#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$PROJECT_DIR/.env" ]]; then
  echo "Missing .env. Copy .env.example and provide reviewed local values." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1091
source "$PROJECT_DIR/.env"
set +a
SERVER_PORT="${SERVER_PORT:-4000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
if [[ ! -d "$PROJECT_DIR/server/node_modules" || ! -d "$PROJECT_DIR/client/node_modules" ]]; then
  echo "Dependencies are absent. Install them explicitly in server and client; this launcher never changes dependencies." >&2
  exit 1
fi
for port in "$SERVER_PORT" "$FRONTEND_PORT"; do
  if command -v lsof >/dev/null 2>&1 && lsof -ti ":$port" >/dev/null 2>&1; then
    echo "Port $port is already in use" >&2
    exit 1
  fi
done

(
  cd "$PROJECT_DIR/server"
  npm start
) &
SERVER_PID=$!

(
  cd "$PROJECT_DIR/client"
  PORT="$FRONTEND_PORT" BROWSER=none npm start
) &
CLIENT_PID=$!

cleanup() {
  kill "$SERVER_PID" "$CLIENT_PID" 2>/dev/null || true
  wait "$SERVER_PID" "$CLIENT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait "$SERVER_PID" "$CLIENT_PID"
