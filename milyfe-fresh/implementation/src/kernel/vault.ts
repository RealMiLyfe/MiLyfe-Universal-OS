// Kernel: vault — AES-256-GCM + PBKDF2(SHA-256, 310k). Keys NEVER leave the device:
// vault keys are non-extractable CryptoKeys held in memory only; only salt/ciphertext persist.
// Source: MISECURITY.md, MIDATA.md.

import { b64urlDecode, b64urlEncode, randomId } from './id';

const openVaults = new Map<string, CryptoKey>();

export interface VaultHandle {
  id: string;
  salt: string;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return globalThis.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.slice().buffer, iterations: 310000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable: the key can never be exported off-device
    ['encrypt', 'decrypt'],
  );
}

export async function unlockVault(passphrase: string, saltB64?: string): Promise<VaultHandle> {
  const salt = saltB64 ? b64urlDecode(saltB64) : globalThis.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(passphrase, salt);
  const id = randomId();
  openVaults.set(id, key);
  return { id, salt: b64urlEncode(salt) };
}

export function lockVault(id: string): void {
  openVaults.delete(id);
}

function getKey(id: string): CryptoKey {
  const k = openVaults.get(id);
  if (!k) throw new Error('VAULT_LOCKED');
  return k;
}

export async function encryptJSON(handle: VaultHandle, value: unknown): Promise<string> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.slice().buffer },
    getKey(handle.id),
    new TextEncoder().encode(JSON.stringify(value)),
  );
  const packed = new Uint8Array(12 + ct.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ct), 12);
  return b64urlEncode(packed);
}

export async function decryptJSON<T>(handle: VaultHandle, payload: string): Promise<T> {
  const packed = b64urlDecode(payload);
  const iv = packed.slice(0, 12);
  const ct = packed.slice(12);
  try {
    const pt = await globalThis.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.slice().buffer },
      getKey(handle.id),
      ct.slice().buffer,
    );
    return JSON.parse(new TextDecoder().decode(pt)) as T;
  } catch {
    throw new Error('VAULT_DECRYPT_FAILED');
  }
}
