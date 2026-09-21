'use client';
// Vibe Bar: ambient street-weather strip (MiPulse-style), honest staleness labels.
export function VibeBar({ items }: { items: { label: string; state: 'good' | 'watch' | 'stale' }[] }) {
  return (
    <div role="status" aria-label="Street weather" className="flex gap-2 overflow-x-auto py-2">
      {items.map((i) => (
        <span
          key={i.label}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
            i.state === 'good' ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
            : i.state === 'watch' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
        >
          {i.label}{i.state === 'stale' ? ' (stale)' : ''}
        </span>
      ))}
    </div>
  );
}
