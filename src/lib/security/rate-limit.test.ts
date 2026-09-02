import { describe, it, expect } from 'vitest';
import { checkRateLimit, getClientIP, RATE_LIMITS } from './rate-limit';

// With no UPSTASH_* env vars set, checkRateLimit uses the in-memory fallback.

describe('checkRateLimit (in-memory fallback)', () => {
  it('allows requests under the limit and decrements remaining', async () => {
    const id = `user-${Math.random()}`;
    const cfg = { limit: 3, window: '1m' as const };
    const r1 = await checkRateLimit(id, 'test-a', cfg);
    const r2 = await checkRateLimit(id, 'test-a', cfg);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it('blocks once the limit is exceeded and returns a 429 error response', async () => {
    const id = `user-${Math.random()}`;
    const cfg = { limit: 2, window: '1m' as const };
    await checkRateLimit(id, 'test-b', cfg);
    await checkRateLimit(id, 'test-b', cfg);
    const blocked = await checkRateLimit(id, 'test-b', cfg);
    expect(blocked.success).toBe(false);
    expect(blocked.error).toBeDefined();
    expect(blocked.error!.status).toBe(429);
  });

  it('isolates counters across different identifiers', async () => {
    const cfg = { limit: 1, window: '1m' as const };
    const a = await checkRateLimit('id-a', 'test-c', cfg);
    const b = await checkRateLimit('id-b', 'test-c', cfg);
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
  });

  it('exposes preconfigured tiers', () => {
    expect(RATE_LIMITS.auth.limit).toBeGreaterThan(0);
    expect(RATE_LIMITS.transfer.window).toBe('1m');
  });
});

describe('getClientIP', () => {
  it('takes the first IP from x-forwarded-for', () => {
    const r = new Request('https://x.com', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } });
    expect(getClientIP(r)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const r = new Request('https://x.com', { headers: { 'x-real-ip': '9.9.9.9' } });
    expect(getClientIP(r)).toBe('9.9.9.9');
  });

  it('returns "anonymous" when no IP headers are present', () => {
    expect(getClientIP(new Request('https://x.com'))).toBe('anonymous');
  });
});
