# Onekof PM — Project Readiness Report
**Prepared for:** Founders & Stakeholders
**Author:** Oli T. Oli, Founder & Lead Engineer
**Date:** May 23, 2026
**Classification:** Confidential — Internal Distribution Only

---

## Executive Summary

Onekof PM is an enterprise-grade, multi-tenant project management platform built specifically for Ethiopian and East African organizations. As of May 23, 2026, the platform has achieved **full technical production readiness** across security, infrastructure, and compliance — with zero outstanding code blockers.

The platform is live on global cloud infrastructure (Tier 3), passes 100% of INSA security requirements, enforces strict TypeScript builds with zero errors, and operates with complete error tracking and audit logging. All five languages (English, Amharic, Oromo, Tigrinya, Somali) are fully supported.

**The only remaining go-live blockers are non-technical: domain registration, server provisioning, and INSA certification submission — all of which are founder/stakeholder actions, not engineering tasks.**

---

## 1. Product Overview

| Attribute | Detail |
|-----------|--------|
| Product name | Onekof PM |
| Category | Enterprise Project Management SaaS |
| Primary market | Ethiopian government, NGOs, private sector (East Africa) |
| IP owner | DAPS Analytics |
| Author / moral rights | Oli Tamrat Oli |
| IP status | EIPA copyright deposit in progress |
| Stage | Pre-launch — no paying customers |
| Live URL | onekof.com (Vercel, global cloud) |

### What Onekof Does

Onekof is a full-stack project management platform comparable to Jira, Linear, and Asana — built from the ground up for the Ethiopian enterprise context:

- **Multi-tenant**: Each organization gets its own subdomain (`org.onekof.et`)
- **5-language UI**: English, Amharic, Oromo, Tigrinya, Somali — all production-ready
- **Ethiopian calendar**: Dual Gregorian/Ethiopian date display throughout
- **ETB currency**: Ethiopian Birr as default currency for budget tracking
- **Three-tier hosting**: Cloud (Vercel), self-hosted (EthioTelecom), and air-gapped sovereign (government/INSA) — same codebase, environment-driven

### Core Feature Set

| Module | Status |
|--------|--------|
| Projects & Issues (Kanban, Backlog, List) | ✅ Complete |
| Goals & Key Results (OKR framework) | ✅ Complete |
| Teams & Member management | ✅ Complete |
| Budget tracking (ETB, multi-currency) | ✅ Complete |
| Wiki / Knowledge base | ✅ Complete |
| Document management + AI processing | ✅ Complete |
| Audit log (INSA-compliant, append-only) | ✅ Complete |
| Notifications (web + mobile) | ✅ Complete |
| Automations & rules engine | ✅ Complete |
| Analytics & dashboard | ✅ Complete |
| Mobile app (iOS + Android) | ✅ Feature-complete |
| AI features (Anthropic) | ⏳ Ready — pending API key provisioning |

---

## 2. Technical Readiness

### 2.1 Build Health

| Metric | Status |
|--------|--------|
| TypeScript errors | **0** — strict mode enforced (`ignoreBuildErrors: false`) |
| ESLint | Warnings only (console.log in scripts) — no errors |
| CI/CD pipeline | GitHub Actions live — CI + Deploy both green |
| Test coverage | Basic smoke tests — unit test suite deferred post-launch |
| API routes | 141 routes — all auth-guarded |

### 2.2 Security Posture — INSA 100%

All six INSA security requirements are closed as of Wave 5 (2026-05-23):

| # | Requirement | Status |
|---|-------------|--------|
| P1 | CSRF origin validation on all state-mutating API calls | ✅ Closed |
| P2 | Admin endpoint rate limiting (60 req/min per IP) | ✅ Closed |
| P3 | Audit log immutability — DELETE returns 405 Method Not Allowed | ✅ Closed |
| P4 | AES-256-GCM at-rest encryption for all uploaded files | ✅ Closed |
| P5 | Session invalidation on password change | ✅ Closed |
| P6 | HTTP security headers (CSP, X-Frame-Options, HSTS, Referrer-Policy) | ✅ Closed |

Additional security measures in production:
- bcrypt 12-round password hashing
- Account lockout after failed login attempts
- Email verification required on signup
- JWT sessions scoped to subdomain
- All debug routes behind `requireSuperAdmin` guard
- No secrets in git history (verified)

### 2.3 Infrastructure

| Component | Tier 3 (Cloud) | Tier 2 (Self-Hosted) | Tier 1 (Sovereign) |
|-----------|---------------|---------------------|-------------------|
| Web app | ✅ Vercel (fra1) | ✅ Docker 408 MB ready | ✅ Same image |
| Database | ✅ Supabase PG15 | ✅ PostgreSQL 15 config | ✅ Same config |
| Redis | ✅ Upstash (cloud) | ✅ Redis 7 config | ✅ Same config |
| File storage | ✅ Vercel Blob | ✅ Local-fs + AES-256 | ✅ Same driver |
| SSL | ✅ Vercel auto | ✅ Caddy auto Let's Encrypt | Manual |
| Backups | ✅ Automated | ✅ Cron + GPG encrypted | ✅ Same script |
| CI/CD | ✅ GitHub Actions | Manual trigger | USB delivery |

