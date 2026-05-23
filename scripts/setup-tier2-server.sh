#!/usr/bin/env bash
# =============================================================================
# Onekof Platform — Tier 2 Server Setup Script
# =============================================================================
# Idempotent: safe to run multiple times on the same server.
#
# What this script does:
#   1. Updates system packages
#   2. Installs Docker Engine + Compose plugin
#   3. Creates deploy directory at /opt/onekof
#   4. Generates strong random secrets for Postgres and Redis
#   5. Creates .env.production from the example template
#   6. Creates /opt/backups directory for DB backups
#   7. Installs the daily backup cron job
#   8. Starts the full production stack
#   9. Runs Prisma migrations
#  10. Prints the smoke-test checklist
#
# USAGE:
#   1. SSH into the server as ubuntu (or any sudo user)
#   2. Upload the repo or clone it:
#        git clone https://github.com/your-org/onekof-platform.git /opt/onekof
#   3. Run this script from the repo root:
#        cd /opt/onekof && bash scripts/setup-tier2-server.sh
#
# AFTER RUNNING:
#   - Edit /opt/onekof/.env.production to fill in RESEND_API_KEY, SENTRY_DSN,
#     and any other optional values.
#   - Point your DNS A record to this server's IP.
#   - Update NEXTAUTH_URL and NEXT_PUBLIC_APP_URL to your real domain.
#
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[setup]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $1"; }
fail() { echo -e "${RED}[fail]${NC}  $1"; exit 1; }

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_DIR/.env.production"
COMPOSE_FILE="$REPO_DIR/docker-compose.prod.yml"
BACKUP_DIR="/opt/backups/onekof"
CRON_TAG="onekof-daily-backup"

log "=== Onekof Tier 2 Server Setup ==="
log "Repo: $REPO_DIR"

# -----------------------------------------------------------------------------
# 1. System packages
# -----------------------------------------------------------------------------
log "Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# -----------------------------------------------------------------------------
# 2. Docker
# -----------------------------------------------------------------------------
if ! command -v docker &>/dev/null; then
  log "Installing Docker Engine..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  warn "Docker installed. You may need to log out and back in for group changes."
else
  log "Docker already installed: $(docker --version)"
fi

if ! docker compose version &>/dev/null; then
  log "Installing Docker Compose plugin..."
  sudo apt-get install -y docker-compose-plugin
else
  log "Docker Compose already installed: $(docker compose version)"
fi

# -----------------------------------------------------------------------------
# 3. Backup directory
# -----------------------------------------------------------------------------
log "Creating backup directory at $BACKUP_DIR..."
sudo mkdir -p "$BACKUP_DIR"
sudo chown "$USER:$USER" "$BACKUP_DIR"

# -----------------------------------------------------------------------------
# 4. Generate secrets (only if .env.production doesn't exist yet)
# -----------------------------------------------------------------------------
if [[ -f "$ENV_FILE" ]]; then
  warn ".env.production already exists — skipping secret generation."
  warn "Delete it and re-run if you want fresh secrets."
else
  log "Generating secrets and creating .env.production..."

  POSTGRES_PASS=$(openssl rand -hex 24)
  REDIS_PASS=$(openssl rand -hex 24)
  NEXTAUTH_SECRET=$(openssl rand -base64 32)

  # Derive DATABASE_URL from generated password
  sed \
    -e "s|CHANGE_ME_USE_openssl_rand_hex_24|$POSTGRES_PASS|g" \
    -e "s|CHANGE_ME_USE_openssl_rand_base64_32|$NEXTAUTH_SECRET|g" \
    -e "s|CHANGE_ME@postgres|$POSTGRES_PASS@postgres|g" \
    "$REPO_DIR/.env.production.example" > "$ENV_FILE"

  # Patch REDIS_PASSWORD line
  sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASS|" "$ENV_FILE"
  sed -i "s|CHANGE_ME@redis|$REDIS_PASS@redis|" "$ENV_FILE"

  chmod 600 "$ENV_FILE"
  log ".env.production created with generated secrets."
  warn "IMPORTANT: Edit $ENV_FILE and fill in:"
  warn "  - NEXTAUTH_URL (your real domain)"
  warn "  - NEXT_PUBLIC_APP_URL (your real domain)"
  warn "  - RESEND_API_KEY"
  warn "  - SENTRY_DSN (optional but recommended)"
fi

# -----------------------------------------------------------------------------
# 5. Daily backup cron job
# -----------------------------------------------------------------------------
if crontab -l 2>/dev/null | grep -q "$CRON_TAG"; then
  log "Backup cron already installed — skipping."
else
  log "Installing daily backup cron job..."
  (
    crontab -l 2>/dev/null || true
    echo "# $CRON_TAG"
    echo "0 23 * * * docker compose -f $COMPOSE_FILE exec -T postgres pg_dump -U onekof onekof | gzip > $BACKUP_DIR/onekof-\$(date +\\%Y\\%m\\%d).sql.gz"
    echo "0 0 * * * find $BACKUP_DIR -name 'onekof-*.sql.gz' -mtime +30 -delete"
  ) | crontab -
  log "Backup cron installed: daily at 11 PM server time, 30-day retention."
fi

# -----------------------------------------------------------------------------
# 6. Start the production stack
# -----------------------------------------------------------------------------
log "Pulling Docker images..."
docker compose -f "$COMPOSE_FILE" pull

log "Starting production stack..."
docker compose -f "$COMPOSE_FILE" up -d

log "Waiting for services to become healthy (up to 60s)..."
for i in $(seq 1 12); do
  if docker compose -f "$COMPOSE_FILE" ps | grep -q "healthy"; then
    break
  fi
  sleep 5
done

# -----------------------------------------------------------------------------
# 7. Run Prisma migrations
# -----------------------------------------------------------------------------
log "Running Prisma migrations..."
docker compose -f "$COMPOSE_FILE" exec onekof-web \
  npx prisma migrate deploy \
  --schema /app/packages/database/prisma/schema.prisma

# -----------------------------------------------------------------------------
# 8. Final status
# -----------------------------------------------------------------------------
echo ""
log "=== Setup Complete ==="
docker compose -f "$COMPOSE_FILE" ps
echo ""
log "Smoke test checklist:"
echo "  [ ] curl -f http://localhost:3000/api/health"
echo "  [ ] https://<your-domain> loads with valid SSL"
echo "  [ ] User signup works"
echo "  [ ] User login works"
echo "  [ ] Project creation works"
echo ""
warn "Next steps:"
warn "  1. Edit $ENV_FILE — fill in domain, email, and Sentry values"
warn "  2. Update Caddyfile with your real domain"
warn "  3. Point DNS A record to: $(curl -s ifconfig.me 2>/dev/null || echo '<this server IP>')"
warn "  4. Restart Caddy: docker compose -f $COMPOSE_FILE restart caddy"
