# Security Requirements for MiLyfe Public Repository

## Purpose
This document outlines the security requirements that must be met before any MiLyfe component is released as a public GitHub repository. These requirements ensure that public code does not expose sensitive information, create security vulnerabilities, or compromise the integrity of the MiLyfe platform.

## 1. Secrets and Credential Management

### 1.1 Prohibited Content
- **NO** API keys, tokens, or credentials of any kind
- **NO** database connection strings with credentials
- **NO** cryptographic keys (private keys, seed phrases)
- **NO** service account keys or tokens
- **NO** webhook secrets or signing keys
- **NO** encryption keys or initialization vectors
- **NO** OAuth client secrets or keys
- **NO** cloud provider access keys (AWS, GCP, Azure, etc.)

### 1.2 Required Protections
- All configuration must use environment variables
- Environment variable examples must be provided in `.env.example` or similar
- Example files MUST contain only placeholder values (e.g., `YOUR_KEY_HERE`)
- No actual secrets may be committed, even in deleted/history
- Use of secrets management tools (e.g., dotenv-safe, vault) encouraged
- Pre-deployment validation must check for absence of secrets

## 2. Code Security Requirements

### 2.1 Dependency Security
- All dependencies must be vetted for known vulnerabilities
- Use of `npm audit`, `pip-audit`, `cargo audit`, or equivalent required
- No dependencies with known critical or high vulnerabilities
- Dependency versions must be explicitly pinned (no floating versions)
- Regular dependency updates must be scheduled
- Transitive dependencies must be monitored

### 2.2 Code Quality and Safety
- No debugging statements left in production code (`console.log`, `debugger`, etc.)
- No hardcoded IP addresses, domains, or internal service names
- No test credentials or demo accounts in production code paths
- Input validation must be implemented for all external inputs
- Output encoding must be used to prevent injection attacks
- Error messages must not leak stack traces or internal details
- No use of dangerous functions (`eval()`, `exec()`, `system()` with user input, etc.)

### 2.3 Authentication and Authorization
- Authentication implementations must follow industry standards
- Passwords must be hashed using strong, slow algorithms (bcrypt, scrypt, Argon2)
- No storage of plaintext passwords or session tokens in logs/database
- JWT implementations must use strong secrets and proper validation
- Session management must implement proper timeout and invalidation
- Principle of least privilege must be applied to all access controls
- Role-based access control (RBAC) must be implemented where appropriate

### 2.4 Data Protection
- No logging of personally identifiable information (PII)
- No logging of authentication tokens or credentials
- Data minimization principles must be applied
- Any stored sensitive data must be encrypted at rest
- Transmission of sensitive data must use TLS 1.2+
- No caching of sensitive data in insecure locations
- GDPR/CCPA compliance considerations must be addressed where applicable

## 3. Repository Configuration

### 3.1 Git Settings
- Repository must be initialized with appropriate `.gitignore`
- `.gitignore` must exclude:
  - Dependency directories (`node_modules/`, `venv/`, `__pycache__/`, etc.)
  - Build artifacts (`.next/`, `.expo/`, `dist/`, `build/`, etc.)
  - Environment files (`.env*`, `.env.*`)
  - IDE directories (`.vscode/`, `.idea/`)
  - OS files (`.DS_Store`, `Thumbs.db`, etc.)
  - Log files (`*.log`)
  - Test output directories (`coverage/`, `htmlcov/`, etc.)
  - Secret files (`*.key`, `*.pem`, `*.p12`, `*.jks`, etc.)
  
- Initial commit must be clean (no accidental inclusions)
- History must not contain removed secrets (use BFG/git-filter-repo if needed)
- Repository description must accurately describe the project

### 3.2 Branch Protection
- Default branch must require pull request reviews
- Status checks must be required before merging
- Required checks must include:
  - CI/CD pipeline success
  - Dependency vulnerability scanning
  - Secret scanning (if enabled)
  - Code quality checks (linting, formatting)
- Administrator bypass of protection rules must be disabled
- Force pushes must be prevented on protected branches
- Deletion of protected branches must be prevented

### 3.3 Security Features
- Enable GitHub Secret Scanning (if available)
- Enable GitHub Dependency Graph and Dependabot alerts
- Consider enabling Code Scanning (CodeQL) for larger repositories
- Enable branch protection rules as described above
- Consider requiring signed commits for high-sensitivity repositories
- Enable vulnerability alerts for dependencies