### 2.4 Monitoring & Observability

| Tool | Status |
|------|--------|
| Error tracking (Sentry) | ✅ Live — `onekof-web` project active, both DSN vars set in Vercel |
| Mobile error tracking | ✅ `onekof-mobile` Sentry project active |
| Audit logging | ✅ 10 privileged routes instrumented, viewer page live |
| Application logging | ✅ Structured logger (`lib/logger.ts`), configurable level |
| Uptime monitoring | ⏳ Pending — configure UptimeRobot after Tier 2 launch |

### 2.5 Database Migrations

14 migrations applied and tracked, latest:

| Migration | Purpose |
|-----------|---------|
| `20260505_add_org_audit_log` | INSA audit log (OrgAuditLog model) |
| `20260418_add_push_tokens` | Mobile push notification tokens |
| `20260417_add_notifications` | Notification read-state model |
| `20260412_add_admin_audit_log` | Admin action tracking |
| `20260411120000_portability_wave1` | Three-tier architecture foundation |

---

## 3. Mobile Application

| Attribute | Detail |
|-----------|--------|
| Platform | Expo SDK 54 + React Native |
| Bundle ID | com.dapsanalytics.onekof |
| Auth | JWT-based, connects to production API |
| Feature parity | Matches web — full CRUD, offline mode, push notifications |
| i18n | 5 languages implemented |
| EAS Build | Configured and linked |
| App Store | Pending Apple Developer membership ($99/yr) |
| Play Store | Pending Google Play account ($25 one-time) |

---

## 4. Intellectual Property

| Item | Status |
|------|--------|
| IP owner | DAPS Analytics (commercial rights) |
| Author | Oli Tamrat Oli (moral rights, non-transferable per Proclamation 410/2004) |
| EIPA copyright deposit | In progress — deposit package prepared 2026-04-11 |
| Filing blocker | Co-Owner / Co-Founder agreement + DAPS authorization letter required |
| Berne Convention coverage | Ethiopian registration covers all 181 member countries |
| Code innovations (patentable) | 4 identified: multi-tenant subdomain routing, Ethiopian calendar integration, three-tier federation dispatch, Amharic LLM task parsing |

---

## 5. Deployment Architecture — Three-Tier Federation

```
┌─────────────────────────────────────────────────────────┐
│  TIER 3 — Global Cloud (CURRENT PRODUCTION)             │
│  Vercel + Supabase + Upstash + Vercel Blob              │
│  URL: *.onekof.com  │  Status: LIVE ✅                  │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│  TIER 2 — Ethiopian Self-Hosted                         │
│  Docker + PostgreSQL 15 + Redis 7 + Caddy SSL           │
│  URL: *.onekof.et   │  Status: CODE-READY, PENDING VM  │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│  TIER 1 — Government / Air-Gapped Sovereign             │
│  Same Docker image, delivered via USB or ACR token      │
│  URL: internal      │  Status: PENDING INSA CERT        │
└─────────────────────────────────────────────────────────┘
```

**Key principle:** One codebase. One Docker image. Runtime behavior controlled entirely by environment variables. No code changes between tiers.

---

## 6. Go-Live Readiness Scorecard

### Engineering (Owner: Oli)

| Item | Score | Notes |
|------|-------|-------|
| Core product features | 10/10 | All modules complete |
| Security compliance (INSA) | 10/10 | P1–P6 all closed |
| Build quality (TypeScript) | 10/10 | Zero errors, strict mode |
| Mobile app | 9/10 | Feature-complete, App Store pending |
| Error tracking | 10/10 | Sentry live on web + mobile |
| i18n (5 languages) | 10/10 | Fully aligned across all locales |
| CI/CD pipeline | 10/10 | GitHub Actions live and green |
| Docker / self-hosted | 10/10 | 408 MB image, proven locally |
| Documentation | 9/10 | Runbooks + deployment plan complete |
| **Engineering overall** | **98/100** | |

### Business / Founder Actions Required

| Item | Score | Blocker |
|------|-------|---------|
| onekof.et domain | 0/10 | Register via EthioTelecom — Oli |
| EthioTelecom VM | 0/10 | Provision server — Oli |
| INSA certification submission | 0/10 | Initiate filing — code is ready |
| EIPA final deposit | 3/10 | Blocked on Co-Owner agreement paperwork |
| App Store (iOS) | 7/10 | Apple Developer membership active — submission in progress |
| Play Store (Android) | 0/10 | Google Play $25 one-time |
| Cloudflare Full SSL | 2/10 | $10/mo ACM or DNS move to Vercel |
| First customer / pilot org | 0/10 | Outreach not yet started |

---

## 7. Timeline to Launch

