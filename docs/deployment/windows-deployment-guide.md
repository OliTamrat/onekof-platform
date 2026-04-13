# Onekof Platform — Windows Deployment Guide
## Tier 2 Self-Hosted on Windows (Docker Desktop)

**Version:** 1.0 — 2026-04-12
**Companion to:** `docs/deployment/tier-2-runbook.md` (Ubuntu reference)
**Audience:** IT administrators deploying Onekof on Windows machines in Ethiopia

---

## Overview

This guide deploys the full Onekof stack (Next.js app + PostgreSQL 15 + Redis 7) on a
Windows machine using Docker Desktop. The same Docker images used on Ubuntu work on
Windows without modification — Docker handles the Linux-to-Windows translation layer
automatically.

**What you get:** A fully self-hosted Onekof instance with all data stored locally on the
Windows machine. No Vercel, no Supabase, no cloud dependency.

---

## 1. Hardware Requirements

| Component       | Minimum          | Recommended         |
|-----------------|------------------|---------------------|
| CPU             | 4 cores          | 8+ cores            |
| RAM             | 8 GB             | 16+ GB              |
| Disk            | 50 GB free       | 100+ GB SSD         |
| OS              | Windows 10 (21H2+) or Windows 11 | Windows 11 Pro/Enterprise |
| Network         | Ethernet or stable Wi-Fi | Ethernet (wired)   |

> **Note:** Windows Home edition works but requires WSL 2 backend (no Hyper-V).
> Windows Pro/Enterprise can use either WSL 2 or Hyper-V backend.

---

## 2. Install Prerequisites

### 2.1 Enable WSL 2

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

This installs WSL 2 with Ubuntu as the default distribution. **Restart your computer** when prompted.

After restart, verify:

```powershell
wsl --version
```

You should see WSL version 2.x.

### 2.2 Install Docker Desktop

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Run the installer — select **"Use WSL 2 instead of Hyper-V"** when prompted
3. After installation, **restart your computer**
4. Open Docker Desktop and wait for the engine to start (whale icon in system tray turns steady)

Verify Docker is working — open **PowerShell** (regular, not admin) and run:

```powershell
docker --version
docker compose version
```

Both should return version numbers.

### 2.3 Allocate Resources to Docker

Docker Desktop > Settings > Resources > WSL Integration:
- Ensure your WSL distribution is enabled

Docker Desktop > Settings > Resources > Advanced:
- **CPUs:** At least 4
- **Memory:** At least 4 GB (8 GB recommended)
- **Disk image size:** At least 40 GB

Click **Apply & Restart**.

---

## 3. Get the Onekof Platform Files

You need three files from the Onekof platform repository:

```
onekof-platform/
  docker-compose.tier-sim.yml    # Stack definition
  .env.tier2.example             # Environment template
  apps/web/Dockerfile            # Application build instructions
```

If you have the full repository, navigate to it:

```powershell
cd C:\path\to\onekof-platform
```

If you received a deployment package, extract it and navigate to the folder.

---

## 4. Configure Environment Variables

Copy the environment template:

```powershell
copy .env.tier2.example .env
```

Edit `.env` with Notepad or any text editor:

```powershell
notepad .env
```

**Required changes:**

```env
# Generate a random secret (run this in PowerShell and paste the output):
#   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }) -as [byte[]])
NEXTAUTH_SECRET=paste-your-generated-secret-here

# Database (matches docker-compose defaults — no change needed for local use)
DATABASE_URL=postgresql://onekof:onekof@postgres:5432/onekof?schema=public
DIRECT_URL=postgresql://onekof:onekof@postgres:5432/onekof?schema=public
```

Save and close the file.

---

## 5. Build and Start the Stack

Open **PowerShell** in the `onekof-platform` directory and run:

```powershell
docker compose -f docker-compose.tier-sim.yml up -d --build
```

**First run takes 5-15 minutes** (downloading base images + building the app).
Subsequent starts take seconds.

Check that all three containers are running:

```powershell
docker compose -f docker-compose.tier-sim.yml ps
```

You should see:

```
NAME              STATUS
onekof-postgres   Up (healthy)
onekof-redis      Up (healthy)
onekof-web        Up
```

---

## 6. Initialize the Database

