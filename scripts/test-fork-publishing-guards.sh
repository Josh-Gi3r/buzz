#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"

guard="github.repository == 'block/buzz'"
workflows=(
  .github/workflows/auto-tag-on-release-pr-merge.yml
  .github/workflows/desktop-release-cache-proof.yml
  .github/workflows/docker.yml
  .github/workflows/helm-chart.yml
  .github/workflows/linux-canary.yml
  .github/workflows/macos-intel-canary.yml
  .github/workflows/push-gateway-helm-chart.yml
  .github/workflows/release.yml
  .github/workflows/signed-macos-canary.yml
  .github/workflows/sprig-image.yml
  .github/workflows/sprig.yml
  .github/workflows/windows-canary.yml
)

for workflow in "${workflows[@]}"; do
  [[ -f "$workflow" ]] || {
    echo "missing publishing workflow: $workflow" >&2
    exit 1
  }
  grep -Fq "$guard" "$workflow" || {
    echo "publishing workflow lacks the block/buzz repository guard: $workflow" >&2
    exit 1
  }
done

sprig_image=.github/workflows/sprig-image.yml
grep -Fq "if: github.repository == 'block/buzz'" "$sprig_image"
grep -Fq "if: github.repository == 'block/buzz' && github.event_name != 'pull_request'" "$sprig_image"

echo "fork publishing guard contract passed"
