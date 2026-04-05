#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-manual}"

CONTAINER_NAME="${POSTGRES_CONTAINER_NAME:-experiment-lab-postgres}"
POSTGRES_DB="${POSTGRES_DB:-experiment_lab}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

MANUAL_PORT="${MANUAL_PORT:-3000}"
PLAYWRIGHT_PORT="${PLAYWRIGHT_PORT:-3001}"
PLAYWRIGHT_BASE_URL_DEFAULT="http://127.0.0.1:${PLAYWRIGHT_PORT}"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/run-local.sh manual
  ./scripts/run-local.sh playwright
  ./scripts/run-local.sh test
  ./scripts/run-local.sh help

Modes:
  manual      Installs deps if needed, prepares Postgres, pushes Prisma schema,
              seeds the demo user, and starts Next.js for manual browser testing.
  playwright  Prepares the same local stack, runs unit tests, then starts Next.js
              on the Playwright-friendly base URL.
  test        Runs Vitest only.
  help        Prints this message.

Notes:
  - manual mode serves the app at http://localhost:3000
  - playwright mode serves the app at http://127.0.0.1:3001
  - Run "npm run test:e2e" in a second terminal after playwright mode is up
EOF
}

log() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

ensure_prereqs() {
  require_cmd npm
  require_cmd docker
  require_cmd npx
}

ensure_env_file() {
  cd "$ROOT_DIR"

  if [[ ! -f .env ]]; then
    log "Creating .env from .env.example"
    cp .env.example .env
  fi
}

ensure_dependencies() {
  cd "$ROOT_DIR"

  if [[ ! -d node_modules ]]; then
    log "Installing npm dependencies"
    npm install
  fi
}

ensure_postgres() {
  if ! docker ps --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
    if docker ps -a --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
      log "Starting existing Postgres container: $CONTAINER_NAME"
      docker start "$CONTAINER_NAME" >/dev/null
    else
      log "Creating Postgres container: $CONTAINER_NAME"
      docker run \
        --name "$CONTAINER_NAME" \
        -e POSTGRES_DB="$POSTGRES_DB" \
        -e POSTGRES_USER="$POSTGRES_USER" \
        -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
        -p "${POSTGRES_PORT}:5432" \
        -d postgres:16 >/dev/null
    fi
  fi

  log "Waiting for Postgres readiness"
  docker exec "$CONTAINER_NAME" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"
}

prepare_database() {
  cd "$ROOT_DIR"

  log "Applying Prisma schema"
  npx prisma db push

  log "Seeding demo user"
  npm run db:seed
}

run_manual() {
  cd "$ROOT_DIR"
  log "Starting Next.js for manual browser testing at http://localhost:${MANUAL_PORT}"
  PORT="$MANUAL_PORT" NEXTAUTH_URL="http://localhost:${MANUAL_PORT}" npm run dev
}

run_playwright() {
  cd "$ROOT_DIR"
  log "Running Vitest before browser checks"
  npm test

  log "Starting Next.js for Playwright at ${PLAYWRIGHT_BASE_URL_DEFAULT}"
  PORT="$PLAYWRIGHT_PORT" \
    NEXTAUTH_URL="$PLAYWRIGHT_BASE_URL_DEFAULT" \
    PLAYWRIGHT_BASE_URL="$PLAYWRIGHT_BASE_URL_DEFAULT" \
    npm run dev
}

run_test() {
  cd "$ROOT_DIR"
  log "Running Vitest"
  npm test
}

case "$MODE" in
  manual)
    ensure_prereqs
    ensure_env_file
    ensure_dependencies
    ensure_postgres
    prepare_database
    run_manual
    ;;
  playwright)
    ensure_prereqs
    ensure_env_file
    ensure_dependencies
    ensure_postgres
    prepare_database
    run_playwright
    ;;
  test)
    ensure_prereqs
    ensure_dependencies
    run_test
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown mode: $MODE" >&2
    usage
    exit 1
    ;;
esac
