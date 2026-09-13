import './globals.css'

export const metadata = {
  title: 'MiForge × MiLyfe | AI Bookkeeping Powered by $MLY',
  description: 'AI bookkeeping, real-time daily reports, and 100% matched community credits. Backed by the Jacksonville MiJaxx civic movement.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">{children}</body>
    </html>
  )
}
