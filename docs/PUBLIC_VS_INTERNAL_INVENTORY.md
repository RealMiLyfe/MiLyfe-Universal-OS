# MiLyfe Project: Public vs Internal Tooling Inventory

## Overview
This document inventories what components of the MiLyfe project should be made public versus what should remain internal tooling, based on analysis of the current workspace.

## Public-Facing Components (Safe for Public Repositories)

### 1. Core Platform Applications
- **milyfe-platform/**
  - Next.js web application
  - Public interfaces: landing page, onboarding, dashboard, wallet, rewards, connections
  - Corresponds to existing public repo: `MiLyfe-Platform-OS`
  - **NOTE**: While the code is public, `.env.local` and other secret files MUST be excluded

- **milyfe-app/**
  - React Native/Expo mobile application
  - Public interfaces: mobile companion app
  - May correspond to existing public repo (check GitHub_Readiness.md)

### 2. Public Infrastructure & Tools
- **fcc/** (Free Claude Code)
  - Python-based agent system
  - Public interfaces: agent framework, API endpoints
  - **Potentially public** if intended as open-source tool
  - Contains `.env.example` - shows what configuration is needed without exposing secrets
  - Has public repo potential based on MIT license visible in README

### 3. Documented Public Repositories (from GitHub_Readiness.md)
Based on the GitHub readiness assessment, these already have public repos:
- **MiLyfe** - Main repo (current codebase)
- **MiCity** - "MiLyfe OS — The Operating System for Humanity"
- **Bldg** - Governance UI
- **MiLyfe-Platform** - Platform arena build
- **MiLyfeOS** - OS-style portal build
- **MiForge** - Vercel frontend for Titan Bridge
- **MiForgeTVS** - Titan Venture Studio forge
- **Forge** - Another forge iteration

These correspond to builds found in `OtherMilyfeBuilds/`:
- `MiLyfe-repo/` → MiLyfe
- `MiCity/` → MiCity
- `Bldg-main/` → Bldg
- `MiLyfe-Platform-arena-*/` → MiLyfe-Platform
- `MiLyfe-OS-arena-*/` → MiLyfeOS
- etc.

## Internal Tooling (Should NOT Be Public)

### 1. Secret Configuration Files
- **milyfe-platform/.env.local**
  - Contains: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, UBI_CRON_SECRET, CRON_SECRET
  - **CRITICAL**: SUPABASE_SERVICE_ROLE_KEY provides full database access
  
- **milyfe-fresh/.env.local**
  - Contains similar Supabase keys
  
- **ANY** `.env`, `.env.local`, `.env.production`, or similar files containing:
  - API keys
  - Database credentials
  - Service tokens
  - Cryptographic keys
  - Webhook secrets

### 2. Internal Strategy & Planning Documents
- **Campaign_Private/**
  - `Strategy.md` - Campaign/business strategy
  - `Titan_Agent_System.md` - Internal agent system documentation
  
- **MiLyfe_Strategy_Private.md**
  - Private strategic planning
  
- Other `*_PRIVATE.md` or documents in clearly marked private directories

### 3. Development & Testing Artifacts
- **node_modules/** directories in any project
  - Should never be committed; regenerated via package managers
  
- Build output directories:
  - `.next/` (Next.js build output)
  - `.expo/` (Expo build output)
  - `.vercel/` (Vercel deployment configs - may contain secrets)
  
- Test outputs, logs, temporary files:
  - `*.log` files
  - `npm-debug.log*`, `yarn-debug.log*`, `pnpm-debug.log*`
  - Coverage reports (`coverage/`, `lcov-info`)
  - Temporary upload/processing directories

### 4. Internal System Components
- **supabase/** directory
  - May contain local Supabase configurations or migrations
  
- **.claude/** directory
  - Claude Code configurations, skills, settings
  - May contain custom agent configurations or workflows
  
- IDE-specific configurations:
  - `.vscode/`, `.idea/` (may contain workspace-specific settings)
  - `*.sublime-*`, `*.vim*` files

### 5. Backup and Archive Files
- `*.zip`, `*.bak`, `*.backup`, `*.old` files
- Documented in workspace: various `.zip` backups of repositories
- These often contain historical versions that may include removed secrets

## Decision Framework for Public vs Internal

### Make PUBLIC if:
1. Contains user-facing features or interfaces
2. Represents core product functionality meant for users
3. Is documentation meant for public consumption or contributors
4. Is tooling meant to be shared with the community
5. Can be shared without exposing:
   - Secrets/credentials
   - Internal business strategies
   - Security vulnerabilities
   - Personal data

### Keep INTERNAL if:
1. Contains secrets, credentials, or keys
2. Contains unreleased product strategies or business plans
3. Is configuration for internal development/testing environments
4. Contains security-sensitive implementations
5. Is personal/workspace-specific configuration
6. Would aid attackers if made public

## Recommendations for Public Repository Preparation

1. **For each component intended for public release**:
   - Verify no secret files are included (.env, keys, tokens, etc.)
   - Ensure build artifacts are excluded via .gitignore
   - Verify license compatibility of all dependencies
   - Check for any accidentally committed sensitive data in history
   - Add appropriate documentation (README, CONTRIBUTING, SECURITY)

2. **When creating fresh repositories**:
   - Start with minimal viable public version
   - Establish security practices from commit zero
   - Implement branch protection and review requirements
   - Enable dependency scanning and secret scanning

3. **For existing repositories being cleaned**:
   - Consider history rewriting ONLY if absolutely necessary and with extreme caution
   - Preferably create fresh repo with clean state
   - If rewriting history, use tools like `git filter-repo` or BFG
   - Verify thoroughly that no remnants remain