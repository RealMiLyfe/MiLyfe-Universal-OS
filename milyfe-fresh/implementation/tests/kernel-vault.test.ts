import { describe, expect, it } from 'vitest';
import { decryptJSON, encryptJSON, lockVault, unlockVault } from '@/kernel/vault';

describe('kernel vault (AES-256-GCM + PBKDF2)', () => {
  it('roundtrips JSON', async () => {
    const h = await unlockVault('correct horse tuesday staple');
    const ct = await encryptJSON(h, { secret: 'pocket', n: 7 });
    expect(await decryptJSON(h, ct)).toEqual({ secret: 'pocket', n: 7 });
  });
  it('random salt and IV: same input encrypts differently', async () => {
    const h = await unlockVault('same-passphrase');
    const a = await encryptJSON(h, 'x');
    const b = await encryptJSON(h, 'x');
    expect(a).not.toBe(b);
  });
  it('wrong passphrase cannot decrypt (same salt)', async () => {
    const h1 = await unlockVault('right');
    const ct = await encryptJSON(h1, 'data');
    const h2 = await unlockVault('wrong', h1.salt);
    await expect(decryptJSON(h2, ct)).rejects.toThrow('VAULT_DECRYPT_FAILED');
  });
  it('locked vault refuses work — keys never leave, sessions end', async () => {
    const h = await unlockVault('temp');
    lockVault(h.id);
    await expect(encryptJSON(h, 'x')).rejects.toThrow('VAULT_LOCKED');
  });
  it('handles unicode and empty payloads', async () => {
    const h = await unlockVault('u');
    expect(await decryptJSON(h, await encryptJSON(h, ''))).toBe('');
    expect(await decryptJSON(h, await encryptJSON(h, 'héllo 🌳'))).toBe('héllo 🌳');
  });
});
