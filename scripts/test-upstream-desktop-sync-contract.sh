#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
workflow="$repo_root/.github/workflows/upstream-desktop-sync.yml"
resolver="$repo_root/scripts/latest-upstream-desktop-tag.sh"
baseline="$repo_root/.github/upstream-desktop-baseline"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

git -C "$tmp" init -q
git -C "$tmp" config user.name test
git -C "$tmp" config user.email test@example.com
echo first >"$tmp/file"
git -C "$tmp" add file
git -C "$tmp" commit -q -m first
git -C "$tmp" tag desktop-v0.5.8
git -C "$tmp" tag desktop-v0.6.0-beta.1
git -C "$tmp" tag mobile-v9.0.0
git -C "$tmp" tag desktop-v0.5.10

actual=$($resolver "$tmp")
[[ "$actual" == "desktop-v0.5.10" ]] || {
  echo "expected desktop-v0.5.10, got $actual" >&2
  exit 1
}

grep -Eq '^desktop-v[0-9]+\.[0-9]+\.[0-9]+ [0-9a-f]{40}$' "$baseline"
grep -Fq 'schedule:' "$workflow"
grep -Fq 'workflow_dispatch:' "$workflow"
grep -Fq 'scripts/latest-upstream-desktop-tag.sh' "$workflow"
grep -Fq 'git merge --no-ff --no-edit --signoff' "$workflow"
grep -Fq 'git merge --abort' "$workflow"
grep -Fq 'upstream moved the existing' "$workflow"
grep -Fq 'gh pr create' "$workflow"
grep -Fq 'gh issue create' "$workflow"
grep -Fq 'UPSTREAM_SYNC_TOKEN' "$workflow"

resolve_script="$tmp/resolve-released-upstream-baseline.sh"
awk '
  /^      - name: Resolve released upstream baseline$/ { found = 1; next }
  found && /^        run: \|$/ { in_run = 1; next }
  in_run && /^      - name:/ { exit }
  in_run { sub(/^          /, ""); print }
' "$workflow" >"$resolve_script"
[[ -s "$resolve_script" ]] || {
  echo "could not extract upstream baseline resolver from workflow" >&2
  exit 1
}
bash -n "$resolve_script"

if grep -Eq 'gh pr merge|git push[^\n]*origin[^\n]*main' "$workflow"; then
  echo "upstream sync workflow may merge or push directly to main" >&2
  exit 1
fi

echo "upstream desktop sync contract passed"
