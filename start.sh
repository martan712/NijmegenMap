#!/usr/bin/env bash
#
# Starts the NijmegenKaart backend (Java/Javalin SPARQL service on :8088) and
# the frontend (Vite dev server). Ctrl-C stops both.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT="${PORT:-8088}"
FRONTEND_PORT="5173"   # Vite default

# --- free a TCP port by killing whatever is listening on it --------------
free_port() {
  local port="$1" pids
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  elif command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti "tcp:${port}" 2>/dev/null || true)"
    [[ -n "$pids" ]] && kill $pids 2>/dev/null || true
  fi
}

echo "Stopping anything already on :$BACKEND_PORT and :$FRONTEND_PORT ..."
free_port "$BACKEND_PORT"
free_port "$FRONTEND_PORT"
sleep 1   # give the ports a moment to be released

# --- cleanup: kill both children on exit ---------------------------------
pids=()
cleanup() {
  trap - INT TERM EXIT
  echo
  echo "Stopping..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# --- backend -------------------------------------------------------------
# Always rebuild so graph/ontology/code changes are picked up (the jar bundles
# the .ttl resources). Pass SKIP_BUILD=1 to skip and reuse the existing jar.
JAR="$ROOT/backend/target/nijmegenkaart-backend.jar"
if [[ "${SKIP_BUILD:-0}" == "1" && -f "$JAR" ]]; then
  echo "Skipping backend build (SKIP_BUILD=1); reusing existing jar."
else
  echo "Building backend..."
  (cd "$ROOT/backend" && ./mvnw -B package -q -DskipTests)
fi

echo "Starting backend on :$BACKEND_PORT ..."
PORT="$BACKEND_PORT" java -jar "$JAR" &
pids+=($!)

# --- frontend ------------------------------------------------------------
if [[ ! -d "$ROOT/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (cd "$ROOT" && npm install)
fi

echo "Starting frontend (Vite) ..."
(cd "$ROOT" && npm run dev) &
pids+=($!)

echo "Both running. Press Ctrl-C to stop."
wait
