import { describe, expect, it } from 'vitest';
import { generateKeyPair, importPublicKey, isDid, sign, verify } from '@/kernel/id';

describe('kernel id', () => {
  it('generates a valid did:milyfe identity', async () => {
    const kp = await generateKeyPair();
    expect(isDid(kp.did)).toBe(true);
  });
  it('signs and verifies', async () => {
    const kp = await generateKeyPair();
    const sig = await sign(kp.privateKey, 'hello-tuesday');
    expect(await verify(kp.publicKey, 'hello-tuesday', sig)).toBe(true);
  });
  it('rejects tampered messages', async () => {
    const kp = await generateKeyPair();
    const sig = await sign(kp.privateKey, 'original');
    expect(await verify(kp.publicKey, 'tampered', sig)).toBe(false);
  });
  it('imports public keys from DIDs', async () => {
    const kp = await generateKeyPair();
    const pub = await importPublicKey(kp.did);
    const sig = await sign(kp.privateKey, 'm');
    expect(await verify(pub, 'm', sig)).toBe(true);
  });
});
