import { LOCKED_FLAGS } from '@/trunk/miscale';
import { JusticeDemo, LegalDemo, ResolveDemo, VoteDemo } from '@/components/tree/gov-demos';
import { CareDemo, EduDemo, HealthDemo, PlaceDemo } from '@/components/tree/life-demos';
import { ForgeDemo, MarketDemo, MoneyDemo, WorkDemo } from '@/components/tree/fin-demos';

function Branch({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{name}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export default function Tree() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">The MiLyfe tree, working.</h1>
        <p className="text-gray-600 dark:text-gray-300">
          All 12 systems below run the real code, right here in your browser, on pretend data.
          Nothing here is real money, real people, or a launch.
        </p>
      </header>
      <Branch name="Governance branch">
        <VoteDemo />
        <LegalDemo />
        <ResolveDemo />
        <JusticeDemo />
      </Branch>
      <Branch name="Lifestyle branch">
        <CareDemo />
        <HealthDemo />
        <PlaceDemo />
        <EduDemo />
      </Branch>
      <Branch name="Finance branch">
        <ForgeDemo />
        <MarketDemo />
        <MoneyDemo />
        <WorkDemo />
      </Branch>
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
        <h2 className="mb-2 text-lg font-bold">Money doors: all locked</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {LOCKED_FLAGS.map((f) => (
            <li key={f.id}>
              <span className="font-semibold">{f.name}</span> — locked until: {f.unlockNeeds}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
