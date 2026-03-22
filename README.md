<div align="center">

# 🚀 Onekof Platform

### *Modern Project Management for African Enterprises*

**Enterprise-grade project management with Ethiopian-first design**

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

[Features](#-key-features) • [Demo](#-screenshots) • [Installation](#-quick-start) • [Documentation](#-documentation) • [Roadmap](#-roadmap)

</div>

---

## 📖 About Onekof

Onekof is a **modern, enterprise-grade project management platform** designed specifically for Ethiopian government agencies, NGOs, and enterprises. We combine the power of Jira-style issue tracking with comprehensive budget management, team collaboration, and AI-powered document processing.

### Why Onekof?

🇪🇹 **Ethiopian-First Design** - Built with ETB currency, multilingual support (Amharic, Oromo, Tigrinya), and infrastructure project templates

🤖 **AI-Powered** - Automatic document processing to extract budget items, milestones, and vendors from invoices and contracts

💰 **Cost-Effective** - All-in-one platform replacing multiple expensive tools (Jira, Confluence, Budget software)

🎯 **Project-Type Aware** - Different workflows for SOFTWARE, BUSINESS, MARKETING, OPERATIONS, RESEARCH, and CONSTRUCTION projects

📱 **Modern Experience** - Beautiful, responsive interface with dark mode support and mobile optimization

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎯 Multi-Project Types
- SOFTWARE projects with code integration
- BUSINESS projects with P&L tracking
- MARKETING campaigns with analytics
- OPERATIONS with process workflows
- RESEARCH with findings documentation
- CONSTRUCTION with materials & inspections

</td>
<td width="50%">

### 📊 Comprehensive Navigation
- Dynamic navigation (11-12 tabs per project type)
- Board, List, Calendar, Timeline views
- Team, Goals, Budget, Reports pages
- Documents, Wiki, Automation
- Mobile-optimized collapsible sidebar

</td>
</tr>
<tr>
<td>

### 🤖 AI Document Processing
- Upload invoices, contracts, RFPs
- Automatic budget item extraction
- Vendor and milestone detection
- Confidence scoring
- 50 docs/month free tier

</td>
<td>

### 💰 Budget Management
- Multi-category budgets (CAPEX, OPEX, etc.)
- Real-time tracking & variance alerts
- Budget watchers & notifications
- Beautiful dashboard with insights
- ETB currency support

</td>
</tr>
<tr>
<td>

### 👥 Team Collaboration
- Organization-based workspaces
- Role-based access control (RBAC)
- Member management
- Activity tracking & audit logs
- User profiles with avatars

</td>
<td>

### 🔐 Enterprise Security
- NextAuth.js authentication
- Soft delete with restoration
- Full audit trail
- Organization-level isolation
- OAuth support (Google, GitHub)

</td>
</tr>
</table>

---

## 🖼️ Screenshots

<table>
<tr>
<td><strong>Issue Board</strong><br/><em>Kanban-style project management</em></td>
<td><strong>Budget Dashboard</strong><br/><em>Real-time budget tracking</em></td>
</tr>
<tr>
<td><strong>AI Document Processing</strong><br/><em>Automatic data extraction</em></td>
<td><strong>Dark Mode</strong><br/><em>Beautiful night-time interface</em></td>
</tr>
</table>

> 📸 *Screenshots coming soon - Platform currently in active development*

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+  •  PostgreSQL 14+  •  Git
```

### Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/OliTamrat/onekof-platform.git
cd onekof-platform

# 2️⃣ Install dependencies
npm install

# 3️⃣ Set up environment variables
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your database URL and secrets

# 4️⃣ Set up the database
cd packages/database
npx prisma generate    # Generate Prisma client
npx prisma db push     # Create database tables

# 5️⃣ Start development server
cd ../..
npm run dev
```

🎉 **Open http://localhost:3000** - You're ready to go!

---

## 🛠️ Tech Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 14.1, React 18, TypeScript 5, Tailwind CSS 3.4</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Next.js API Routes, Prisma ORM, PostgreSQL</td>
</tr>
<tr>
<td><strong>AI</strong></td>
<td>Anthropic Haiku (cost-optimized)</td>
</tr>
<tr>
<td><strong>Auth</strong></td>
<td>NextAuth.js v4 with OAuth support</td>
</tr>
<tr>
<td><strong>UI</strong></td>
<td>Radix UI, Lucide React Icons, Custom Design System</td>
</tr>
<tr>
<td><strong>State</strong></td>
<td>TanStack Query, React Hook Form, Zod</td>
</tr>
<tr>
<td><strong>Deployment</strong></td>
<td>Vercel (frontend), Render/Supabase (database)</td>
</tr>
</table>

---

## 📁 Project Structure

```
onekof-platform/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── src/
│       │   ├── app/            # Next.js 14 App Router
│       │   │   ├── api/        # API routes
│       │   │   ├── dashboard/  # Dashboard pages
│       │   │   └── auth/       # Authentication pages
│       │   ├── components/     # React components
│       │   │   ├── layouts/    # Layout components
│       │   │   ├── navigation/ # Navigation components
│       │   │   └── ui/         # UI primitives
│       │   └── lib/            # Utilities & helpers
│       └── public/             # Static assets
│
├── packages/
│   ├── database/               # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── package.json
│   └── ui/                     # Shared UI components (future)
│
├── turbo.json                  # Turborepo config
└── package.json                # Root package.json
```

---

## 🎯 Onekof vs. Competition

<table>
<tr>
<th>Feature</th>
<th>Jira + Confluence</th>
<th>Onekof ⚡</th>
</tr>
<tr>
<td><strong>Pricing</strong></td>
<td>$13.80/user/month</td>
<td><strong>Coming Soon</strong></td>
</tr>
<tr>
<td><strong>Setup Time</strong></td>
<td>Hours of configuration</td>
<td><strong>5 minutes ⚡</strong></td>
</tr>
<tr>
<td><strong>Learning Curve</strong></td>
<td>Steep (weeks)</td>
<td><strong>Intuitive (minutes) 🎯</strong></td>
</tr>
<tr>
<td><strong>AI Document Processing</strong></td>
<td>❌ Not available</td>
<td><strong>✅ Built-in</strong></td>
</tr>
<tr>
<td><strong>Budget Management</strong></td>
<td>💰 Paid add-on</td>
<td><strong>✅ Integrated</strong></td>
</tr>
<tr>
<td><strong>Ethiopian Support</strong></td>
<td>❌ None</td>
<td><strong>🇪🇹 ETB, Multilingual</strong></td>
</tr>
<tr>
<td><strong>Platform</strong></td>
<td>Separate products</td>
<td><strong>✅ All-in-one</strong></td>
</tr>
<tr>
<td><strong>Modern UI</strong></td>
<td>Legacy interface</td>
<td><strong>✅ Clean, modern design</strong></td>
</tr>
</table>

---

## 🗺️ Roadmap

### ✅ v0.1 - Foundation (Current)
- [x] Project-type-aware navigation (6 types)
- [x] 20+ navigation pages with consistent UX
- [x] Collapsible sidebar with 7 core categories
- [x] AI-powered document processing (Anthropic Haiku)
- [x] Advanced budget management
- [x] Team collaboration & RBAC
- [x] Dark mode support
- [x] Mobile responsive design

### 🚧 v0.2 - Enhanced Features (In Progress)
- [ ] Full Calendar with Ethiopian calendar toggle
- [ ] Advanced Reports & Analytics dashboards
- [ ] Real-time notifications system
- [ ] Email integration (invites, digests)
- [ ] File attachment with drag-and-drop
- [ ] Advanced filtering & search (JQL-like)
- [ ] Export to Excel/PDF

### 🔮 v0.3 - Localization & Scale
- [ ] **Multilingual:** Amharic (አማርኛ), Oromo (Afaan Oromo), Tigrinya (ትግርኛ)
- [ ] **Ethiopian Calendar:** Full Ge'ez calendar integration
- [ ] **Payment Gateways:** Chapa, Telebirr, CBE Birr
- [ ] **Advanced Workflows:** Custom workflow builder
- [ ] **Mobile Apps:** iOS & Android native apps
- [ ] **Integrations:** Slack, MS Teams, Zapier
- [ ] **API:** Public REST API with documentation

### 🌟 v1.0 - Production Ready
- [ ] Advanced automation & rules engine
- [ ] Custom fields & dynamic forms
- [ ] Time tracking & resource planning
- [ ] Advanced permissions & compliance
- [ ] White-label options
- [ ] Enterprise SSO (SAML, LDAP)

---

## 📚 Documentation

### Environment Variables

Create `apps/web/.env`:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="${DATABASE_URL}"

# Authentication (Required)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# AI Document Processing (Optional - for AI features)
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key-here"

# OAuth (Optional - for social login)
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-secret"
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-secret"
```

> 📖 **Full deployment guide:** See [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npm run format       # Format with Prettier

# Database commands
cd packages/database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Regenerate Prisma client
npx prisma db push   # Push schema changes to database
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done ✅)
   ```bash
   git push origin master
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Select `onekof-platform` repository
   - Framework: **Next.js**
   - Root Directory: **`apps/web`**

3. **Configure Environment Variables**
   Add required variables (see [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)):
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

4. **Deploy** 🚀
   - Vercel auto-deploys on every push to `master`
   - Add custom domain: **onekof.com** in Vercel dashboard

> 💡 **Tip:** Use separate databases for production and preview deployments

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to your branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

**Proprietary** - All rights reserved © 2026 Onekof

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 📞 Contact & Support

<div align="center">

**🌐 Website:** [onekof.com](https://onekof.com) *(coming soon)*

**💻 GitHub:** [github.com/OliTamrat/onekof-platform](https://github.com/OliTamrat/onekof-platform)

**🐛 Report Issues:** [github.com/OliTamrat/onekof-platform/issues](https://github.com/OliTamrat/onekof-platform/issues)

---

### Made in USA 🇺🇸 with ❤️ for Ethiopia 🇪🇹

*Empowering African enterprises with world-class project management*

**[⬆ Back to Top](#-onekof-platform)**

</div>
