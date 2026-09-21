// Kernel: identity primitive — did:milyfe + Ed25519 (WebCrypto, device-local).
// Source: MIID.md, MONEY-STATE-CONTRACT (refs). No network. No PII.

export function randomId(): string {
  return globalThis.crypto.randomUUID();
}

export function b64urlEncode(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export interface KeyPair {
  did: string;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export async function generateKeyPair(): Promise<KeyPair> {
  const kp = (await globalThis.crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair;
  const raw = new Uint8Array(await globalThis.crypto.subtle.exportKey('raw', kp.publicKey));
  return { did: `did:milyfe:${b64urlEncode(raw)}`, publicKey: kp.publicKey, privateKey: kp.privateKey };
}

export async function importPublicKey(did: string): Promise<CryptoKey> {
  const raw = b64urlDecode(did.replace(/^did:milyfe:/, ''));
  const buf = raw.slice().buffer;
  return globalThis.crypto.subtle.importKey('raw', buf, { name: 'Ed25519' }, true, ['verify']);
}

const te = new TextEncoder();

export async function sign(privateKey: CryptoKey, message: string): Promise<string> {
  const sig = await globalThis.crypto.subtle.sign('Ed25519', privateKey, te.encode(message));
  return b64urlEncode(new Uint8Array(sig));
}

export async function verify(publicKey: CryptoKey, message: string, signature: string): Promise<boolean> {
  try {
    const sig = b64urlDecode(signature);
    return await globalThis.crypto.subtle.verify('Ed25519', publicKey, sig.slice().buffer, te.encode(message));
  } catch {
    return false;
  }
}

export function isDid(v: string): boolean {
  return /^did:milyfe:[A-Za-z0-9_-]{40,60}$/.test(v);
}
