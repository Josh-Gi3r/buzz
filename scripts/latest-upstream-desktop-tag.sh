#!/usr/bin/env bash
set -euo pipefail

remote="${1:-https://github.com/block/buzz.git}"

git ls-remote --tags --refs "$remote" 'desktop-v*' \
  | awk '{ sub("refs/tags/", "", $2); print $2 }' \
  | grep -E '^desktop-v[0-9]+\.[0-9]+\.[0-9]+$' \
  | sort -V \
  | tail -n 1
