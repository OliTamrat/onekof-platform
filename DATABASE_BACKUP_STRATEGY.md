# Database Backup Strategy for Onekof Platform

## Overview
This document outlines the comprehensive database backup and disaster recovery strategy for the Onekof platform.

## Current Setup
- **Database**: Supabase PostgreSQL
- **Connection**: Session Pooler for serverless compatibility
- **Location**: AWS Frankfurt (eu-central-1)

## Backup Strategy

### 1. Automated Daily Backups
**Provider**: Supabase (Built-in)
- **Frequency**: Daily at 3:00 AM UTC
- **Retention**: 7 days for Free tier, 30 days for Pro tier
- **Type**: Full database snapshots
- **Storage**: Supabase infrastructure (encrypted)

**Action Required**: Upgrade to Supabase Pro for extended retention

### 2. Point-in-Time Recovery (PITR)
**Status**: Available on Supabase Pro tier
- **RPO (Recovery Point Objective)**: Minutes
- **RTO (Recovery Time Objective)**: < 1 hour
- **Retention**: Up to 30 days

**Action Required**: Enable PITR on Supabase Pro plan

### 3. Manual Backup Script
Location: `scripts/backup-database.sh`

```bash
#!/bin/bash
# Manual database backup script
# Usage: ./scripts/backup-database.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="onekof_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup using pg_dump
pg_dump $DATABASE_URL > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress the backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

echo "Backup completed: ${BACKUP_FILE}.gz"

# Optional: Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
# aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" s3://onekof-backups/
```

### 4. Export Critical Data
**Tables to prioritize**:
- `User` - User accounts and credentials
- `Organization` - Organization data
- `OrganizationMember` - Membership relationships
- `Project` - Project data
- `Budget` - Financial data
- `Expense` - Transaction records

### 5. Backup Testing
**Schedule**: Monthly
**Process**:
1. Restore backup to test environment
2. Verify data integrity
3. Test application functionality
4. Document any issues

### 6. Off-site Backup Storage
**Recommended Providers**:
- AWS S3 (Glacier for long-term storage)
- Google Cloud Storage (Nearline/Coldline)
- Backblaze B2 (Cost-effective alternative)

**Configuration**:
```typescript
// Example: Upload to AWS S3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function uploadBackupToS3(filePath: string) {
  const s3 = new S3Client({ region: 'eu-central-1' });

  const command = new PutObjectCommand({
    Bucket: 'onekof-backups',
    Key: `database/${path.basename(filePath)}`,
    Body: fs.createReadStream(filePath),
    ServerSideEncryption: 'AES256',
  });

  await s3.send(command);
}
```

## Disaster Recovery Plan

### Scenario 1: Database Corruption
**Steps**:
1. Stop all write operations
2. Assess extent of corruption
3. Restore from latest healthy backup
4. Verify data integrity
5. Resume operations

**Estimated Downtime**: 30-60 minutes

### Scenario 2: Accidental Data Deletion
**Steps**:
1. Identify affected tables/records
2. Use PITR to restore to point before deletion
3. Verify restored data
4. Merge with current data if needed

**Estimated Downtime**: 15-30 minutes

### Scenario 3: Complete Database Loss
**Steps**:
1. Provision new Supabase database
2. Restore from most recent backup
3. Update connection strings
4. Verify all services
5. Monitor for issues

**Estimated Downtime**: 2-4 hours

## Backup Verification

### Daily Checks
- Verify backup completion logs
- Check backup file sizes (should be consistent)
- Monitor backup storage usage

### Weekly Checks
- Sample restore test (select random tables)
- Verify backup encryption
- Check backup retention compliance

### Monthly Checks
- Full restore test in staging environment
- Performance testing after restore
- Update disaster recovery documentation

## Compliance & Security

### Data Encryption
- **At Rest**: AES-256 encryption (Supabase default)
- **In Transit**: TLS 1.3
- **Backup Files**: Encrypted before upload to off-site storage

### Access Control
- Backup access limited to senior engineers
- MFA required for production database access
- Audit logs for all backup/restore operations

### Retention Policy
- **Daily Backups**: 30 days
- **Weekly Backups**: 90 days
- **Monthly Backups**: 1 year
- **Annual Backups**: 7 years (for compliance)

## Monitoring & Alerts

### Alert Triggers
- Backup failure
- Backup file size deviation > 50%
- Storage capacity > 80%
- Backup age > 25 hours

### Notification Channels
- Email: ops@onekof.com
- Slack: #platform-alerts
- PagerDuty: Critical failures

## Cost Estimation

### Supabase Pro Tier
- **Cost**: $25/month
- **Includes**: 8GB database, daily backups, PITR

### Off-site Storage (AWS S3)
- **Estimated**: $5-10/month
- **Breakdown**:
  - Standard storage: $0.023/GB
  - Glacier (long-term): $0.004/GB
  - Data transfer: Minimal

**Total Estimated Monthly Cost**: $30-35

## Implementation Checklist

- [ ] Upgrade to Supabase Pro tier
- [ ] Enable Point-in-Time Recovery
- [ ] Create backup scripts (`scripts/backup-database.sh`)
- [ ] Set up off-site storage (AWS S3)
- [ ] Configure automated backup uploads
- [ ] Set up monitoring and alerts
- [ ] Document restore procedures
- [ ] Schedule monthly disaster recovery drills
- [ ] Train team on backup/restore process
- [ ] Create incident response runbook

## Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Verify daily backups | Daily | Automated |
| Review backup logs | Weekly | DevOps |
| Test restore process | Monthly | Engineering |
| DR drill (full test) | Quarterly | All teams |
| Update documentation | As needed | Engineering |
| Review and optimize costs | Quarterly | Finance + DevOps |

## Contact Information

**Primary Contact**: DevOps Team
- Email: devops@onekof.com
- Phone: [TBD]

**Secondary Contact**: CTO
- Email: cto@onekof.com

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-08 | Claude Code | Initial backup strategy document |

---

**Last Updated**: 2026-03-08
**Next Review**: 2026-06-08
