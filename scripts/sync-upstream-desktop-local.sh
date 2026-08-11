#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
baseline_file="$repo_root/.github/upstream-desktop-baseline"
upstream_url="${BUZZ_UPSTREAM_URL:-https://github.com/block/buzz.git}"
target=""
fetch=0

usage() {
  cat <<'EOF'
Usage: scripts/sync-upstream-desktop-local.sh [--fetch] [desktop-vX.Y.Z]

Merges a newer stable Buzz desktop release into the current local checkout.
It never pushes, opens a PR, or invokes GitHub Actions. Run it only from a
clean worktree.

  --fetch   fetch stable desktop tags from the official upstream first
EOF
}

while (($#)); do
  case "$1" in
    --fetch) fetch=1 ;;
    -h|--help) usage; exit 0 ;;
    desktop-v[0-9]*.[0-9]*.[0-9]*)
      [[ -z "$target" ]] || { echo "only one target tag may be supplied" >&2; exit 2; }
      target=$1
      ;;
    *) echo "unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done

cd "$repo_root"
git diff --quiet && git diff --cached --quiet || {
  echo "the worktree must be clean before an upstream upgrade" >&2
  exit 1
}

read -r current current_sha < "$baseline_file"
tag_pattern='^desktop-v[0-9]+\.[0-9]+\.[0-9]+$'
[[ "$current" =~ $tag_pattern && "$current_sha" =~ ^[0-9a-f]{40}$ ]] || {
  echo "invalid baseline: $(cat "$baseline_file")" >&2
  exit 1
}

if ((fetch)); then
  git fetch --no-tags "$upstream_url" '+refs/tags/desktop-v*:refs/tags/desktop-v*'
fi

if [[ -z "$target" ]]; then
  target=$(git tag --list 'desktop-v*' | grep -E "$tag_pattern" | sort -V | tail -n 1)
fi
[[ "$target" =~ $tag_pattern ]] || { echo "invalid target tag: $target" >&2; exit 1; }

git cat-file -e "$current_sha^{commit}" 2>/dev/null || {
  echo "baseline object $current_sha is missing; rerun with --fetch" >&2
  exit 1
}
target_sha=$(git rev-list -n 1 "$target" 2>/dev/null || true)
[[ "$target_sha" =~ ^[0-9a-f]{40}$ ]] || {
  echo "target $target is missing locally; rerun with --fetch" >&2
  exit 1
}

[[ "$(git rev-list -n 1 "$current")" == "$current_sha" ]] || {
  echo "recorded tag $current no longer resolves to $current_sha" >&2
  exit 1
}

current_version=${current#desktop-v}
target_version=${target#desktop-v}
highest=$(printf '%s\n%s\n' "$current_version" "$target_version" | sort -V | tail -n 1)
[[ "$highest" == "$target_version" ]] || {
  echo "refusing downgrade from $current to $target" >&2
  exit 1
}
if [[ "$current_sha" == "$target_sha" ]]; then
  echo "already current at $target ($target_sha)"
  exit 0
fi

git merge-base HEAD "$current_sha" >/dev/null || {
  echo "current checkout does not share official history with recorded baseline $current" >&2
  exit 1
}

echo "Merging $current ($current_sha) -> $target ($target_sha) locally"
if ! git merge --no-commit --no-ff "$target_sha"; then
  git rm -r --ignore-unmatch .github/workflows >/dev/null 2>&1 || true
  echo >&2
  echo "The release overlaps fork changes. Resolve the listed files locally," >&2
  echo "stage them, then update $baseline_file to:" >&2
  echo "$target $target_sha" >&2
  exit 1
fi

# This fork deliberately performs no GitHub Actions. Keep upstream history and
# source changes while excluding workflow files from the resulting merge.
git rm -r --ignore-unmatch .github/workflows >/dev/null 2>&1 || true
printf '%s %s\n' "$target" "$target_sha" > "$baseline_file"
git add "$baseline_file"
echo "Merged $target without committing. Review and test, then commit the merge; nothing was pushed."
