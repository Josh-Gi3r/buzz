#!/usr/bin/env bash
# Launch an isolated dev instance of the desktop app with its own bundle ID,
# app-data directory, keyring, and nest (~/.buzz-dev). A production install
# and ~/.buzz are never read or written.
#
# Isolation:
#   - Bundle ID:  xyz.block.buzz.app.dev.studio-sandbox (dev-only instance ID;
#                 any distributed build must use its own identifier namespace,
#                 see FORK_PATCHES.md)
#   - App data:   ~/Library/Application Support/xyz.block.buzz.app.dev.studio-sandbox
#   - Keyring:    buzz-desktop-dev.studio-sandbox
#   - Nest:       ~/.buzz-dev
#   - No local relay is started
#   - --fresh wipes sandbox app data only, never a production install
#
# Usage:
#   ./scripts/run-studio-sandbox.sh              # normal onboarding in the sandbox
#   ./scripts/run-studio-sandbox.sh --fresh      # wipe sandbox app data first
#   ./scripts/run-studio-sandbox.sh --mock       # e2e mock data; BROWSER ONLY, see note
#
# Note: --mock injects the Playwright e2e bridge, which calls mockWindows()
# from @tauri-apps/api/mocks. That only works on a plain browser page — inside
# the real Tauri shell it throws and the window never paints. Use --mock with
# the dev URL in a browser, not with the app window.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

INSTANCE_ID="xyz.block.buzz.app.dev.studio-sandbox"
KEYRING="buzz-desktop-dev.studio-sandbox"
# High fixed ports so we don't collide with a random worktree port or anything
# interesting on 1420.
VITE_PORT="${BUZZ_STUDIO_VITE_PORT:-15240}"
HMR_PORT=$((VITE_PORT + 1))

FRESH=0
# Off by default: the e2e bridge cannot run inside the real Tauri shell.
MOCK=0
for arg in "$@"; do
  case "$arg" in
    --fresh|-f) FRESH=1 ;;
    --mock) MOCK=1 ;;
    --help|-h)
      sed -n '2,19p' "$0"
      exit 0
      ;;
  esac
done

export PATH="$ROOT/bin:$PATH"

echo "════════════════════════════════════════════════════════"
echo "  BUZZ — LIVE PREVIEW STUDIO Sandbox (isolated test client)"
echo "════════════════════════════════════════════════════════"
echo "  Bundle:   $INSTANCE_ID"
echo "  App data: \$HOME/Library/Application Support/$INSTANCE_ID"
echo "  Keyring:  $KEYRING"
echo "  Nest:     ~/.buzz-dev  (a production ~/.buzz is never used)"
echo "  Vite:     http://localhost:${VITE_PORT}"
echo "  Relay:    none started"
echo "  Account:  $([[ "$MOCK" == "1" ]] && echo 'E2E MOCK (browser only)' || echo 'sandbox keyring — a throwaway identity, never your prod account')"
echo "  Production app data and ~/.buzz are not touched"
echo "════════════════════════════════════════════════════════"

# Ensure production nest is not the process cwd target
if [[ ! -d "$HOME/.buzz-dev" ]]; then
  mkdir -p "$HOME/.buzz-dev"
  echo "Created empty ~/.buzz-dev (dev nest). Prod ~/.buzz left as-is."
fi

# Build the sidecars Tauri expects. The list is read from tauri.conf.json so an
# upstream merge that adds a sidecar cannot silently break this script.
BINS=$(node -p "JSON.parse(require('fs').readFileSync('desktop/src-tauri/tauri.conf.json','utf8')).bundle.externalBin.map(p => p.split('/').pop()).join(' ')")
echo "→ Building sidecars (debug): $BINS"

# Map binary name -> cargo package (they differ for the CLI).
pkg_for_bin() {
  case "$1" in
    buzz) echo "buzz-cli" ;;
    *) echo "$1" ;;
  esac
}

CARGO_ARGS=()
for bin in $BINS; do
  CARGO_ARGS+=(-p "$(pkg_for_bin "$bin")")
done
cargo build "${CARGO_ARGS[@]}"

TARGET=$(rustc -vV | sed -n 's|host: ||p')
TARGET_DIR=$(cargo metadata --format-version 1 --no-deps | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).target_directory")
mkdir -p desktop/src-tauri/binaries
for bin in $BINS; do
  src="${TARGET_DIR}/debug/${bin}"
  if [[ ! -f "$src" ]]; then
    echo "✗ sidecar '$bin' was not produced at $src" >&2
    exit 1
  fi
  cp "$src" "desktop/src-tauri/binaries/${bin}-${TARGET}"
  chmod +x "desktop/src-tauri/binaries/${bin}-${TARGET}"
done

cd desktop
[[ -d node_modules ]] || pnpm install

# Never inherit a prod/share identity into the sandbox
unset BUZZ_PRIVATE_KEY BUZZ_SHARE_IDENTITY || true

export BUZZ_DEV_KEYRING_SERVICE="$KEYRING"
export BUZZ_VITE_PORT="$VITE_PORT"
export BUZZ_HMR_PORT="$HMR_PORT"
export VITE_PORT="$VITE_PORT"
export VITE_HMR_PORT="$HMR_PORT"
# Do not auto-point at a local relay the user isn't running for this sandbox
unset BUZZ_RELAY_URL || true

# Build query: always prefer mock (no account) unless --real-id
QS=()
if [[ "$FRESH" == "1" ]]; then
  QS+=("resetDevState=1")
  export BUZZ_RESET_WEBVIEW_STATE=1
  echo "→ Fresh wipe of sandbox app data only…"
  "$ROOT/scripts/reset-desktop-standalone-state.sh" "$INSTANCE_ID" "$KEYRING"
fi
if [[ "$MOCK" == "1" ]]; then
  QS+=("e2e=mock")
  echo "→ E2E mock mode (browser only — the app window will not paint with this)"
fi
DEV_URL="http://localhost:${VITE_PORT}"
if [[ ${#QS[@]} -gt 0 ]]; then
  DEV_URL="${DEV_URL}?$(IFS='&'; echo "${QS[*]}")"
fi

export BUZZ_TAURI_CONFIG=$(cat <<EOF
{
  "build": {
    "devUrl": "${DEV_URL}",
    "beforeDevCommand": "exec ./node_modules/.bin/vite --port ${VITE_PORT} --strictPort"
  },
  "identifier": "${INSTANCE_ID}",
  "productName": "BUZZ — LIVE PREVIEW STUDIO Sandbox"
}
EOF
)

echo "→ Launching Tauri (BUZZ — LIVE PREVIEW STUDIO Sandbox)…"
echo "  Enable BUZZ — LIVE PREVIEW STUDIO in Settings → Preview features after first paint."
echo "  Quit this window anytime; stock Buzz keeps running."
echo

exec pnpm exec tauri dev --config "$BUZZ_TAURI_CONFIG"
