'use client';
import { useState } from 'react';
import { createEntity, setEntityStatus } from '@/trunk/miid';
import { completeOnboarding, flowSteps, loadProgress, saveProgress } from '@/trunk/mionboard';
import { claimName } from '@/trunk/miname';
import { Celebration } from '@/components/celebrations';

export default function OnboardingPage() {
  const [flowId] = useState(() => `flow-${Date.now().toString(36)}`);
  const [kind, setKind] = useState('person');
  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const steps = flowSteps(kind);

  async function next() {
    setError('');
    try {
      const step = steps[stepIdx];
      await saveProgress(flowId, kind, step, { name });
      if (stepIdx === steps.length - 2) {
        // Finalize: create entity, claim name, activate. All on-device first.
        const { entity } = await createEntity(kind);
        if (name.trim()) await claimName(name, 'place', entity.did);
        await setEntityStatus(entity.did, 'active', 'onboarded');
        await completeOnboarding(flowId, entity.did);
        setDone(true);
        return;
      }
      setStepIdx(stepIdx + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Your progress is saved — try again.');
    }
  }

  async function resume() {
    const p = await loadProgress(flowId);
    if (p) {
      setKind(p.kind);
      setStepIdx(Math.max(0, steps.indexOf(p.step)));
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <Celebration show message="Welcome to MiLyfe. Your profile is yours." />
        <h1 className="text-2xl font-bold">You are in.</h1>
        <p>Your identity was created on this device. Back up your recovery phrase with your recovery friends next.</p>
        <a href="/pocket" className="block rounded-2xl bg-emerald-700 p-4 text-center font-semibold text-white">Open your Pocket</a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Join MiLyfe</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">Step {stepIdx + 1} of {steps.length}: {steps[stepIdx]}. Progress saves on this device — close and resume anytime.</p>
      {stepIdx === 0 && (
        <label className="block space-y-1">
          <span className="text-sm font-semibold">I am joining as</span>
          <select value={kind} onChange={(e) => { setKind(e.target.value); setStepIdx(0); }} className="w-full rounded-xl border p-3 dark:bg-gray-900">
            <option value="person">A person</option>
            <option value="youth">A young person (with a grown-up)</option>
            <option value="shop">A shop or business</option>
          </select>
        </label>
      )}
      <label className="block space-y-1">
        <span className="text-sm font-semibold">Pick a name (you can change it later)</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. neighbor-jo" className="w-full rounded-xl border p-3 dark:bg-gray-900" />
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm text-red-900">{error}</p>}
      <div className="flex gap-2">
        <button onClick={next} className="flex-1 rounded-2xl bg-emerald-700 p-4 font-semibold text-white">Continue</button>
        <button onClick={resume} className="rounded-2xl border p-4 font-semibold">Resume</button>
      </div>
      <p className="text-xs text-gray-500">No address needed. No ID needed. MiLyfe is not a government. Children: profile through a grown-up; no adult DMs, ever.</p>
    </div>
  );
}
