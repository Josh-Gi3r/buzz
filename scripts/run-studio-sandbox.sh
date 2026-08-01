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
#   ./scripts/run-studio-sandbox.sh              # mock identity (default) — no real account
#   ./scripts/run-studio-sandbox.sh --fresh      # wipe sandbox app data first
#   ./scripts/run-studio-sandbox.sh --real-id    # throwaway sandbox key instead of the mock
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
# Default: e2e mock skips community/sign-in onboarding and never uses prod keys.
MOCK=1
for arg in "$@"; do
  case "$arg" in
    --fresh|-f) FRESH=1 ;;
    --real-id) MOCK=0 ;;
    --help|-h)
      sed -n '2,19p' "$0"
      exit 0
      ;;
  esac
done

export PATH="$ROOT/bin:$PATH"

echo "════════════════════════════════════════════════════════"
echo "  Buzz Studio Sandbox (isolated test client)"
echo "════════════════════════════════════════════════════════"
echo "  Bundle:   $INSTANCE_ID"
echo "  App data: \$HOME/Library/Application Support/$INSTANCE_ID"
echo "  Keyring:  $KEYRING"
echo "  Nest:     ~/.buzz-dev  (a production ~/.buzz is never used)"
echo "  Vite:     http://localhost:${VITE_PORT}"
echo "  Relay:    none started"
echo "  Account:  $([[ "$MOCK" == "1" ]] && echo 'E2E MOCK — no real sign-in / not your identity' || echo 'throwaway sandbox key (NOT prod account)')"
echo "  Production app data and ~/.buzz are not touched"
echo "════════════════════════════════════════════════════════"

# Ensure production nest is not the process cwd target
if [[ ! -d "$HOME/.buzz-dev" ]]; then
  mkdir -p "$HOME/.buzz-dev"
  echo "Created empty ~/.buzz-dev (dev nest). Prod ~/.buzz left as-is."
fi

# Build sidecars needed by Tauri (dev copies)
echo "→ Building agent/CLI sidecars (debug)…"
cargo build -p buzz-acp -p buzz-agent -p buzz-dev-mcp -p buzz-cli -p git-credential-nostr
TARGET=$(rustc -vV | sed -n 's|host: ||p')
TARGET_DIR=$(cargo metadata --format-version 1 --no-deps | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).target_directory")
mkdir -p desktop/src-tauri/binaries
for bin in buzz-acp buzz-agent buzz-dev-mcp git-credential-nostr buzz; do
  cp "${TARGET_DIR}/debug/${bin}" "desktop/src-tauri/binaries/${bin}-${TARGET}"
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
  echo "→ E2E mock mode: fake community, skip onboarding, no real account"
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
  "productName": "Buzz Studio Sandbox"
}
EOF
)

echo "→ Launching Tauri (Buzz Studio Sandbox)…"
echo "  Enable Preview Studio in Settings → Preview features after first paint."
echo "  Quit this window anytime; stock Buzz keeps running."
echo

exec pnpm exec tauri dev --config "$BUZZ_TAURI_CONFIG"
