#!/bin/bash

# Database Backup Script for Onekof Platform
# This script creates a backup of the production database
# Usage: ./scripts/backup-database.sh

set -e  # Exit on error

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="onekof_backup_${TIMESTAMP}.sql"
LOG_FILE="./backups/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL environment variable is not set${NC}"
    echo "Please set it in your .env file or export it:"
    echo "export DATABASE_URL='your-database-url'"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "${YELLOW}Starting database backup...${NC}"

# Perform backup using pg_dump
if pg_dump "$DATABASE_URL" > "${BACKUP_DIR}/${BACKUP_FILE}"; then
    log "${GREEN}✓ Database dumped successfully${NC}"
else
    log "${RED}✗ Database dump failed${NC}"
    exit 1
fi

# Get file size before compression
ORIGINAL_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
log "Original backup size: $ORIGINAL_SIZE"

# Compress the backup
if gzip "${BACKUP_DIR}/${BACKUP_FILE}"; then
    log "${GREEN}✓ Backup compressed successfully${NC}"
else
    log "${RED}✗ Compression failed${NC}"
    exit 1
fi

# Get compressed file size
COMPRESSED_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}.gz" | cut -f1)
log "Compressed backup size: $COMPRESSED_SIZE"

# Calculate and display backup location
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}.gz"
log "${GREEN}✓ Backup completed successfully${NC}"
log "Backup location: $BACKUP_PATH"

# Clean up old backups (keep last 30 days)
log "${YELLOW}Cleaning up old backups...${NC}"
find "$BACKUP_DIR" -name "onekof_backup_*.sql.gz" -type f -mtime +30 -delete
log "${GREEN}✓ Old backups cleaned up${NC}"

# Display summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}   Backup Summary${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo "Timestamp: $TIMESTAMP"
echo "Original size: $ORIGINAL_SIZE"
echo "Compressed size: $COMPRESSED_SIZE"
echo "Location: $BACKUP_PATH"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# Optional: Upload to cloud storage
# Uncomment and configure if you want to upload to S3/GCS
# if [ ! -z "$AWS_BACKUP_BUCKET" ]; then
#     log "Uploading to AWS S3..."
#     aws s3 cp "$BACKUP_PATH" "s3://$AWS_BACKUP_BUCKET/database/$BACKUP_FILE.gz"
#     log "✓ Uploaded to S3"
# fi

exit 0
