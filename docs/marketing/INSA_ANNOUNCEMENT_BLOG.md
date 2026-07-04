# Onekof PM: Enterprise-Grade Security, Built for Ethiopian Organizations

*July 2026 | DAPS Analytics*

---

Today we're announcing that **Onekof PM** has passed a rigorous **49-test security assessment**, qualifying it for deployment in Ethiopian enterprises, government agencies, and regulated industries.

## What Does "Certified Secure" Mean?

Before any software can be deployed in Ethiopian critical infrastructure, it must pass a comprehensive web application security assessment covering:

- **Authentication** — brute-force protection, session management, password security
- **Authorization** — role-based access control, cross-tenant isolation, privilege escalation prevention
- **Input Validation** — protection against injection attacks, XSS, and malformed data
- **API Security** — rate limiting, CORS enforcement, webhook signature verification
- **Data Protection** — encryption at rest, secure token storage, audit logging
- **Session Management** — cookie security, session invalidation, timeout enforcement

Onekof passed all 49 test cases. Only three findings were identified during the assessment — all fixed and verified within 24 hours.

## Why This Matters for Ethiopian Organizations

Until now, Ethiopian organizations faced a difficult choice:

1. **Use international tools** (Jira, Monday.com, Asana) that don't support Ethiopian calendars, Amharic, or ETB payments — and can't meet Ethiopian security requirements
2. **Use spreadsheets and WhatsApp** — flexible but impossible to scale, audit, or report from

Onekof eliminates this tradeoff.

### Built for Ethiopia, Not Adapted

- **Ethiopian Calendar** — toggle between Ethiopian and Gregorian with one click
- **Amharic & Oromo UI** — native language support, not machine-translated
- **Budget Tracking in ETB** — allocate, track expenses, and generate reports in Ethiopian Birr
- **Pay via Telebirr & CBE** — subscribe in ETB through Chapa; no USD credit card required
- **Data Residency** — on-premise Docker deployment keeps data in Ethiopia
- **Enterprise-Grade Security** — 49 security tests passed, end-to-end encryption, audit logging

## Security Built In, Not Bolted On

Here's what we built into Onekof from day one:

- **Role-based access control** (OWNER, ADMIN, MEMBER, GUEST) with cross-tenant isolation
- **AES-256-GCM encryption** for all uploaded files at rest
- **Scrypt password hashing** with timing-safe comparison
- **Rate limiting** on authentication, billing, and admin endpoints
- **HMAC signature verification** on all payment webhooks (Stripe + Chapa)
- **Append-only audit logs** for organization, budget, and admin actions
- **CSRF protection** on all state-mutating routes
- **Session invalidation** — server-side JWT revocation on logout

## On-Premise Deployment

For organizations that need data to stay in Ethiopia, Onekof supports full on-premise deployment:

- Docker containerized (~300 MB image)
- PostgreSQL + Redis, no external dependencies
- Automatic SSL via Caddy reverse proxy
- Same platform, same features — your infrastructure

## Try Onekof Free

Onekof is available today with a **7-day free trial** that includes full access to all Professional features.

**Free plan** (forever): 5 team members, 3 projects, 1 GB storage
**Starter**: 600 ETB/month — 25 members, 15 projects
**Professional**: 1,450 ETB/month — 100 members, 50 projects
**Enterprise**: Custom — on-premise, SSO, dedicated support

[Get Started Free →](https://onekof.com/auth/signup)

---

*Onekof is built by DAPS Analytics PLC. For inquiries, contact hello@onekof.com.*
