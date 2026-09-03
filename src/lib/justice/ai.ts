/**
 * MiJustice — dedicated, self-healing AI client.
 *
 * This is SEPARATE from the platform's Mi chat backend and from the
 * hyperbolic-time-chamber. MiJustice gets its OWN ordered provider fleet and
 * its OWN env keys (JUSTICE_AI_*), so tuning or breaking one never affects the
 * others.
 *
 * Self-healing: providers are tried in priority order. If one is missing a key,
 * errors, rate-limits, or times out, we fall through to the next. A keyless
 * local endpoint (Ollama) is the final fallback so the system NEVER hard-fails
 * to "AI down" as long as any backend is reachable.
 *
 * GUARDRAIL: this client is for ENRICHMENT/summarization of MiJustice content
 * only. It never invents legal citations — the Defender's citations come from
 * the verified set in ./defender.ts, and any model output must pass
 * complianceScan (./agents.ts) + human review gates before reaching a user.
 * All providers below expose an OpenAI-compatible /chat/completions endpoint.
 */

export interface JusticeProvider {
  id: string;
  label: string;
  baseUrl: string;
  apiKey: string | undefined;
  model: string;
  /** true if this provider needs no key (local) — always "available". */
  keyless?: boolean;
}

export interface ChatMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Build the provider fleet from env, in priority order. Each provider reads its
 * OWN JUSTICE_AI_* key first, then falls back to a shared workspace key name so
 * existing keys "just work" without duplication. Order favors fast free tiers.
 */
export function justiceProviders(): JusticeProvider[] {
  const env = process.env;
  const all: JusticeProvider[] = [
    {
      id: 'groq',
      label: 'Groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: env.JUSTICE_AI_GROQ_KEY || env.GROQ_API_KEY,
      model: env.JUSTICE_AI_GROQ_MODEL || 'llama-3.3-70b-versatile',
    },
    {
      id: 'cerebras',
      label: 'Cerebras',
      baseUrl: 'https://api.cerebras.ai/v1',
      apiKey: env.JUSTICE_AI_CEREBRAS_KEY || env.CEREBRAS_API_KEY,
      model: env.JUSTICE_AI_CEREBRAS_MODEL || 'llama-3.3-70b',
    },
    {
      id: 'nvidia',
      label: 'NVIDIA NIM',
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      apiKey: env.JUSTICE_AI_NVIDIA_KEY || env.NVIDIA_NIM_API_KEY,
      model: env.JUSTICE_AI_NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
    },
    {
      id: 'gemini',
      label: 'Google Gemini',
      // Gemini exposes an OpenAI-compatible endpoint.
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      apiKey: env.JUSTICE_AI_GEMINI_KEY || env.GEMINI_API_KEY,
      model: env.JUSTICE_AI_GEMINI_MODEL || 'gemini-2.0-flash',
    },
    {
      id: 'openrouter',
      label: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: env.JUSTICE_AI_OPENROUTER_KEY || env.OPENROUTER_API_KEY,
      model: env.JUSTICE_AI_OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    },
    {
      id: 'ollama',
      label: 'Local (Ollama)',
      baseUrl: env.JUSTICE_AI_OLLAMA_URL || env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      apiKey: undefined,
      model: env.JUSTICE_AI_OLLAMA_MODEL || 'llama3.2:3b',
      keyless: true,
    },
  ];

  // Optional explicit priority order: comma-separated provider ids.
  const order = (env.JUSTICE_AI_ORDER || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ordered = order.length
    ? [...all].sort((a, b) => {
        const ia = order.indexOf(a.id); const ib = order.indexOf(b.id);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      })
    : all;

  // Only keep providers that are usable (have a key, or are keyless).
  return ordered.filter((p) => p.keyless || (p.apiKey && p.apiKey.length > 0));
}

export interface JusticeChatResult {
  ok: boolean;
  content: string;
  providerId?: string;
  triedProviders: string[];
  error?: string;
}

/**
 * Non-streaming completion with self-healing failover across the fleet.
 * Returns the first successful provider's content. Never throws.
 */
export async function justiceChat(
  messages: ChatMsg[],
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {}
): Promise<JusticeChatResult> {
  const { maxTokens = 800, temperature = 0.3, timeoutMs = 12000 } = opts;
  const providers = justiceProviders();
  const tried: string[] = [];

  if (providers.length === 0) {
    return { ok: false, content: '', triedProviders: tried, error: 'no_provider_configured' };
  }

  for (const p of providers) {
    tried.push(p.id);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${p.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(p.apiKey ? { Authorization: `Bearer ${p.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: p.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) continue; // self-heal: try next provider
      const data = await res.json();
      const content: string | undefined = data?.choices?.[0]?.message?.content;
      if (content && content.trim()) {
        return { ok: true, content: content.trim(), providerId: p.id, triedProviders: tried };
      }
    } catch {
      clearTimeout(timer);
      // network/timeout — fall through to next provider
    }
  }

  return { ok: false, content: '', triedProviders: tried, error: 'all_providers_failed' };
}

/** Health snapshot for the tracker/admin: which providers are configured. */
export function justiceProviderHealth(): { id: string; label: string; configured: boolean; keyless: boolean }[] {
  const env = process.env;
  const keyFor: Record<string, string | undefined> = {
    groq: env.JUSTICE_AI_GROQ_KEY || env.GROQ_API_KEY,
    cerebras: env.JUSTICE_AI_CEREBRAS_KEY || env.CEREBRAS_API_KEY,
    nvidia: env.JUSTICE_AI_NVIDIA_KEY || env.NVIDIA_NIM_API_KEY,
    gemini: env.JUSTICE_AI_GEMINI_KEY || env.GEMINI_API_KEY,
    openrouter: env.JUSTICE_AI_OPENROUTER_KEY || env.OPENROUTER_API_KEY,
  };
  return [
    { id: 'groq', label: 'Groq', configured: !!keyFor.groq, keyless: false },
    { id: 'cerebras', label: 'Cerebras', configured: !!keyFor.cerebras, keyless: false },
    { id: 'nvidia', label: 'NVIDIA NIM', configured: !!keyFor.nvidia, keyless: false },
    { id: 'gemini', label: 'Google Gemini', configured: !!keyFor.gemini, keyless: false },
    { id: 'openrouter', label: 'OpenRouter', configured: !!keyFor.openrouter, keyless: false },
    { id: 'ollama', label: 'Local (Ollama)', configured: true, keyless: true },
  ];
}
