# LinkedIn Content Calendar — 10 Posts

Post from Oli's personal account. Schedule 2-3 per week. Use relevant hashtags at the end.

---

## Post 1 — Security Certification Announcement (Priority — post first)

We just passed a rigorous 49-test security assessment for Onekof PM.

Every test — authentication, authorization, session management, input validation, API security, data protection, audit logging — passed.

What this means for Ethiopian organizations:
- Onekof meets the security standards required for government and enterprise deployment
- Your data is protected by the same standards used in critical national infrastructure
- On-premise deployment keeps your data in Ethiopia

We didn't build security as an afterthought. We built it as the foundation.

7-day free trial at onekof.com

#Ethiopia #ProjectManagement #Security #AfricanTech #DAPS

---

## Post 2 — The Problem We're Solving

Every Ethiopian organization I've worked with tracks projects the same way:

WhatsApp groups + Google Sheets + email chains.

The result? Budgets are tracked in USD (not ETB). Deadlines use the wrong calendar. Reports are copy-pasted from 5 different spreadsheets. And when the donor audit comes, everyone scrambles.

We built Onekof to fix this:
- Ethiopian calendar (toggle with one click)
- Budget tracking in ETB
- Amharic and Oromo UI
- Pay via Telebirr (no USD credit card needed)
- Enterprise-grade security, certified and tested

Sometimes the best technology isn't the most advanced — it's the most relevant.

onekof.com

#Ethiopia #ProjectManagement #BudgetManagement #NGO

---

## Post 3 — Why Ethiopian Calendar Matters

A project deadline of Sene 30, 2018 EC means nothing in Jira.

But for an Ethiopian team, it's the most natural way to track time. Forcing them to mentally convert every date to Gregorian is a daily friction that nobody talks about.

In Onekof, you toggle between Ethiopian and Gregorian calendars with one click. Deadlines, milestones, reports — all sync automatically.

Small feature. Massive productivity impact.

#Ethiopia #EthiopianCalendar #ProductDesign #UserExperience

---

## Post 4 — Pay in ETB, Not USD

The #1 barrier to SaaS adoption in Ethiopia isn't features.

It's payment.

Most international tools require a USD credit card. In a country where foreign currency is restricted and most transactions happen via Telebirr and CBE, that's a non-starter.

Onekof accepts Ethiopian Birr via:
- Telebirr
- CBE Birr
- Awash Bank
- Debit/Credit card

All through Chapa, Ethiopia's payment gateway.

Starting at 600 ETB/month for 25 team members. That's less than what most NGOs spend on paper for monthly reports.

onekof.com/pricing

#Ethiopia #Fintech #SaaS #Chapa #Telebirr

---

## Post 5 — Data Sovereignty

"Where is our data stored?"

This question comes up in every Ethiopian enterprise meeting. And it should.

For sensitive project data — organizational budgets, workflows, team operations — the data needs to stay in Ethiopia.

Onekof supports on-premise deployment:
- Full Docker deployment to your own servers
- PostgreSQL + Redis, no external dependencies
- Same platform, same features, your infrastructure
- Enterprise-grade security, 49 tests passed

Cloud or on-premise — your choice.

#DataSovereignty #Ethiopia #Security #GovTech

---

## Post 6 — Building in Public: Our Stack

For the engineers following along, here's what powers Onekof:

Frontend: Next.js 14 (App Router, standalone output)
Backend: Prisma + PostgreSQL (70+ models)
Auth: NextAuth with session invalidation + scrypt hashing
Payments: Stripe (USD) + Chapa (ETB)
Deployment: Vercel (cloud) + Docker (on-premise)
Security: 49 tests passed, HMAC webhook verification, RBAC, rate limiting
Languages: English, Amharic, Oromo, Tigrinya

Total codebase: ~130K lines of TypeScript.

Built by DAPS Analytics, a 2-person team in Maryland and Addis Ababa.

#BuildInPublic #TypeScript #NextJS #Engineering #Ethiopia

---

## Post 7 — Budget Management for Ethiopian Teams

I've seen Ethiopian NGOs spend 3 days preparing a single quarterly budget report.

The data is scattered across:
- Excel files on someone's laptop
- WhatsApp receipts
- Bank statements in Amharic
- Email approvals

In Onekof, budget management is built in — not bolted on:
- Allocate budgets in ETB
- Track expenses with approval workflows
- Generate donor-ready reports automatically
- Full audit trail for compliance

Budget management should take minutes, not days.

#BudgetManagement #NGO #Ethiopia #Finance

---

## Post 8 — Our Security Journey

Building software for Ethiopian organizations means security isn't optional.

Here's what we built into Onekof from day one:

- Role-based access control (OWNER, ADMIN, MEMBER, GUEST)
- AES-256-GCM encryption for uploaded files
- Session invalidation with scrypt password hashing
- Rate limiting on all authentication and billing endpoints
- HMAC signature verification on payment webhooks
- Append-only audit logs for compliance
- CSRF protection on all state-mutating routes

Then we put it through a 49-test security assessment. Authentication, session management, input validation, API security, data protection — every category tested.

3 findings identified. All fixed within 24 hours.

If you're building software for Ethiopian markets, invest in security early. Your customers and their data deserve it.

#Security #Ethiopia #Software #Engineering

---

## Post 9 — Amharic UI: More Than Translation

Making software work in Amharic isn't just about translating strings.

It's about:
- Right font rendering (Abyssinica SIL for Ethiopic script)
- Proper text overflow in buttons and labels
- Cultural context in error messages
- Date formatting in Ethiopian calendar
- Number formatting for ETB currency

We didn't use Google Translate. Every label, tooltip, and notification was written by native speakers who understand the context.

Language isn't a feature checkbox — it's a design decision.

#Amharic #Localization #i18n #Ethiopia #Design

---

## Post 10 — Free Forever for Small Teams

Not every team needs an Enterprise plan.

Onekof's Free plan includes:
- 5 team members
- 3 projects
- 1 GB storage
- Ethiopian calendar
- Amharic & Oromo UI
- Full project & task management

Free forever. No credit card. No time limit.

If your team outgrows it, upgrade starts at 600 ETB/month.

Sign up: onekof.com

#FreeTool #ProjectManagement #Ethiopia #Startup

---

## Posting Schedule

| Week | Day | Post # | Topic |
|------|-----|--------|-------|
| Week 1 | Mon | 1 | Security Certification (announcement) |
| Week 1 | Wed | 2 | The Problem |
| Week 1 | Fri | 4 | Pay in ETB |
| Week 2 | Mon | 3 | Ethiopian Calendar |
| Week 2 | Wed | 5 | Data Sovereignty |
| Week 2 | Fri | 7 | Budget Management |
| Week 3 | Mon | 6 | Building in Public |
| Week 3 | Wed | 8 | Security Journey |
| Week 3 | Fri | 9 | Amharic UI |
| Week 4 | Mon | 10 | Free Forever |
