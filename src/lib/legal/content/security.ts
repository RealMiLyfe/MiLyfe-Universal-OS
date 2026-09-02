// Auto-generated from SECURITY.md. Edit the source .md, then regenerate.
const security = `# Security Policy

## Reporting a Vulnerability

We take the security of MiLyfe seriously. If you discover a security vulnerability, please report it responsibly.

**DO NOT** open a public GitHub issue for security vulnerabilities.

### How to Report

Email: **contact@milyfe.fun**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment | Within 24 hours |
| Initial assessment | Within 72 hours |
| Fix development | Within 7 days for critical, 30 days for others |
| Public disclosure | After fix is deployed + 7 day grace period |

### Scope

In scope:
- milyfe.fun (production application)
- API endpoints at milyfe.fun/api/*
- Authentication and authorization flaws
- Data exposure vulnerabilities
- Injection vulnerabilities (XSS, SQL injection, etc.)
- Business logic flaws affecting user funds ($MLY)

Out of scope:
- Denial of service attacks
- Social engineering
- Physical attacks
- Vulnerabilities in third-party services (Supabase, Vercel)
- Issues already reported and being fixed

### Safe Harbor

We will not take legal action against researchers who:
- Make a good faith effort to avoid privacy violations and data destruction
- Do not exploit vulnerabilities beyond what is necessary to demonstrate them
- Report vulnerabilities promptly
- Do not publicly disclose before we've had reasonable time to fix

### Recognition

We recognize security researchers who responsibly disclose vulnerabilities. With your permission, we'll credit you in our changelog.

## Security Features

This platform implements:
- Row Level Security (RLS) on all database tables
- Rate limiting on all API routes (Upstash Redis)
- Zod input validation at every boundary
- Atomic wallet transfers (PostgreSQL transactions with row locks)
- HTML sanitization (DOMPurify) on all rich text
- CSRF protection via Origin/Referer validation
- Audit trail on sensitive operations
- End-to-end encrypted safety journal (AES-256-GCM)
- Session management with revocation capabilities
- Content reporting system

## Supported Versions

| Version | Supported |
|---------|-----------|
| main branch (latest) | Yes |
| Tagged releases | Yes |
| Older commits | No |

---

*Last updated: August 2026*
`;
export default security;