| Milestone | Target Date | Depends On |
|-----------|-------------|------------|
| Register onekof.et domain | Immediately | Oli — EthioTelecom |
| Deploy Tier 2 on EthioTelecom VM | Week of Jun 1 | VM provisioned |
| DNS cutover to onekof.et | Week of Jun 8 | Domain + VM live |
| Email setup (Resend + .et domain) | Week of Jun 8 | Domain live |
| Submit INSA certification | Week of Jun 8 | Code already ready |
| Internal beta (pilot organizations) | Week of Jun 15 | Tier 2 live |
| App Store submission (iOS) | Jun 2026 | Apple Dev active ✅ — EAS build + screenshots |
| Play Store submission (Android) | Jun 2026 | Google Play account |
| External beta / public launch | Jul 2026 | INSA cert in progress |
| First government pilot | Aug 2026 | INSA cert received |

---

## 8. Budget Requirements (Founder Actions)

| Item | Cost | Frequency | Priority |
|------|------|-----------|----------|
| onekof.et domain registration | ~$50 est. | Annual | **Immediate** |
| EthioTelecom VM (Tier 2) | TBD by EthioTelecom | Monthly | **Immediate** |
| Apple Developer membership | $99 USD | Annual | ✅ Active — in progress |
| Google Play account | $25 USD | One-time | High — blocks Android |
| Cloudflare ACM (wildcard SSL) | $10 USD | Monthly | Medium — blocks gov contracts |
| INSA certification fee | TBD | One-time | **Immediate** |
| Anthropic API key (AI features) | Usage-based | Monthly | Post-launch |
| Uptime monitoring (UptimeRobot) | Free tier | — | Low |

**Minimum spend to unblock Tier 2 launch:** Domain + VM + INSA fee

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| EthioTelecom VM provisioning delays | Medium | High | Use Massano rig as interim Tier 2 fallback |
| INSA certification timeline unknown | Medium | High | Submit immediately — code is 100% ready |
| onekof.et domain unavailable | Low | High | Fallback: onekof.com.et or negotiate |
| Cloudflare wildcard SSL cost objection | Low | Medium | Move DNS to Vercel (free wildcard) |
| Apple App Store review rejection | Low | Medium | Pre-review against App Store guidelines |
| EIPA filing delay (Co-Owner agreement) | High | Medium | Draft agreement ASAP — doesn't block go-live |
| No paying customers at launch | Medium | High | Start pilot outreach now (NGOs, private sector) |

---

## 10. What Stakeholders / Founders Need to Do

### Immediate (this week)

1. **Register onekof.et domain** — contact EthioTelecom or ETHIO-NET registrar
2. **Draft Co-Owner / Co-Founder agreement** between Oli Tamrat Oli and DAPS Analytics — unblocks EIPA final deposit
3. **Provision EthioTelecom VM** — Ubuntu 22.04, 4 vCPU, 8 GB RAM, 100 GB SSD
4. **Initiate INSA certification submission** — engineering is 100% ready, nothing left to code

### This month (June 2026)

5. **Apple Developer** — ✅ Active. Next: complete EAS Build + App Store screenshots
6. **Google Play enrollment** — $25 one-time, needed for Android
7. **Identify 3–5 pilot organizations** — NGOs, ministries, or private companies for internal beta
8. **Decide Cloudflare SSL approach** — $10/mo ACM or move DNS to Vercel

### Post-launch

9. **Government LOI / pilot MOU** — required before Tier 1 sovereign deployment begins
10. **Anthropic API key** — enables AI features (document processing, receipt analysis)

---

## 11. Competitive Position

| Feature | Onekof | Jira | Asana | Trello |
|---------|--------|------|-------|--------|
| Ethiopian language support | ✅ 5 langs | ❌ | ❌ | ❌ |
| Ethiopian calendar | ✅ | ❌ | ❌ | ❌ |
| ETB currency | ✅ | ❌ | ❌ | ❌ |
| On-premise / air-gapped | ✅ | Enterprise only | ❌ | ❌ |
| Government data residency | ✅ (Tier 1/2) | ❌ | ❌ | ❌ |
| INSA compliance | ✅ 100% | N/A | N/A | N/A |
| Local pricing (ETB) | ✅ | ❌ | ❌ | ❌ |
| Ethiopian mobile app | ✅ | ✅ (English) | ✅ (English) | ✅ (English) |

**Onekof is the only enterprise project management platform built for Ethiopian compliance, language, and data sovereignty requirements.**

---

## 12. Summary Statement

> Onekof PM is technically complete, security-hardened to 100% INSA compliance, and ready to deploy on Ethiopian infrastructure the moment the domain is registered and the VM is provisioned. The engineering team has delivered everything required for go-live. The path from here to launch is entirely in the hands of the business — domain, server, certification submission, and pilot outreach.

---

**Document Owner:** Oli T. Oli / DAPS Analytics
**Prepared:** 2026-05-23
**Next Review:** 2026-06-15
**Distribution:** Founders, Stakeholders, DAPS Analytics Board
