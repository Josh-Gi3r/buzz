#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"

if [[ -d .github/workflows ]] && find .github/workflows -type f -print -quit | grep -q .; then
  echo "fork must not carry GitHub Actions workflows" >&2
  exit 1
fi

grep -Fq "deliberately carries no files under \`.github/workflows/\`" FORK_PATCHES.md
grep -Fq "do not add repository workflows" docs/development/releasing.md

echo "fork publishing guard contract passed"
