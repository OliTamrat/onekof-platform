const SUPPORT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Onekof — Support Centre</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  :root {
    --teal: #1C8C7D;
    --teal-dark: #15705f;
    --teal-light: #E8F5F3;
    --teal-mid: #c2e8e2;
    --dark: #22272B;
    --grey: #6B7280;
    --light: #F8FAFA;
    --white: #FFFFFF;
    --border: #E2E8F0;
    --warn: #FFF7ED;
    --warn-border: #F97316;
    --info: #EFF6FF;
    --info-border: #3B82F6;
    --danger: #FEF2F2;
    --danger-border: #EF4444;
    --success: #F0FDF4;
    --success-border: #22C55E;
    --red: #EF4444;
    --amber: #F59E0B;
    --green: #22C55E;
    --sidebar-w: 280px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: var(--light); color: var(--dark); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  /* TOP BAR */
  .topbar { background: #0B0E11; color: #fff; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; z-index: 100; }
  .topbar-brand { display: flex; align-items: center; gap: 12px; }
  .topbar-logo { width: 36px; height: 36px; background: linear-gradient(135deg, #1C8C7D, #7C3AED); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; color: #fff; letter-spacing: -0.5px; box-shadow: 0 4px 12px rgba(28,140,125,0.35); }
  .topbar-name { font-weight: 700; font-size: 16px; letter-spacing: -0.01em; }
  .topbar-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-left: 10px; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.12); }
  .topbar-search { flex: 1; max-width: 520px; margin: 0 32px; position: relative; }
  .topbar-search input { width: 100%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 14px 8px 38px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s; }
  .topbar-search input::placeholder { color: rgba(255,255,255,0.45); }
  .topbar-search input:focus { background: rgba(255,255,255,0.15); border-color: var(--teal); }
  .topbar-search .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); font-size: 15px; }
  .topbar-meta { display: flex; align-items: center; gap: 16px; font-size: 13px; color: rgba(255,255,255,0.4); }
  .topbar-meta a { color: #2BB5A2; text-decoration: none; transition: color 0.15s; }
  .topbar-meta a:hover { color: #1C8C7D; }
  .topbar-back { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 5px 12px; color: rgba(255,255,255,0.6) !important; font-size: 12px; font-weight: 500; text-decoration: none !important; transition: all 0.15s !important; }
  .topbar-back:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }

  /* BODY LAYOUT */
  .body-wrap { display: flex; flex: 1; overflow: hidden; }

  /* SIDEBAR */
  .sidebar { width: var(--sidebar-w); background: var(--white); border-right: 1px solid var(--border); overflow-y: auto; flex-shrink: 0; }
  .sidebar-section { padding: 16px 0 8px; }
  .sidebar-section-title { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: var(--grey); padding: 0 16px 6px; text-transform: uppercase; }
  .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px; cursor: pointer; font-size: 13.5px; color: var(--dark); transition: all 0.15s; border-left: 3px solid transparent; }
  .sidebar-item:hover { background: var(--teal-light); color: var(--teal); }
  .sidebar-item.active { background: var(--teal-light); color: var(--teal); border-left-color: var(--teal); font-weight: 600; }
  .sidebar-item .ch-num { width: 22px; height: 22px; background: var(--teal-light); border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--teal); flex-shrink: 0; }
  .sidebar-item.active .ch-num { background: var(--teal); color: #fff; }
  .sidebar-divider { height: 1px; background: var(--border); margin: 8px 16px; }

  /* MAIN CONTENT */
  .main { flex: 1; overflow-y: auto; padding: 32px 40px; }
  .content-section { display: none; }
  .content-section.active { display: block; }

  /* SEARCH RESULTS */
  #search-results { display: none; }
  #search-results.active { display: block; }
  .search-result-item { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; cursor: pointer; transition: all 0.15s; }
  .search-result-item:hover { border-color: var(--teal); box-shadow: 0 2px 8px rgba(28,140,125,0.1); }
  .sri-chapter { font-size: 11px; color: var(--teal); font-weight: 600; margin-bottom: 4px; }
  .sri-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .sri-preview { font-size: 13px; color: var(--grey); }
  mark { background: #FEF9C3; color: var(--dark); border-radius: 2px; padding: 0 2px; }

  /* PAGE HEADER */
  .page-header { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid var(--teal-light); }
  .page-header-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--teal-light); color: var(--teal); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px; }
  .page-header h1 { font-size: 26px; font-weight: 800; color: var(--dark); margin-bottom: 6px; }
  .page-header p { font-size: 14.5px; color: var(--grey); line-height: 1.6; max-width: 700px; }

  /* SECTION HEADINGS */
  h2 { font-size: 19px; font-weight: 700; color: var(--dark); margin: 28px 0 12px; padding-left: 12px; border-left: 4px solid var(--teal); }
  h3 { font-size: 15px; font-weight: 700; color: var(--teal-dark); margin: 18px 0 8px; }

  /* CARDS */
  .card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px; }
  .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; }
  .stat-card .stat-val { font-size: 28px; font-weight: 800; color: var(--teal); }
  .stat-card .stat-label { font-size: 13px; color: var(--grey); margin-top: 2px; }

  /* FAQ ITEMS */
  .faq-item { border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
  .faq-q { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; cursor: pointer; background: var(--white); transition: background 0.15s; }
  .faq-q:hover { background: var(--teal-light); }
  .faq-q.open { background: var(--teal-light); }
  .faq-q-badge { background: var(--teal); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; margin-top: 1px; }
  .faq-q-text { font-size: 14px; font-weight: 600; color: var(--dark); flex: 1; line-height: 1.4; }
  .faq-chevron { color: var(--grey); font-size: 14px; transition: transform 0.2s; flex-shrink: 0; margin-top: 2px; }
  .faq-q.open .faq-chevron { transform: rotate(180deg); }
  .faq-a { display: none; padding: 14px 18px 16px 50px; border-top: 1px solid var(--border); background: var(--white); font-size: 14px; line-height: 1.7; color: #374151; }
  .faq-a.open { display: block; }
  .faq-a p { margin-bottom: 10px; }
  .faq-a ul, .faq-a ol { margin: 8px 0 10px 18px; }
  .faq-a li { margin-bottom: 5px; }
  .faq-a strong { color: var(--dark); }
  .faq-a .path { background: #F1F5F9; color: var(--teal-dark); font-family: monospace; font-size: 12px; padding: 2px 6px; border-radius: 4px; }

  /* STEP LIST */
  .step-list { counter-reset: step; margin: 12px 0; }
  .step { display: flex; gap: 14px; margin-bottom: 14px; align-items: flex-start; }
  .step-num { width: 28px; height: 28px; background: var(--teal); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .step-body { flex: 1; }
  .step-body strong { display: block; font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .step-body p { font-size: 13.5px; color: #374151; line-height: 1.6; }

  /* TABLES */
  .data-table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 13.5px; }
  .data-table th { background: var(--teal); color: #fff; padding: 10px 14px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .data-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); vertical-align: top; line-height: 1.5; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:nth-child(even) td { background: #FAFAFA; }
  .data-table tr:hover td { background: var(--teal-light); }
  .data-table .label-cell { background: var(--teal-light); font-weight: 600; color: var(--teal-dark); white-space: nowrap; }

  /* CALLOUTS */
  .callout { border-radius: 10px; padding: 14px 18px; margin: 14px 0; display: flex; gap: 12px; align-items: flex-start; font-size: 13.5px; line-height: 1.6; }
  .callout-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .callout.tip { background: #F0FDF4; border: 1px solid #86EFAC; }
  .callout.note { background: var(--info); border: 1px solid #93C5FD; }
  .callout.warn { background: var(--warn); border: 1px solid #FCD34D; }
  .callout.danger { background: var(--danger); border: 1px solid #FCA5A5; }

  /* CHECKLIST */
  .checklist-section { margin-bottom: 24px; }
  .checklist-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .checklist-header h3 { margin: 0; }
  .checklist-progress { font-size: 12px; color: var(--grey); }
  .cl-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; background: var(--white); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px; transition: all 0.15s; }
  .cl-item:hover { border-color: var(--teal-mid); }
  .cl-item.checked { opacity: 0.65; }
  .cl-item input[type=checkbox] { width: 18px; height: 18px; accent-color: var(--teal); cursor: pointer; flex-shrink: 0; margin-top: 1px; }
  .cl-item-body { flex: 1; }
  .cl-item-body .cl-text { font-size: 13.5px; font-weight: 500; margin-bottom: 4px; line-height: 1.5; }
  .cl-item-body .cl-criteria { font-size: 12px; color: var(--grey); line-height: 1.5; }
  .cl-item-body .cl-text.checked-text { text-decoration: line-through; color: var(--grey); }
  .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
  .badge-red { background: #FEE2E2; color: #B91C1C; }
  .badge-amber { background: #FEF3C7; color: #92400E; }
  .badge-green { background: #D1FAE5; color: #065F46; }
  .badge-teal { background: var(--teal-light); color: var(--teal-dark); }

  /* PLAN COMPARE */
  .plan-card { border: 1px solid var(--border); border-radius: 12px; padding: 22px; background: var(--white); }
  .plan-card.featured { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(28,140,125,0.1); }
  .plan-name { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
  .plan-price { font-size: 24px; font-weight: 800; color: var(--teal); margin-bottom: 12px; }
  .plan-price span { font-size: 14px; font-weight: 400; color: var(--grey); }
  .plan-feature { display: flex; align-items: center; gap: 8px; font-size: 13.5px; padding: 5px 0; border-bottom: 1px solid var(--border); }
  .plan-feature:last-child { border-bottom: none; }
  .plan-feature .check { color: var(--teal); font-weight: 700; }

  /* SHORTCUT TABLE */
  kbd { background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 4px; padding: 2px 7px; font-family: monospace; font-size: 12px; }

  /* QUICK ACTIONS */
  .quick-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .qa-btn { display: flex; align-items: center; gap: 10px; background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: all 0.15s; text-decoration: none; color: var(--dark); }
  .qa-btn:hover { border-color: var(--teal); background: var(--teal-light); color: var(--teal); }
  .qa-btn .qa-icon { font-size: 20px; }
  .qa-btn span { font-size: 13.5px; font-weight: 600; }

  /* CONTACT GRID */
  .contact-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
  .contact-card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; }
  .contact-card h4 { font-size: 13px; font-weight: 700; color: var(--teal); margin-bottom: 6px; }
  .contact-card p { font-size: 13px; color: var(--grey); line-height: 1.5; }
  .contact-card a { color: var(--teal); text-decoration: none; font-weight: 600; }

  /* CALENDAR TABLE */
  .month-pill { display: inline-block; background: var(--teal-light); color: var(--teal-dark); border-radius: 20px; padding: 3px 10px; font-size: 12px; font-weight: 600; }

  /* SIDEBARSCROLLBAR */
  .sidebar::-webkit-scrollbar { width: 5px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  .main::-webkit-scrollbar { width: 6px; }
  .main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* STATUS INDICATOR */
  .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 5px; }
  .status-dot.green { background: var(--green); }
  .status-dot.amber { background: var(--amber); }
  .status-dot.red { background: var(--red); }

  /* AGENT TIP BOX */
  .agent-box { background: #FFFBEB; border: 1px solid #F59E0B; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; }
  .agent-box-title { font-size: 12px; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .agent-box ul { padding-left: 18px; font-size: 13.5px; color: #78350F; }
  .agent-box li { margin-bottom: 5px; line-height: 1.5; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main { padding: 16px 20px; }
    .topbar-sub { display: none; }
  }

  /* PRINT */
  @media print { .sidebar, .topbar { display: none; } .main { padding: 0; } .content-section { display: block !important; } }
</style>
</head>
<body>

<!-- TOP BAR -->
<div class="topbar">
  <div class="topbar-brand">
    <div class="topbar-logo">O</div>
    <span class="topbar-name">Onekof</span>
    <span class="topbar-sub">Support Centre</span>
  </div>
  <div class="topbar-search">
    <span class="search-icon">🔍</span>
    <input type="text" id="globalSearch" placeholder="Search FAQs, guides, checklists… (Ctrl+K)" autocomplete="off">
  </div>
  <div class="topbar-meta">
    <a href="mailto:support@onekof.com">support@onekof.com</a>
    <span><span class="status-dot green"></span>All Systems Operational</span>
    <a href="https://onekof.com" class="topbar-back">&#8592; Back to Onekof</a>
  </div>
</div>

<div class="body-wrap">

<!-- SIDEBAR -->
<nav class="sidebar">
  <div class="sidebar-section">
    <div class="sidebar-section-title">Overview</div>
    <div class="sidebar-item active" data-section="home">
      <span class="ch-num">🏠</span> Home & Quick Reference
    </div>
  </div>
  <div class="sidebar-section">
    <div class="sidebar-section-title">User Guide — Chapters 1–5</div>
    <div class="sidebar-item" data-section="ch1">
      <span class="ch-num">1</span> Getting Started
    </div>
    <div class="sidebar-item" data-section="ch2">
      <span class="ch-num">2</span> Core Features
    </div>
    <div class="sidebar-item" data-section="ch3">
      <span class="ch-num">3</span> Ethiopian Calendar
    </div>
    <div class="sidebar-item" data-section="ch4">
      <span class="ch-num">4</span> Collaboration & Docs
    </div>
    <div class="sidebar-item" data-section="ch5">
      <span class="ch-num">5</span> Mobile & Offline
    </div>
  </div>
  <div class="sidebar-divider"></div>
  <div class="sidebar-section">
    <div class="sidebar-section-title">Admin Guide — Chapters 6–9</div>
    <div class="sidebar-item" data-section="ch6">
      <span class="ch-num">6</span> Workspace Administration
    </div>
    <div class="sidebar-item" data-section="ch7">
      <span class="ch-num">7</span> Security, SSO & Audit
    </div>
    <div class="sidebar-item" data-section="ch8">
      <span class="ch-num">8</span> Integrations & API
    </div>
    <div class="sidebar-item" data-section="ch9">
      <span class="ch-num">9</span> Billing & Subscriptions
    </div>
  </div>
  <div class="sidebar-divider"></div>
  <div class="sidebar-section">
    <div class="sidebar-section-title">Support Tools</div>
    <div class="sidebar-item" data-section="ch10">
      <span class="ch-num">10</span> Troubleshooting
    </div>
    <div class="sidebar-item" data-section="checklist">
      <span class="ch-num">✅</span> Production Readiness
    </div>
    <div class="sidebar-item" data-section="appendix">
      <span class="ch-num">A</span> Appendix & Reference
    </div>
  </div>
</nav>

<!-- MAIN CONTENT -->
<main class="main" id="mainContent">

<!-- SEARCH RESULTS -->
<div id="search-results" class="content-section">
  <div class="page-header">
    <div class="page-header-badge">🔍 Search</div>
    <h1 id="search-heading">Search Results</h1>
    <p id="search-meta"></p>
  </div>
  <div id="search-output"></div>
</div>

<!-- ===================== HOME ===================== -->
<div class="content-section active" id="section-home">
  <div class="page-header">
    <div class="page-header-badge">🏠 Home</div>
    <h1>Onekof PM — Support Knowledge Base</h1>
    <p>The complete reference for customer support agents and administrators. Use the search bar or navigate chapters from the sidebar. This guide covers all features of the Onekof project management platform, built specifically for Ethiopian and East African teams.</p>
  </div>

  <div class="agent-box">
    <div class="agent-box-title">⚡ Support Agent Quick Reference</div>
    <ul>
      <li><strong>P1 Critical (platform down / data loss):</strong> Escalate immediately → engineering on-call. Pro SLA: 2hr response. Enterprise: 1hr.</li>
      <li><strong>Login issues:</strong> Check SSO enforcement, Caps Lock, TOTP clock sync, 15-min auto-lockout. See Ch. 10.</li>
      <li><strong>Calendar date confusion:</strong> Almost always an EC vs Gregorian mismatch. Settings → Profile → Date Preferences. See Ch. 3.</li>
      <li><strong>Payment failed:</strong> Retried Day 1, 3, 7. Downgraded to Free on Day 7 — no data deleted. See Ch. 9.</li>
      <li><strong>Storage limit hit:</strong> Uploads blocked, other features work. Upgrade or delete files. See Ch. 6.</li>
      <li><strong>Data recovery:</strong> Deleted projects have 30-day window. Settings → Workspace → Deleted Projects.</li>
    </ul>
  </div>

  <div class="quick-actions">
    <div class="qa-btn" onclick="showSection('ch1')"><span class="qa-icon">👤</span><span>Getting Started</span></div>
    <div class="qa-btn" onclick="showSection('ch2')"><span class="qa-icon">📋</span><span>Tasks & Projects</span></div>
    <div class="qa-btn" onclick="showSection('ch3')"><span class="qa-icon">📅</span><span>Ethiopian Calendar</span></div>
    <div class="qa-btn" onclick="showSection('ch4')"><span class="qa-icon">💬</span><span>Collaboration</span></div>
    <div class="qa-btn" onclick="showSection('ch5')"><span class="qa-icon">📱</span><span>Mobile & Offline</span></div>
    <div class="qa-btn" onclick="showSection('ch6')"><span class="qa-icon">⚙️</span><span>Admin Settings</span></div>
    <div class="qa-btn" onclick="showSection('ch7')"><span class="qa-icon">🔐</span><span>Security & SSO</span></div>
    <div class="qa-btn" onclick="showSection('ch8')"><span class="qa-icon">🔗</span><span>Integrations & API</span></div>
    <div class="qa-btn" onclick="showSection('ch9')"><span class="qa-icon">💳</span><span>Billing</span></div>
    <div class="qa-btn" onclick="showSection('ch10')"><span class="qa-icon">🛠️</span><span>Troubleshooting</span></div>
    <div class="qa-btn" onclick="showSection('checklist')"><span class="qa-icon">✅</span><span>Readiness Checklist</span></div>
    <div class="qa-btn" onclick="showSection('appendix')"><span class="qa-icon">📖</span><span>Appendix</span></div>
  </div>

  <div class="card-grid">
    <div class="stat-card"><div class="stat-val">5</div><div class="stat-label">Languages supported (EN, AM, OM, TI, SO)</div></div>
    <div class="stat-card"><div class="stat-val">13</div><div class="stat-label">Ethiopian calendar months supported</div></div>
    <div class="stat-card"><div class="stat-val">96</div><div class="stat-label">Production readiness checklist items</div></div>
    <div class="stat-card"><div class="stat-val">24/7</div><div class="stat-label">In-app help availability</div></div>
  </div>

  <h2>Support Contacts</h2>
  <div class="contact-grid">
    <div class="contact-card"><h4>📧 General Support</h4><p><a href="mailto:support@onekof.com">support@onekof.com</a><br>Mon–Sat 8AM–6PM EAT<br>4hr response (Pro), 2hr (P2 Enterprise)</p></div>
    <div class="contact-card"><h4>💳 Billing</h4><p><a href="mailto:billing@onekof.com">billing@onekof.com</a><br>Invoices, payment failures, VAT receipts, plan changes</p></div>
    <div class="contact-card"><h4>🔐 Security</h4><p><a href="mailto:security@onekof.com">security@onekof.com</a><br>Data breach reports, vulnerability disclosure, DPAs</p></div>
    <div class="contact-card"><h4>📚 Help Centre</h4><p><a href="#">help.onekof.com</a><br>Searchable KB in English & Amharic</p></div>
    <div class="contact-card"><h4>🌐 Status Page</h4><p><a href="#">status.onekof.com</a><br>Real-time health, 90-day incident history</p></div>
    <div class="contact-card"><h4>👥 Community</h4><p><a href="#">community.onekof.com</a><br>Peer support from other Onekof teams</p></div>
  </div>

  <h2>Plan Overview</h2>
  <div class="card-grid">
    <div class="plan-card">
      <div class="plan-name">Free</div>
      <div class="plan-price">0 ETB <span>/ forever</span></div>
      <div class="plan-feature"><span class="check">✓</span> Up to 5 members</div>
      <div class="plan-feature"><span class="check">✓</span> 3 active projects</div>
      <div class="plan-feature"><span class="check">✓</span> 2 GB storage</div>
      <div class="plan-feature"><span class="check">✓</span> Kanban + List views</div>
      <div class="plan-feature"><span class="check">✓</span> Ethiopian calendar</div>
      <div class="plan-feature"><span class="check">✓</span> Basic automations (5/workspace)</div>
    </div>
    <div class="plan-card featured">
      <div class="plan-name">Pro ⭐</div>
      <div class="plan-price">1,999 ETB <span>/ user / month</span></div>
      <div class="plan-feature"><span class="check">✓</span> Unlimited members & projects</div>
      <div class="plan-feature"><span class="check">✓</span> 50 GB storage</div>
      <div class="plan-feature"><span class="check">✓</span> All views (Gantt, Timeline, Table)</div>
      <div class="plan-feature"><span class="check">✓</span> Advanced automations (100/workspace)</div>
      <div class="plan-feature"><span class="check">✓</span> AI Document Processor</div>
      <div class="plan-feature"><span class="check">✓</span> Analytics & priority support</div>
    </div>
    <div class="plan-card">
      <div class="plan-name">Enterprise</div>
      <div class="plan-price">Custom <span>pricing</span></div>
      <div class="plan-feature"><span class="check">✓</span> Everything in Pro</div>
      <div class="plan-feature"><span class="check">✓</span> SSO / SAML 2.0</div>
      <div class="plan-feature"><span class="check">✓</span> Audit logs (up to 7 years)</div>
      <div class="plan-feature"><span class="check">✓</span> Custom data residency</div>
      <div class="plan-feature"><span class="check">✓</span> On-premise deployment</div>
      <div class="plan-feature"><span class="check">✓</span> Dedicated customer success manager</div>
    </div>
  </div>
</div>
<!-- END HOME -->

<!-- ===================== CHAPTER 1 ===================== -->
<div class="content-section" id="section-ch1">
  <div class="page-header">
    <div class="page-header-badge">&#128366; Chapter 1</div>
    <h1>Getting Started</h1>
    <p>Everything you need to create your account, set up your workspace, and invite your team. Chapters 1&#8211;5 are written for end users.</p>
  </div>

  <h2>1.1 Creating Your Account</h2>
  <div class="step-list">
    <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Visit onekof.com and click Get Started</strong><p>Sign up with your work email or via Google SSO. Using your organisation email domain allows future teammates to be auto-matched to your workspace.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Verify your email address</strong><p>Check your inbox for a verification email from <strong>noreply@onekof.com</strong>. Click Verify Email. The link expires after 24 hours &#8212; request a new one from the login page if needed.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Set your display name and profile photo</strong><p>Visible to all workspace members. Update at any time from <span class="path">Settings &#8594; Profile</span>.</p></div></div>
    <div class="step"><div class="step-num">4</div><div class="step-body"><strong>Create your first workspace</strong><p>Enter your organisation name and select your primary working language. Changeable later by an administrator.</p></div></div>
    <div class="step"><div class="step-num">5</div><div class="step-body"><strong>Select your calendar system</strong><p>Choose Ethiopian Calendar (EFY / Ge&#699;ez) or Gregorian. Sets the default for all date pickers, timeline views, and due date fields. Individual users can override in personal settings.</p></div></div>
    <div class="step"><div class="step-num">6</div><div class="step-body"><strong>Invite your team</strong><p>Enter email addresses or share your workspace invite link. Invites expire after 7 days. Resend from <span class="path">Settings &#8594; Members &#8594; Pending Invites</span>.</p></div></div>
  </div>
  <div class="callout tip"><span class="callout-icon">&#128161;</span><div>If your organisation uses Microsoft 365 or Google Workspace, ask your administrator to enable SSO so your team can sign in without separate passwords.</div></div>

  <h2>1.2 Account Setup FAQs</h2>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I sign up without a company email address?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Onekof accepts any valid email address. However, workspaces created with a company domain (e.g. @zemenbank.com) support automatic domain-matching, making it easier for colleagues to find and join your workspace without needing an explicit invite link. Domain-matching can be configured later by an administrator if you start with a personal email.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">I didn&#8217;t receive my verification email. What should I do?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><ol><li>Check your <strong>spam or junk folder</strong> for email from noreply@onekof.com. Mark it &#8220;not spam&#8221; to ensure future delivery.</li><li>Return to the sign-up page and click <strong>Resend Verification Email</strong>. Wait up to 10 minutes.</li><li>If using an Ethio Telecom email (ethionet.et), note that transactional emails may be delayed up to 30 minutes.</li><li>If the problem persists, contact <strong>support@onekof.com</strong> with the email address you used to register.</li></ol></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I change my workspace name or URL after creation?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Workspace <strong>names</strong> can be changed by an administrator at any time from <span class="path">Settings &#8594; Workspace &#8594; General</span>. The workspace <strong>URL slug</strong> can also be changed, but all existing invite links, API webhooks, and integrations pointing to the old URL must be updated. Notify your team and update all integrations before changing the URL to avoid broken links.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">How do I delete my account?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Go to <span class="path">Settings &#8594; Account &#8594; Danger Zone &#8594; Delete Account</span>. If you are the <strong>sole workspace owner</strong>, you must either transfer ownership to another member or delete the workspace first &#8212; you cannot delete your personal account while you are the only owner. Deleted accounts enter a <strong>30-day recovery window</strong> before permanent purge. All personal data is removed in accordance with Onekof&#8217;s Privacy Policy. Export your data first via <span class="path">Settings &#8594; Workspace &#8594; Export All Data</span>.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Is there a free trial for the Pro plan?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Every new workspace automatically receives a <strong>14-day Pro trial &#8212; no credit card required</strong>. During the trial you have full access to all Pro features including unlimited projects, all views (Gantt, Timeline, Table), 100 automations, AI Document Processor, and analytics. At the end of the trial, your workspace reverts to the Free plan automatically. No data is lost &#8212; Pro-only features are simply restricted. Enter payment details in <span class="path">Settings &#8594; Billing</span> before the trial ends to continue without interruption.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">What currencies and payment methods are accepted?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><ul><li><strong>Ethiopian Birr (ETB)</strong> via <strong>Chapa</strong>: Telebirr, CBE Birr, and major Ethiopian bank cards (Commercial Bank of Ethiopia, Dashen, Awash, etc.).</li><li><strong>USD</strong> via <strong>Stripe</strong>: Visa, Mastercard, American Express.</li><li><strong>Enterprise invoicing</strong>: Bank transfer on net-30 terms. Contact billing@onekof.com to set this up.</li></ul><p>VAT invoices are provided for all plans. Add your VAT registration number in <span class="path">Settings &#8594; Billing &#8594; Tax Information</span>.</p></div>
  </div>

  <h2>1.3 Plans &amp; Pricing</h2>
  <table class="data-table">
    <thead><tr><th>Plan</th><th>What&#8217;s Included</th></tr></thead>
    <tbody>
      <tr><td class="label-cell">Free</td><td>Up to 5 members, 3 active projects, 2 GB storage, Kanban and List views, Ethiopian calendar, basic automations (5/workspace). No credit card required.</td></tr>
      <tr><td class="label-cell">Pro &#8212; 1,999 ETB/user/month</td><td>Unlimited members and projects, 50 GB storage, all views (Gantt, Timeline, Table), 100 automations/workspace, AI Document Processor, analytics, priority support (4-hour response SLA).</td></tr>
      <tr><td class="label-cell">Enterprise &#8212; Custom pricing</td><td>Everything in Pro plus SSO/SAML 2.0, audit logs (up to 7 years), custom data residency, on-premise deployment, SLA guarantee, dedicated customer success manager. Contact sales@onekof.com.</td></tr>
    </tbody>
  </table>
</div>

<!-- ===================== CHAPTER 2 ===================== -->
<div class="content-section" id="section-ch2">
  <div class="page-header">
    <div class="page-header-badge">&#128203; Chapter 2</div>
    <h1>Core Features</h1>
    <p>A guide to Onekof&#8217;s project views, task management, goals, and collaboration tools.</p>
  </div>

  <h2>2.1 Projects &amp; Tasks</h2>
  <h3>Creating a Project</h3>
  <div class="step-list">
    <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Click + New Project from the sidebar</strong><p>Create from scratch or use a template: Software Sprint, NGO Grant Tracker, Construction Phase, or Ministry Budget.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Set a project name, description, and colour</strong><p>The colour and icon appear in the sidebar and workspace dashboards for quick visual identification.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Choose a start date and due date</strong><p>Dates use your workspace calendar system (Ethiopian or Gregorian). Both calendar types display in timeline and Gantt views simultaneously.</p></div></div>
    <div class="step"><div class="step-num">4</div><div class="step-body"><strong>Set the default view</strong><p>Choose from Kanban, List, Table, Timeline, or Gantt. All views are always available &#8212; this only controls what team members see when first opening the project.</p></div></div>
    <div class="step"><div class="step-num">5</div><div class="step-body"><strong>Assign a project owner and add members</strong><p>The project owner manages access, can archive the project, and adjusts billing-relevant settings. Add members from your workspace or invite external guests with limited access.</p></div></div>
  </div>

  <h3>Creating and Managing Tasks</h3>
  <ul style="margin:10px 0 16px 20px;font-size:14px;line-height:1.8">
    <li>Click <strong>+ Add Task</strong> in any view. Press <kbd>Enter</kbd> to create the next task without leaving the keyboard.</li>
    <li>Every task supports: title, description (rich text), assignee(s), due date, priority (Urgent/High/Normal/Low), status, labels, sub-tasks, attachments, and comments.</li>
    <li>Drag and drop tasks between status columns in Kanban view. Drag the row handle to reorder tasks in List view.</li>
    <li>Sub-tasks can be nested up to <strong>3 levels deep</strong>. Sub-task completion automatically updates the parent task progress indicator.</li>
    <li>Use <strong>@</strong> to mention a team member in a comment. They receive an in-app and email notification immediately.</li>
    <li>Attach files to tasks (max 50 MB per file on Pro). Files are stored securely and accessible only to project members.</li>
  </ul>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I assign a task to more than one person?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Click the assignee field and select multiple team members. All assignees receive notifications for due date reminders, comments, and status changes. For accountability, we recommend designating one <strong>primary owner</strong> even when co-assigning &#8212; this avoids situations where all assignees assume someone else is responsible.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">How do I move a task between projects?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Open the task, click the <strong>&#8943; More</strong> menu (top-right of the task detail panel), and select <em>Move to Project</em>. Choose the destination project and optionally a new status column. <strong>All comments, attachments, and activity history move with the task.</strong> Automations in the destination project that apply to new tasks will trigger. Assignees remain unchanged unless you manually update them.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">What is the difference between a task and a sub-task?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><ul><li>A <strong>sub-task</strong> is a child item belonging to a parent task. It appears in the parent task detail panel and in List/Table views when the parent is expanded.</li><li>Sub-tasks can have their own assignees, due dates, priorities, and statuses &#8212; fully independent of the parent.</li><li>Sub-tasks do <em>not</em> appear as standalone Kanban cards unless you enable <em>Show Sub-tasks</em> in view settings.</li><li>Sub-task completion updates the parent progress bar but does <em>not</em> automatically close the parent task.</li><li>Nesting limit: 3 levels (task &#8594; sub-task &#8594; sub-sub-task &#8594; sub-sub-sub-task).</li></ul></div>
  </div>

  <h2>2.2 Views</h2>
  <table class="data-table">
    <thead><tr><th>View</th><th>Best Used For</th><th>Key Feature</th></tr></thead>
    <tbody>
      <tr><td><strong>Kanban</strong></td><td>Sprint tracking, support queues, editorial workflows</td><td>Drag tasks between columns. Configure WIP limits per column to prevent bottlenecks.</td></tr>
      <tr><td><strong>List</strong></td><td>Bulk editing, sorting by due date or priority, large task volumes</td><td>Inline editing of all fields. Fast keyboard navigation with full shortcut support.</td></tr>
      <tr><td><strong>Table</strong></td><td>Reporting, data export, comparing task attributes across projects</td><td>Add/hide columns as needed. Export to CSV or formatted PDF.</td></tr>
      <tr><td><strong>Timeline</strong></td><td>Task durations and team capacity across a date range</td><td>Identify scheduling conflicts. Best for resource planning across multiple assignees.</td></tr>
      <tr><td><strong>Gantt (Pro)</strong></td><td>Dependency management and critical path analysis</td><td>Finish-to-Start and Start-to-Start dependencies. Slack time. Critical path in red.</td></tr>
      <tr><td><strong>Calendar</strong></td><td>Daily and weekly scheduling by due date</td><td>Displays tasks by due date. Ethiopian and Gregorian calendar overlays simultaneously.</td></tr>
    </tbody>
  </table>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I save a filtered or grouped view for my team?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Apply your filters, grouping, and sort order, then click <strong>Save View</strong> (top right). Choose <em>Share with team</em> to make the view available to all project members, or keep it <em>Private</em> (visible only to you). Saved views appear in the sidebar under the project name. Team members can switch between saved views at any time. The view owner can update or delete saved views &#8212; team members can make their own copies without affecting the original.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Does the Gantt view support critical path analysis?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Enable <strong>Critical Path</strong> from the Gantt toolbar. Tasks on the critical path are highlighted in red. The critical path recalculates automatically as you adjust task dates or dependencies. This feature is available on <strong>Pro and Enterprise plans</strong>. Hover over any task bar to view its slack time (buffer before becoming critical).</p></div>
  </div>

  <h2>2.3 Goals &amp; OKRs</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">Onekof&#8217;s Goals module lets you define Objectives and Key Results at workspace, team, or project level. Key Results linked to tasks advance automatically as tasks complete.</p>
  <ul style="margin:0 0 14px 20px;font-size:14px;line-height:1.8">
    <li>Create a Goal: sidebar &#8594; <strong>Goals &#8594; + New Goal</strong>.</li>
    <li>Set a time period: quarterly, annually, or custom E.C./Gregorian date range.</li>
    <li>Add Key Results with measurement type: <em>percentage, numeric, binary (done/not done), or linked tasks</em>.</li>
    <li>Assign an owner to each Key Result. Owners receive weekly progress digest emails.</li>
    <li>Goals roll up into a workspace-level OKR dashboard accessible to administrators.</li>
  </ul>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I align a team goal to a company-wide goal?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Use the <strong>Aligned to</strong> field when creating or editing a Goal to link it to a parent Goal. Child goals appear nested under the parent in the Goals overview, creating a clear hierarchy from team-level to company-level objectives. Progress from child goals does <em>not</em> automatically roll up to the parent &#8212; the parent&#8217;s progress is tracked independently via its own Key Results.</p></div>
  </div>

  <h2>2.4 Automations</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">Automations eliminate repetitive work using a simple if-this-then-that interface. No code required.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
    <div class="card"><h3 style="margin-top:0">Trigger Events</h3><ul style="font-size:13.5px;line-height:1.8;padding-left:18px"><li>Task status changes to [value]</li><li>Task is assigned to [person]</li><li>Due date approaching (1 day/3 days/1 week)</li><li>Comment added to task</li><li>Sub-task completion reaches [N]%</li><li>New task created in project</li><li>Schedule/time-based (Pro and Enterprise)</li></ul></div>
    <div class="card"><h3 style="margin-top:0">Automation Actions</h3><ul style="font-size:13.5px;line-height:1.8;padding-left:18px"><li>Change task status</li><li>Assign or unassign team member</li><li>Add a label or priority</li><li>Send notification to member or channel</li><li>Create sub-task from a template</li><li>Move task to another project</li><li>Post a comment</li></ul></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">How many automations can I create?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Limits are per <em>workspace</em> (not per project): <strong>Free:</strong> 5 active automations. <strong>Pro:</strong> 100 active automations. <strong>Enterprise:</strong> Unlimited. Paused automations do not count toward the limit. Automation run history (last 30 days) is visible in <span class="path">Settings &#8594; Automations &#8594; History</span>.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can automations run on a schedule (time-based triggers)?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes &#8212; available on <strong>Pro and Enterprise</strong>. Select <em>Schedule</em> as the trigger type and configure the recurrence using Ethiopian or Gregorian calendar intervals. Example use cases: weekly standup task creation every Senbet (Saturday), monthly billing review reminders on the 1st of each Ethiopian month, quarterly OKR review prompts, and recurring check-ins aligned to the Ethiopian fiscal year (EFY).</p></div>
  </div>
</div>

<!-- ===================== CHAPTER 3 ===================== -->
<div class="content-section" id="section-ch3">
  <div class="page-header">
    <div class="page-header-badge">&#128197; Chapter 3</div>
    <h1>Ethiopian Calendar &amp; Localisation</h1>
    <p>Onekof is the first project management platform built natively around the Ethiopian fiscal and liturgical year. This chapter covers how dates work, how to switch between calendars, and known edge cases.</p>
  </div>

  <h2>3.1 The Ethiopian Calendar in Onekof</h2>
  <div class="callout note"><span class="callout-icon">&#128216;</span><div>The Ethiopian calendar (Ge&#699;ez or EFY &#8212; Ethiopian Fiscal Year) has <strong>13 months</strong>: 12 months of 30 days each, and a 13th intercalary month called <strong>Pagume</strong>, which has 5 days (6 in a leap year). The Ethiopian New Year falls on <strong>Meskerem 1</strong> &#8212; corresponding to September 11 or 12 in the Gregorian calendar. The current Ethiopian year in 2026 (Gregorian) is <strong>2018 E.C.</strong></div></div>

  <h2>3.2 Ethiopian Months</h2>
  <table class="data-table">
    <thead><tr><th>Ethiopian Month</th><th>Approx. Gregorian Equivalent</th></tr></thead>
    <tbody>
      <tr><td><span class="month-pill">&#4768;&#4661;&#4853;&#4619;&#4721;</span> Meskerem &#8212; Month 1</td><td>September 11 &#8211; October 10</td></tr>
      <tr><td><span class="month-pill">&#4832;&#4621;&#4705;&#4895;</span> Tikimt &#8212; Month 2</td><td>October 11 &#8211; November 9</td></tr>
      <tr><td><span class="month-pill">&#4613;&#4771;&#4619;</span> Hidar &#8212; Month 3</td><td>November 10 &#8211; December 9</td></tr>
      <tr><td><span class="month-pill">&#4720;&#4613;&#4657;&#4672;</span> Tahsas &#8212; Month 4</td><td>December 10 &#8211; January 8</td></tr>
      <tr><td><span class="month-pill">&#4832;&#4619;</span> Tir &#8212; Month 5</td><td>January 9 &#8211; February 7</td></tr>
      <tr><td><span class="month-pill">&#4840;&#4637;&#4725;&#4795;</span> Yekatit &#8212; Month 6</td><td>February 8 &#8211; March 9</td></tr>
      <tr><td><span class="month-pill">&#4768;&#4683;&#4707;&#4895;</span> Megabit &#8212; Month 7</td><td>March 10 &#8211; April 8</td></tr>
      <tr><td><span class="month-pill">&#4773;&#4843;&#4653;&#4899;</span> Miazia &#8212; Month 8</td><td>April 9 &#8211; May 8</td></tr>
      <tr><td><span class="month-pill">&#4707;&#4853;&#4707;&#4795;</span> Ginbot &#8212; Month 9</td><td>May 9 &#8211; June 7</td></tr>
      <tr><td><span class="month-pill">&#4680;&#4654;</span> Sene &#8212; Month 10</td><td>June 8 &#8211; July 7</td></tr>
      <tr><td><span class="month-pill">&#4613;&#4741;&#4654;</span> Hamle &#8212; Month 11</td><td>July 8 &#8211; August 6</td></tr>
      <tr><td><span class="month-pill">&#4853;&#4613;&#4668;</span> Nehase &#8212; Month 12</td><td>August 7 &#8211; September 5</td></tr>
      <tr><td><span class="month-pill">&#4947;&#4927;&#4773;&#4853;</span> Pagume &#8212; Month 13</td><td>September 6 &#8211; September 10 (or 11 in leap year)</td></tr>
    </tbody>
  </table>

  <h2>3.3 Switching Between Calendar Systems</h2>
  <div class="step-list">
    <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Workspace default (Administrators only)</strong><p><span class="path">Settings &#8594; Workspace &#8594; Calendar System</span>. Sets the default for all new users and all date displays. Existing task dates are not affected &#8212; stored dates remain unchanged.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Individual user override</strong><p><span class="path">Settings &#8594; Profile &#8594; Date Preferences</span>. Each user can choose their preferred calendar independently. Both Ethiopian and Gregorian dates are always stored internally in UTC.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Per-project calendar setting</strong><p>Project owners can set a project-level calendar from <span class="path">Project Settings &#8594; Dates</span>. Useful when one team works in E.C. and another in Gregorian within the same workspace.</p></div></div>
  </div>
  <div class="callout tip"><span class="callout-icon">&#128161;</span><div>Onekof always stores dates in UTC internally. The Ethiopian calendar conversion happens at the display layer &#8212; switching between systems never corrupts stored data.</div></div>

  <h2>3.4 Ethiopian Public Holidays</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">Onekof&#8217;s calendar includes Ethiopian public holidays pre-loaded for E.C. 2016&#8211;2022 (Gregorian 2023&#8211;2030). Holidays appear in Calendar, Timeline, and Gantt views as shaded non-working days.</p>
  <table class="data-table">
    <thead><tr><th>Holiday</th><th>Notes</th></tr></thead>
    <tbody>
      <tr><td>Enkutatash (Ethiopian New Year) &#8212; Meskerem 1</td><td>National public holiday. Variable Gregorian date (Sept 11 or 12).</td></tr>
      <tr><td>Meskel (Finding of the True Cross) &#8212; Meskerem 17</td><td>National public holiday.</td></tr>
      <tr><td>Ethiopian Christmas (Genna) &#8212; Tahsas 29</td><td>Public holiday. January 7 Gregorian.</td></tr>
      <tr><td>Ethiopian Epiphany (Timkat) &#8212; Tir 11</td><td>Public holiday. January 19&#8211;20 Gregorian.</td></tr>
      <tr><td>Adwa Victory Day &#8212; Yekatit 23</td><td>National public holiday. March 2 Gregorian.</td></tr>
      <tr><td>Ethiopian Good Friday (Siklet) &#8212; Variable</td><td>Orthodox Easter cycle. Varies annually.</td></tr>
      <tr><td>Ethiopian Easter (Fasika) &#8212; Variable</td><td>Orthodox Easter cycle. Varies annually.</td></tr>
      <tr><td>Labour Day &#8212; Miazia 23</td><td>May 1 Gregorian.</td></tr>
      <tr><td>Patriots&#8217; Victory Day &#8212; Miazia 27</td><td>May 5 Gregorian.</td></tr>
      <tr><td>Derg Downfall Day &#8212; Ginbot 20</td><td>May 28 Gregorian.</td></tr>
      <tr><td>Eid al-Fitr &#8212; Variable (Islamic calendar)</td><td>Onekof pre-loads estimated dates based on Islamic calendar.</td></tr>
      <tr><td>Eid al-Adha &#8212; Variable</td><td>Variable date. Onekof pre-loads estimated dates.</td></tr>
      <tr><td>Prophet&#8217;s Birthday (Mawlid) &#8212; Variable</td><td>Variable date. Onekof pre-loads estimated dates.</td></tr>
    </tbody>
  </table>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I add custom non-working days (company holidays, regional observances)?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Administrators can add custom non-working days from <span class="path">Settings &#8594; Calendar &#8594; Non-Working Days</span>. Custom days appear in all views alongside national holidays. They can be set as <strong>recurring annual events</strong> (e.g. company founding day) or <strong>one-off dates</strong> (e.g. an extraordinary holiday). These affect the working-day calculations used by automations and due date reminders.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">How does Onekof handle Pagume &#8212; the 13th month?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Pagume is fully supported as a valid date in all date pickers, timeline views, and Gantt charts. Tasks can be assigned due dates in Pagume. The platform correctly handles Pagume having <strong>5 days in a standard year</strong> and <strong>6 days in an Ethiopian leap year</strong> (every 4th year). No manual adjustment is required. Due date reminders and automations fire correctly for Pagume dates.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">My task due dates are showing in the wrong year (7 years off). Why?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>This occurs when dates were entered in Gregorian format but the workspace is <em>displaying</em> in Ethiopian calendar, or vice versa. The Ethiopian calendar is approximately <strong>7 years and 8 months behind the Gregorian calendar</strong>, so a Gregorian date entered while viewing in Ethiopian mode will appear 7&#8211;8 years off.</p><p><strong>Fix:</strong> Go to <span class="path">Settings &#8594; Profile &#8594; Date Preferences</span> and confirm your calendar selection matches how you entered the dates. For bulk correction, export tasks to CSV, adjust the dates in a spreadsheet, and re-import.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Pagume is not appearing in the date picker.</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Ensure your workspace and profile calendar is set to <strong>Ethiopian Calendar</strong>, not Gregorian. In Gregorian mode, the 13th month (Pagume) is not displayed &#8212; the Gregorian calendar only has 12 months. Switch to Ethiopian calendar in <span class="path">Settings &#8594; Profile &#8594; Date Preferences</span>. If your workspace is set to Gregorian by default, only your personal preference needs changing &#8212; you do not need administrator access.</p></div>
  </div>

  <h2>3.5 Languages &amp; Multi-Language Support</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">To change your interface language: <span class="path">Settings &#8594; Profile &#8594; Language</span>. Your choice applies immediately and is saved to your account.</p>
  <table class="data-table">
    <thead><tr><th>Language</th><th>Coverage</th></tr></thead>
    <tbody>
      <tr><td>English</td><td>100% &#8212; all UI, emails, notifications, and help content.</td></tr>
      <tr><td>&#4768;&#4655;&#4769;&#4899;&#4763; (Amharic)</td><td>100% &#8212; UI, transactional emails, push notifications, and in-app help.</td></tr>
      <tr><td>Afaan Oromoo</td><td>100% &#8212; UI and transactional emails.</td></tr>
      <tr><td>Tigrinya</td><td>100% &#8212; UI and transactional emails.</td></tr>
      <tr><td>Somali</td><td>100% &#8212; UI and transactional emails.</td></tr>
    </tbody>
  </table>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">If I switch to Amharic, will my team members also see Amharic?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>No. Language is a <strong>per-user preference</strong>. Each team member independently selects their own display language. Shared content (task titles, comments, project names) displays in the language it was written &#8212; Onekof does not auto-translate user-generated content. You and a colleague can work in the same project, one viewing the interface in Amharic and the other in English.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can Onekof translate task content between Amharic and English?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>AI-powered translation of task content is on the product roadmap. Currently, Onekof translates all <strong>platform interface elements</strong> but does not translate user-generated content. You can use the <strong>AI Document Processor</strong> to extract and summarise text from uploaded Amharic contracts and PDFs &#8212; this can serve as a workaround for document-level content.</p></div>
  </div>
</div>

<!-- ===================== CHAPTER 4 ===================== -->
<div class="content-section" id="section-ch4">
  <div class="page-header">
    <div class="page-header-badge">&#128172; Chapter 4</div>
    <h1>Collaboration, Notifications &amp; Documents</h1>
    <p>How real-time collaboration, notifications, and the AI Document Processor work in Onekof.</p>
  </div>

  <h2>4.1 Real-Time Collaboration</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">Multiple team members can work on the same project simultaneously. Changes appear live &#8212; no page refresh required.</p>
  <ul style="margin:0 0 14px 20px;font-size:14px;line-height:1.8">
    <li>Live presence indicators show which team members are currently viewing or editing a task.</li>
    <li>Comments support @mentions, file attachments, and emoji reactions.</li>
    <li>Task fields (status, assignee, due date, priority) update in real time for all viewers.</li>
    <li><strong>Conflict resolution:</strong> if two users simultaneously edit the same task field, the most recent save wins. Both users see a notification that the field was updated by someone else.</li>
    <li>The activity feed on each task shows a full audit trail: who changed what, and when.</li>
  </ul>
  <div class="callout note"><span class="callout-icon">&#128216;</span><div>Real-time features require a stable internet connection. On intermittent connections (common on mobile data), Onekof queues writes locally and syncs when connectivity is restored. A banner notifies you when you are in offline mode.</div></div>

  <h2>4.2 Notifications</h2>
  <table class="data-table">
    <thead><tr><th>Trigger</th><th>Default Setting</th></tr></thead>
    <tbody>
      <tr><td>You are assigned to a task</td><td>In-app + Email</td></tr>
      <tr><td>A task you own is approaching its due date (1 day)</td><td>In-app + Email</td></tr>
      <tr><td>Someone @mentions you in a comment</td><td>In-app + Email + Push (mobile)</td></tr>
      <tr><td>A comment is added to a task you are assigned to</td><td>In-app only</td></tr>
      <tr><td>A task you are watching changes status</td><td>In-app only</td></tr>
      <tr><td>An automation you created fails</td><td>In-app + Email</td></tr>
      <tr><td>Your workspace storage is near the limit</td><td>Email (admin only)</td></tr>
      <tr><td>A project you own has overdue tasks</td><td>Weekly digest email</td></tr>
    </tbody>
  </table>
  <p style="font-size:13.5px;color:#374151;margin-top:8px">To adjust preferences: <span class="path">Settings &#8594; Notifications</span>. Customise delivery channels (in-app, email, push) for each trigger type independently.</p>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">I am receiving too many email notifications. How do I reduce them?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Go to <span class="path">Settings &#8594; Notifications &#8594; Email</span>. You can switch most notifications to <strong>in-app only</strong>, or consolidate them into a <strong>Daily Digest</strong> (sent once per day at a time you choose). We recommend keeping <em>assignment</em> and <em>@mention</em> emails active, as these require timely responses. The Daily Digest is ideal for comment and status-change notifications.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I set quiet hours so I don&#8217;t receive push notifications at night?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Go to <span class="path">Settings &#8594; Notifications &#8594; Push &#8594; Quiet Hours</span>. Set your quiet window (e.g. 9:00 PM &#8211; 7:00 AM EAT). Notifications received during quiet hours are batched and delivered when quiet hours end. This setting applies to push notifications only &#8212; in-app notifications still accumulate and are visible when you next open Onekof.</p></div>
  </div>

  <h2>4.3 Documents &amp; Wiki</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">Each project includes a Documents section for wiki pages, meeting notes, SOPs, and project briefs using Onekof&#8217;s built-in rich text editor.</p>
  <ul style="margin:0 0 14px 20px;font-size:14px;line-height:1.8">
    <li>Create nested page hierarchies (e.g. Project Brief &#8594; Technical Spec &#8594; API Design).</li>
    <li>Embed tasks directly in documents &#8212; embedded tasks stay live and reflect current status.</li>
    <li>Share a document page with external stakeholders via a read-only link (Pro plan).</li>
    <li>Export documents to PDF or Microsoft Word format.</li>
    <li>Version history is automatically saved &#8212; restore any previous version from the page history panel.</li>
  </ul>

  <h2>4.4 AI Document Processor</h2>
  <div class="step-list">
    <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Upload a document to a task or the project Documents section</strong><p>Supported formats: PDF, DOCX, PPTX, XLSX, TXT. Maximum file size: 50 MB. Supports English and Amharic documents.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Click &#8220;Analyse with AI&#8221; on the uploaded file</strong><p>The processor reads the document and identifies: key deadlines, deliverables, risk clauses, parties, financial obligations, and action items.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Review the extracted information</strong><p>Results appear in a structured panel alongside the document. Each extraction shows the source paragraph so you can verify accuracy.</p></div></div>
    <div class="step"><div class="step-num">4</div><div class="step-body"><strong>Create tasks directly from extracted items</strong><p>Click <em>Create Task</em> next to any extracted deadline or action item. The task is created with the extracted date, description, and a link back to the source document.</p></div></div>
  </div>
  <div class="callout warn"><span class="callout-icon">&#9888;&#65039;</span><div>The AI Document Processor provides suggestions &#8212; not legal or financial advice. Always verify extracted information against the original document before acting on it.</div></div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Which languages does the AI Document Processor support?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Currently <strong>English and Amharic</strong>. Support for Afaan Oromoo and Tigrinya documents is on the roadmap. The processor can handle <strong>bilingual documents</strong> (e.g. an Amharic contract with English clause headings) and will extract relevant information from both languages in the same pass.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Is my document data sent to a third-party AI provider?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Document content is processed via a secure API connection to Onekof&#8217;s AI infrastructure. Enterprise customers with data residency requirements can configure document processing to remain within their designated region (e.g. Ethiopia-hosted infrastructure). <strong>Document data is never used to train AI models.</strong> Refer to the Onekof Privacy Policy and your Data Processing Agreement for full details. Security questions: security@onekof.com.</p></div>
  </div>
</div>

<!-- ===================== CHAPTER 5 ===================== -->
<div class="content-section" id="section-ch5">
  <div class="page-header">
    <div class="page-header-badge">&#128241; Chapter 5</div>
    <h1>Mobile &amp; Offline Access</h1>
    <p>Onekof is designed for teams that work in the field, on low-bandwidth connections, and on Android devices common across Ethiopia.</p>
  </div>

  <h2>5.1 Mobile Access &#8212; Installing as a PWA</h2>
  <div class="step-list">
    <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Open onekof.com in Chrome on your Android device</strong><p>Ensure you are signed in to your account. Samsung Internet and Chrome are the recommended browsers on Android.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Tap the browser menu (three dots &#8942;) and select &#8220;Add to Home Screen&#8221;</strong><p>This installs Onekof as a Progressive Web App (PWA). It will appear on your home screen like a native app and runs in full screen without the browser toolbar.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Open from your home screen</strong><p>The PWA launches faster than the browser and supports push notifications directly to your Android notification bar. All major features including Kanban drag-and-drop, task creation, and comments are fully functional on mobile.</p></div></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">How much data does Onekof use on mobile?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Text-based project activity (tasks, comments, status changes) uses very little data &#8212; typically under <strong>1 MB per hour</strong> of active use. File uploads, video attachments, and loading large documents consume significantly more. If you are on a limited data plan, we recommend downloading large files only when on Wi-Fi. Enable <strong>Low-Bandwidth Mode</strong> from <span class="path">Settings &#8594; Performance &#8594; Enable Low-Bandwidth Mode</span> to reduce image quality and disable live collaboration animations on 2G/3G connections.</p></div>
  </div>

  <h2>5.2 Offline Mode</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">When your internet connection is unavailable or unstable, Onekof enters offline mode automatically.</p>
  <ul style="margin:0 0 14px 20px;font-size:14px;line-height:1.8">
    <li>A <strong>yellow banner</strong> at the top of the screen indicates you are offline.</li>
    <li>You can view and edit tasks that were loaded before going offline.</li>
    <li>New tasks, comments, and status changes made offline are <strong>queued locally</strong>.</li>
    <li>When connectivity is restored, all queued changes <strong>sync automatically</strong>.</li>
    <li>If a conflict occurs (e.g. another user changed the same field while you were offline), Onekof shows both versions and asks you to choose which to keep.</li>
    <li>File uploads and AI Document Processing require an active connection and will resume automatically when you reconnect.</li>
  </ul>
</div>

<!-- ===================== CHAPTER 6 ===================== -->
<div class="content-section" id="section-ch6">
  <div class="page-header">
    <div class="page-header-badge">&#9881;&#65039; Chapter 6</div>
    <h1>Workspace Administration</h1>
    <p>This chapter is for workspace owners and administrators. It covers member management, permissions, and workspace-level settings.</p>
  </div>

  <h2>6.1 Roles &amp; Permissions</h2>
  <table class="data-table">
    <thead><tr><th>Role</th><th>Access Level</th><th>Typical Use Case</th></tr></thead>
    <tbody>
      <tr><td class="label-cell">Owner</td><td>Full access. Can delete workspace, manage billing, and transfer ownership.</td><td>Founder, CTO, Department Head</td></tr>
      <tr><td class="label-cell">Admin</td><td>Can manage members, roles, workspace settings, and integrations. Cannot delete workspace or change billing.</td><td>IT Manager, Team Lead</td></tr>
      <tr><td class="label-cell">Member</td><td>Can create and edit projects they are assigned to. Cannot access workspace-level settings.</td><td>Standard team member</td></tr>
      <tr><td class="label-cell">Guest</td><td>Read-only or limited write access to specific projects they are explicitly invited to. Cannot see other projects.</td><td>External contractor, client reviewer</td></tr>
    </tbody>
  </table>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I create custom roles with specific permissions?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Custom roles are available on the <strong>Enterprise plan</strong>. You can define granular permissions (e.g. can view but not edit budgets, can create tasks but not delete projects) and assign them to groups of users. Contact your dedicated customer success manager or email support@onekof.com to configure custom roles for your workspace.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">How do I transfer workspace ownership?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Go to <span class="path">Settings &#8594; Members</span>, find the target member, click <strong>&#8943;</strong>, and select <em>Transfer Ownership</em>. The current owner becomes an Admin after the transfer. Only <strong>one Owner role exists per workspace</strong> at a time. The new owner will receive an email confirmation of the transfer. This action is reversible &#8212; the new owner can transfer ownership back if needed.</p></div>
  </div>

  <h2>6.2 Inviting &amp; Removing Members</h2>
  <div class="step-list">
    <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Go to Settings &#8594; Members &#8594; Invite Members</strong><p>Enter email addresses (one per line) or paste a comma-separated list.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Assign a role and optional project access</strong><p>New members can be added to specific projects during the invite flow, or added to projects later.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Send the invitation</strong><p>Invitees receive an email with a link to join. Links expire after 7 days. Resend from <span class="path">Settings &#8594; Members &#8594; Pending Invites</span>.</p></div></div>
  </div>
  <div class="callout warn"><span class="callout-icon">&#9888;&#65039;</span><div>Removing a member does <strong>not</strong> delete their tasks or comments. Their name remains in the activity history. Reassign their open tasks before removing them to avoid items becoming unowned.</div></div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I temporarily deactivate a member without deleting them?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Go to <span class="path">Settings &#8594; Members</span>, find the member, and click <em>Deactivate</em>. Deactivated members <strong>cannot log in</strong> and do not consume a paid seat, but their data, task history, and comments are fully preserved. Reactivate at any time from the same screen. This is ideal for employees on extended leave or temporary contractors whose engagement is paused.</p></div>
  </div>

  <h2>6.3 Storage &amp; Limits</h2>
  <table class="data-table">
    <thead><tr><th>Plan</th><th>Storage Limit</th></tr></thead>
    <tbody>
      <tr><td>Free</td><td>2 GB total workspace storage</td></tr>
      <tr><td>Pro</td><td>50 GB total workspace storage</td></tr>
      <tr><td>Enterprise</td><td>Custom (minimum 500 GB; expandable on request)</td></tr>
    </tbody>
  </table>
  <p style="font-size:13.5px;color:#374151;margin-top:8px">Storage usage is visible at <span class="path">Settings &#8594; Workspace &#8594; Storage</span> with a breakdown by project and file type. Administrators receive an email notification when workspace storage exceeds 80% of the limit.</p>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">What happens if we exceed our storage limit?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p><strong>New file uploads are blocked</strong> until storage is freed or your plan is upgraded. Existing files remain fully accessible. Task creation, comments, and all non-file features continue to work without interruption. To free space: delete unused file attachments from task detail panels or from <span class="path">Settings &#8594; Storage &#8594; Manage Files</span>. Upgrading your plan (e.g. Free &#8594; Pro) restores upload capability immediately.</p></div>
  </div>
</div>

<!-- ===================== CHAPTER 7 ===================== -->
<div class="content-section" id="section-ch7">
  <div class="page-header">
    <div class="page-header-badge">&#128272; Chapter 7</div>
    <h1>Security, SSO &amp; Audit Logs</h1>
    <p>Security settings available to workspace administrators on Pro and Enterprise plans.</p>
  </div>

  <h2>7.1 Two-Factor Authentication (2FA)</h2>
  <div class="step-list">
    <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Each user enables 2FA from Settings &#8594; Security &#8594; Two-Factor Authentication</strong><p>Onekof supports TOTP authenticator apps: Google Authenticator, Microsoft Authenticator, Authy.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Scan the QR code with your authenticator app</strong><p>The app generates a 6-digit code that refreshes every 30 seconds.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Download and store recovery codes</strong><p>Recovery codes allow you to sign in if you lose access to your authenticator app. Each code is <strong>single-use</strong>. Store them in a secure, offline location.</p></div></div>
    <div class="step"><div class="step-num">4</div><div class="step-body"><strong>Administrators can enforce 2FA workspace-wide</strong><p>From <span class="path">Settings &#8594; Security &#8594; Require 2FA</span>. Members without 2FA will be prompted on next login and cannot access the workspace until they set it up.</p></div></div>
  </div>
  <div class="callout danger"><span class="callout-icon">&#128683;</span><div>If a user loses both their authenticator app <em>and</em> their recovery codes, an administrator must manually reset their 2FA from <span class="path">Settings &#8594; Members &#8594; [User] &#8594; Reset 2FA</span>. The user must set up 2FA again on next login.</div></div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">My 2FA code is not being accepted. What should I do?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>TOTP codes are time-sensitive. Ensure the clock on your phone is set to <strong>automatic/network time</strong> (<span class="path">Settings &#8594; Date &amp; Time &#8594; Automatic</span>). If the clock is even 30 seconds out of sync, codes will be invalid. If the problem persists, use a <strong>recovery code</strong> to sign in, then re-enrol 2FA with a fresh setup from <span class="path">Settings &#8594; Security</span>.</p></div>
  </div>

  <h2>7.2 Single Sign-On (SSO)</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">Enterprise plan workspaces can configure SSO using SAML 2.0, compatible with Microsoft Azure Active Directory, Okta, Google Workspace, and other enterprise identity providers.</p>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">How do I configure SSO for my workspace?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><ol><li>Go to <span class="path">Settings &#8594; Security &#8594; Single Sign-On</span>.</li><li>Download the Onekof SAML metadata file.</li><li>Upload it to your identity provider (Azure AD, Okta, Google Workspace, etc.).</li><li>Enter your IdP&#8217;s metadata URL or XML in the Onekof SSO configuration panel.</li><li>Click <em>Test SSO</em> to verify the connection before enforcing it.</li></ol><p>Step-by-step guides for Azure AD and Okta are available in the Onekof Help Centre at help.onekof.com.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">What happens to members who don&#8217;t have an account in our IdP when SSO is enforced?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>They will be unable to log in via SSO. You can either: (1) <strong>add them to your IdP</strong>, or (2) <strong>exempt specific email addresses</strong> from the SSO requirement in <span class="path">Settings &#8594; Security &#8594; SSO Exemptions</span>. Guest users are <em>always</em> exempt from SSO enforcement &#8212; they continue to use email/password login.</p></div>
  </div>

  <h2>7.3 Audit Logs</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:8px">Audit logs record every significant action in your workspace. Available on Pro (90-day retention) and Enterprise (custom retention, up to 7 years). Access from <span class="path">Settings &#8594; Security &#8594; Audit Log</span>. Filter by event type, actor, date range, or IP address. Export as CSV for compliance reporting.</p>
  <table class="data-table">
    <thead><tr><th>Logged Event</th><th>Details Captured</th></tr></thead>
    <tbody>
      <tr><td>Member invited or removed</td><td>Inviting admin, invitee email, timestamp, IP address</td></tr>
      <tr><td>Role changed</td><td>Admin who made change, previous role, new role, timestamp</td></tr>
      <tr><td>Project created, archived, or deleted</td><td>Actor, project name, timestamp</td></tr>
      <tr><td>SSO or 2FA settings changed</td><td>Actor, previous setting, new setting, timestamp</td></tr>
      <tr><td>File uploaded or deleted</td><td>Actor, file name, size, project, timestamp</td></tr>
      <tr><td>Workspace settings changed</td><td>Actor, field changed, previous value, new value</td></tr>
      <tr><td>API key created or revoked</td><td>Actor, key name (not the key value itself), timestamp</td></tr>
      <tr><td>Billing plan changed</td><td>Actor, previous plan, new plan, timestamp</td></tr>
    </tbody>
  </table>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Are audit logs tamper-proof?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Audit logs are stored in an <strong>append-only system</strong> &#8212; no user, including the workspace owner, can delete or modify log entries. Enterprise customers can configure <strong>log forwarding</strong> to their own SIEM (Security Information and Event Management) system via webhook for additional security assurance and long-term archiving.</p></div>
  </div>
</div>

<!-- ===================== CHAPTER 8 ===================== -->
<div class="content-section" id="section-ch8">
  <div class="page-header">
    <div class="page-header-badge">&#128279; Chapter 8</div>
    <h1>Integrations &amp; API</h1>
    <p>Connecting Onekof to the tools your team already uses.</p>
  </div>

  <h2>8.1 Native Integrations</h2>
  <p style="font-size:13.5px;color:#374151;margin-bottom:12px">To configure any integration: <span class="path">Settings &#8594; Integrations &#8594; [service] &#8594; Connect</span>. You will be redirected to the service&#8217;s authorisation page.</p>
  <table class="data-table">
    <thead><tr><th>Integration</th><th>What It Does</th></tr></thead>
    <tbody>
      <tr><td>Microsoft 365 / Outlook Calendar</td><td>Sync task due dates to your Outlook calendar. Onekof tasks appear as calendar events.</td></tr>
      <tr><td>Google Calendar</td><td>Bi-directional sync of task due dates with Google Calendar.</td></tr>
      <tr><td>Slack</td><td>Receive task assignment, mention, and status change notifications in a Slack channel. Create Onekof tasks from Slack messages.</td></tr>
      <tr><td>Microsoft Teams</td><td>Same as Slack &#8212; notifications and task creation from Teams.</td></tr>
      <tr><td>Google Drive / SharePoint</td><td>Attach Drive or SharePoint files to tasks directly. Changes to the linked file reflect in Onekof.</td></tr>
      <tr><td>Zoom</td><td>Schedule and join Zoom meetings from within a task. Meeting notes are saved to the task comment thread.</td></tr>
      <tr><td>Telebirr / Chapa</td><td>Payment integration for subscription billing. Not available for task-level payments.</td></tr>
    </tbody>
  </table>

  <h2>8.2 Webhooks</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">Webhooks allow external systems to receive real-time notifications when events occur in Onekof. Useful for connecting to custom internal tools, ERP systems, or data pipelines.</p>
  <ul style="margin:0 0 14px 20px;font-size:14px;line-height:1.8">
    <li>Configure from <span class="path">Settings &#8594; Integrations &#8594; Webhooks &#8594; + New Webhook</span>.</li>
    <li>Select which events to subscribe to: task created, task updated, comment added, etc.</li>
    <li>All webhook payloads are <strong>signed with HMAC-SHA256</strong>. Verify the signature in your receiving server to ensure authenticity.</li>
    <li>Delivery failures are retried up to <strong>5 times</strong> with exponential backoff.</li>
    <li>Delivery history for the last 30 days is visible in the webhook settings panel.</li>
  </ul>

  <h2>8.3 Public API</h2>
  <table class="data-table">
    <thead><tr><th>Detail</th><th>Value</th></tr></thead>
    <tbody>
      <tr><td class="label-cell">Base URL</td><td>https://api.onekof.com/v1</td></tr>
      <tr><td class="label-cell">Authentication</td><td>Bearer token (API key generated in <span class="path">Settings &#8594; API &#8594; New Key</span>)</td></tr>
      <tr><td class="label-cell">Rate Limit</td><td>1,000 requests per minute per workspace (Pro); custom limit (Enterprise)</td></tr>
      <tr><td class="label-cell">Response Format</td><td>JSON</td></tr>
      <tr><td class="label-cell">Date Format</td><td>ISO 8601 UTC (e.g. 2026-09-11T00:00:00Z). Ethiopian calendar dates via <code>?calendar=ethiopian</code></td></tr>
      <tr><td class="label-cell">Documentation</td><td>https://docs.onekof.com/api</td></tr>
      <tr><td class="label-cell">Availability</td><td>Pro and Enterprise plans only</td></tr>
    </tbody>
  </table>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I retrieve task data with Ethiopian calendar dates via the API?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Append <code>?calendar=ethiopian</code> to any API endpoint that returns or accepts dates. The API will return dates in Ge&#699;ez format (e.g. <code>{"due_date": "2018-01-05"}</code> where the year is in E.C.). Ethiopian month numbers 1&#8211;13 are used, with month 13 being Pagume. Example: <code>GET /v1/tasks/123?calendar=ethiopian</code></p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Does the API support bulk operations?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. The <code>/v1/tasks/bulk</code> endpoint accepts up to <strong>100 task create, update, or delete operations</strong> in a single request. Bulk operations are processed <strong>atomically</strong> &#8212; if any item fails validation, the entire batch is rejected. Available on Pro and Enterprise plans.</p></div>
  </div>
</div>

<!-- ===================== CHAPTER 9 ===================== -->
<div class="content-section" id="section-ch9">
  <div class="page-header">
    <div class="page-header-badge">&#128179; Chapter 9</div>
    <h1>Billing &amp; Subscriptions</h1>
    <p>Managing your Onekof subscription, payment methods, and invoices.</p>
  </div>

  <h2>9.1 Managing Your Subscription</h2>
  <div class="step-list">
    <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Go to Settings &#8594; Billing</strong><p>View your current plan, next billing date, seat count, and payment method.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Upgrade or downgrade your plan</strong><p>Changes take effect immediately. Upgrades are charged pro-rata for the remaining billing period. Downgrades take effect at the next billing cycle &#8212; you retain Pro features until then.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Add or remove seats</strong><p>Adding seats charges pro-rata immediately. Removing seats takes effect at the next billing cycle.</p></div></div>
    <div class="step"><div class="step-num">4</div><div class="step-body"><strong>Download invoices</strong><p>All invoices are available in <span class="path">Settings &#8594; Billing &#8594; Invoice History</span> in PDF format, displaying workspace name, billing period, ETB or USD amount, and tax details.</p></div></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">What happens if my payment fails?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a">
      <p>Onekof retries failed payments on a schedule:</p>
      <ul><li><strong>Day 1:</strong> First retry. Email notification sent with link to update payment method.</li><li><strong>Day 3:</strong> Second retry. Another email notification.</li><li><strong>Day 7:</strong> Third and final retry. If payment is not received, workspace is <strong>downgraded to the Free plan</strong>.</li></ul>
      <p><strong>No data is deleted</strong> when downgraded. Upgrading restores full Pro access immediately. Update your payment method at any time in <span class="path">Settings &#8594; Billing &#8594; Payment Method</span>.</p>
    </div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Can I pay annually to save money?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Annual billing is available at a <strong>15% discount</strong> compared to monthly billing. Switch to annual in <span class="path">Settings &#8594; Billing &#8594; Billing Interval</span>. Annual plans are billed in full at the start of the period. Refunds for unused months are available on a pro-rata basis if you cancel within 30 days of the annual renewal date.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">Does Onekof provide a tax invoice (VAT receipt)?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Yes. Invoices include VAT details where applicable under Ethiopian and international tax law. Enterprise customers can add their <strong>VAT registration number</strong> in <span class="path">Settings &#8594; Billing &#8594; Tax Information</span> for inclusion on all invoices. For billing disputes or tax documentation, contact <a href="mailto:billing@onekof.com">billing@onekof.com</a>.</p></div>
  </div>
</div>

<!-- ===================== CHAPTER 10 ===================== -->
<div class="content-section" id="section-ch10">
  <div class="page-header">
    <div class="page-header-badge">&#128295; Chapter 10</div>
    <h1>Troubleshooting &amp; Support</h1>
    <p>Common issues, diagnostic steps, and how to reach the Onekof support team.</p>
  </div>

  <div class="agent-box">
    <div class="agent-box-title">&#9889; Support Agent Diagnostic Checklist</div>
    <ul>
      <li>Always ask for: workspace name, email address, browser + OS, steps to reproduce, and screenshots.</li>
      <li>Check status.onekof.com first before diagnosing user-side issues &#8212; a platform incident may explain the problem.</li>
      <li>Login issues: check SSO enforcement, Caps Lock, TOTP clock sync (must be automatic), 15-min lockout timer.</li>
      <li>Calendar/date issues: almost always EC vs Gregorian mismatch &#8212; check Settings &#8594; Profile &#8594; Date Preferences.</li>
      <li>Slow loading: check Low-Bandwidth Mode, PWA installation, Chrome vs Safari (Safari known Gantt limitation).</li>
    </ul>
  </div>

  <h2>10.1 Common Issues</h2>
  <h3>Login &amp; Access</h3>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">ISSUE</span><span class="faq-q-text">I cannot log in &#8212; &#8220;Invalid credentials&#8221; even though my password is correct.</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a">
      <ol><li>Check that <strong>Caps Lock is off</strong>.</li><li>If you use Google SSO, try signing in via the &#8220;Continue with Google&#8221; button &#8212; SSO accounts do not have a separate Onekof password.</li><li>If your workspace enforces SSO, you <em>must</em> log in via your company identity provider (Azure AD, Okta, etc.) &#8212; the email/password form will not work.</li><li>Use the <strong>Forgot Password</strong> link to reset your password.</li><li>If none of the above work, contact support@onekof.com with your workspace name and email address.</li></ol>
    </div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">ISSUE</span><span class="faq-q-text">My 2FA code is not being accepted.</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a">
      <p>TOTP codes are time-sensitive &#8212; the most common cause is a phone clock that is out of sync.</p>
      <ol><li>Ensure the clock on your phone is set to <strong>automatic/network time</strong> (<span class="path">Settings &#8594; Date &amp; Time &#8594; Automatic</span>). Even 30 seconds of drift makes codes invalid.</li><li>Try the code immediately after it generates (before it rotates).</li><li>If the problem persists, use a <strong>recovery code</strong> to sign in, then re-enrol 2FA from scratch.</li><li>If you have no recovery codes, a workspace administrator can reset your 2FA from <span class="path">Settings &#8594; Members &#8594; [Your Name] &#8594; Reset 2FA</span>.</li></ol>
    </div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">ISSUE</span><span class="faq-q-text">I have been locked out after too many failed login attempts.</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Account lockouts lift <strong>automatically after 15 minutes</strong>. If you need immediate access, a workspace administrator can unlock your account from <span class="path">Settings &#8594; Members &#8594; [Your Name] &#8594; Unlock Account</span>. If you are the only administrator, contact support@onekof.com for emergency unlock assistance.</p></div>
  </div>

  <h3>Calendar &amp; Dates</h3>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">ISSUE</span><span class="faq-q-text">My task due dates are showing in the wrong year (7 years off).</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>This occurs when dates were entered in Gregorian format but the workspace is displaying in Ethiopian calendar (or vice versa). The Ethiopian calendar is approximately <strong>7 years and 8 months behind</strong> the Gregorian calendar.</p><p><strong>Fix:</strong> <span class="path">Settings &#8594; Profile &#8594; Date Preferences</span> and confirm your calendar selection matches how you entered the dates. For bulk correction, export tasks to CSV, adjust dates in a spreadsheet, and re-import.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">ISSUE</span><span class="faq-q-text">Pagume is not appearing in the date picker.</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Your workspace or profile calendar is set to <strong>Gregorian mode</strong>. Gregorian has only 12 months, so Pagume (month 13) is not displayed. Switch to Ethiopian calendar in <span class="path">Settings &#8594; Profile &#8594; Date Preferences</span>. This is a personal setting &#8212; you do not need admin access.</p></div>
  </div>

  <h3>Performance &amp; Loading</h3>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">ISSUE</span><span class="faq-q-text">Onekof is loading slowly on my mobile connection.</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><ol><li>Install Onekof as a PWA from Chrome for faster load times (see Chapter 5).</li><li>Close other browser tabs to free device memory.</li><li>Enable <strong>Low-Bandwidth Mode</strong> from <span class="path">Settings &#8594; Performance</span>. This reduces image quality and disables live animations on 2G/3G connections.</li><li>If the problem persists, contact support with your device model and connection type (2G/3G/4G/Wi-Fi).</li></ol></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">ISSUE</span><span class="faq-q-text">The Gantt chart is not loading for our large project (500+ tasks).</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><ol><li>Gantt rendering for very large projects can take 5&#8211;10 seconds. If it does not load after 15 seconds, continue below.</li><li>Apply <strong>date filters</strong> to reduce the visible date range.</li><li>Group tasks by assignee or milestone to reduce visual complexity.</li><li>Use <strong>Chrome or Edge</strong> &#8212; Safari has known performance limitations with large Gantt charts.</li><li>If the issue persists, raise a support ticket at support@onekof.com with your project name and task count.</li></ol></div>
  </div>

  <h3>Notifications &amp; Emails</h3>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">ISSUE</span><span class="faq-q-text">I am not receiving email notifications from Onekof.</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><ol><li>Check your spam/junk folder for emails from <strong>noreply@onekof.com</strong> or <strong>notifications@onekof.com</strong>. Add these to your safe sender list.</li><li>If using Ethio Telecom email (ethionet.et), some transactional emails may be delayed up to 30 minutes.</li><li>Check your notification settings in <span class="path">Settings &#8594; Notifications</span> to confirm email delivery is enabled for the relevant events.</li><li>If the problem persists, contact support@onekof.com with your email address and the specific notification type you&#8217;re missing.</li></ol></div>
  </div>

  <h2>10.2 Data Export &amp; Recovery</h2>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">I accidentally deleted a project. Can I recover it?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>Deleted projects enter a <strong>30-day recovery window</strong>. Go to <span class="path">Settings &#8594; Workspace &#8594; Deleted Projects &#8594; Restore</span>. After 30 days, the project and all its data are permanently deleted and cannot be recovered. Only administrators can see the deleted projects list &#8212; regular members cannot access this.</p></div>
  </div>

  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(this)"><span class="faq-q-badge">FAQ</span><span class="faq-q-text">How do I export all my project data?</span><span class="faq-chevron">&#9660;</span></div>
    <div class="faq-a"><p>From any project: <span class="path">&#8943; Project Settings &#8594; Export</span>. Choose:</p><ul><li><strong>CSV</strong>: tasks and metadata</li><li><strong>JSON</strong>: full project structure for re-import</li><li><strong>PDF</strong>: formatted project report</li></ul><p>For a full workspace export: <span class="path">Settings &#8594; Workspace &#8594; Export All Data</span>. Large exports are processed in the background and you will receive an email with a download link when ready.</p></div>
  </div>

  <h2>10.3 Contacting Onekof Support</h2>
  <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:12px">When contacting support, please include:</p>
  <ul style="margin:0 0 16px 20px;font-size:14px;line-height:1.8">
    <li>Your <strong>workspace name</strong> and the <strong>email address</strong> associated with your account.</li>
    <li>A description of the issue: what you were trying to do, what you expected, and what happened.</li>
    <li>The <strong>browser and operating system</strong> you are using (e.g. Chrome 124 on Android 13).</li>
    <li><strong>Screenshots or a screen recording</strong> if the issue is visual.</li>
    <li>For billing issues: your <strong>invoice number</strong> or the date of the affected charge.</li>
  </ul>
  <table class="data-table">
    <thead><tr><th>Channel</th><th>Details</th></tr></thead>
    <tbody>
      <tr><td>In-app chat</td><td>Click the ? Help button (bottom-right of the Onekof interface). Available 24/7. Agents respond Mon&#8211;Sat 8AM&#8211;6PM EAT.</td></tr>
      <tr><td>Email</td><td>support@onekof.com &#8212; include workspace name and full description.</td></tr>
      <tr><td>Priority support (Pro &amp; Enterprise)</td><td>Guaranteed first response within 4 business hours via in-app chat or dedicated Slack channel (Enterprise only).</td></tr>
      <tr><td>Help Centre</td><td>help.onekof.com &#8212; searchable knowledge base in English and Amharic.</td></tr>
      <tr><td>Community forum</td><td>community.onekof.com &#8212; peer support from other Onekof teams.</td></tr>
      <tr><td>Status page</td><td>status.onekof.com &#8212; real-time platform health and incident history.</td></tr>
    </tbody>
  </table>

  <h2>10.4 Escalation &amp; SLAs</h2>
  <table class="data-table">
    <thead><tr><th>Severity</th><th>Definition</th><th>Response SLA</th></tr></thead>
    <tbody>
      <tr><td><span class="badge badge-red">P1 Critical</span></td><td>Platform completely unavailable or data loss occurring.</td><td>Pro: 2 hrs. Enterprise: 1 hr.</td></tr>
      <tr><td><span class="badge badge-amber">P2 High</span></td><td>Core feature broken for all users (e.g. cannot create tasks).</td><td>Pro: 4 hrs. Enterprise: 2 hrs.</td></tr>
      <tr><td><span class="badge badge-teal">P3 Medium</span></td><td>Feature partially broken or affecting some users.</td><td>Pro: Next business day. Enterprise: 4 hrs.</td></tr>
      <tr><td><span class="badge badge-green">P4 Low</span></td><td>Cosmetic issue, feature request, or general question.</td><td>Pro: 3 business days. Enterprise: 1 business day.</td></tr>
    </tbody>
  </table>
  <div class="callout note"><span class="callout-icon">&#128216;</span><div>Response SLA refers to the time from ticket creation to the first substantive response from a support agent. Resolution times vary by issue complexity. SLAs apply during Onekof business hours (Monday&#8211;Saturday, 8 AM &#8211; 6 PM EAT) unless an Enterprise contract specifies 24/7 support.</div></div>
</div>

<!-- ===================== PRODUCTION READINESS CHECKLIST ===================== -->
<div class="content-section" id="section-checklist">
  <div class="page-header">
    <div class="page-header-badge">&#9989; Production Readiness</div>
    <h1>Production Readiness Checklist</h1>
    <p>96 items across 10 categories. 34 Critical &#8212; must pass before launch. 48 High &#8212; strong recommendation. 14 Medium &#8212; best practice. Use this checklist to validate production launch readiness. Mark items as verified by checking the box.</p>
  </div>

  <div class="card-grid" style="margin-bottom:20px">
    <div class="stat-card"><div class="stat-val" style="color:#B91C1C">34</div><div class="stat-label"><span class="badge badge-red">&#128308; Critical</span> Must pass before launch</div></div>
    <div class="stat-card"><div class="stat-val" style="color:#92400E">48</div><div class="stat-label"><span class="badge badge-amber">&#128993; High</span> Strong recommendation</div></div>
    <div class="stat-card"><div class="stat-val" style="color:#065F46">14</div><div class="stat-label"><span class="badge badge-green">&#128994; Medium</span> Best practice</div></div>
    <div class="stat-card"><div class="stat-val" id="checked-count">0</div><div class="stat-label">Items checked so far</div></div>
  </div>

  <div class="callout warn"><span class="callout-icon">&#9888;&#65039;</span><div>Any <strong>Critical</strong> item that cannot be checked must be escalated. Do not launch with open Critical items. Assign an owner to every item &#8212; no item should be left unowned.</div></div>

  <!-- Section 1 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">1. Infrastructure &amp; Deployment</h2><span class="checklist-progress" id="prog-1"></span></div>
    <p style="font-size:13px;color:#6B7280;margin-bottom:12px">Validates that environments are correctly isolated, deployment is automated and repeatable, and the system can survive infrastructure failures.</p>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> All environments (dev/staging/prod) fully isolated with independent databases, secrets, and configurations</div><div class="cl-criteria">No shared credentials or databases between environments at any tier.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Production runs across a minimum of 2 availability zones or regions for redundancy</div><div class="cl-criteria">Single-AZ failure must not cause complete service outage.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Zero-downtime deployment strategy (blue-green or rolling) validated in staging</div><div class="cl-criteria">Full deploy executed without user-visible interruption or dropped connections.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> All secrets managed via a vault (AWS Secrets Manager/Azure Key Vault/HashiCorp Vault); no .env files in prod</div><div class="cl-criteria">Secret rotation procedure documented; git-secrets or equivalent scan in CI to prevent leaks.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Auto-scaling configured for web, API, and background worker tiers</div><div class="cl-criteria">Tested to handle 3&#8211;5&#215; baseline load; scale-down tested to avoid cost overrun.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> All cloud infrastructure defined as code (Terraform/Pulumi/CloudFormation); no manually created prod resources</div><div class="cl-criteria">Drift detection enabled; IaC applied in CI before every deploy.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> CDN configured for all static assets; cache headers and purge workflow documented</div><div class="cl-criteria">Cache-Control headers correct; purge tested after a deployment.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Deployment runbook documented including rollback steps and estimated RTO</div><div class="cl-criteria">Runbook tested within 30 days of go-live; stored in operations wiki accessible without system access.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Container images pinned to specific digests (not :latest) in production</div><div class="cl-criteria">Base images scanned for CVEs before use; rebuild policy documented.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> DNS TTLs reduced ahead of go-live to support rapid failover if needed</div><div class="cl-criteria">Restore TTLs to normal values after stable launch period.</div></div></div>
  </div>

  <!-- Section 2 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">2. Security &amp; Compliance</h2><span class="checklist-progress" id="prog-2"></span></div>
    <p style="font-size:13px;color:#6B7280;margin-bottom:12px">Security must be verified at the API layer &#8212; not inferred from UI controls. Each item requires a human to actively test.</p>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Authentication implemented with OAuth 2.0/OIDC/SAML; no custom auth schemes</div><div class="cl-criteria">Token expiry, refresh flow, and revocation all tested end-to-end.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> RBAC enforced server-side at API layer for every endpoint</div><div class="cl-criteria">Direct API calls with lower-privilege tokens must return 403 &#8212; not just hidden in UI.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> MFA available and enforceable for admin and privileged users</div><div class="cl-criteria">Recovery code generation, single-use validation, and backup method tested.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> All data at rest encrypted (AES-256); all data in transit via TLS 1.2+</div><div class="cl-criteria">TLS 1.0/1.1 explicitly disabled; HSTS header set (max-age &ge; 1 year).</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Audit log captures all write and delete events with user ID, timestamp, IP address</div><div class="cl-criteria">Logs tamper-resistant (append-only); retained for minimum 90 days; queryable by administrators.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Automated security scan (OWASP ZAP/Semgrep/Burp) run against staging; zero high/critical findings</div><div class="cl-criteria">Covers SQLi, XSS, CSRF, SSRF, IDOR; scan gates CI pipeline on release branches.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Dependency vulnerability scan (npm audit/pip-audit/Snyk) passing with no critical CVEs</div><div class="cl-criteria">Blocking gate in CI; suppression of any finding requires documented justification and expiry date.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Rate limiting applied to all authentication endpoints (login, OTP, password reset, registration)</div><div class="cl-criteria">&#8804;5 failed attempts triggers soft lockout; exponential backoff; CAPTCHA fallback on repeat failures.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Content Security Policy (CSP) headers enforced in production (no unsafe-inline)</div><div class="cl-criteria">Report-Only mode validated before enforcement; violation reporting endpoint active and monitored.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> CORS policy restricts allowed origins to known application domains only</div><div class="cl-criteria">Wildcard (*) must not appear in prod Access-Control-Allow-Origin.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Session management: idle timeout configured, concurrent session limits enforced, forced logout functional</div><div class="cl-criteria">Admins can revoke all sessions for any user; session list visible in account settings.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> File upload validation: MIME type check, size limit, and malware scan before storage</div><div class="cl-criteria">Blocked extension list maintained; uploads stored outside web root; filenames sanitised.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Penetration test conducted by an external vendor within the last 6 months</div><div class="cl-criteria">All Critical/High findings remediated before launch; report stored securely and available to auditors.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Privacy policy and cookie consent mechanism aligned with applicable data protection regulations</div><div class="cl-criteria">GDPR/CCPA/local regulations assessed; consent recorded with timestamp.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> SSO integration tested with at least one enterprise identity provider</div><div class="cl-criteria">Attribute mapping documented; JIT provisioning tested; logout propagation verified.</div></div></div>
  </div>

  <!-- Section 3 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">3. Performance &amp; Reliability</h2></div>
    <p style="font-size:13px;color:#6B7280;margin-bottom:12px">Every target should be measured &#8212; not estimated. Real-world load conditions, not developer environments.</p>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Load test completed at 2&#215; projected peak concurrent users; all latency and error targets met</div><div class="cl-criteria">Target: &le;500ms p95 API response time; error rate &lt;0.1% under sustained load.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Database connection pooling configured; slow query log enabled with alerting</div><div class="cl-criteria">All high-traffic queries have covering indexes; EXPLAIN plans reviewed for top 20 queries.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Database backups automated, encrypted, tested with a restore drill, RTO/RPO documented</div><div class="cl-criteria">Recommended: RPO &le;1hr, RTO &le;4hrs; restore tested in staging within 30 days of launch.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Platform uptime SLA target (&ge;99.9%) achievable with current architecture</div><div class="cl-criteria">SPOF analysis completed; fallback documented for each critical third-party service.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> All third-party API calls have timeout, retry-with-backoff, and circuit-breaker logic</div><div class="cl-criteria">Graceful degradation UI shown when external service is unreachable.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Core Web Vitals pass on a mid-range device: LCP &lt;2.5s, INP &lt;200ms, CLS &lt;0.1</div><div class="cl-criteria">Measured via Lighthouse CI; results stored per release for regression tracking.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Frontend bundle size audited; route-level code splitting applied; initial bundle &lt;300KB gzipped</div><div class="cl-criteria">Heavy libraries (charts, PDF viewers, rich editors) lazy-loaded on first use only.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Caching strategy documented: layers, TTLs, and invalidation triggers defined per data type</div><div class="cl-criteria">Application cache (Redis), CDN layer, and browser caching all covered.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Email notification delivery confirmed via verified sender domain with SPF, DKIM, and DMARC</div><div class="cl-criteria">Transactional email delivery rate &gt;95%; bounce and complaint handling active.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Stress test run to identify breaking point and confirm graceful degradation (queue, shed load, or 503)</div><div class="cl-criteria">System must not corrupt data or lose writes under overload; shedding strategy documented.</div></div></div>
  </div>

  <!-- Section 4 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">4. Core Feature Completeness</h2></div>
    <p style="font-size:13px;color:#6B7280;margin-bottom:12px">Every feature advertised on the pricing page or onboarding materials must pass full functional testing.</p>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> All features listed on the public pricing and feature pages are functional in production</div><div class="cl-criteria">Any advertised feature not ready must be clearly marked &#8216;coming soon&#8217; &#8212; not silently absent.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> End-to-end happy-path user journeys tested: sign-up &#8594; core action &#8594; share/export &#8594; account deletion</div><div class="cl-criteria">Executed in a clean staging environment by a tester who did not build the feature.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> All write operations (create, update, delete) are idempotent or protected against duplicate submission</div><div class="cl-criteria">Double-click and network-retry scenarios tested; no duplicate records created.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Guest and external collaborator access restricted correctly (cannot traverse to unauthorised resources)</div><div class="cl-criteria">Guest token tested via direct API calls to verify it cannot access out-of-scope resources.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Free trial, upgrade, downgrade, and cancellation flows tested end-to-end</div><div class="cl-criteria">Feature access changes correctly on tier change; no billing after cancellation; confirmation emails sent.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Data export functionality tested: all user data exportable in a portable format (CSV, JSON, PDF)</div><div class="cl-criteria">Export completes within a reasonable time for large accounts; file is valid and complete.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Data import/migration path tested with realistic volume and edge-case data</div><div class="cl-criteria">Errors in import show actionable messages; partial failures do not corrupt existing data.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Search and filtering tested with large data sets (simulate 1,000+ records)</div><div class="cl-criteria">Search returns results in &lt;1s; filters combine correctly; pagination works at all offsets.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Notifications (email, push, in-app) delivered correctly for all trigger events</div><div class="cl-criteria">User notification preferences respected; unsubscribe links functional; no duplicate notifications.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Archive, delete, and restore workflows function without data loss</div><div class="cl-criteria">Deleted/archived items excluded from active views; restore returns all associated data and metadata.</div></div></div>
  </div>

  <!-- Section 5 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">5. User Experience &amp; Accessibility</h2></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Onboarding flow tested end-to-end with a first-time user unfamiliar with the product</div><div class="cl-criteria">Completion rate target &gt;75% in usability test; no dead ends, blank screens, or confusing steps.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Responsive layout tested on common mobile device sizes (360px, 390px, 414px wide)</div><div class="cl-criteria">Core workflows fully usable on mobile; no horizontal scroll on primary screens.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Empty states present for all views that can have zero data</div><div class="cl-criteria">Empty states include a helpful call-to-action &#8212; not a blank white space.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Error messages displayed inline with clear guidance on how to resolve each issue</div><div class="cl-criteria">No raw error codes or stack traces visible to end users; fallback for unexpected errors shows support contact.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Loading states (skeletons or spinners) present for all async data loads &gt;300ms</div><div class="cl-criteria">No layout shift when data loads; skeleton matches approximate shape of loaded content.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Browser compatibility tested: Chrome, Firefox, Safari, Edge (latest 2 versions each)</div><div class="cl-criteria">Critical workflows confirmed functional; cosmetic differences documented.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> All links on the marketing site and help centre return 200 (no 404s or placeholder pages)</div><div class="cl-criteria">Use a crawler (e.g. Screaming Frog) to scan all internal links before launch.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Keyboard navigation functional for all primary workflows; focus indicators visible</div><div class="cl-criteria">Tab order is logical; Esc closes modals; Enter submits focused forms.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Colour contrast ratios meet WCAG AA: 4.5:1 for body text, 3:1 for large text and UI components</div><div class="cl-criteria">Check all status badges, buttons, and alert colours &#8212; not just body copy.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> All images, icons, and non-decorative visual elements have descriptive alt text</div><div class="cl-criteria">Decorative images use alt="" to be skipped by screen readers.</div></div></div>
  </div>

  <!-- Section 6 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">6. Integrations &amp; APIs</h2></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Billing provider integration tested: payment capture, failed payment handling, refunds, and webhooks</div><div class="cl-criteria">Failed card scenarios tested; dunning logic configured; receipts and invoices generated correctly.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Public API reference documentation complete, accurate, and tested against current API version</div><div class="cl-criteria">Auth, rate limits, error codes, and pagination documented; working code examples in at least 2 languages.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> API versioning strategy defined; v1 endpoints stable at launch</div><div class="cl-criteria">Breaking change policy documented; deprecation timeline communicated to API consumers.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Webhook delivery reliable: signed payloads (HMAC), retry on failure, delivery log in admin panel</div><div class="cl-criteria">Signature verification documented with example code; failed delivery alerts configured.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> All third-party OAuth integrations tested: token issuance, refresh, revocation, re-auth on expiry</div><div class="cl-criteria">Test with real provider accounts &#8212; not mock tokens; revoked tokens handled gracefully.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> API rate limiting implemented and communicated clearly in documentation and response headers</div><div class="cl-criteria">X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After headers present on rate-limited responses.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Status page live and reflects real-time system health; past incident history visible</div><div class="cl-criteria">Incidents communicated within 15 min of detection; history page shows at least 90 days.</div></div></div>
  </div>

  <!-- Section 7 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">7. Observability &amp; Incident Response</h2></div>
    <p style="font-size:13px;color:#6B7280;margin-bottom:12px">You cannot fix what you cannot see. Full observability must be in place before go-live.</p>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Centralised structured logging (JSON) active for all services; log levels used consistently</div><div class="cl-criteria">Logs queryable within 30s; PII redacted or masked at the log layer.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> APM active: request traces, DB query times, and error rates visible</div><div class="cl-criteria">p50/p95/p99 latency dashboards available per endpoint; alerts on degradation.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Uptime monitoring with alerting on all public-facing endpoints (detection time &lt;1 min)</div><div class="cl-criteria">Monitoring from at least 2 geographic regions; on-call escalation path defined and tested.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Error tracking (Sentry/Rollbar/Datadog) active; unhandled exceptions alert on-call within 5 min</div><div class="cl-criteria">Source maps uploaded for readable stack traces; release tagging enabled for regression tracking.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Business metrics dashboard live: active users, signups, conversions, core feature usage</div><div class="cl-criteria">Accessible to leadership without engineering access; updated at &le;1hr cadence.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> On-call rotation defined with primary and secondary contacts; pager integration configured</div><div class="cl-criteria">Acknowledge SLA &lt;15min; initial update to stakeholders &lt;30min for P1 incidents.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Incident response runbook written, stored accessibly, and rehearsed before launch</div><div class="cl-criteria">Covers: detection &#8594; triage &#8594; escalation &#8594; communication &#8594; post-mortem; tested in a drill within 60 days.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Post-mortem template and blameless culture process defined before first incident</div><div class="cl-criteria">RCA required for all P1/P2 incidents; action items tracked to closure in issue tracker.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Alerting thresholds calibrated to avoid alert fatigue (no more than 5 actionable alerts per day at baseline)</div><div class="cl-criteria">All alerts must be actionable; informational alerts routed to dashboards, not pagers.</div></div></div>
  </div>

  <!-- Section 8 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">8. Data Management &amp; Legal</h2></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Terms of Service and Privacy Policy reviewed by qualified legal counsel and live on the site</div><div class="cl-criteria">Covers: data ownership, SLA disclaimers, acceptable use, account termination, and governing law.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Data deletion (right to erasure) workflow functional: account deletion purges all PII within defined SLA</div><div class="cl-criteria">Deletion cascades to backups within retention window; confirmation email sent; support can verify completion.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Data export (portability) functional: users can export all their data in a machine-readable format</div><div class="cl-criteria">Export includes all user-generated content; completes within 24hrs for large accounts.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Data retention policy documented: what is retained, for how long, and when it is permanently purged</div><div class="cl-criteria">Audit logs: 90 days minimum; deleted account data: 30-day recovery window then purge.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Cookie consent banner functional: records consent with timestamp; analytics blocked until accepted</div><div class="cl-criteria">Strictly necessary cookies load without consent; consent can be withdrawn; records stored for audit.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Incident response plan includes data breach notification procedure with regulatory timelines</div><div class="cl-criteria">GDPR: 72hr notification to supervisory authority; affected users notified without undue delay.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Sub-processor list maintained and available to enterprise customers on request</div><div class="cl-criteria">Includes: cloud host, CDN, email provider, payment processor, analytics, AI providers.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Data Processing Agreement (DPA) template available for enterprise and regulated-industry customers</div><div class="cl-criteria">DPA covers GDPR Article 28 requirements; signed copy stored per customer.</div></div></div>
  </div>

  <!-- Section 9 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">9. Support &amp; Documentation</h2></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Customer support channel live and staffed before public launch</div><div class="cl-criteria">First response SLA defined (e.g. &lt;24hrs business hours); escalation path to engineering documented.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Help centre / knowledge base live with articles covering all core workflows</div><div class="cl-criteria">Minimum: getting started guide, account management, billing FAQ, and troubleshooting for top 10 issues.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> In-app onboarding or guided tour available for first-time users</div><div class="cl-criteria">Can be dismissed; progress tracked per user; resurface option available in help menu.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Developer documentation live for any public API, SDK, or webhook integration</div><div class="cl-criteria">Quickstart guide allows a developer to make their first API call within 10 minutes.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Support team trained on all features included in launch; known issues documented internally</div><div class="cl-criteria">Known issues list reviewed daily during first 2 weeks post-launch; fixes communicated proactively.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Changelog or release notes page live and updated with launch content</div><div class="cl-criteria">Provides transparency on what is new; referenced in product update emails.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Feedback mechanism in product (bug report, feature request) routes to tracked backlog</div><div class="cl-criteria">Users receive acknowledgement; PM reviews new submissions within 48hrs.</div></div></div>
  </div>

  <!-- Section 10 -->
  <div class="checklist-section">
    <div class="checklist-header"><h2 style="margin:0;border:none;padding:0;font-size:17px">10. Go-Live &amp; Launch Readiness</h2></div>
    <p style="font-size:13px;color:#6B7280;margin-bottom:12px">Final gate checks before launch. Technical readiness means nothing if the team is not operationally prepared.</p>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Go/No-Go criteria formally defined and agreed by engineering, product, and leadership</div><div class="cl-criteria">Written criteria shared in advance; decision made in a meeting with all stakeholders present.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> All beta or early-access users notified of production launch; data migrated without loss</div><div class="cl-criteria">Migration tested in staging first; rollback plan ready if migration fails partway through.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Pricing page amounts, currency, and billing interval validated; payment flow tested end-to-end</div><div class="cl-criteria">Receipt email, invoice generation, and failed payment flow all confirmed functional.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-red">Critical</span> Post-launch hypercare plan: daily stand-up, hotfix SLA, and rollback trigger criteria defined</div><div class="cl-criteria">First 2 weeks: daily incident review; rollback triggered if error rate exceeds 1% sustained for 5 min.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Marketing site performance and uptime tested under anticipated launch traffic spike</div><div class="cl-criteria">Marketing site on separate infrastructure from the application to avoid mutual impact.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Launch day communications (email to waitlist, blog post, social) prepared and scheduled</div><div class="cl-criteria">All links in communications tested; support team aware of launch timing.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Sales demo environment seeded with realistic, production-quality data</div><div class="cl-criteria">Demo workspace uses realistic org structures, data volumes, and feature configurations &#8212; not Lorem Ipsum.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Social and community channels monitored for bug reports and user questions during launch week</div><div class="cl-criteria">Dedicated team member assigned; response time target &lt;2hrs during business hours.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-amber">High</span> Load balancer and CDN capacity pre-scaled for anticipated launch traffic surge</div><div class="cl-criteria">Coordinate with cloud provider if expecting traffic spike &gt;10&#215; baseline on launch day.</div></div></div>
    <div class="cl-item"><input type="checkbox" onchange="updateChecklist()"><div class="cl-item-body"><div class="cl-text"><span class="badge badge-green">Medium</span> Post-launch retrospective scheduled for 2 weeks after go-live</div><div class="cl-criteria">Review: error rates, support ticket volume, onboarding funnel, and user feedback themes.</div></div></div>
  </div>
</div>

<!-- ===================== APPENDIX ===================== -->
<div class="content-section" id="section-appendix">
  <div class="page-header">
    <div class="page-header-badge">&#128218; Appendix</div>
    <h1>Quick Reference &amp; Glossary</h1>
    <p>Keyboard shortcuts, Ethiopian&#8211;Gregorian year conversion table, support contacts, and glossary of terms.</p>
  </div>

  <h2>A. Keyboard Shortcuts</h2>
  <table class="data-table">
    <thead><tr><th>Action</th><th>Windows / Linux</th><th>macOS</th></tr></thead>
    <tbody>
      <tr><td>Create new task</td><td><kbd>C</kbd></td><td><kbd>C</kbd></td></tr>
      <tr><td>Search workspace</td><td><kbd>Ctrl</kbd> + <kbd>K</kbd></td><td><kbd>&#8984;</kbd> + <kbd>K</kbd></td></tr>
      <tr><td>Open quick switcher (jump to project)</td><td><kbd>Ctrl</kbd> + <kbd>J</kbd></td><td><kbd>&#8984;</kbd> + <kbd>J</kbd></td></tr>
      <tr><td>Save task detail / confirm edit</td><td><kbd>Ctrl</kbd> + <kbd>Enter</kbd></td><td><kbd>&#8984;</kbd> + <kbd>Enter</kbd></td></tr>
      <tr><td>Cancel / close modal</td><td><kbd>Esc</kbd></td><td><kbd>Esc</kbd></td></tr>
      <tr><td>Expand / collapse sidebar</td><td><kbd>Ctrl</kbd> + <kbd>\</kbd></td><td><kbd>&#8984;</kbd> + <kbd>\</kbd></td></tr>
      <tr><td>Switch to Kanban view</td><td><kbd>G</kbd> then <kbd>K</kbd></td><td><kbd>G</kbd> then <kbd>K</kbd></td></tr>
      <tr><td>Switch to List view</td><td><kbd>G</kbd> then <kbd>L</kbd></td><td><kbd>G</kbd> then <kbd>L</kbd></td></tr>
      <tr><td>Switch to Timeline view</td><td><kbd>G</kbd> then <kbd>T</kbd></td><td><kbd>G</kbd> then <kbd>T</kbd></td></tr>
      <tr><td>Switch to Gantt view</td><td><kbd>G</kbd> then <kbd>G</kbd></td><td><kbd>G</kbd> then <kbd>G</kbd></td></tr>
      <tr><td>Mark task complete</td><td><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd></td><td><kbd>&#8984;</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd></td></tr>
      <tr><td>@Mention in comment</td><td><kbd>@</kbd></td><td><kbd>@</kbd></td></tr>
    </tbody>
  </table>

  <h2>B. Ethiopian &#8596; Gregorian Year Conversion</h2>
  <div class="callout note"><span class="callout-icon">&#128216;</span><div>The Ethiopian New Year (Enkutatash) falls on Meskerem 1 &#8212; September 11 in a standard Gregorian year and September 12 in a Gregorian leap year. A new Ethiopian year begins partway through the Gregorian year. The Ethiopian calendar is approximately <strong>7 years and 8 months behind</strong> the Gregorian calendar.</div></div>
  <table class="data-table">
    <thead><tr><th>Ethiopian Year (E.C.)</th><th>Gregorian Year (approx.)</th></tr></thead>
    <tbody>
      <tr><td>2015 E.C.</td><td>2022&#8211;2023</td></tr>
      <tr><td>2016 E.C.</td><td>2023&#8211;2024</td></tr>
      <tr><td>2017 E.C.</td><td>2024&#8211;2025</td></tr>
      <tr><td>2018 E.C.</td><td>2025&#8211;2026 (current)</td></tr>
      <tr><td>2019 E.C.</td><td>2026&#8211;2027</td></tr>
      <tr><td>2020 E.C.</td><td>2027&#8211;2028</td></tr>
    </tbody>
  </table>

  <h2>C. Support Contact Quick Reference</h2>
  <table class="data-table">
    <thead><tr><th>Contact Point</th><th>Details</th></tr></thead>
    <tbody>
      <tr><td class="label-cell">In-app help</td><td>? button &#8594; bottom-right corner of the application</td></tr>
      <tr><td class="label-cell">Support email</td><td>support@onekof.com</td></tr>
      <tr><td class="label-cell">Billing queries</td><td>billing@onekof.com</td></tr>
      <tr><td class="label-cell">Security / Data concerns</td><td>security@onekof.com</td></tr>
      <tr><td class="label-cell">Help centre</td><td>https://help.onekof.com (English &amp; Amharic)</td></tr>
      <tr><td class="label-cell">Status page</td><td>https://status.onekof.com</td></tr>
      <tr><td class="label-cell">Community forum</td><td>https://community.onekof.com</td></tr>
      <tr><td class="label-cell">Enterprise success manager</td><td>Provided in your onboarding welcome email</td></tr>
      <tr><td class="label-cell">Business hours</td><td>Monday&#8211;Saturday, 8 AM &#8211; 6 PM EAT</td></tr>
    </tbody>
  </table>

  <h2>D. Glossary</h2>
  <table class="data-table">
    <thead><tr><th>Term</th><th>Definition</th></tr></thead>
    <tbody>
      <tr><td class="label-cell">EFY</td><td>Ethiopian Fiscal Year &#8212; the calendar system used by the Ethiopian government and most local organisations, running Meskerem to Pagume.</td></tr>
      <tr><td class="label-cell">E.C.</td><td>Ethiopian Calendar &#8212; shorthand for dates expressed in the Ge&#699;ez calendar system.</td></tr>
      <tr><td class="label-cell">Pagume</td><td>The 13th month of the Ethiopian calendar, lasting 5 days (6 in a leap year). The final month of the Ethiopian year.</td></tr>
      <tr><td class="label-cell">Workspace</td><td>The top-level container in Onekof representing your organisation. One workspace can contain many projects and members.</td></tr>
      <tr><td class="label-cell">Project</td><td>A collection of tasks, documents, and goals organised around a specific objective or deliverable.</td></tr>
      <tr><td class="label-cell">Kanban</td><td>A project view displaying tasks as cards in columns representing different stages (e.g. To Do, In Progress, Done).</td></tr>
      <tr><td class="label-cell">Gantt</td><td>A project view showing tasks as horizontal bars on a timeline, with support for dependencies and critical path analysis.</td></tr>
      <tr><td class="label-cell">OKR</td><td>Objectives and Key Results &#8212; a goal-setting framework. Onekof&#8217;s Goals module supports OKR tracking.</td></tr>
      <tr><td class="label-cell">Automation</td><td>An if-this-then-that rule that performs an action automatically when a trigger condition is met.</td></tr>
      <tr><td class="label-cell">SSO</td><td>Single Sign-On &#8212; allows users to authenticate with Onekof using their organisation&#8217;s existing identity provider (e.g. Azure AD, Okta).</td></tr>
      <tr><td class="label-cell">SAML 2.0</td><td>Security Assertion Markup Language &#8212; the protocol used for SSO federation between Onekof and enterprise identity providers.</td></tr>
      <tr><td class="label-cell">TOTP</td><td>Time-based One-Time Password &#8212; the type of 2FA code generated by authenticator apps like Google Authenticator.</td></tr>
      <tr><td class="label-cell">Webhook</td><td>An HTTP callback that sends event data from Onekof to an external system in real time when an event occurs.</td></tr>
      <tr><td class="label-cell">PWA</td><td>Progressive Web App &#8212; a web application installed on a device that behaves like a native app, including offline support and push notifications.</td></tr>
      <tr><td class="label-cell">WIP Limit</td><td>Work In Progress Limit &#8212; a constraint on a Kanban column that prevents more than a set number of tasks from being in that stage simultaneously.</td></tr>
      <tr><td class="label-cell">Critical Path</td><td>In Gantt view, the sequence of dependent tasks that determines the earliest possible project completion date.</td></tr>
      <tr><td class="label-cell">RTO</td><td>Recovery Time Objective &#8212; the maximum acceptable time to restore service after an outage.</td></tr>
      <tr><td class="label-cell">RPO</td><td>Recovery Point Objective &#8212; the maximum acceptable amount of data loss measured in time.</td></tr>
      <tr><td class="label-cell">RBAC</td><td>Role-Based Access Control &#8212; a security model where permissions are assigned to roles, and roles are assigned to users.</td></tr>
      <tr><td class="label-cell">SIEM</td><td>Security Information and Event Management &#8212; a system that collects, correlates, and analyses security event data in real time.</td></tr>
    </tbody>
  </table>
</div>

</main>
</div>

<script>
// ==================== NAVIGATION ====================
function showSection(id) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('section-' + id);
  if (target) target.classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(s => {
    if (s.dataset.section === id) s.classList.add('active');
  });
  document.getElementById('mainContent').scrollTop = 0;
  document.getElementById('search-results').classList.remove('active');
}

document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', () => showSection(item.dataset.section));
});

document.querySelectorAll('.qa-btn[onclick]').forEach(btn => {});

// ==================== FAQ TOGGLE ====================
function toggleFaq(el) {
  el.classList.toggle('open');
  const ans = el.nextElementSibling;
  ans.classList.toggle('open');
}

// ==================== SEARCH ====================
const searchData = [];

function buildSearchIndex() {
  document.querySelectorAll('.content-section:not(#search-results)').forEach(section => {
    const id = section.id.replace('section-', '');
    const chapterEl = section.querySelector('.page-header-badge');
    const chapter = chapterEl ? chapterEl.textContent.trim() : id;

    section.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q-text')?.textContent || '';
      const a = item.querySelector('.faq-a')?.textContent || '';
      searchData.push({ section: id, chapter, title: q, body: a, el: item });
    });

    section.querySelectorAll('h2, h3').forEach(h => {
      const next = h.nextElementSibling;
      const body = next ? next.textContent : '';
      searchData.push({ section: id, chapter, title: h.textContent, body, el: h });
    });
  });
}

buildSearchIndex();

const searchInput = document.getElementById('globalSearch');
const searchResults = document.getElementById('search-results');
const searchOutput = document.getElementById('search-output');

searchInput.addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  if (q.length < 2) {
    searchResults.classList.remove('active');
    document.querySelectorAll('.content-section').forEach(s => {
      if (s.id !== 'search-results') {
        const sId = s.id.replace('section-', '');
        if (document.querySelector('.sidebar-item.active')?.dataset.section === sId) {
          s.classList.add('active');
        }
      }
    });
    return;
  }

  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  searchResults.classList.add('active');
  document.getElementById('search-heading').textContent = \`Search: "\${this.value}"\`;

  const results = searchData.filter(d =>
    d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q)
  ).slice(0, 20);

  document.getElementById('search-meta').textContent = results.length
    ? \`\${results.length} results found\`
    : 'No results found. Try different keywords.';

  searchOutput.innerHTML = results.map(r => {
    const snippet = r.body.replace(/\s+/g, ' ').substring(0, 160);
    const hl = (str) => str.replace(new RegExp(q.replace(/[.*+?^\${}()|[\]\\]/g,'\\$&'), 'gi'), m => \`<mark>\${m}</mark>\`);
    return \`<div class="search-result-item" onclick="showSection('\${r.section}')">
      <div class="sri-chapter">\${r.chapter}</div>
      <div class="sri-title">\${hl(r.title)}</div>
      <div class="sri-preview">\${hl(snippet)}...</div>
    </div>\`;
  }).join('');
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    searchInput.blur();
  }
});

// ==================== CHECKLIST ====================
function updateChecklist() {
  const allBoxes = document.querySelectorAll('#section-checklist input[type=checkbox]');
  const checked = Array.from(allBoxes).filter(b => b.checked).length;
  document.getElementById('checked-count').textContent = checked;

  allBoxes.forEach(box => {
    const item = box.closest('.cl-item');
    const textEl = item.querySelector('.cl-text');
    if (box.checked) {
      item.classList.add('checked');
      textEl.classList.add('checked-text');
    } else {
      item.classList.remove('checked');
      textEl.classList.remove('checked-text');
    }
  });
}
</script>
</body>
</html>

`;

export const dynamic = 'force-static';

export async function GET() {
  return new Response(SUPPORT_HTML, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
