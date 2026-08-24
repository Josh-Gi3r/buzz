#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
resolver="$repo_root/scripts/latest-upstream-desktop-tag.sh"
updater="$repo_root/scripts/sync-upstream-desktop-local.sh"
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
[[ -x "$updater" ]] || { echo "local updater is not executable" >&2; exit 1; }
bash -n "$updater"
grep -Fq 'git merge --no-commit --no-ff "$target_sha"' "$updater"
grep -Fq 'git merge-base HEAD "$current_sha"' "$updater"
grep -Fq 'git rm -r --ignore-unmatch .github/workflows' "$updater"
if grep -Eq '(^|[^[:alnum:]_])gh([^[:alnum:]_]|$)|git push|workflow_dispatch|schedule:' "$updater"; then
  echo "local updater contains remote mutation or Actions behavior" >&2
  exit 1
fi

if find "$repo_root/.github/workflows" -type f -print -quit 2>/dev/null | grep -q .; then
  echo "GitHub Actions workflows must remain absent" >&2
  exit 1
fi

echo "local upstream desktop sync contract passed"
