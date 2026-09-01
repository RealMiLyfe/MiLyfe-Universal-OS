#!/usr/bin/env bash
# One-time setup: point git at the versioned .githooks directory and make hooks executable.
# Run once after cloning:  bash scripts/setup-git-hooks.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
chmod +x .githooks/* scripts/secret-scan.sh 2>/dev/null || true
git config core.hooksPath .githooks
echo "✅ Git hooks enabled (core.hooksPath=.githooks). Secret pre-commit scan active."