### 6.1 Mark Migrations as Applied

The database tables are created during the Docker build. You need to tell Prisma
that all migrations are already applied. Run each command one at a time:

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 0_init --schema //app/packages/database/prisma/schema.prisma
```

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 20260304062200_add_automation_rules --schema //app/packages/database/prisma/schema.prisma
```

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 20260407_add_wiki_models --schema //app/packages/database/prisma/schema.prisma
```

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 20260409_add_contractor_role --schema //app/packages/database/prisma/schema.prisma
```

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 20260409_add_task_links --schema //app/packages/database/prisma/schema.prisma
```

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 20260410_add_backlog_status --schema //app/packages/database/prisma/schema.prisma
```

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 20260410_project_visibility_default_public --schema //app/packages/database/prisma/schema.prisma
```

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 20260410_revert_project_visibility_default --schema //app/packages/database/prisma/schema.prisma
```

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied 20260411120000_portability_wave1 --schema //app/packages/database/prisma/schema.prisma
```

> **Note:** The `//app/` double-slash is required on Windows to prevent Git Bash
> from converting the path. The `-u root` flag is needed because the container
> runs as a non-root user that doesn't have write access to the corepack cache.

### 6.2 Seed the Database with Test Data

This creates a test user and demo organization so you can log in:

```powershell
docker compose -f docker-compose.tier-sim.yml exec -u root -w //app/packages/database onekof-web npx tsx prisma/seed.ts
```

**Test credentials after seeding:**

| Field    | Value              |
|----------|--------------------|
| Email    | test@onekof.com    |
| Password | password123        |

---

## 7. Access Onekof

Open your browser and go to:

```
http://localhost:3000
```

You should see the Onekof landing page. Click **Sign In** and use the test credentials above.

---

## 8. Windows Firewall (LAN Access)

By default, Onekof only listens on `127.0.0.1` (the local machine). To allow other
computers on your office network to access it:

### 8.1 Update docker-compose to bind to all interfaces

Edit `docker-compose.tier-sim.yml` and change the onekof-web ports line:

```yaml
# Before (localhost only):
ports:
  - "127.0.0.1:3000:3000"

# After (all interfaces — LAN accessible):
ports:
  - "3000:3000"
```

### 8.2 Add Windows Firewall rule

Open **PowerShell as Administrator**:

```powershell
New-NetFirewallRule -DisplayName "Onekof Platform" `
  -Direction Inbound -Protocol TCP -LocalPort 3000 `
  -Action Allow -Profile Domain,Private
```

> **Security note:** This only opens the port on Domain and Private network profiles.
> It will NOT be accessible on Public networks (e.g., coffee shop Wi-Fi).

### 8.3 Find your machine's IP address

```powershell
ipconfig
```

Look for the `IPv4 Address` under your active network adapter (e.g., `192.168.1.50`).

Other computers on the same network can now access Onekof at:

```
http://192.168.1.50:3000
```

---

## 9. Daily Operations

### Start Onekof (after reboot)

Docker Desktop starts automatically with Windows. If the containers are stopped:

```powershell
docker compose -f docker-compose.tier-sim.yml up -d
```

### Stop Onekof

```powershell
docker compose -f docker-compose.tier-sim.yml down
```

### View logs

```powershell
# All services
docker compose -f docker-compose.tier-sim.yml logs -f

# Just the app
docker compose -f docker-compose.tier-sim.yml logs -f onekof-web

# Just the database
docker compose -f docker-compose.tier-sim.yml logs -f postgres
```

### Restart after a configuration change

```powershell
docker compose -f docker-compose.tier-sim.yml down
docker compose -f docker-compose.tier-sim.yml up -d
```

### Update to a new version

```powershell
# Pull latest code / replace files, then:
docker compose -f docker-compose.tier-sim.yml up -d --build

# Run any new migrations:
docker compose -f docker-compose.tier-sim.yml exec onekof-web `
  pnpm exec prisma migrate deploy --schema packages/database/prisma/schema.prisma
```

---

## 10. Backup and Restore

### Backup the database

```powershell
docker compose -f docker-compose.tier-sim.yml exec postgres `
  pg_dump -U onekof -d onekof --format=custom -f /tmp/onekof-backup.dump

docker cp onekof-postgres:/tmp/onekof-backup.dump `
  C:\Backups\onekof-backup-%date:~-4%%date:~4,2%%date:~7,2%.dump
