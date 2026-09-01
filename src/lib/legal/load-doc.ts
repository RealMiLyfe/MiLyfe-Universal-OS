import fs from 'node:fs';
import path from 'node:path';

/**
 * Load a legal markdown doc from the repo root at build/request time.
 * Server-only. Files: PRIVACY.md, TERMS.md, SECURITY.md.
 */
export function loadLegalDoc(filename: string): string {
  const full = path.join(process.cwd(), filename);
  try {
    return fs.readFileSync(full, 'utf8');
  } catch {
    return `# ${filename}\n\nThis document is temporarily unavailable. Please contact contact@milyfe.fun.`;
  }
}
