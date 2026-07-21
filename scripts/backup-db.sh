#!/usr/bin/env bash
# Onekof Platform — Automated Database Backup
# =============================================
# Runs pg_dump against the PostgreSQL container and stores compressed
# backups on the data disk with 7-day rolling retention.
#
# Usage (from host cron):
#   0 0 * * * /opt/onekof/scripts/backup-db.sh >> /var/log/onekof-backup.log 2>&1
#
# The cron schedule above runs at 00:00 UTC = 03:00 EAT (UTC+3).
#
# Backup location: /var/onekof/backups/ (on the separate data disk)
# Retention: 7 days (older backups are automatically pruned)
# Format: custom (pg_restore compatible, compressed)

set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
COMPOSE_FILE="/opt/onekof/docker-compose.prod.yml"
BACKUP_DIR="/var/onekof/backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/onekof-${TIMESTAMP}.dump"

# Colors for log output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}[backup]${NC} $*"; }
fail() { echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}[backup FAIL]${NC} $*"; exit 1; }

# ---------------------------------------------------------------------------
# Pre-flight
# ---------------------------------------------------------------------------
mkdir -p "${BACKUP_DIR}"

# Read DB credentials from .env.production
if [ -f /opt/onekof/.env.production ]; then
    POSTGRES_USER=$(grep -E '^POSTGRES_USER=' /opt/onekof/.env.production | cut -d= -f2)
    POSTGRES_DB=$(grep -E '^POSTGRES_DB=' /opt/onekof/.env.production | cut -d= -f2)
else
    fail ".env.production not found at /opt/onekof/"
fi

# Verify postgres container is running
if ! docker compose -f "${COMPOSE_FILE}" ps postgres --format '{{.State}}' 2>/dev/null | grep -q "running"; then
    fail "PostgreSQL container is not running"
fi

# ---------------------------------------------------------------------------
# Backup
# ---------------------------------------------------------------------------
log "Starting backup → ${BACKUP_FILE}"

docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    pg_dump -U "${POSTGRES_USER}" \
    --format=custom \
    --compress=9 \
    "${POSTGRES_DB}" > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log "Backup complete: ${BACKUP_FILE} (${BACKUP_SIZE})"

# ---------------------------------------------------------------------------
# Retention — prune backups older than 7 days
# ---------------------------------------------------------------------------
PRUNED=$(find "${BACKUP_DIR}" -name "onekof-*.dump" -mtime +${RETENTION_DAYS} -print -delete | wc -l)
if [ "${PRUNED}" -gt 0 ]; then
    log "Pruned ${PRUNED} backup(s) older than ${RETENTION_DAYS} days"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
TOTAL=$(find "${BACKUP_DIR}" -name "onekof-*.dump" | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
log "Backup inventory: ${TOTAL} file(s), ${TOTAL_SIZE} total"
