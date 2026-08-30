import { describe, it, expect } from 'vitest';
import { sanitizeRichText, sanitizePlainText, hasDangerousContent } from './sanitize';

describe('sanitizeRichText — blocks XSS', () => {
  it('strips <script> tags', () => {
    const out = sanitizeRichText('<p>hi</p><script>alert(1)</script>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
    expect(out).toContain('<p>hi</p>');
  });

  it('removes inline event handlers (onerror/onclick/onload)', () => {
    const out = sanitizeRichText('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain('onerror');
    const clicky = sanitizeRichText('<p onclick="steal()">x</p>');
    expect(clicky).not.toContain('onclick');
  });

  it('neutralizes javascript: URIs in links', () => {
    const out = sanitizeRichText('<a href="javascript:alert(1)">click</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
  });

  it('strips style attributes (FORBID_ATTR)', () => {
    const out = sanitizeRichText('<p style="position:fixed">x</p>');
    expect(out).not.toContain('style=');
  });

  it('drops disallowed tags like <iframe>', () => {
    const out = sanitizeRichText('<iframe src="evil"></iframe><p>ok</p>');
    expect(out).not.toContain('<iframe');
    expect(out).toContain('<p>ok</p>');
  });
});

describe('sanitizeRichText — preserves legitimate formatting', () => {
  it('keeps allowed rich-text tags', () => {
    const html = '<h2>Title</h2><p><strong>bold</strong> and <em>italic</em></p><ul><li>one</li></ul>';
    const out = sanitizeRichText(html);
    expect(out).toContain('<h2>');
    expect(out).toContain('<strong>');
    expect(out).toContain('<em>');
    expect(out).toContain('<li>');
  });

  it('keeps safe links and images', () => {
    const out = sanitizeRichText('<a href="https://milyfe.fun">link</a><img src="/a.png" alt="a">');
    expect(out).toContain('href="https://milyfe.fun"');
    expect(out).toContain('<img');
  });
});

describe('sanitizePlainText — strips all HTML', () => {
  it('removes every tag, keeps text', () => {
    const out = sanitizePlainText('<b>hello</b> <script>x()</script>world');
    expect(out).not.toContain('<');
    expect(out).toContain('hello');
    expect(out).toContain('world');
  });
});

describe('hasDangerousContent', () => {
  it('flags content that gets modified by sanitization', () => {
    expect(hasDangerousContent('<script>alert(1)</script>')).toBe(true);
    expect(hasDangerousContent('<img src=x onerror=alert(1)>')).toBe(true);
  });

  it('returns false for already-clean content', () => {
    expect(hasDangerousContent('<p>totally safe</p>')).toBe(false);
  });
});
