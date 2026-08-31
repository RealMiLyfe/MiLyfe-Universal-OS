import type { Metadata, Viewport } from 'next';
import './globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://milyfe-platform.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'MiLyfe — Add Value. Raise Quality of Life.',
    template: '%s | MiLyfe',
  },
  description: 'The Constitution as a living lifestyle. Earn $MLY, govern together, connect with neighbors. A system that still works after anyone leaves. People-owned. Free forever.',
  metadataBase: new URL(BASE_URL),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'MiLyfe',
    title: 'MiLyfe — Add Value. Raise Quality of Life.',
    description: 'The Constitution as a living lifestyle. Earn $MLY, govern together, connect with neighbors. A system that still works after anyone leaves.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiLyfe — Add Value. Raise Quality of Life.',
    description: 'Community-owned civic platform. Earn $MLY, govern together, connect with neighbors.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e3a6e' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1b33' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getActiveLanguage } = await import('@/lib/i18n/set-language');
  const { getLanguage } = await import('@/lib/i18n/languages');
  const langCode = await getActiveLanguage();
  const lang = getLanguage(langCode);
  return (
    <html lang={langCode} dir={lang.rtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
