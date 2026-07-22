# EthioTelecom Cloud — Technical and Commercial Requirements Inquiry

**From:** Oli Tamrat Oli, Founder & CEO, DAPS Analytics PLC / Onekof Platform
**To:** EthioTelecom Cloud Services — Enterprise / Government Solutions Team
**Date:** July 22, 2026
**Reference:** Onekof Tier 1 Government Deployment Evaluation

---

## 1. Introduction

I am writing on behalf of DAPS Analytics PLC, the entity behind the **Onekof Platform** — an Ethiopian-first enterprise project management, budget tracking, and document processing software system. Onekof is currently deployed on international cloud infrastructure serving a mix of private-sector and pilot customers.

In preparation for **Ethiopian government and public-sector customers**, I am evaluating EthioTelecom Cloud as the hosting provider for a dedicated government tier of the platform. This tier would host workloads for ministries, federal and regional agencies, public universities, and other public-sector institutions that require Ethiopian data residency.

The purpose of this letter is to request **technical and commercial information** about EthioTelecom Cloud's current offering so I can evaluate fit, design the deployment architecture, and begin procurement discussions.

I would be grateful for responses to the questions in Sections 3–7 below, at whatever level of detail your team is able to share at this stage. I understand some answers may require a formal NDA or a sales engagement — I am happy to sign standard confidentiality agreements and schedule a technical call.

---

## 2. About Onekof

### 2.1 Company

- **Legal entity:** DAPS Analytics PLC
- **Founder & CEO:** Oli Tamrat Oli
- **Contact:** oli.oli@udc.edu
- **Mailing address:** Addis Ababa, Ethiopia
- **IP status:** Ethiopian Intellectual Property Authority (EIPA) software copyright registration filed 2026-04-11

### 2.2 Platform

