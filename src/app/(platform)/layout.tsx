import { Sidebar } from '@/components/shell/sidebar';
import { BottomNav } from '@/components/shell/bottom-nav';
import { TopBar } from '@/components/shell/top-bar';
import { DesktopHeader } from '@/components/shell/desktop-header';
import { RightRail } from '@/components/shell/right-rail';
import { AuthProvider } from '@/components/shell/auth-provider';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { ServiceWorkerRegistrar } from '@/components/shell/sw-registrar';
import { MiBubble } from '@/components/mi/mi-bubble';
import { CommandSearch } from '@/components/shell/command-search';
import { DataCacher } from '@/components/shell/data-cacher';
import { VibeBar } from '@/components/media/vibe-bar';
import { Toaster } from 'sonner';

/**
 * Platform Layout — Responsive shell
 *
 * Mobile (< 768px): TopBar + Content + BottomNav
 * Desktop (768px+): Sidebar + Content
 */
export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {/* Offline status banner */}
      <OfflineIndicator />

      {/* Service worker registration */}
      <ServiceWorkerRegistrar />

      {/* Mobile top bar (< md) */}
      <TopBar />

      {/* Desktop sidebar (md+) */}
      <Sidebar />

      {/* Desktop header (md+) — fills the top strip */}
      <DesktopHeader />

      {/* Contextual right rail (lg+) — fills the right side */}
      <RightRail />

      {/* Main content area.
          Left offset for sidebar (md+), top offset for header (md+) or mobile
          top bar (< md), right offset for the right rail (lg+). */}
      <div className="min-h-screen pt-14 pb-20 md:pb-4 md:ml-56 lg:ml-60 lg:mr-72 xl:mr-80">
        <main
          id="main-content"
          className="mx-auto max-w-2xl px-4 py-4 md:px-6 md:py-6 lg:max-w-3xl"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Data cacher (silently caches critical data to IndexedDB for offline) */}
      <DataCacher />

      {/* Global persistent media player (the Vibe Bar) */}
      <VibeBar />

      {/* Mi ambient bubble */}
      <MiBubble />

      {/* Global search (Cmd+K) */}
      <CommandSearch />

      <Toaster position="top-right" richColors closeButton theme="system" />
    </AuthProvider>
  );
}
