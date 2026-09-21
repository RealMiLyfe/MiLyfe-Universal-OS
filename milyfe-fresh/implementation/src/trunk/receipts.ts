// Receipt keeper: save + list + verify receipts on-device (server receipts mirrored here).
import { getDoc, putDoc, verifyReceipt, type MiReceipt } from '@/kernel';

export async function saveReceipt(r: MiReceipt): Promise<void> {
  await putDoc('receipts', r.id, r);
}

export async function getReceipt(id: string): Promise<MiReceipt | undefined> {
  return getDoc<MiReceipt>('receipts', id);
}

export async function verifySavedReceipt(id: string): Promise<boolean> {
  const r = await getReceipt(id);
  if (!r) return false;
  return verifyReceipt(r);
}