```

### Restore from backup

```powershell
docker cp C:\Backups\onekof-backup-20260412.dump onekof-postgres:/tmp/restore.dump

docker compose -f docker-compose.tier-sim.yml exec postgres `
  pg_restore -U onekof -d onekof --clean --if-exists /tmp/restore.dump
```

### Backup uploaded files

```powershell
# Find the volume location
docker volume inspect onekof_tier2_blobs

# Copy files out (the volume is inside WSL, so use docker cp)
docker cp onekof-web:/var/onekof/blobs C:\Backups\onekof-blobs-backup
```

---

## 11. Troubleshooting

### "Docker Desktop - WSL 2 installation is incomplete"
Run in PowerShell as Administrator:
```powershell
wsl --update
```
Then restart Docker Desktop.

### Containers start but app shows "502" or blank page
Check the app logs:
```powershell
docker compose -f docker-compose.tier-sim.yml logs onekof-web --tail 50
```
Common causes:
- `NEXTAUTH_SECRET` not set in `.env`
- Database migrations not applied (run Step 6.1)

### "Port 5432 already in use"
Another PostgreSQL instance is running on your machine. Either stop it:
```powershell
Stop-Service postgresql*
```
Or change the port mapping in `docker-compose.tier-sim.yml`:
```yaml
ports:
  - "127.0.0.1:5433:5432"   # Map to 5433 instead
```

### "Port 3000 already in use"
Another application (Node.js dev server, etc.) is using port 3000:
```powershell
netstat -ano | findstr :3000
taskkill /PID <pid-from-above> /F
```
Or change the port in `docker-compose.tier-sim.yml`:
```yaml
ports:
  - "127.0.0.1:8080:3000"   # Access via http://localhost:8080
```

### Docker is very slow on Windows
1. Ensure you're using the **WSL 2 backend** (not Hyper-V)
2. Store project files inside WSL filesystem (`\\wsl$\Ubuntu\home\...`) for faster I/O
3. Increase Docker memory allocation (Settings > Resources)
4. Disable Windows Defender real-time scanning for Docker data folders

### Cannot connect from another computer on LAN
1. Check Windows Firewall rule exists (Step 8.2)
2. Ensure both machines are on the same network
3. Verify the network profile is "Private" (not "Public")
4. Try temporarily disabling Windows Firewall to confirm it's a firewall issue

---

## 12. Security Considerations for Production Use

This Docker setup is designed for **internal/office use**. For internet-facing production:

| Concern | Action Required |
|---------|----------------|
| SSL/TLS | Add a reverse proxy (Caddy or Nginx) with TLS certificate |
| Database password | Change from default `onekof:onekof` to a strong password |
| NEXTAUTH_SECRET | Use a cryptographically random 32+ character string |
| Firewall | Only expose ports 80/443 via reverse proxy, not 3000 directly |
| Backups | Schedule automated daily backups (Task Scheduler + the backup commands above) |
| Updates | Apply Windows security updates monthly; rebuild Docker images for app updates |
| Antivirus | Whitelist Docker data directories to avoid performance issues |

---

## Quick Reference Card

| Action | Command |
|--------|---------|
| Start | `docker compose -f docker-compose.tier-sim.yml up -d` |
| Stop | `docker compose -f docker-compose.tier-sim.yml down` |
| Rebuild | `docker compose -f docker-compose.tier-sim.yml up -d --build` |
| Logs | `docker compose -f docker-compose.tier-sim.yml logs -f` |
| Mark migration applied | `docker compose -f docker-compose.tier-sim.yml exec -u root onekof-web npx prisma migrate resolve --applied MIGRATION_NAME --schema //app/packages/database/prisma/schema.prisma` |
| Seed database | `docker compose -f docker-compose.tier-sim.yml exec -u root -w //app/packages/database onekof-web npx tsx prisma/seed.ts` |
| Backup DB | `docker compose -f docker-compose.tier-sim.yml exec postgres pg_dump -U onekof -d onekof --format=custom -f /tmp/backup.dump` |
| Wipe everything | `docker compose -f docker-compose.tier-sim.yml down -v` |
