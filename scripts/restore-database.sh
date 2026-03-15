#!/bin/bash

# Database Restore Script for Onekof Platform
# This script restores a database backup
# Usage: ./scripts/restore-database.sh <backup-file>

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}ERROR: No backup file specified${NC}"
    echo "Usage: ./scripts/restore-database.sh <backup-file>"
    echo "Example: ./scripts/restore-database.sh ./backups/onekof_backup_20260308_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}ERROR: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL environment variable is not set${NC}"
    exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}WARNING: This will restore the database from:${NC}"
echo "$BACKUP_FILE"
echo ""
echo -e "${RED}This will OVERWRITE all current data in the database!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Decompress if needed
TEMP_FILE="$BACKUP_FILE"
if [[ $BACKUP_FILE == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    TEMP_FILE="/tmp/$(basename ${BACKUP_FILE%.gz})"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    echo -e "${GREEN}✓ Decompressed${NC}"
fi

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
if psql "$DATABASE_URL" < "$TEMP_FILE"; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}✗ Database restore failed${NC}"
    # Clean up temp file if it was created
    if [[ $BACKUP_FILE == *.gz ]]; then
        rm -f "$TEMP_FILE"
    fi
    exit 1
fi

# Clean up temp file if it was created
if [[ $BACKUP_FILE == *.gz ]]; then
    rm -f "$TEMP_FILE"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}   Restore Complete${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo "Backup file: $BACKUP_FILE"
echo "Timestamp: $(date)"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

exit 0
