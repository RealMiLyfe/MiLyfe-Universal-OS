// Server-side MiReceipt signing (API routes). Key from SERVER_SIGNING_SEED (32 raw
// bytes, base64); public DID published in SERVER_DID (same keypair, generated once
// offline via `npx tsx scripts/gen-server-keys.ts` in later ops work).
// SERVER-ONLY module — never import from client components.
import { importPublicKey } from '@/kernel/id';
import { issueReceipt, type ReceiptInput } from '@/kernel/receipt';

let cached: { did: string; privateKey: CryptoKey } | null = null;

function b64ToBytes(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function serverKeys(): Promise<{ did: string; privateKey: CryptoKey }> {
  if (cached) return cached;
  const seedB64 = process.env.SERVER_SIGNING_SEED ?? '';
  if (!seedB64) throw new Error('SERVER_SIGNING_SEED_MISSING');
  const seed = b64ToBytes(seedB64);
  if (seed.length !== 32) throw new Error('SERVER_SIGNING_SEED_BAD_LENGTH');
  // Ed25519 raw private import = 32-byte seed (WebCrypto).
  const privateKey = await globalThis.crypto.subtle.importKey('raw', seed.slice().buffer, { name: 'Ed25519' }, false, ['sign']);
  const did = process.env.SERVER_DID ?? '';
  if (!did) throw new Error('SERVER_DID_MISSING');
  await importPublicKey(did); // sanity: must be a valid Ed25519 verify key
  cached = { did, privateKey };
  return cached;
}

export async function signServerReceipt(
  input: Omit<ReceiptInput, 'actor'>,
): Promise<Awaited<ReturnType<typeof issueReceipt>>> {
  const { did, privateKey } = await serverKeys();
  return issueReceipt({ ...input, actor: did }, privateKey, 'milyfe/1');
}
