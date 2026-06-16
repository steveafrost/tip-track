#!/bin/bash
# Daily health check for TipTrack
# Runs: build, type-check, lint, and reports status

set -euo pipefail

REPO_DIR="/workspace/repos/tip-track"
LOG_DIR="/workspace/repos/tip-track/.health-checks"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y-%m-%d_%H:%M:%S')
LOG_FILE="$LOG_DIR/health-check-$TIMESTAMP.log"
STATUS=0

log() { echo "[$TIMESTAMP] $*" | tee -a "$LOG_FILE"; }

log "=== TipTrack Daily Health Check ==="

cd "$REPO_DIR"

# 1. Check Node version
log "Node version: $(node -v)"
log "pnpm version: $(pnpm -v 2>/dev/null || echo 'not found')"

# 2. Check if pnpm-lock.yaml is consistent
log "Checking dependency lock..."
if [ -f "pnpm-lock.yaml" ]; then
  log "pnpm-lock.yaml exists ($(wc -c < pnpm-lock.yaml) bytes)"
else
  log "WARNING: pnpm-lock.yaml missing!"
  STATUS=1
fi

# 3. Build check
log "Running build..."
if pnpm build >> "$LOG_FILE" 2>&1; then
  log "BUILD: OK"
else
  log "BUILD: FAILED"
  STATUS=1
fi

# 4. TypeScript check
log "Running TypeScript check..."
if pnpm exec tsc --noEmit >> "$LOG_FILE" 2>&1; then
  log "TYPECHECK: OK"
else
  log "TYPECHECK: FAILED"
  STATUS=1
fi

# 5. Lint check
log "Running lint..."
if pnpm lint >> "$LOG_FILE" 2>&1; then
  log "LINT: OK"
else
  log "LINT: FAILED (warnings may be present)"
fi

# 6. Check Prisma schema
log "Checking Prisma schema..."
if [ -f "prisma/schema.prisma" ]; then
  log "PRISMA SCHEMA: OK ($(wc -l < prisma/schema.prisma) lines)"
else
  log "PRISMA SCHEMA: MISSING"
  STATUS=1
fi

# 7. Check if .nvmrc matches
log "Checking .nvmrc..."
NVM_REQUIRED=$(cat .nvmrc 2>/dev/null || echo "unknown")
NVM_CURRENT=$(node -v | sed 's/v//')
log ".nvmrc requires: $NVM_REQUIRED, current: $NVM_CURRENT"

# 8. Check for dependency vulnerabilities (pnpm audit)
log "Running dependency audit..."
pnpm audit --audit-level=high 2>&1 | tail -10 >> "$LOG_FILE" || true

log "=== Health check complete (status=$STATUS) ==="
exit $STATUS
