# Onekof PM — Ethio Cloud Enterprise Architecture: Phased Roadmap

**Date:** July 24, 2026
**Prepared by:** DAPS Analytics PLC
**Contributors:** Oli Tamrat (CTO), Shambel (Infrastructure & Security)
**Status:** Planning — pending Ethio Telecom Cloud capability confirmation

---

> **Relationship to the existing migration plan:** This document is a **separate, forward-looking architecture roadmap**. The original `ETHIO_TELECOM_MIGRATION_PLAN.md` (Phase 1) remains the active, approved deployment plan and is not altered by this document. The phases below build on top of the Phase 1 foundation as Ethio Cloud capabilities are confirmed and customer requirements evolve.

---

## Architecture Vision

**Single Image (430 MB) · Multi-Environment · Multi-Tenant · Secure · Highly Available**

The Onekof PM container image is designed for deployment portability. The same Docker image runs identically across:

| Environment | Target Customer | Rationale |
|---|---|---|
| Ethio Cloud (ECS) | Government agencies, ministries | Data sovereignty compliance |
| On-premises data centers | Banks, financial institutions | Regulatory custody requirements |
| Microsoft Azure | NGOs, private sector | Commercial flexibility, global reach |

---

## Phase 1 — Production Deployment (Current Plan)

> **Status: Approved and in progress. See `ETHIO_TELECOM_MIGRATION_PLAN.md` for full details.**

**Architecture:** Single VM with Docker Compose stack.

```
Internet → Caddy (SSL/TLS) → Onekof Web (Next.js) → PostgreSQL + Redis
                                   ↑
                              Docker Network
                           (internal only — DB/Redis not exposed)
```

**Components:**
- 2 VMs (production + staging) from Ethio Telecom
- Caddy reverse proxy with automatic Let's Encrypt SSL
- Onekof PM container (~430 MB, from ghcr.io)
- PostgreSQL 15 (70+ Prisma models)
- Redis 7 (rate limiting, caching, sessions)

**Access pattern:** Public IP + HTTPS + security groups + application-level authentication + RBAC + rate limiting + tenant isolation.

**This phase is not modified by anything below.**

---

## Phase 2 — VPC Network Isolation & Security Hardening

**Trigger:** Ethio Cloud confirms VPC, subnet, and security group capabilities.

### Architecture Changes

| Component | Phase 1 | Phase 2 |
|---|---|---|
| Network | Flat — public IP on VM | VPC with public + private subnets |
| Database | On same VM, Docker network only | Private data subnet, no public access |
| Application | Single container | Application subnet, behind internal LB |
| Outbound | Direct internet | NAT gateway for outbound-only traffic |
| Edge security | UFW + fail2ban | Security groups + network ACLs (least privilege) |

### Proposed VPC Layout

| Subnet | CIDR (placeholder) | Purpose |
|---|---|---|
| Public subnet | 10.0.1.0/24 | Internet-facing load balancer, NAT gateway |
| Application subnet | 10.0.10.0/24 | Onekof PM containers |
| Data subnet | 10.0.40.0/24 | PostgreSQL primary |
| Services subnet | 10.0.50.0/24 | Object storage, monitoring, secrets management |

### VPC Endpoints (if available)

Private connectivity to Ethio Cloud managed services avoids sending internal traffic over the public internet:

- Object Storage endpoint (backups)
- Monitoring endpoint (logs/metrics)
- KMS endpoint (encryption keys)
- Container Registry endpoint (image pulls)
- DNS resolver

### Security Additions

- WAF at the edge (if Ethio Cloud offers managed WAF)
- DDoS protection (if available as a managed service)
- Security groups with least-privilege rules per subnet
- Network ACLs as a secondary defense layer

---

## Phase 3 — Private Government Access Pattern

**Trigger:** Ethio Cloud confirms private connectivity options AND a government customer requires private-only access.

### The Requirement

Government agencies managing sensitive project data may require that Onekof traffic never traverses the public internet. This phase adds a second access pattern alongside the existing public HTTPS path:

```
Government agency on-premises network
    → Encrypted private connection (VPN / leased line / private gateway)
        → Ethio Cloud private gateway
            → Internal load balancer / reverse proxy
                → Onekof PM (same application, same data)
```

**Both access patterns coexist** — the same Onekof deployment serves public users via HTTPS and private government users via the internal endpoint.

### Ethio Cloud Capability Questions

The following questions must be answered by Ethio Telecom before this phase can be designed. These are **prerequisites, not assumptions**.

| # | Question | Why It Matters |
|---|---|---|
| 1 | Does Ethio Cloud support a managed site-to-site IPsec VPN gateway? | Determines whether agencies can establish encrypted tunnels to the Onekof VPC without DAPS managing VPN infrastructure |
| 2 | Can government agencies connect through an existing Ethio Telecom private WAN, MPLS, or government network? | Many ministries already have Ethio Telecom private circuits; reusing them avoids new procurement |
| 3 | Is a dedicated or private cloud connectivity service available (similar to AWS Direct Connect)? | Provides dedicated bandwidth and lower latency than VPN for high-usage agencies |
| 4 | Can a private load balancer or internal application endpoint be created within the Onekof VPC? | Required to expose the application internally without a public IP |
| 5 | Does Ethio Cloud support private DNS zones or conditional forwarding? | Allows agencies to resolve `onekof.gov.et` to the internal endpoint without public DNS |
| 6 | Can the same Onekof service support both a private endpoint and the public production EIP simultaneously? | Confirms dual-access architecture is feasible without running two separate deployments |
| 7 | Are overlapping agency IP address ranges handled through NAT? | Government networks often reuse common RFC1918 ranges (10.x, 172.16.x); NAT avoids conflicts |
| 8 | Are gateway, VPN, routing, traffic, or bandwidth quotas governed separately? | Ensures DAPS can plan capacity and cost without hidden throttling |
| 9 | Which party manages agency routing, tunnel monitoring, certificate management, and incident response? | Defines the operational boundary between DAPS, Ethio Telecom, and the agency IT team |
| 10 | Are WAF and managed DDoS-protection services available for the public endpoint? | The public endpoint still needs edge protection even when private access is offered |

