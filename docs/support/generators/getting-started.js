const { P, B, BOLDLEAD, STEP, H1, H2, table, buildGuide, GRAY } = require('./lib/guide-lib');

buildGuide({
  subtitle: 'Getting Started & Navigation',
  headerTitle: 'Getting Started & Navigation',
  version: '1.0',
  date: 'July 25, 2026',
  outFile: 'ONEKOF_SUPPORT_GUIDE_GETTING_STARTED.docx',
  body: [
    // ---- 1. Overview ----
    H1('1. What is Onekof?'),
    P('Onekof is a project management platform built by DAPS Analytics PLC for Ethiopian government institutions, NGOs, enterprises, and schools. One account gives a user access to one or more workspaces (organizations); inside a workspace, work is organized into projects, issues, sprints, goals, budgets, teams, and documents. The platform speaks five languages — English, Amharic, Afaan Oromo, Tigrinya, and Somali — and adapts its features to the type of organization using it.'),
    P('This guide covers the first-day experience: creating an account, joining or creating a workspace, choosing the organization type, switching languages, and finding your way around.'),

    // ---- 2. Roles ----
    H1('2. Who Can Do What'),
    table([
      ['Action', 'Required role'],
      ['Sign up, create a personal workspace', 'Anyone'],
      ['Invite members, accept members into the org', 'Org Owner or Admin'],
      ['Apply an organization preset / customize sections', 'Org Owner or Admin (others can open the page but saving is refused)'],
      ['Change org branding, currency, terminology', 'Org Owner or Admin'],
      ['Use the platform, switch language and theme', 'Any member'],
      ['See Budget, Members, Reports, Settings in the sidebar', 'Any member except Guests — Guests never see these'],
    ]),

    // ---- 3. Key terms ----
    H1('3. Key Terms'),
    BOLDLEAD('Workspace (organization) — ', 'the top-level container for everything: members, projects, budgets, settings. A user can belong to several and switch between them from the top bar.'),
    BOLDLEAD('Organization preset — ', 'a one-click configuration for a type of institution: Ministry / Government, NGO / Non-Profit, Business / Startup, or Education. It decides which sections appear and which features are on.'),
    BOLDLEAD('Section — ', 'a major sidebar area (Teams, Budget, Goals, Automations, Documents, Docs…). Owners/Admins can switch sections on or off per organization.'),
    BOLDLEAD('Terminology scheme — ', 'Agile ("Sprint") or Formal ("Work Cycle") vocabulary, chosen per organization. Every screen and report follows it.'),
    BOLDLEAD('Command palette — ', 'the universal search box (Ctrl+K / Cmd+K): searches issues, projects, members, teams, goals, and docs, and jumps anywhere.'),
    BOLDLEAD('Project scope — ', 'picking one project in the sidebar filters every dashboard page to that project; a green scope card shows the filter is on.'),

    // ---- 4. Step-by-step ----
    H1('4. Step-by-Step Guides'),
    H2('4.1 Create an account'),
    STEP('steps0', 'Go to the sign-up page. Enter your name, email, and a password — at least 8 characters with an uppercase letter, a lowercase letter, and a number.'),
    STEP('steps0', 'Check your email and open the verification link (valid for 24 hours).'),
    STEP('steps0', 'Sign in. Google, Microsoft, GitHub, and LinkedIn sign-in buttons may also be available depending on the deployment; email + password always works.'),
    H2('4.2 First-time onboarding'),
    STEP('steps1', 'Pick the kind of work you do (or Skip for now) — this only tunes suggestions, nothing is locked.'),
    STEP('steps1', 'Create your workspace: name, web address (auto-suggested), and team size. You land on the Dashboard.'),
    STEP('steps1', 'If you were invited to an existing organization, you will not get a personal workspace — verify your email, accept the invitation, and you join the inviter’s workspace directly.'),
    H2('4.3 Apply the organization type (Owner/Admin)'),
    STEP('steps2', 'Go to Settings → Customization (direct address: /dashboard/settings/customization).'),
    STEP('steps2', 'Under Quick Start Presets, choose Ministry / Government, NGO / Non-Profit, Business / Startup, or Education. The sections and features adjust immediately in the preview.'),
    STEP('steps2', 'Fine-tune individual section toggles and budget features if needed, then press Save Changes. The dashboard reloads with the new layout.'),
    H2('4.4 Switch language'),
    STEP('steps3', 'On a computer: click the globe icon in the top bar and pick English, አማርኛ (Amharic), Afaan Oromoo, ትግርኛ (Tigrinya), or Af Soomaali.'),
    STEP('steps3', 'On a phone: open the ⋮ menu in the top bar → Language.'),
    STEP('steps3', 'The choice is remembered per browser/device. Amharic and Tigrinya switch the interface to an Ethiopic font automatically.'),
    H2('4.5 Find your way around'),
    STEP('steps4', 'Sidebar: Home, Projects (with Issues, Calendar, Timeline, Goals, Reports underneath), Teams, Budget, and the Knowledge group (AI Documents, Automation, Wiki, Docs). Which sections appear depends on the organization’s preset and settings.'),
    STEP('steps4', 'Top bar: workspace switcher, search (opens the command palette), + Create button (Issue, Project, Wiki page, Team, Invite member), language, notifications bell, light/dark theme, and your avatar menu.'),
    STEP('steps4', 'Press Ctrl+K (Cmd+K on Mac) anywhere to search and jump. On phones, the sidebar is behind the ☰ button and the top-bar tools are behind ⋮.'),
    H2('4.6 Focus on one project'),
    STEP('steps5', 'In the sidebar under Projects, pick a specific project. All dashboard pages now show only that project’s data, and a green scope card appears.'),
    STEP('steps5', 'To go back to everything, press the X on the scope card or choose View all projects.'),

    // ---- 5. Rules ----
    H1('5. Rules the System Enforces (and Why)'),
    P('These are deliberate protections, not bugs.'),
    BOLDLEAD('Email must be verified before full use. ', 'The verification link expires after 24 hours — re-request it if missed. This keeps accounts tied to real institutional mailboxes.'),
    BOLDLEAD('Passwords have a minimum strength. ', '8+ characters with upper, lower, and a number. Weak passwords are refused at sign-up and reset.'),
    BOLDLEAD('Repeated failed logins lock the account temporarily. ', 'The message says how many minutes remain. This blocks password-guessing; it resolves by itself — no support action needed.'),
    BOLDLEAD('Customization saves are Owner/Admin only. ', 'Anyone can look at the Customization page, but saving as a regular member is refused with "Admin access required". Layout decisions belong to org administrators.'),
    BOLDLEAD('Guests see a reduced sidebar. ', 'Budget, Members, Reports, Settings, and Automation are hidden from Guest accounts by design — not a display error.'),
    BOLDLEAD('Presets are starting points, not locks. ', 'Applying Ministry, NGO, Business, or Education just sets the toggles; an Owner/Admin can change any individual toggle afterwards.'),

    // ---- 6. FAQ ----
    H1('6. Troubleshooting & FAQ'),
    table([
      ['Question / symptom', 'Answer'],
      ['"Automations / AI Assistant is missing."', 'Only the Business/Startup preset enables Automations and the AI Assistant. Ministry, NGO, and Education presets switch them off deliberately. An Owner/Admin can enable them under Settings → Customization.'],
      ['"The Budget (or Teams) section disappeared."', 'An Owner/Admin turned that section off in Settings → Customization, or the account is a Guest (Guests never see Budget, Members, Reports, Settings, Automation).'],
      ['"The app switched back to English on my other computer."', 'Language is remembered per browser/device, not per account. Pick it again on each device; clearing browser data also resets it.'],
      ['"I can’t save on the Customization page."', 'Saving requires the org Owner or Admin role. Also, the Save button stays disabled until something is actually changed.'],
      ['"I signed up but the verification link doesn’t work."', 'Links expire after 24 hours. Request a new one from the sign-in page.'],
      ['"I’m locked out after wrong passwords."', 'A temporary security lock — the message states the minutes remaining. Wait it out or use Forgot password.'],
      ['"I was invited but ended up in an empty workspace of my own." ', 'Accept the invitation from the email after verifying — invited users join the inviter’s organization; a personal workspace is only created when there is no pending invitation.'],
      ['"Onboarding never asked whether we are a Ministry or NGO."', 'Correct — onboarding creates a neutral workspace. The organization type is applied afterwards by an Owner/Admin at Settings → Customization (/dashboard/settings/customization).'],
      ['"Google/Microsoft sign-in does nothing."', 'Social sign-in providers must be configured on the specific deployment. Email + password always works.'],
      ['"Why does this org say Work Cycle instead of Sprint?"', 'The organization uses the Formal terminology scheme. Same feature, formal vocabulary — common for government-facing organizations.'],
    ], 3400, 5960),

    // ---- 7. Benefits ----
    H1('7. Why This Design — the Benefits'),
    H2('For users'),
    B('One account, many workspaces — a consultant or ministry liaison switches organizations from the top bar without separate logins.'),
    B('The interface speaks the user’s language, including Ge’ez-script languages with proper fonts, on every page from sign-in onwards.'),
    H2('For administrators'),
    B('Presets configure a whole institution in one click — a ministry gets procurement and transparency, an NGO gets grants and donations, a school gets a simplified layout.'),
    B('Sections users don’t need simply don’t appear — less training, fewer wrong turns.'),
    H2('For leadership'),
    B('Security by default: verified emails, strong passwords, login-lockout protection, optional two-factor authentication (Settings → Security), and role-gated administration.'),
    B('The same platform serves every organization type in the country — one support team, one training program, four institutional flavors.'),

    // ---- 8. Under the hood ----
    H1('8. Under the Hood (Senior Support Reference)'),
    B('Authentication is NextAuth with JWT sessions; sign-out invalidates the session server-side. OAuth providers (Google, Microsoft, GitHub, LinkedIn) activate only when configured on the deployment.'),
    B('Sign-up is rate-limited and failed logins trigger a timed account lock — both return messages that state the remaining wait.'),
    B('A user with zero organizations is force-redirected to onboarding; a user with an organization who opens onboarding is bounced back to the dashboard.'),
    B('Section visibility is resolved per organization from enabledSections + feature flags; if settings fail to load, the sidebar fails open (shows everything) rather than hiding work.'),
    B('Language preference is stored client-side (onekof-locale). The organization also has its own language/terminology settings used for generated reports.'),
    B('Preset definitions live in code (organization-presets.ts) — support can state exactly what each preset turns on or off.'),

    // ---- 9. Navigation map ----
    H1('9. Where Everything Lives'),
    table([
      ['I want to…', 'Go to'],
      ['Sign in / sign up / reset password', '/auth/signin · /auth/signup · Forgot password link'],
      ['Switch workspace (organization)', 'Top bar → workspace name dropdown'],
      ['Search everything / jump anywhere', 'Ctrl+K (Cmd+K) or the top-bar search box'],
      ['Create issue, project, wiki page, team, or invite', 'Top bar → + Create'],
      ['Change language / theme', 'Top bar → globe icon / theme toggle (phone: ⋮ menu)'],
      ['Apply org type preset, toggle sections', 'Settings → Customization (/dashboard/settings/customization) — Owner/Admin'],
      ['Security: password, two-factor', 'Dashboard → Settings → Security'],
      ['Notifications', 'Top-bar bell (phone: /dashboard/notifications)'],
    ], 4200, 5160),
  ],
});