- **Product:** Onekof — web-based multi-tenant enterprise platform
- **Technology stack:** Next.js 14, TypeScript, React 18, PostgreSQL 15 (Prisma ORM), Node.js 20
- **Features:** Project management, budget and expense tracking with Ethiopian fiscal year alignment, AI-powered document processing, Ethiopian (Ge'ez) calendar, five-language user interface (English, Amharic, Oromo, Tigrinya, Somali)
- **Current codebase:** ~158,000 lines of original source code across 538+ files, 46 database models
- **Tenancy model:** Multi-tenant with subdomain-per-organization routing

### 2.3 Current deployment (for reference)

- **Application:** Vercel serverless, Frankfurt (EU) region
- **Database:** Supabase PostgreSQL 15, EU-central-1 region
- **File storage:** Vercel Blob, EU-hosted
- **This tier (international) will remain in place** as the non-sovereign "global cloud" offering for international customers

### 2.4 Tier 1 (government) architecture target

- **Application runtime:** Containerized Node.js 20 service, ~512 MB–2 GB RAM per instance
- **Database:** PostgreSQL 15, ~50 GB initial growing with tenant onboarding
- **File storage:** S3-compatible object storage OR filesystem volume, expected ~100 GB initially
- **Network:** HTTPS ingress on port 443, HTTP→HTTPS redirect on port 80
- **Data residency requirement:** All customer data MUST remain physically within Ethiopia
- **Domain:** `*.gov.onekof.et` (wildcard subdomain for tenant isolation)

---

## 3. Compute and runtime

Please describe your current **Infrastructure-as-a-Service (IaaS) or Platform-as-a-Service (PaaS)** offerings that could host the Onekof application runtime.

1. **Virtual machines**
   - What VM sizes are available? (vCPU, RAM, disk)
   - Which Linux distributions are supported? (We need Ubuntu 22.04 LTS or 24.04 LTS, or Debian 12 — any modern glibc-based distro with OpenSSL 3 support is acceptable.)
   - Are GPU-enabled instances available? (Not required for Tier 1, noted for future AI inference workloads.)

2. **Containers / Kubernetes**
   - Do you offer a managed container service (e.g., managed Kubernetes, Docker host, OpenShift)?
   - Do you host a private container registry?

3. **Runtime limits**
   - What is the maximum allowed long-lived TCP connection duration?
   - Is outbound internet access available from compute instances, and if so, is egress metered?
   - Are there firewall rules between Ethiopian and international destinations that we should anticipate?

4. **Scaling**
   - Do you support horizontal scaling (adding more identical instances behind a load balancer)?
   - Is auto-scaling available, or only manual provisioning?

---

## 4. Database

This is the most important section for our architecture. Onekof's data layer is PostgreSQL 15 with the Prisma ORM.

1. **Managed PostgreSQL**
   - Do you offer a **managed PostgreSQL service**? If so, what versions are supported? We require **PostgreSQL 15 or newer**.
   - What is the maximum database size supported?
   - What is the maximum number of concurrent connections supported?
   - Is **connection pooling** (PgBouncer, PgCat, or similar) available as part of the service?
   - Is **point-in-time recovery (PITR)** supported? What is the retention window?
   - Is **read replica** support available?

2. **Extensions**
   - Can we install and use the following PostgreSQL extensions on managed instances?
     - `pg_trgm` (text search)
     - `uuid-ossp` (UUID generation) — optional, we use CUIDs primarily
     - `pgvector` (vector embeddings for future AI features)
     - `pg_stat_statements` (query performance monitoring)

3. **If only raw VMs / no managed PostgreSQL**
   - Confirm we can install PostgreSQL 15 ourselves from a trusted repository (e.g., the official PostgreSQL APT repository).
   - Are there any restrictions on network ports between application and database VMs (assuming co-located on the same private network)?

4. **Backup and restore**
   - What is the backup frequency for managed PostgreSQL?
   - How long are backups retained?
   - What is the documented recovery time objective (RTO) and recovery point objective (RPO)?
   - Can backups be exported for off-site retention, or are they only usable within EthioTelecom Cloud?

---

## 5. Storage

Onekof stores user-uploaded file attachments (invoices, receipts, contracts, photos, PDFs) outside the database for performance and cost reasons. Expected initial volume: ~100 GB, growing linearly with tenant count.

1. **Object storage**
   - Do you offer **S3-compatible object storage**?
   - What is the pricing model? (Per-GB-month, per-request, bandwidth?)
   - What is the maximum object size?
   - Are lifecycle rules (automatic deletion, tiering) supported?
   - What is the durability guarantee?

2. **If no object storage**
   - What is the maximum persistent volume size that can be attached to a VM?
   - Can volumes be resized live?
   - Are volumes backed by SSD or spinning disk?

3. **Data residency guarantee**
   - Can you provide a **written commitment** that stored data remains physically within Ethiopia and is not replicated to international datacenters under any circumstance (including DR, analytics, or vendor maintenance)?

---

## 6. Networking

1. **Public connectivity**
   - Do compute instances receive public IPv4 addresses by default? If not, how is internet-facing exposure configured?
   - Do you offer managed load balancers with TLS termination?
   - Is there a managed CDN offering for static assets?

2. **Private connectivity**
   - Can compute, database, and storage resources be placed on a private network with no internet routing?
   - Do you offer VPN or private peering for administrators to reach private resources securely?

3. **DNS**
   - Does EthioTelecom provide authoritative DNS hosting for the `onekof.et` domain, or must we use a third-party DNS provider?
   - Is wildcard DNS (`*.gov.onekof.et`) supported?

4. **TLS certificates**
   - Can we use Let's Encrypt for automatic TLS certificate issuance?
   - If not, does EthioTelecom Cloud offer managed TLS certificates (including wildcard certificates for subdomain tenancy)?

---

## 7. Security and compliance

1. **Physical and facility**
   - Where are your primary datacenters located? (City-level is sufficient.)
   - What tier (Uptime Institute Tier I–IV) is the primary facility?
   - What access controls govern physical access to the datacenters?

2. **Logical security**
   - Is encryption-at-rest available for managed database and storage services? If so, who holds the key (EthioTelecom, customer, shared)?
   - Is encryption-in-transit enforced between EthioTelecom services?
   - Do you provide identity and access management (IAM) for administrative console access?
   - Are audit logs of administrative actions available to customers?

3. **Compliance**
   - Does EthioTelecom Cloud hold any of the following certifications or attestations: ISO 27001, ISO 27017, ISO 27018, SOC 2 Type II, PCI DSS?
   - How does EthioTelecom Cloud align with current or pending Ethiopian data protection legislation?
   - Are there specific compliance frameworks you have built to accommodate Ethiopian government customers?

4. **Vulnerability management**
   - Do you conduct third-party penetration tests on your services? Are reports shareable with customers under NDA?
   - What is your documented incident response and customer notification timeline?

5. **Disaster recovery**
   - Do you offer DR services within Ethiopia (e.g., multi-region replication within the country)?
   - What is the stated recovery time for a total datacenter loss event?

---

## 8. Commercial

1. **Pricing model**
   - How is compute, storage, and network priced? (Per-hour, per-month, reserved instances, consumption?)
   - Do you offer discounts for long-term commitments, government contracts, or local entities?
   - Is there a published price sheet, or is pricing negotiated per engagement?

2. **Contracts**
   - What is the minimum contract duration?
   - Is the contract denominated in ETB or USD?
   - Do you offer trial or evaluation credits (e.g., 30-day paid proof of concept)?

3. **Support**
   - What support tiers are available? (Basic, enhanced, premium?)
   - What is the response time SLA for each tier?
   - Is 24/7 support available?
   - What languages does your support team operate in?

4. **Procurement**
   - What is the procurement process for a private company (non-government) to become an EthioTelecom Cloud customer?
   - DAPS Analytics PLC is a registered Ethiopian entity — what documentation do you require to open an enterprise account?
   - What documentation do you require for a new enterprise account?

5. **Operational model**
   - Do customers self-service via a web console and API, or is every request processed through a sales or support engineer?
   - Is there a programmable API (REST, Terraform provider, SDK) for automation?

---

## 9. Proof of concept

I would like to request a **paid 30-day proof of concept** engagement with the following scope:

- Provision one Linux VM (Ubuntu 22.04 LTS, ~4 vCPU / 16 GB RAM / 200 GB SSD)
- Provision one managed PostgreSQL 15 instance (or one additional VM for self-hosted PostgreSQL if managed is not available)
- Provision one S3-compatible bucket (or equivalent) with ~100 GB quota
- Configure DNS for a test subdomain under `onekof.et`
- Deploy a production-equivalent Onekof build
- Run synthetic load tests against the deployment
- Document deployment experience, performance, and any friction points

The purpose of the POC is to confirm that EthioTelecom Cloud can meet our technical requirements BEFORE we commit to a production Tier 1 deployment. I am prepared to **execute any necessary NDAs, sign a POC agreement, and pay published rates for resources consumed**.

---

## 10. Next steps

I would appreciate:

1. **A written response to the questions in Sections 3–7** at whatever level of detail you can share at this stage
2. **A sales / solutions engineering contact** I can work with for follow-up questions and a deeper technical discussion
3. **A formal quote or estimate** for the POC described in Section 9
4. **Any NDAs or compliance documents** your team requires before sharing detailed pricing or architectural information

I am available for a call, written exchange, or in-person meeting at our office in Addis Ababa, Ethiopia.

Thank you in advance for your time and consideration. I am enthusiastic about the possibility of building the Onekof government tier on Ethiopian-owned infrastructure and look forward to your response.

Sincerely,

**Oli Tamrat Oli**
Founder & CEO, DAPS Analytics PLC
Author and Copyright Holder, Onekof Platform
Email: oli.oli@udc.edu
Phone: _______________

![Onekof Logo](/apps/web/public/logo-wordmark.png)

---

## Appendix A — Onekof Tier 1 technical summary (for your engineering team)

| Attribute | Requirement |
|---|---|
| Application runtime | Node.js 20 LTS, containerized |
| Database | PostgreSQL 15, ~50 GB initial, Prisma ORM |
| File storage | S3-compatible OR filesystem, ~100 GB initial |
| Cache / rate limit | Redis 7 |
| Reverse proxy / TLS | Caddy or Nginx |
| Inbound ports | 443 (HTTPS) + 80 (HTTPS redirect) |
| Outbound requirements | OS package updates, NPM registry (build time), OPTIONAL: Anthropic API, Resend SMTP |
| Expected tenant count (year 1) | 5–20 government customers |
| Expected peak traffic | ~500 concurrent users |
| Expected daily database writes | ~100,000 row inserts/updates |
| Expected daily file uploads | ~1 GB |
| RTO target | 4 hours |
| RPO target | 24 hours |
| TLS wildcard | `*.gov.onekof.et` |
| Backup strategy | Nightly PostgreSQL dump + blob rsync, retained 30 days on-site |

---

## Appendix B — Questions we do NOT need answers to yet

To keep this inquiry focused, the following topics are **out of scope** for this initial request and can be deferred to a later conversation:

- Mobile application distribution
- SMS gateway integration
- National ID (Fayda) integration
- Payment gateway integration (Telebirr, CBE Birr)
- Hebrew / right-to-left language support
- Kubernetes / Helm chart delivery
- Microservices decomposition
- CDN + edge computing
- Machine learning model hosting

---

**Document version:** 2.0 — finalized July 22, 2026
**Review status:** Draft, pending final review before sending
**Distribution:** EthioTelecom Cloud Enterprise / Government team only
