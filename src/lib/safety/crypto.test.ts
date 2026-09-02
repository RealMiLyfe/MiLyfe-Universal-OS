import { describe, it, expect } from 'vitest';
import { encryptText, decryptText, isCryptoAvailable } from './crypto';

describe('safety journal crypto (AES-256-GCM + PBKDF2)', () => {
  it('reports Web Crypto availability in the test runtime', () => {
    expect(isCryptoAvailable()).toBe(true);
  });

  it('round-trips plaintext: decrypt(encrypt(x)) === x', async () => {
    const secret = 'My private journal entry — nobody else can read this.';
    const pass = 'correct horse battery staple';
    const ciphertext = await encryptText(secret, pass);
    const recovered = await decryptText(ciphertext, pass);
    expect(recovered).toBe(secret);
  });

  it('produces different ciphertext each time (random salt + IV)', async () => {
    const pass = 'passphrase-123';
    const a = await encryptText('same text', pass);
    const b = await encryptText('same text', pass);
    expect(a).not.toBe(b);
  });

  it('fails to decrypt with the wrong passphrase', async () => {
    const ciphertext = await encryptText('sensitive', 'right-pass');
    await expect(decryptText(ciphertext, 'wrong-pass')).rejects.toThrow();
  });

  it('handles unicode and emoji content', async () => {
    const secret = 'café ☕ 日本語 🔒 ünïçödé';
    const pass = 'p@ss';
    const recovered = await decryptText(await encryptText(secret, pass), pass);
    expect(recovered).toBe(secret);
  });

  it('handles empty string', async () => {
    const pass = 'x';
    const recovered = await decryptText(await encryptText('', pass), pass);
    expect(recovered).toBe('');
  });
});
