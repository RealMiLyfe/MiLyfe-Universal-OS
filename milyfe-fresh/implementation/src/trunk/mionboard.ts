// MiOnboard service: one signup/profile flows — progress local-first, resumable.
import { enqueue, getDoc, putDoc } from '@/kernel';

export interface OnboardProgress { flowId: string; kind: string; step: string; state: Record<string, unknown>; updatedAt: string }

const FLOWS: Record<string, string[]> = {
  person: ['welcome', 'proof', 'recovery', 'context', 'tour', 'done'],
  youth: ['welcome', 'grownup', 'proof', 'context', 'tour', 'done'],
  shop: ['welcome', 'owner', 'place', 'policy', 'till', 'done'],
};

export function flowSteps(kind: string): string[] {
  const steps = FLOWS[kind];
  if (!steps) throw new Error('UNKNOWN_FLOW');
  return steps;
}

export async function saveProgress(flowId: string, kind: string, step: string, state: Record<string, unknown>): Promise<OnboardProgress> {
  if (!flowSteps(kind).includes(step)) throw new Error('BAD_STEP');
  const p: OnboardProgress = { flowId, kind, step, state, updatedAt: new Date().toISOString() };
  await putDoc('onboarding', flowId, p);
  return p;
}

export async function loadProgress(flowId: string): Promise<OnboardProgress | undefined> {
  return getDoc<OnboardProgress>('onboarding', flowId);
}

export async function completeOnboarding(flowId: string, entityDid: string): Promise<string> {
  const p = await loadProgress(flowId);
  if (!p) throw new Error('FLOW_NOT_FOUND');
  await putDoc('onboarding', flowId, { ...p, step: 'done', state: { ...p.state, entity: entityDid } });
  return enqueue('mionboard.complete', { flowId, entity: entityDid });
}
