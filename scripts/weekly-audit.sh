#!/bin/bash
# Weekly dependency audit for TipTrack
# Checks for known vulnerabilities and outdated packages

set -euo pipefail

REPO_DIR="/workspace/repos/tip-track"
LOG_DIR="/workspace/repos/tip-track/.health-checks"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date '+%Y-%m-%d_%H:%M:%S')
LOG_FILE="$LOG_DIR/audit-$TIMESTAMP.log"

log() { echo "[$TIMESTAMP] $*" | tee -a "$LOG_FILE"; }

log "=== TipTrack Weekly Dependency Audit ==="

cd "$REPO_DIR"

# pnpm audit
log "=== pnpm audit ==="
pnpm audit >> "$LOG_FILE" 2>&1 || true

# Check for outdated packages
log "=== Outdated packages ==="
pnpm outdated >> "$LOG_FILE" 2>&1 || true

# Count vulnerabilities
HIGH_COUNT=$(pnpm audit --audit-level=high 2>&1 | grep -c "high" || true)
CRIT_COUNT=$(pnpm audit --audit-level=critical 2>&1 | grep -c "critical" || true)

log "High severity vulnerabilities: $HIGH_COUNT"
log "Critical severity vulnerabilities: $CRIT_COUNT"

# Check lock file age
LOCK_AGE=$(stat -c %Y "pnpm-lock.yaml" 2>/dev/null || echo "0")
NOW=$(date +%s)
LOCK_AGE_DAYS=$(( (NOW - LOCK_AGE) / 86400 ))
log "Lock file age: $LOCK_AGE_DAYS days"

if [ "$LOCK_AGE_DAYS" -gt 30 ]; then
  log "WARNING: pnpm-lock.yaml is over 30 days old. Consider updating dependencies."
fi

log "=== Audit complete ==="
