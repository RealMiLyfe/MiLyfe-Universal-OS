import privacy from './content/privacy';
import terms from './content/terms';
import security from './content/security';
import receipts from './content/receipts';

/**
 * Legal/proof doc content, imported as bundled string modules (generated from
 * the root .md files). Bundled at build time so it always ships with the
 * serverless function — no runtime filesystem reads (which Vercel does not
 * trace for root-level .md files).
 *
 * To update: edit the root .md file, then regenerate the matching
 * src/lib/legal/content/*.ts module.
 */
const DOCS: Record<string, string> = {
  'PRIVACY.md': privacy,
  'TERMS.md': terms,
  'SECURITY.md': security,
  'RECEIPTS.md': receipts,
};

export function loadLegalDoc(filename: string): string {
  return (
    DOCS[filename] ??
    `# ${filename}\n\nThis document is temporarily unavailable. Please contact contact@milyfe.fun.`
  );
}