## 4. Documentation Requirements

### 4.1 Mandatory Files
- `README.md` - Clear project description, usage instructions, contribution guidelines
- `SECURITY.md` - Security policy including vulnerability reporting procedure
- `LICENSE.md` - Appropriate open source license (MIT, Apache-2.0, etc.)
- `CONTRIBUTING.md` - Guidelines for contributors
- `CODE_OF_CONDUCT.md` - Optional but recommended

### 4.2 Security Documentation (`SECURITY.md`)
Must include:
- How to report security vulnerabilities (email, private reporting, etc.)
- Expected response timeline for vulnerability reports
- Project's commitment to security
- Dependabot/vulnerability alert status
- Any third-party security services used
- Encryption standards used (if applicable)
- Data handling and privacy practices
- Instructions for secure configuration

### 4.3 Additional Documentation
- Architecture overview (if complex)
- Deployment instructions (without exposing secrets)
- API documentation (if applicable)
- Development setup instructions
- Testing procedures

## 5. Pre-Release Checklist

Before making any repository public, verify:

### 5.1 Content Review
- [ ] No `.env`, `.env.local`, or similar files with actual values
- [ ] No secret files (keys, tokens, certificates) in repository
- [ ] No credentials in code, comments, or documentation
- [ ] No debug statements in production code paths
- [ ] No hardcoded internal service references
- [ ] All configuration uses environment variables
- [ ] `.gitignore` properly excludes sensitive files
- [ ] License file present and appropriate
- [ ] README accurately describes the project
- [ ] SECURITY.md present with vulnerability reporting process

### 5.2 Dependency Review
- [ ] All dependencies have current versions
- [ ] No known vulnerable dependencies (check with audit tools)
- [ ] Licenses of all dependencies are compatible with project license
- [ ] No GPL or other restrictive licenses if incompatible with goals
- [ ] Dependency versions are pinned in lockfiles

### 5.3 Repository Settings
- [ ] Repository initialized with correct visibility (start private if needed)
- [ ] Initial commit is clean
- [ ] Branch protection rules configured (if applicable)
- [ ] GitHub security features enabled (secret scanning, dependabot, etc.)
- [ ] Repository description filled out
- [ ] Topics/tags added for discoverability
- [ ] Social preview image added (optional)

### 5.4 Legal and Compliance
- [ ] No export-controlled technology included
- [ ] No copyrighted code without proper license
- [ ] All third-party code properly attributed
- [ ] Privacy policy considerations addressed if handling user data
- [ ] Terms of service considerations if providing service

## 6. Ongoing Security Practices

### 6.1 Monitoring and Maintenance
- Enable Dependabot for automatic dependency updates
- Regularly review security alerts and notifications
- Schedule periodic dependency updates
- Monitor for newly disclosed vulnerabilities in used technologies
- Keep documentation up to date with security practices

### 6.2 Incident Response
- Have a plan for responding to discovered vulnerabilities in public code
- Know how to quickly patch and release fixes
- Maintain contact information for security reporting
- Document lessons learned from security incidents

## 7. Specific Considerations for MiLyfe Components

### 7.1 For milyfe-platform (Next.js App)
- Ensure NEXT_PUBLIC_* variables are truly public-safe
- Verify no secrets in getServerSideProps or getStaticProps
- Check API routes for proper authentication and validation
- Ensure no client-side secrets exposed in frontend code
- Verify proper handling of Supabase tokens (if used client-side)

### 7.2 For milyfe-app (React Native/Expo)
- Verify no secrets in exposed JavaScript bundles
- Check for proper token storage (use secure storage libraries)
- Ensure no hardcoded API keys in exposed code
- Verify proper certificate pinning if used
- Check deep link handling for security issues

### 7.3 For fcc/Free Claude Code (if public)
- Verify no API keys to external LLMs in code
- Ensure proper sandboxing of agent execution
- Check for safe handling of user-provided prompts/code
- Verify proper validation of external tool integrations
- Ensure no privilege escalation in agent execution environment

## Approval Process
Any repository intended for public release must have this security requirements checklist completed and approved by the project maintainer or security lead before changing repository visibility to public.

---
*Last Updated: 2026-08-25*
*Based on workspace analysis and security best practices*