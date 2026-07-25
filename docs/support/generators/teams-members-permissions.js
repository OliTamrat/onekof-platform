const { P, B, BOLDLEAD, STEP, H1, H2, table, buildGuide } = require('./lib/guide-lib');

buildGuide({
  subtitle: 'Teams, Members & Permissions',
  headerTitle: 'Teams, Members & Permissions',
  version: '1.0',
  date: 'July 25, 2026',
  outFile: 'ONEKOF_SUPPORT_GUIDE_TEAMS_MEMBERS_PERMISSIONS.docx',
  body: [
    // ---- 1. Overview ----
    H1('1. How People and Access Work in Onekof'),
    P('Onekof separates "who is in the organization", "who can open which project", and "which team someone belongs to" into three independent layers. This is what lets a ministry keep a confidential project invisible even to its own administrators, or let an NGO bring in an external consultant who sees exactly one project and nothing else. It is also the number-one source of support questions — most "I can\'t see X" tickets are resolved by identifying which of the three layers is missing.'),
    BOLDLEAD('Organization membership — ', 'gets a person into the workspace, with an org role: Owner, Admin, Member, or Guest.'),
    BOLDLEAD('Project membership — ', 'gets a person into a specific project, with a project role: Admin, Member, or Viewer.'),
    BOLDLEAD('Team membership — ', 'groups people for planning (team board, goals, timeline), with roles Lead or Member. Being on a team grants no project access by itself.'),

    // ---- 2. Roles ----
    H1('2. Who Can Do What'),
    H2('Organization roles'),
    table([
      ['Role', 'What it allows'],
      ['Owner', 'Everything an Admin can do. Cannot be demoted or removed by anyone — the Owner role is permanent.'],
      ['Admin', 'Invite/remove members, change roles, create/delete teams, manage any project’s members, org settings, billing, view the audit log. Automatically has full budget control unless set otherwise.'],
      ['Member', 'Normal user: sees Public and Internal projects plus any project they are explicitly added to.'],
      ['Guest', 'Sees only projects they are explicitly added to — nothing else. Budget, Members, Reports, Settings, and Automation are hidden from their sidebar. Used for external partners.'],
    ]),
    H2('Common people actions'),
    table([
      ['Action', 'Required role'],
      ['Invite someone to the organization', 'Org Owner or Admin'],
      ['Revoke a pending invitation', 'Org Owner or Admin'],
      ['Change a member’s org role / remove a member', 'Org Owner or Admin (Owners cannot be changed or removed; you cannot remove yourself)'],
      ['Create or delete a team', 'Org Owner or Admin'],
      ['Add / remove team members', 'Team Lead, or Org Owner/Admin (members can remove themselves)'],
      ['Promote a team member to Lead (or demote)', 'Org Owner/Admin only — a Lead cannot do this'],
      ['Add / remove project members, change project roles', 'Project Admin, or Org Owner/Admin'],
      ['View the organization audit log', 'Org Owner or Admin'],
    ]),

    // ---- 3. Key terms ----
    H1('3. Key Terms'),
    BOLDLEAD('Invitation — ', 'an emailed, secure link that brings a person into the organization with a chosen role. Valid for 7 days.'),
    BOLDLEAD('Project-scoped invitation — ', 'an invitation that also names a project and project role. On acceptance the person joins the org and that project in one step — the right way to onboard an external partner (their org role defaults to Guest).'),
    BOLDLEAD('Project visibility — ', 'Public and Internal projects are open to all org members; Private projects need explicit membership (org Owners/Admins can also see them); Confidential projects are visible only to explicitly added people — even org Admins are excluded unless added.'),
    BOLDLEAD('Budget access — ', 'a separate per-person level (No access → View only → Edit → Approve → Full control) that governs money features independently of org role. Covered in the Budget & Expenses guide.'),
    BOLDLEAD('Default team — ', 'every organization has one team that cannot be deleted.'),

    // ---- 4. Step-by-step ----
    H1('4. Step-by-Step Guides'),
    H2('4.1 Invite a member'),
    STEP('steps0', 'Go to Dashboard → Members (or top bar → + Create → Invite member).'),
    STEP('steps0', 'Enter the email and choose the role: Member, Admin, or Guest. (No one can be invited as Owner.)'),
    STEP('steps0', 'Optional: pick a project to make it a project-scoped invite — choose the project role (Admin / Member / Viewer). The org role switches to Guest automatically, which is right for external people; raise it manually for internal staff.'),
    STEP('steps0', 'Send. The person has 7 days to accept. Anyone in the org can see the pending list; only Owners/Admins can revoke.'),
    H2('4.2 Accept an invitation (what the invitee experiences)'),
    STEP('steps1', 'Open the email link. Without an account, sign up first — using the exact same email address the invite was sent to.'),
    STEP('steps1', 'Verify the email, sign in, and accept. The organization becomes the person’s default workspace.'),
    STEP('steps1', 'If the link says it was sent to a different email, the person is signed in with another address — sign out and sign in with the invited one.'),
    H2('4.3 Change a role or remove a member'),
    STEP('steps2', 'Dashboard → Members. Owners/Admins see a role dropdown next to each member (except the Owner).'),
    STEP('steps2', 'Pick the new role (Admin / Member / Guest), or use Remove to take the person out of the organization.'),
    H2('4.4 Create a team and staff it'),
    STEP('steps3', 'Dashboard → Teams → create a team (Owner/Admin). The creator becomes its Lead.'),
    STEP('steps3', 'Add members by email. If the email already belongs to an org member, they are added at once; if not, an org invitation is sent instead — after they accept, add them to the team again (it is not automatic).'),
    STEP('steps3', 'Use the team’s Overview, Members, Board, Timeline, Goals, and Activity tabs for team-level planning.'),
    H2('4.5 Give someone access to a project'),
    STEP('steps4', 'Open the project → Settings → Members (or invite with a project-scoped invitation from the Members page).'),
    STEP('steps4', 'Choose the project role: Admin (manage the project, its members and settings, complete sprints), Member (work on issues), Viewer (read-only).'),
    STEP('steps4', 'Remember: for Private and Confidential projects this step is mandatory — org membership alone is not enough.'),

    // ---- 5. Rules ----
    H1('5. Rules the System Enforces (and Why)'),
    P('These are deliberate protections, not bugs.'),
    BOLDLEAD('The Owner cannot be demoted or removed. ', 'Every organization keeps exactly one ultimately responsible account. There is currently no ownership transfer — choose the Owner account deliberately at creation.'),
    BOLDLEAD('You cannot remove yourself. ', 'Prevents an organization from accidentally orphaning itself.'),
    BOLDLEAD('Invitations expire after 7 days and cannot be resent. ', 'Stale links die on their own. To try again: revoke the pending invitation, then send a fresh one — the system refuses a second invite while one is still pending.'),
    BOLDLEAD('The invited email must match the sign-in email exactly. ', 'Invitations are personal. This stops a forwarded invite email from letting the wrong person into a government workspace.'),
    BOLDLEAD('Confidential projects exclude even org Admins. ', 'Visibility is by explicit membership only — the strongest confidentiality level, designed for sensitive institutional work.'),
    BOLDLEAD('Only Owners/Admins change team Lead roles. ', 'Leads run the team day-to-day (add/remove members) but cannot promote themselves replacements — leadership changes stay an administrative decision.'),
    BOLDLEAD('Invitation links are stored only as cryptographic hashes. ', 'Even a database leak would not expose usable invitation links — part of the INSA security hardening.'),

    // ---- 6. FAQ ----
    H1('6. Troubleshooting & FAQ'),
    table([
      ['Question / symptom', 'Answer'],
      ['"I accepted the invite but I see no projects."', 'Most likely a Guest org role (the default for project-scoped invites) with no project memberships yet, or a plain org invite while all projects are Private/Confidential. Add the person to each project they need.'],
      ['"The invite says it was sent to a different email address."', 'The person is signed in with another account (personal vs work email). Sign out, sign in with the exact invited address, then accept.'],
      ['"I added someone to my team but they can’t open the team’s project."', 'Teams and projects are separate. Add them to the project too (project → Settings → Members).'],
      ['"I invited someone to my team and they never appeared in it."', 'If they weren’t an org member yet, the system sent an org invitation instead. After they accept, add them to the team again — that second step is manual.'],
      ['"The invitation expired — where is Resend?"', 'There is none. Revoke the expired/pending invite on the Members page, then send a new one.'],
      ['"I’m an org Admin but this project won’t open."', 'It is Confidential — explicit membership required even for Admins. Ask a member of that project (or its lead) to add you.'],
      ['"Why can’t I change or remove the Owner?"', 'By design — the Owner is permanent and there is no transfer feature yet. Plan the Owner account accordingly.'],
      ['"I’m a Team Lead but can’t promote another Lead."', 'Correct — role changes within a team are Owner/Admin actions. Leads manage membership, not leadership.'],
      ['"I can see the money pages but can’t approve expenses."', 'Budget access is a separate per-person level (default: No access). Approval needs the Approve level — see the Budget & Expenses guide.'],
    ], 3400, 5960),

    // ---- 7. Benefits ----
    H1('7. Why This Design — the Benefits'),
    H2('For teams'),
    B('Teams get their own board, goals, timeline, and activity view without affecting who can open which project.'),
    B('Self-service exit: anyone can leave a team themselves; no ticket needed.'),
    H2('For administrators'),
    B('One-step external onboarding: a project-scoped Guest invitation lands a partner inside exactly one project with the right role — nothing else visible.'),
    B('Clear separation of duties: project admins staff their projects, org admins govern the organization, and neither needs the other for daily work.'),
    H2('For government, NGO, and enterprise leadership'),
    B('Four visibility levels up to Confidential, where even administrators see nothing unless explicitly included — matching how sensitive files are handled on paper.'),
    B('Invitations are personal, expiring, and hash-protected; role changes are restricted to accountable administrators.'),
    B('People actions are designed into the organization audit-log catalogue (invitations, role changes, removals) for INSA-aligned reporting.'),

    // ---- 8. Under the hood ----
    H1('8. Under the Hood (Senior Support Reference)'),
    B('Org role hierarchy: OWNER > ADMIN > MEMBER > GUEST, enforced server-side on every membership-gated route. Owner/Admin are treated identically for nearly all administration.'),
    B('Project access resolution: PUBLIC/INTERNAL → any org member; PRIVATE → explicit member, project lead/owner, or org Owner/Admin; CONFIDENTIAL → explicit member or lead/owner only. Project roles are ADMIN > MEMBER > VIEWER; org Owner/Admin bypass project-role checks except on Confidential visibility.'),
    B('Invitations store only a token hash; acceptance requires a signed-in account whose email matches the invite (case-insensitive) and runs org-join + project-join in one transaction for project-scoped invites.'),
    B('Team operations: create/delete and Lead↔Member role changes are org Owner/Admin; member add/remove is Lead or Owner/Admin; self-removal is always allowed; the default team is undeletable; team deletion is a soft delete.'),
    B('Audit status (v1.0 accuracy note): the audit-log catalogue defines all people actions, but today entries are written for org/project settings changes and sprint actions; invitation, member, team, and project-member routes do not yet write audit entries. Do not promise member-action audit trails until that wiring ships.'),
    B('Actor identity in audit entries is denormalized (email and role at the time of action), so records stay meaningful even if the account is later deleted. IP addresses are stored encrypted.'),

    // ---- 9. Navigation map ----
    H1('9. Where Everything Lives'),
    table([
      ['I want to…', 'Go to'],
      ['Invite, see pending invites, change roles, remove members', 'Dashboard → Members'],
      ['Quick-invite from anywhere', 'Top bar → + Create → Invite member'],
      ['Create and manage teams (board, goals, timeline, activity)', 'Dashboard → Teams'],
      ['Add people to a specific project / set project roles', 'Project → Settings → Members'],
      ['View the organization audit log', 'Dashboard → Settings → Audit log (Owner/Admin)'],
      ['Set someone’s budget access level', 'Member settings — see the Budget & Expenses guide'],
    ], 4200, 5160),
  ],
});
