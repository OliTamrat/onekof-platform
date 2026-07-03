#!/usr/bin/env bash
# Onekof Platform — Ethio Telecom VM Deploy Script
# ==================================================
# One-command deployment to Ethio Telecom VMs.
#
# Usage:
#   ./deploy-et.sh <VM_HOST> [IMAGE_TAG]
#
# Examples:
#   ./deploy-et.sh onekof@192.168.1.100            # deploys :latest
#   ./deploy-et.sh onekof@192.168.1.100 v1.0.0     # deploys specific version
#   OFFLINE=1 ./deploy-et.sh onekof@192.168.1.100 v1.0.0  # offline mode (docker save/load)
#
# Prerequisites:
#   - SSH key-based access to the VM
#   - Docker + Docker Compose installed on the VM
#   - .env.production and Caddyfile at /opt/onekof/ on the VM
#   - docker-compose.prod.yml at /opt/onekof/ on the VM

set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
REMOTE_HOST="${1:?Usage: ./deploy-et.sh <user@host> [image_tag]}"
IMAGE_TAG="${2:-latest}"
REGISTRY="ghcr.io"
IMAGE_NAME="daps-analytics/onekof-web"
FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
REMOTE_DIR="/opt/onekof"
COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_URL="http://127.0.0.1:3000/"
HEALTH_RETRIES=30
HEALTH_INTERVAL=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; exit 1; }

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
log "Deploying ${FULL_IMAGE} to ${REMOTE_HOST}"

# Test SSH connectivity
log "Testing SSH connection..."
ssh -o ConnectTimeout=10 -o BatchMode=yes "${REMOTE_HOST}" "echo ok" > /dev/null 2>&1 \
  || fail "Cannot SSH to ${REMOTE_HOST}. Check your SSH key and host."

# Verify remote directory and compose file exist
ssh "${REMOTE_HOST}" "test -f ${REMOTE_DIR}/${COMPOSE_FILE}" \
  || fail "${REMOTE_DIR}/${COMPOSE_FILE} not found on VM. Run initial setup first."

ssh "${REMOTE_HOST}" "test -f ${REMOTE_DIR}/.env.production" \
  || fail "${REMOTE_DIR}/.env.production not found on VM. Copy from .env.production.example and fill in values."

# ---------------------------------------------------------------------------
# Offline mode: docker save → scp → docker load
# ---------------------------------------------------------------------------
if [ "${OFFLINE:-0}" = "1" ]; then
  log "OFFLINE MODE: Saving image locally..."
  TEMP_TAR="/tmp/onekof-web-${IMAGE_TAG}.tar.gz"

  # Pull locally first if not present
  if ! docker image inspect "${FULL_IMAGE}" > /dev/null 2>&1; then
    log "Pulling ${FULL_IMAGE} locally..."
    docker pull "${FULL_IMAGE}"
  fi

  log "Saving to ${TEMP_TAR} (~300 MB compressed)..."
  docker save "${FULL_IMAGE}" | gzip > "${TEMP_TAR}"

  log "Transferring to ${REMOTE_HOST}..."
  scp "${TEMP_TAR}" "${REMOTE_HOST}:/tmp/"

  log "Loading image on VM..."
  ssh "${REMOTE_HOST}" "gunzip -c /tmp/onekof-web-${IMAGE_TAG}.tar.gz | docker load && rm /tmp/onekof-web-${IMAGE_TAG}.tar.gz"

  rm -f "${TEMP_TAR}"
  log "Offline image transfer complete."
else
  # ---------------------------------------------------------------------------
  # Online mode: docker compose pull
  # ---------------------------------------------------------------------------
  log "Pulling image on VM..."
  ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && DOCKER_IMAGE=${FULL_IMAGE} docker compose -f ${COMPOSE_FILE} pull onekof-web"
fi

# ---------------------------------------------------------------------------
# Pre-deploy: backup database
# ---------------------------------------------------------------------------
log "Creating pre-deploy database backup..."
ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && docker compose -f ${COMPOSE_FILE} exec -T postgres pg_dump -U \$(grep POSTGRES_USER .env.production | cut -d= -f2) --format=custom --compress=9 \$(grep POSTGRES_DB .env.production | cut -d= -f2) > /tmp/onekof-pre-deploy-\$(date +%Y%m%d-%H%M%S).dump" \
  || warn "Database backup failed (DB may not be running yet — first deploy?)"

# ---------------------------------------------------------------------------
# Run database migrations
# ---------------------------------------------------------------------------
log "Running Prisma migrations..."
ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && DOCKER_IMAGE=${FULL_IMAGE} docker compose -f ${COMPOSE_FILE} run --rm --no-deps onekof-web npx prisma migrate deploy --schema /app/packages/database/prisma/schema.prisma" \
  || fail "Prisma migrations failed. Check the migration output above."

# ---------------------------------------------------------------------------
# Deploy: restart web service with new image
# ---------------------------------------------------------------------------
log "Updating DOCKER_IMAGE in .env.production..."
ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && sed -i 's|^DOCKER_IMAGE=.*|DOCKER_IMAGE=${FULL_IMAGE}|' .env.production"

log "Restarting services..."
ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && docker compose -f ${COMPOSE_FILE} up -d"

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
log "Waiting for health check (up to $((HEALTH_RETRIES * HEALTH_INTERVAL))s)..."
for i in $(seq 1 "${HEALTH_RETRIES}"); do
  if ssh "${REMOTE_HOST}" "curl -sf ${HEALTH_URL} > /dev/null 2>&1"; then
    log "Health check passed on attempt ${i}."
    break
  fi
  if [ "$i" -eq "${HEALTH_RETRIES}" ]; then
    fail "Health check failed after ${HEALTH_RETRIES} attempts. Check logs: ssh ${REMOTE_HOST} 'cd ${REMOTE_DIR} && docker compose -f ${COMPOSE_FILE} logs onekof-web'"
  fi
  sleep "${HEALTH_INTERVAL}"
done

# ---------------------------------------------------------------------------
# Post-deploy info
# ---------------------------------------------------------------------------
log "Deployment complete."
echo ""
echo "  Image:   ${FULL_IMAGE}"
echo "  Host:    ${REMOTE_HOST}"
echo "  Logs:    ssh ${REMOTE_HOST} 'cd ${REMOTE_DIR} && docker compose -f ${COMPOSE_FILE} logs -f onekof-web'"
echo "  Status:  ssh ${REMOTE_HOST} 'cd ${REMOTE_DIR} && docker compose -f ${COMPOSE_FILE} ps'"
echo ""

# Prune old images
log "Pruning old Docker images..."
ssh "${REMOTE_HOST}" "docker image prune -f --filter 'until=168h'" > /dev/null 2>&1 || true

log "Done."
