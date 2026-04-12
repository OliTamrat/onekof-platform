# Onekof Tier 2 Deployment Runbook

**Audience:** whoever is standing up a new Tier 2 (private / on-premise Ethiopian) Onekof deployment.
**Prerequisite:** Wave 1 portability PR merged to main (landed 2026-04-11).
**Reference dev environment:** `docker-compose.tier-sim.yml` at the repo root runs the same stack on a laptop.
**Estimated time:** 4–8 hours for a first-time operator, 2–3 hours once practiced.

---

## What "Tier 2" means

A Tier 2 deployment is **one Onekof production instance running on hardware you own or rent in Ethiopia**, serving one or more private-sector tenants under `*.onekof.et` (or whatever Ethiopian domain you choose). It is deliberately NOT government-facing — that is Tier 1, which layers additional compliance controls on top of this baseline.

**A Tier 2 server provides:**
- The Onekof Next.js application
- PostgreSQL 15 database (self-hosted, not Supabase)
- Redis 7 for rate limiting
- Local filesystem storage for file attachments
- Caddy or Nginx reverse proxy with TLS (Let's Encrypt or internal CA)
- Nightly backups to a second disk or off-site destination

**Tier 2 does NOT provide (yet):**
- High availability (single-server, no hot standby)
- Automatic failover to Tier 3
- Centralized logging / SIEM
- Multi-region DR
- Encrypted-at-rest field-level encryption

These are Tier 1 / Wave 3 concerns. Do NOT promise them to Tier 2 customers.

---

## 0. Hardware and network prerequisites

### 0.1 Reference hardware (minimum viable for production Tier 2)

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 4 physical cores | 8+ cores |
| RAM | 16 GB | 32 GB |
| Storage | 500 GB NVMe SSD | 1 TB NVMe SSD in RAID-1 |
| Network | 100 Mbps symmetric | 1 Gbps + redundant ISP |
| Power | UPS with 30 min runtime | UPS + generator failover |

The development test rig (Massano motherboard, Intel Core i7, 64 GB RAM, 1 TB Seagate SSD) meets the recommended spec comfortably. It is adequate for first customer pilots.

### 0.2 Network requirements

- **Static public IPv4 address** (or dynamic DNS if the customer insists and accepts the risk)
- **Ports 22 (SSH, restricted), 80 (HTTP → 443 redirect), 443 (HTTPS) open to the internet**
- **Wildcard DNS A record** for `*.onekof.et` pointing at the public IP
- **Separate A record** for the apex `onekof.et` and `www.onekof.et`
- **Firewall**: only 22 / 80 / 443 inbound; all outbound allowed for OS updates and package installs

### 0.3 Domain and DNS

Before starting, you must:
1. Own the domain (`onekof.et` — claim after EIPA registration completes)
2. Use a DNS provider that supports **DNS-01 ACME challenges** (Cloudflare, Route53, Namecheap premium, or similar) so Caddy can issue wildcard certs
3. Point `onekof.et`, `www.onekof.et`, and `*.onekof.et` at the server's public IP

---

## 1. Operating system install

### 1.1 OS choice

**Ubuntu Server 24.04 LTS** is the reference. Rationale:
- Matches the `debian-openssl-3.0.x` Prisma binary target added in Wave 1
- 5 years of security updates from Canonical
- Well-documented, widely deployed, easy to hire for
- apt package manager for fast installs

Alternatives: Debian 12 (same ecosystem, conservative), Rocky Linux 9 (RHEL-compatible, enterprise-friendly). **Do NOT use Arch, Gentoo, or rolling releases.** They do not belong on production servers.

### 1.2 Install

Boot from Ubuntu Server 24.04 ISO. During setup:

| Screen | Choice |
|---|---|
| Language | English |
| Network | Configure static IP |
| Proxy | None (unless customer has one) |
| Mirror | ubuntu.com or local Ethiopia mirror |
| Storage | Custom (see below) |
| Profile | Real name: `Onekof Ops`; username: `onekof`; strong password |
| SSH | Install OpenSSH server; import SSH key from GitHub if available |
| Snaps | None. Skip all. |

**Storage layout (single disk):**

| Mount | Size | Purpose |
|---|---|---|
| `/boot` | 1 GB | Kernel + initramfs |
| `/boot/efi` | 512 MB | EFI system partition |
| `/` | 50 GB | OS + installed packages |
| `/var` | 100 GB | Docker images, logs, Postgres WAL |
| `/var/lib/postgresql` | 200 GB | Postgres data |
| `/var/onekof/blobs` | 100 GB | File attachments |
| swap | 8 GB | Emergency swap |
| Remaining | unallocated | Future growth |

Use LVM so partitions can grow later. Encrypt with LUKS if the physical facility has any doubt about access control.

### 1.3 First-boot hardening

```bash
# SSH to the server as your created user
ssh onekof@SERVER_IP

# Update everything
sudo apt update && sudo apt upgrade -y
sudo apt install -y unattended-upgrades apt-listchanges fail2ban ufw curl wget git ca-certificates gnupg lsb-release

# Enable automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (for Let's Encrypt challenges, redirects to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
sudo ufw status verbose

# Harden SSH
sudo sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Verify you can still log in from a second terminal BEFORE closing this session!
```

**Checkpoint:** You can SSH in with a key, root login is disabled, password auth is disabled, and UFW blocks everything except 22/80/443.

---

## 2. Install PostgreSQL 15

### 2.1 Install from Ubuntu repositories

```bash
sudo apt install -y postgresql-15 postgresql-contrib-15
sudo systemctl enable --now postgresql
sudo systemctl status postgresql
```

Verify:
```bash
sudo -u postgres psql -c "SELECT version();"
# Expected: "PostgreSQL 15.x on x86_64-pc-linux-gnu ..."
```

### 2.2 Create the Onekof database and role

```bash
sudo -u postgres psql <<'EOF'
CREATE ROLE onekof WITH LOGIN PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE onekof OWNER onekof ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8' TEMPLATE template0;
GRANT ALL PRIVILEGES ON DATABASE onekof TO onekof;
\c onekof
GRANT ALL ON SCHEMA public TO onekof;
EOF
```

### 2.3 Tune `postgresql.conf`

Edit `/etc/postgresql/15/main/postgresql.conf`:

```conf
# Memory tuning for 16 GB RAM server (adjust proportionally)
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 32MB
maintenance_work_mem = 512MB

# SSD tuning
random_page_cost = 1.1
effective_io_concurrency = 200

# Connection / pooling
max_connections = 100
listen_addresses = 'localhost'   # Do NOT expose Postgres to the internet

# Logging for ops visibility
log_min_duration_statement = 1000   # log queries slower than 1s
log_connections = on
log_lock_waits = on
log_checkpoints = on

# WAL / replication (prepare for future hot standby)
wal_level = replica
max_wal_senders = 3
archive_mode = off   # enable when you add WAL archiving

# Autovacuum
autovacuum = on
autovacuum_max_workers = 4
```

Restart:
```bash
sudo systemctl restart postgresql
```

### 2.4 Apply Onekof schema

Clone the repo first (covered in §5), then from the repo root:

```bash
cd /opt/onekof
DATABASE_URL="postgresql://onekof:STRONG_PASSWORD@localhost:5432/onekof?schema=public" \
  pnpm --filter=@onekof/database exec prisma migrate deploy --schema ./packages/database/prisma/schema.prisma
```

**Important:** The 7 pre-baseline migrations must be archived first per `packages/database/prisma/migrations/README.md` Option A. Otherwise `prisma migrate deploy` will try to re-create tables the baseline already created.

Verify:
```bash
sudo -u postgres psql onekof -c "\dt" | head -20
# Should list 80+ tables
```

---

## 3. Install Redis 7

```bash
sudo apt install -y redis-server
sudo sed -i 's/^bind 127.0.0.1 ::1/bind 127.0.0.1/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory <bytes>/maxmemory 1gb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
sudo systemctl enable --now redis-server
sudo systemctl status redis-server
redis-cli ping
# Expected: PONG
```

Redis listens on localhost only. No password initially — Tier 2 uses network isolation, not Redis AUTH. Add a password before exposing Redis over any shared network.

---

## 4. Install Node.js 20 LTS and pnpm

Use `nvm` so the `onekof` user can manage Node versions without sudo:

```bash
# As the onekof user
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm alias default 20
node --version    # v20.x
npm --version     # 10.x

# Install pnpm via corepack (ships with Node 20)
corepack enable
corepack prepare pnpm@8.15.1 --activate
pnpm --version    # 8.15.1
```

---

## 5. Clone Onekof and build

```bash
sudo mkdir -p /opt/onekof
sudo chown onekof:onekof /opt/onekof
cd /opt/onekof
git clone https://github.com/OliTamrat/onekof-platform.git .

# Pin to a known-good commit (not HEAD) for production
git checkout <commit-sha-from-latest-green-build>

# Install and build
pnpm install --frozen-lockfile
pnpm --filter=web build
```

Expected output: `✓ Compiled successfully`, static pages generated, route tree printed.

---

## 6. Configure environment variables

Copy the Tier 2 template and edit:
```bash
cp /opt/onekof/.env.tier2.example /opt/onekof/apps/web/.env
chmod 600 /opt/onekof/apps/web/.env
```

Edit `/opt/onekof/apps/web/.env`:

```bash
# Generate a unique session secret
openssl rand -base64 32
# Paste the output into NEXTAUTH_SECRET below
```

Required values to set in `.env`:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://onekof:STRONG_PASSWORD@localhost:5432/onekof?schema=public` |
| `DIRECT_URL` | Same as DATABASE_URL |
| `NEXTAUTH_SECRET` | Output from `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://onekof.et` |
| `AUTH_COOKIE_DOMAIN` | `.onekof.et` (note the leading dot) |
| `PUBLIC_HOSTS` | `onekof.et` |
| `NEXT_PUBLIC_SUBDOMAIN_DOMAINS` | `onekof.et` |
| `NEXT_PUBLIC_APP_URL` | `https://onekof.et` |
| `STORAGE_DRIVER` | `local-fs` |
| `STORAGE_LOCAL_ROOT` | `/var/onekof/blobs` |
| `STORAGE_LOCAL_BASE_URL` | `https://onekof.et/api/files` |
| `REDIS_URL` | `redis://localhost:6379` |
| `APP_PLATFORM` | `self-hosted` |
| `APP_REGION` | e.g., `addis-ababa-1` |
| `APP_ENV` | `production` |
| `APP_BUILD_SHA` | `git rev-parse --short HEAD` |

Set up the storage directory:
```bash
sudo mkdir -p /var/onekof/blobs
sudo chown -R onekof:onekof /var/onekof
```

---

## 7. Create a systemd service for Onekof

`/etc/systemd/system/onekof-web.service`:

```ini
[Unit]
Description=Onekof Platform Web Application
After=network.target postgresql.service redis-server.service
Wants=postgresql.service redis-server.service

[Service]
Type=simple
User=onekof
Group=onekof
WorkingDirectory=/opt/onekof/apps/web
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
EnvironmentFile=/opt/onekof/apps/web/.env
ExecStart=/home/onekof/.nvm/versions/node/v20.18.0/bin/node /opt/onekof/apps/web/node_modules/.bin/next start
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/onekof/web.log
StandardError=append:/var/log/onekof/web-error.log

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/onekof/blobs /var/log/onekof
ProtectHome=false

[Install]
WantedBy=multi-user.target
```

```bash
sudo mkdir -p /var/log/onekof
sudo chown onekof:onekof /var/log/onekof
sudo systemctl daemon-reload
sudo systemctl enable --now onekof-web
sudo systemctl status onekof-web
curl -sS http://127.0.0.1:3000/api/auth/session
# Expected: JSON response
```

---

## 8. Install and configure Caddy (reverse proxy + TLS)

Caddy is the recommended choice over Nginx because it handles wildcard TLS via DNS-01 automatically.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

`/etc/caddy/Caddyfile`:

```caddyfile
{
    email ops@onekof.et
    # Use ZeroSSL or Let's Encrypt
    # acme_ca https://acme-v02.api.letsencrypt.org/directory
}

# Wildcard for tenant subdomains
*.onekof.et, onekof.et {
    # Wildcard requires a DNS-01 challenge; configure your DNS provider below.
    # Example for Cloudflare:
    # tls {
    #     dns cloudflare {env.CF_API_TOKEN}
    # }

    encode gzip zstd

    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
        header_up Host {host}
    }

    # Security headers (defense in depth — middleware.ts already sets these,
    # but belt-and-suspenders at the proxy layer is fine)
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }

    log {
        output file /var/log/caddy/onekof-access.log
        format json
    }
}
```

For Cloudflare DNS-01 challenge support, you need the Caddy Cloudflare plugin:

```bash
sudo caddy add-package github.com/caddy-dns/cloudflare
```

Then set the Cloudflare API token:
```bash
sudo systemctl edit caddy
# Add:
# [Service]
# Environment="CF_API_TOKEN=your_cloudflare_api_token"
```

Uncomment the `tls { dns cloudflare ... }` block in the Caddyfile and reload:
```bash
sudo systemctl reload caddy
sudo systemctl status caddy
```

**Verify TLS:**
```bash
curl -vI https://onekof.et 2>&1 | grep -E "HTTP|TLS|issuer"
```

---

## 9. DNS configuration

At your DNS provider, create:
```
A     onekof.et        SERVER_IP
A     www.onekof.et    SERVER_IP
A     *.onekof.et      SERVER_IP
```

Wait for DNS propagation (1 minute to 48 hours depending on provider). Verify:
```bash
dig +short onekof.et
dig +short ministry-example.onekof.et
```

Both should return the server's public IP.

---

## 10. Smoke test end-to-end

From your laptop (not the server):

```bash
# Landing page
curl -sS -o /dev/null -w "HTTP %{http_code} | %{time_total}s\n" https://onekof.et

# Auth-gated endpoint
curl -sS -o /dev/null -w "HTTP %{http_code}\n" https://onekof.et/api/organizations
# Expected: HTTP 401 (unauthorized, auth is working)

# Tenant subdomain (once you create one via signup)
curl -sS -o /dev/null -w "HTTP %{http_code}\n" https://test-org.onekof.et
```

Sign up a test user, create an organization, upload an attachment, download it back. If all of this works, Tier 2 is live.

---

## 11. Backups (mandatory before first real customer)

### 11.1 Nightly Postgres dump

`/usr/local/bin/onekof-backup.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_DIR=/var/backups/onekof/db
mkdir -p "$BACKUP_DIR"

pg_dump \
  --host=localhost \
  --username=onekof \
  --dbname=onekof \
  --no-owner \
  --no-privileges \
  --exclude-table=_prisma_migrations \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/onekof_${TIMESTAMP}.dump"

# Retain 7 daily + 4 weekly
find "$BACKUP_DIR" -name "*.dump" -mtime +7 -delete

# Sync blob storage
rsync -a --delete /var/onekof/blobs/ /var/backups/onekof/blobs/
```

```bash
sudo chmod +x /usr/local/bin/onekof-backup.sh
```

Schedule via systemd timer (`/etc/systemd/system/onekof-backup.timer`):

```ini
[Unit]
Description=Onekof nightly backup

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

And the service unit (`/etc/systemd/system/onekof-backup.service`):

```ini
[Unit]
Description=Onekof backup runner

[Service]
Type=oneshot
User=postgres
ExecStart=/usr/local/bin/onekof-backup.sh
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now onekof-backup.timer
sudo systemctl list-timers | grep onekof
```

### 11.2 Off-site backup (non-negotiable for real customers)

Options:
1. **Second physical disk rotated weekly** — cheapest, manual
2. **External SFTP server** — rsync to a cloud VM in Europe
3. **Encrypted S3/Vercel Blob upload** — set up in Wave 3 with GPG encryption

You MUST have off-site backups before onboarding real tenants. A fire in the server room without off-site is total data loss.

---

## 12. Ongoing operations

### 12.1 Deploying updates

```bash
cd /opt/onekof
sudo -u onekof git fetch origin master
sudo -u onekof git checkout <new-commit-sha>
sudo -u onekof pnpm install --frozen-lockfile
sudo -u onekof pnpm --filter=@onekof/database exec prisma migrate deploy --schema ./packages/database/prisma/schema.prisma
sudo -u onekof pnpm --filter=web build
sudo systemctl restart onekof-web
sudo systemctl status onekof-web
curl -sS -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000
```

If the smoke test fails, roll back:
```bash
sudo -u onekof git checkout <previous-sha>
sudo -u onekof pnpm install --frozen-lockfile
sudo -u onekof pnpm --filter=web build
sudo systemctl restart onekof-web
```

### 12.2 Monitoring checklist

Install `htop`, `iotop`, `ncdu` for interactive debugging:
```bash
sudo apt install -y htop iotop ncdu
```

Daily checks:
```bash
# Disk usage
df -h
du -sh /var/onekof/blobs /var/lib/postgresql /var/log

# Systemd services
systemctl status onekof-web postgresql redis-server caddy

# Recent errors
sudo journalctl -u onekof-web --since "1 hour ago" | grep -iE "error|fatal"

# Postgres connection count
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### 12.3 Common failure modes

| Symptom | First check | Fix |
|---|---|---|
| `HTTP 500` on every page | `journalctl -u onekof-web` | Usually a DB connection issue or missing env var |
| `column "hosting_tier" does not exist` | `prisma migrate status` | Apply Wave 1 migration: `20260411120000_portability_wave1` |
| Cookies not shared across subdomains | `echo $AUTH_COOKIE_DOMAIN` in the service | Must start with a dot: `.onekof.et` |
| Tenant subdomain returns 404 | Middleware logs | Check `PUBLIC_HOSTS` includes the base domain |
| Attachment upload fails | `ls /var/onekof/blobs` | Check ownership + `STORAGE_LOCAL_ROOT` path |
| Redis connection refused | `systemctl status redis-server` | Restart Redis, check `bind 127.0.0.1` |
| Caddy cert renewal fails | `sudo caddy logs` | DNS-01 API token may have expired |
| Out of disk space | `ncdu /var` | Rotate logs, prune old Docker images, clear Postgres WAL |

---

## 13. Appendix — mapping to Wave 1 artifacts

| Runbook step | Wave 1 artifact |
|---|---|
| §2.4 apply schema | `packages/database/prisma/migrations/0_init/migration.sql` |
| §2.4 Wave 1 migration | `packages/database/prisma/migrations/20260411120000_portability_wave1/migration.sql` |
| §6 env vars | `.env.tier2.example` |
| §6 `AUTH_COOKIE_DOMAIN` | `apps/web/src/lib/auth.ts` `resolveAuthCookieDomain()` |
| §6 `PUBLIC_HOSTS` | `apps/web/src/middleware.ts` `getPublicHosts()` |
| §6 `STORAGE_DRIVER=local-fs` | `apps/web/src/lib/storage/drivers/local-fs.ts` |
| §6 `/api/files` route | `apps/web/src/app/api/files/[...path]/route.ts` |
| Dev mirror | `docker-compose.tier-sim.yml` at repo root |

---

## 14. What this runbook does NOT cover (yet)

- **Tier 1 additions**: GPG-encrypted DR pipeline, Shamir split key ceremony, additional audit logging, air-gapped build
- **High availability**: streaming replication to a hot standby, automatic failover
- **Centralized logging**: ELK/Loki/CloudWatch integration
- **Observability**: Grafana + node-exporter dashboards
- **Blue/green deployment**: zero-downtime releases
- **Advanced security**: SELinux/AppArmor profiles, eBPF monitoring, intrusion detection

These are Wave 2 / Wave 3 concerns and will be added to this runbook as they ship.

---

**Runbook version:** 1.0 — 2026-04-11
**Onekof version:** Wave 1 portability PR (post `4c14a59`)
**Maintainer:** Oli Tamrat Oli &lt;oli.oli@udc.edu&gt;
