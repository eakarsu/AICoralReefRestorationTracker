#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")"&&pwd)";[[ -f "$ROOT_DIR/.env" ]]||{ echo "Missing .env; copy .env.example." >&2;exit 1;}
set -a;. "$ROOT_DIR/.env";set +a
BACKEND_PORT="${BACKEND_PORT:-3079}";FRONTEND_PORT="${FRONTEND_PORT:-3078}";[[ -d "$ROOT_DIR/backend/node_modules"&&-d "$ROOT_DIR/frontend/node_modules" ]]||{ echo "Dependencies missing; run npm ci separately." >&2;exit 1;};for port in "$BACKEND_PORT" "$FRONTEND_PORT";do lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1&&{ echo "Port $port occupied; refusing to kill another process." >&2;exit 1;};done
(cd "$ROOT_DIR/backend"&&npm start)& backend_pid=$!;(cd "$ROOT_DIR/frontend"&&BROWSER=none PORT="$FRONTEND_PORT" REACT_APP_API_BASE="http://127.0.0.1:$BACKEND_PORT/api" npm start)& frontend_pid=$!;cleanup(){ kill "$backend_pid" "$frontend_pid" 2>/dev/null||true;};trap cleanup EXIT INT TERM;wait "$backend_pid" "$frontend_pid"
