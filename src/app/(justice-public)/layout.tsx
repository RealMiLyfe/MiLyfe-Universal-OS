/**
 * MiJustice public layout — signed-out visitors, no platform shell.
 * Full-width marketing/education surface. Part of MiLyfe ("We The People").
 */
export default function JusticePublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
