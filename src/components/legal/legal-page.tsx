import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

/**
 * Shared renderer for legal/policy pages (Privacy, Terms, Security).
 * Publicly accessible, styled to match the platform, light theme only.
 */
export function LegalPage({ markdown }: { markdown: string }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">MiLyfe</span>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/receipts" className="hover:text-foreground">Receipts</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/security" className="hover:text-foreground">Security</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-10">
        <article
          className="prose prose-neutral max-w-none
            prose-headings:font-semibold prose-headings:text-foreground
            prose-h1:text-3xl prose-h1:mb-2
            prose-h2:text-xl prose-h2:mt-8 prose-h2:border-b prose-h2:pb-1
            prose-p:text-foreground/90 prose-li:text-foreground/90
            prose-a:text-primary prose-strong:text-foreground
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/40
            prose-blockquote:rounded-r-md prose-blockquote:py-1 prose-blockquote:not-italic
            prose-table:text-sm prose-hr:my-8"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </article>

        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">← Back to MiLyfe</Link>
        </div>
      </main>
    </div>
  );
}
