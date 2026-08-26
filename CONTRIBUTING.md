# Contributing to MiLyfe

MiLyfe is community-owned. We welcome contributions from everyone.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase account (free tier works)

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/MiLyfe-Platform-OS.git
cd MiLyfe-Platform-OS

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Fill in your Supabase credentials

# Start dev server
npm run dev
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your own Supabase project credentials. **Never commit `.env.local`** — it's gitignored.

## How to Contribute

### 1. Find or Create an Issue

- Check existing [issues](https://github.com/RealMiLyfe/MiLyfe-Platform-OS/issues)
- For new features, open a discussion first
- For bugs, include reproduction steps

### 2. Create a Branch

```bash
git checkout -b feat/your-feature
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes

- Follow existing code patterns and conventions
- Use TypeScript strict mode
- Add Zod validation for any new API inputs
- Include rate limiting on new API routes
- Sanitize any user-generated rich text

### 4. Test

```bash
npm run build        # Must pass with 0 errors
npx tsc --noEmit    # Must be clean
```

### 5. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: restructure code without behavior change
```

### 6. Open a Pull Request

- Target the `main` branch
- Fill out the PR template
- Link related issues
- Wait for review

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types in new code (existing `any` is being eliminated)
- Use Zod schemas for runtime validation

### Styling
- Tailwind CSS with project design tokens (harbor, teal, mly)
- Mobile-first responsive design
- Dark mode support required
- Min 44px touch targets for accessibility

### Security
- **Never** commit secrets, keys, or credentials
- Use server actions (not API routes) for state-changing operations when possible — they have built-in CSRF protection
- Add rate limiting to any new API route
- Sanitize HTML with DOMPurify before storage
- Validate all inputs with Zod at the boundary
- Use `createServerSupabase()` for server operations, `createClient()` for client

### Accessibility
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigable
- Color contrast compliance
- `prefers-reduced-motion` respected

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
│   ├── ui/           # Base design system
│   ├── shell/        # Layout components
│   └── [feature]/    # Feature-specific components
├── lib/              # Core logic
│   ├── actions/      # Server actions
│   ├── security/     # Rate limiting, sanitization, auth
│   ├── supabase/     # Database client setup
│   └── hooks/        # Custom React hooks
```

## Governance

Major platform changes (UBI amounts, decay rates, quorum requirements) are governed by the community through the proposal system at [milyfe.fun/governance](https://milyfe.fun/governance). Code changes that affect these parameters require a passed governance proposal.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). We enforce it.

## Questions?

Open a [discussion](https://github.com/RealMiLyfe/MiLyfe-Platform-OS/discussions) or reach out in the community forum at [milyfe.fun/forum](https://milyfe.fun/forum).
