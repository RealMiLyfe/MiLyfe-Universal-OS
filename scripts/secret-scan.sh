#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# secret-scan.sh — Scan given files (or staged files) for secret patterns.
# Used by both the pre-commit hook (staged files) and CI (whole tree).
#
# Usage:
#   scripts/secret-scan.sh --staged        # scan staged files (pre-commit)
#   scripts/secret-scan.sh --all           # scan all tracked files (CI)
#   scripts/secret-scan.sh file1 file2 ... # scan specific files
#
# Exit 0 = clean, Exit 1 = secret(s) found.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# High-signal secret patterns. Kept tight to avoid false positives on env-var
# NAMES (e.g. SUPABASE_SERVICE_ROLE_KEY) while catching actual secret VALUES.
PATTERNS=(
  # Supabase / generic JWT (three base64url segments starting with the standard header)
  'eyJhbGciOiJ[A-Za-z0-9_-]{5,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'
  # Cloudflare API token
  'cfat_[A-Za-z0-9]{20,}'
  # OpenAI / OpenRouter
  'sk-[A-Za-z0-9]{20,}'
  'sk-or-v1-[A-Za-z0-9]{20,}'
  # Cerebras
  'csk-[A-Za-z0-9]{20,}'
  # AWS access key id
  'AKIA[0-9A-Z]{16}'
  # Google API key
  'AIza[0-9A-Za-z_-]{35}'
  # GitHub tokens
  'gh[pousr]_[A-Za-z0-9]{36,}'
  'github_pat_[A-Za-z0-9_]{40,}'
  # Stripe live/test
  'sk_live_[A-Za-z0-9]{20,}'
  'rk_live_[A-Za-z0-9]{20,}'
  # Slack
  'xox[baprs]-[A-Za-z0-9-]{10,}'
  # Private key blocks
  '-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----'
  # Supabase service_role token prefix (sbp_)
  'sbp_[A-Za-z0-9]{40,}'
)

# Files that are allowed to contain example/placeholder patterns.
ALLOWLIST_REGEX='(\.example$|\.template$|secret-scan\.sh$|SECURITY\.md$|\.md:.*placeholder)'

# Determine target files
FILES=()
case "${1:-}" in
  --staged)
    while IFS= read -r f; do [ -n "$f" ] && FILES+=("$f"); done < <(git diff --cached --name-only --diff-filter=ACM)
    ;;
  --all)
    while IFS= read -r f; do [ -n "$f" ] && FILES+=("$f"); done < <(git ls-files)
    ;;
  *)
    FILES=("$@")
    ;;
esac

[ ${#FILES[@]} -eq 0 ] && { echo "secret-scan: no files to scan"; exit 0; }

FOUND=0
for f in "${FILES[@]}"; do
  [ -f "$f" ] || continue
  # skip binary
  if file --mime "$f" 2>/dev/null | grep -q 'charset=binary'; then continue; fi
  # skip allowlisted example/template files
  if echo "$f" | grep -qE "$ALLOWLIST_REGEX"; then continue; fi
  for pat in "${PATTERNS[@]}"; do
    if grep -EnI "$pat" "$f" >/dev/null 2>&1; then
      echo "❌ Potential secret in: $f"
      grep -EnI "$pat" "$f" | sed 's/\(.\{80\}\).*/\1.../' | head -3 | sed 's/^/     /'
      FOUND=1
    fi
  done
done

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "🛑 Secret pattern(s) detected. Commit blocked."
  echo "   • If this is a real secret: remove it, put it in .env (gitignored), rotate it."
  echo "   • If it's a placeholder in an example file: name the file *.example or *.template."
  exit 1
fi

echo "✅ secret-scan: clean (${#FILES[@]} files)"
exit 0