### Action Required

- [ ] Include questions 1–10 in the next Ethio Telecom engagement meeting
- [ ] Document answers and update this section with confirmed capabilities
- [ ] Design the private access architecture only after capabilities are confirmed

---

## Phase 4 — High Availability & Multi-AZ Scaling

**Trigger:** Customer base grows beyond single-instance capacity OR an SLA requires 99.9%+ uptime.

### Architecture Changes

| Component | Phase 1–3 | Phase 4 |
|---|---|---|
| Application | Single container | 3 replicas across availability zones |
| Database | Single PostgreSQL | Primary + synchronous standby (multi-AZ) |
| Cache | Single Redis | Redis cluster or replicated cache |
| Load balancing | Caddy on same instance | HA load balancer distributing across AZ-A, AZ-B, AZ-C |
| Background workers | None or co-located | Dedicated worker containers per AZ |

### Proposed Multi-AZ Layout

| Subnet | AZ-A (10.0.10.0/24) | AZ-B (10.0.20.0/24) | AZ-C (10.0.30.0/24) |
|---|---|---|---|
| Onekof PM container | Replica 1 | Replica 2 | Replica 3 |
| Redis cache | Instance 1 | Instance 2 | Instance 3 |
| Background worker | Worker 1 | Worker 2 | Worker 3 |

| Data tier | Primary (10.0.40.0/24) | Standby |
|---|---|---|
| PostgreSQL | Primary (AZ-A) | Synchronous standby (AZ-B) |

### Prerequisites

- Ethio Cloud must support multiple availability zones within the same region
- Container orchestration (ECS/Kubernetes) must be available for replica management
- Managed or self-hosted PostgreSQL replication must be feasible
- Session affinity or stateless session handling (Redis-backed) must be in place

---

## Phase 5 — Enterprise Observability & Compliance

**Trigger:** Enterprise or government SLA requirements mandate audit trails, monitoring dashboards, and automated alerting.

### Components

| Service | Purpose | Location |
|---|---|---|
| Prometheus + Grafana | Metrics collection and dashboards | Private services subnet |
| Centralized logging | Immutable audit logs | Private services subnet |
| Object storage | Backups, file uploads | Private services subnet |
| Vault / KMS | Secrets and encryption key management | Private services subnet |
| Backup service | Automated PostgreSQL snapshots | Private services subnet |
| Security scanning | Container image and runtime scanning | CI/CD pipeline + runtime |

### DAPS Operations Responsibilities

| Function | Scope |
|---|---|
| Application operations | Container deployments, migrations, health checks |
| Monitoring & alerting | 24/7 uptime monitoring, incident response |
| Backup & DR | Automated daily backups, tested recovery procedures |
| Patch management | OS security updates, container image rebuilds |
| Security scanning | Image vulnerability scanning, dependency audits |
| Logging & audit | Immutable audit trail for compliance reporting |

---

## Multi-Environment Deployment Strategy

The single Onekof PM container image (430 MB) deploys identically across all environments:

| Environment | Infrastructure Provider | Target Customers | Deployment Model |
|---|---|---|---|
| Ethio Cloud (ECS) | Ethio Telecom | Government, ministries | Production / Staging / Dev |
| On-premises | Customer data center | Banks, financial institutions | Production / Staging / Dev |
| Microsoft Azure | Microsoft | NGOs, private sector | Production / Staging / Dev |

**DAPS provides:** Container image, application operations, monitoring, backups, updates.
**Infrastructure provider provides:** Compute, networking, storage, datacenter operations.

---

## Summary: Phase Dependencies

```
Phase 1 (Current)          → No dependencies, approved, in progress
    ↓
Phase 2 (VPC isolation)    → Ethio Cloud confirms VPC/subnet support
    ↓
Phase 3 (Private access)   → Ethio Cloud answers questions 1–10 above
    ↓
Phase 4 (Multi-AZ HA)      → Customer growth requires scaling / SLA demands
    ↓
Phase 5 (Observability)    → Enterprise/government SLA requirements
```

Each phase builds on the previous. No phase requires changes to the Phase 1 migration plan — it is additive infrastructure layered around the same application.

---

## Reference

- Original deployment plan: `docs/deployment/ETHIO_TELECOM_MIGRATION_PLAN.md`
- ECS pricing briefing: `docs/deployment/ETHIO_TELECOM_CLOUD_PRICING_BRIEFING.md`
- VM request specifications: `docs/deployment/ETHIO_TELECOM_VM_REQUEST.html`
- Technical architecture: `docs/architecture/TECHNICAL_ARCHITECTURE.md`
- Architecture diagram (Visio): Provided by Shambel — see attached `onekof_Visio_Architecture_Diagram.docx`
