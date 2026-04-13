#!/bin/bash

# Onekof Platform — Encrypted Database Backup Script
# ===================================================
#
# Creates a compressed, GPG-encrypted backup of the production database.
# Designed for Tier 1/2 self-hosted deployments where data sovereignty
# requires encrypted backups before any off-site transfer.
#
# Usage:
#   ./scripts/backup-database.sh                    # Standard backup
#   ./scripts/backup-database.sh --no-encrypt       # Skip encryption (dev only)
#   RETENTION_DAYS=90 ./scripts/backup-database.sh  # Custom retention
#
# Requirements:
#   - pg_dump (PostgreSQL client)
#   - gzip
#   - gpg (for encryption)
#   - DATABASE_URL environment variable
#   - GPG_RECIPIENT environment variable (for encryption)
#
# Encryption strategy:
#   Backups are encrypted with GPG using the recipient's public key.
#   For production Tier 1/2, use a Shamir 3-of-5 key split:
#     1. Generate a master GPG key for backups
#     2. Split the private key with: ssss-split -t 3 -n 5 < master.key
#     3. Distribute 5 shares to trusted parties (requires 3 to reconstruct)
#     4. Store shares in separate physical locations
#   See docs/architecture/three-tier-federation.md for details.
#
# Cron example (daily at 3 AM):
#   0 3 * * * cd /opt/onekof && ./scripts/backup-database.sh >> /var/log/onekof-backup.log 2>&1

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_FILE="onekof_backup_${TIMESTAMP}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
ENCRYPT="${1:---encrypt}"  # --no-encrypt to skip
GPG_RECIPIENT="${GPG_RECIPIENT:-}"

# ── Helpers ───────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

die() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

# ── Preflight checks ─────────────────────────────────────────────────────────

[ -z "${DATABASE_URL:-}" ] && die "DATABASE_URL environment variable is not set"
command -v pg_dump >/dev/null 2>&1 || die "pg_dump not found — install postgresql-client"
command -v gzip >/dev/null 2>&1 || die "gzip not found"

if [ "$ENCRYPT" != "--no-encrypt" ]; then
    command -v gpg >/dev/null 2>&1 || die "gpg not found — install gnupg or use --no-encrypt"
    [ -z "$GPG_RECIPIENT" ] && die "GPG_RECIPIENT not set. Set it to the backup key ID/email, or use --no-encrypt"
fi

mkdir -p "$BACKUP_DIR"

# ── Step 1: Dump ──────────────────────────────────────────────────────────────

log "Starting database backup..."

if pg_dump "$DATABASE_URL" --format=custom --compress=6 -f "${BACKUP_DIR}/${BACKUP_FILE}.dump"; then
    log "${GREEN}Database dumped successfully${NC}"
else
    die "pg_dump failed"
fi

DUMP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}.dump" | cut -f1)
log "Dump size: $DUMP_SIZE"

# ── Step 2: Compress ──────────────────────────────────────────────────────────

if gzip -9 "${BACKUP_DIR}/${BACKUP_FILE}.dump"; then
    log "${GREEN}Compressed successfully${NC}"
else
    die "gzip failed"
fi

COMPRESSED="${BACKUP_DIR}/${BACKUP_FILE}.dump.gz"
COMPRESSED_SIZE=$(du -h "$COMPRESSED" | cut -f1)
log "Compressed size: $COMPRESSED_SIZE"

# ── Step 3: Encrypt (optional) ───────────────────────────────────────────────

FINAL_FILE="$COMPRESSED"

if [ "$ENCRYPT" != "--no-encrypt" ]; then
    log "Encrypting with GPG (recipient: $GPG_RECIPIENT)..."

    if gpg --batch --yes --trust-model always \
        --recipient "$GPG_RECIPIENT" \
        --output "${COMPRESSED}.gpg" \
        --encrypt "$COMPRESSED"; then
        log "${GREEN}Encrypted successfully${NC}"
        rm -f "$COMPRESSED"  # Remove unencrypted version
        FINAL_FILE="${COMPRESSED}.gpg"
    else
        die "GPG encryption failed — unencrypted backup remains at $COMPRESSED"
    fi

    ENCRYPTED_SIZE=$(du -h "$FINAL_FILE" | cut -f1)
    log "Encrypted size: $ENCRYPTED_SIZE"
fi

# ── Step 4: Verify ───────────────────────────────────────────────────────────

FINAL_SIZE=$(du -h "$FINAL_FILE" | cut -f1)
CHECKSUM=$(sha256sum "$FINAL_FILE" | cut -d' ' -f1)
echo "$CHECKSUM  $(basename "$FINAL_FILE")" >> "${BACKUP_DIR}/checksums.sha256"
log "SHA-256: $CHECKSUM"

# ── Step 5: Cleanup old backups ──────────────────────────────────────────────

log "Cleaning up backups older than ${RETENTION_DAYS} days..."
CLEANED=$(find "$BACKUP_DIR" -name "onekof_backup_*" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)
log "Removed $CLEANED old backup files"

# ── Step 6: Backup uploaded files ────────────────────────────────────────────

BLOBS_DIR="${STORAGE_LOCAL_ROOT:-/var/onekof/blobs}"
if [ -d "$BLOBS_DIR" ] && [ "$(ls -A "$BLOBS_DIR" 2>/dev/null)" ]; then
    BLOBS_ARCHIVE="${BACKUP_DIR}/onekof_blobs_${TIMESTAMP}.tar.gz"
    log "Backing up uploaded files from $BLOBS_DIR..."

    if tar -czf "$BLOBS_ARCHIVE" -C "$(dirname "$BLOBS_DIR")" "$(basename "$BLOBS_DIR")"; then
        if [ "$ENCRYPT" != "--no-encrypt" ]; then
            gpg --batch --yes --trust-model always \
                --recipient "$GPG_RECIPIENT" \
                --output "${BLOBS_ARCHIVE}.gpg" \
                --encrypt "$BLOBS_ARCHIVE"
            rm -f "$BLOBS_ARCHIVE"
            BLOBS_ARCHIVE="${BLOBS_ARCHIVE}.gpg"
        fi
        BLOBS_SIZE=$(du -h "$BLOBS_ARCHIVE" | cut -f1)
        log "${GREEN}Uploaded files backed up: $BLOBS_SIZE${NC}"
    else
        log "${YELLOW}Warning: blob backup failed (non-fatal)${NC}"
    fi
else
    log "No uploaded files to back up"
fi

# ── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Backup Complete${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo "  Timestamp:    $TIMESTAMP"
echo "  Database:     $FINAL_SIZE ($([ "$ENCRYPT" != "--no-encrypt" ] && echo "encrypted" || echo "unencrypted"))"
echo "  Location:     $FINAL_FILE"
echo "  SHA-256:      ${CHECKSUM:0:16}..."
echo "  Retention:    $RETENTION_DAYS days"
echo "  Cleaned up:   $CLEANED old files"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""

# ── Optional: Off-site transfer ──────────────────────────────────────────────

# Uncomment ONE of the following for off-site disaster recovery:

# AWS S3 / MinIO:
# aws s3 cp "$FINAL_FILE" "s3://${AWS_BACKUP_BUCKET}/database/$(basename "$FINAL_FILE")"

# Vercel Blob (Tier 3 DR):
# curl -X PUT "https://blob.vercel-storage.com/backups/$(basename "$FINAL_FILE")" \
#   -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
#   --data-binary @"$FINAL_FILE"

# rsync to remote server:
# rsync -avz "$FINAL_FILE" "${BACKUP_REMOTE_HOST}:${BACKUP_REMOTE_PATH}/"

exit 0
