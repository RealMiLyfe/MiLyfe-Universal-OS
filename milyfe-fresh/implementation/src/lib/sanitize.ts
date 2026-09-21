// Rich-text sanitizer: DOMPurify everywhere user content renders as HTML.
import DOMPurify from 'isomorphic-dompurify';

export function clean(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'], ALLOWED_ATTR: ['href'] });
}
