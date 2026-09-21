// About: the roots in plain words. Static, sourced, offline-friendly.
// Sources: Constitution preamble, Oath 24 (Ultimate Manual), External-Law Boundary.
const OATH = [
  'We the People. Power belongs to the people and stays with them.',
  'Voluntary above all.', 'Free forever for rights, learning, emergency.', 'Every device is a node.',
  'Humans over helpers. Mi serves.', 'Rights are not features.', 'Works when internet and cell fail.',
  'Worst-case-first.', 'Dignity is not earned.', 'No permanent power.', 'OSI open source forever.',
  'Freedom to exit with your data.', 'Evolution is expected.', 'Every domain connected.',
  'Physical meets digital.', 'Resilience is default.', 'Law of the land first.', 'Not a state.',
  'Children first.', 'Truth in claims.', 'License purity.', 'One home: one signup, one profile.',
  'People own it.', 'Human development first.',
];

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">What MiLyfe is</h1>
      <p>
        MiLyfe is a people-owned network connecting people, knowledge, work, care, commerce, devices,
        agents, communities, and places without surrendering ownership to hidden central control.
      </p>
      <h2 className="text-xl font-bold">The Oath — 24 promises no vote can remove</h2>
      <ol className="list-decimal space-y-1 pl-6 text-sm">
        {OATH.map((o) => (<li key={o}>{o}</li>))}
      </ol>
      <h2 className="text-xl font-bold">Honest boundaries</h2>
      <ul className="list-disc space-y-1 pl-6 text-sm">
        <li>MiLyfe is not a government, bank, court, hospital, law firm, or police force.</li>
        <li>U.S. constitutional principles shape our internal rules — but outside law still applies, and regulated activities need real expert review before they open.</li>
        <li>Money features that touch the outside world stay locked until lawyers, money experts, and the community all sign off.</li>
        <li>Children come first: no adult messages to kids, no public location, safety always on.</li>
      </ul>
    </div>
  );
}
