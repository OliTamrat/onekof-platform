/**
 * Creates reviewer@onekof.com with a sample Ethiopian government organization.
 * Run from monorepo root: node setup-reviewer-account.js
 */
const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');

const prisma = new PrismaClient();
const REVIEWER_EMAIL = 'reviewer@onekof.com';
const REVIEWER_PASS = ['ReviewOnekof', '2026', String.fromCharCode(33)].join('');

async function main() {
  console.log('Setting up reviewer account...\n');

  // ── 1. Create reviewer user ──────────────────────────────────────────────
  const hashed = await bcrypt.hash(REVIEWER_PASS, 12);
  let reviewer = await prisma.user.findUnique({ where: { email: REVIEWER_EMAIL } });
  if (reviewer) {
    reviewer = await prisma.user.update({
      where: { email: REVIEWER_EMAIL },
      data: { password: hashed, emailVerified: new Date(), name: 'App Store Reviewer' },
    });
    console.log('✓ Reviewer user updated');
  } else {
    reviewer = await prisma.user.create({
      data: {
        email: REVIEWER_EMAIL,
        name: 'App Store Reviewer',
        password: hashed,
        emailVerified: new Date(),
      },
    });
    console.log('✓ Reviewer user created:', reviewer.id);
  }

  // ── 2. Create sample team members ────────────────────────────────────────
  const memberDefs = [
    { email: 'tigist.bekele@mowr.gov.et', name: 'Tigist Bekele' },
    { email: 'dawit.haile@mowr.gov.et',  name: 'Dawit Haile'   },
    { email: 'sara.tesfaye@mowr.gov.et', name: 'Sara Tesfaye'  },
  ];
  const memberPw = await bcrypt.hash('Demo2026pass', 10);
  const members = [];
  for (const m of memberDefs) {
    let u = await prisma.user.findUnique({ where: { email: m.email } });
    if (!u) {
      u = await prisma.user.create({
        data: { email: m.email, name: m.name, password: memberPw, emailVerified: new Date() },
      });
    }
    members.push(u);
  }
  console.log('✓ Team members ready');

  // ── 3. Create or find the demo organization ───────────────────────────────
  let org = await prisma.organization.findUnique({ where: { slug: 'mowr-ethiopia' } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Ministry of Water Resources',
        slug: 'mowr-ethiopia',
        schemaName: 'onekof_org_mowr_ethiopia',
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        type: 'government',
        department: 'Water & Energy',
        primaryLanguage: 'AM',
        maxMembers: 50,
        maxProjects: 20,
        maxStorage: 20,
      },
    });
    console.log('✓ Organization created:', org.name);
  } else {
    console.log('✓ Organization already exists:', org.name);
  }

  // ── 4. Add all users as org members ──────────────────────────────────────
  const addMember = async (userId, role, budgetAccess) => {
    const exists = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: org.id, userId } },
    });
    if (!exists) {
      await prisma.organizationMember.create({
        data: { organizationId: org.id, userId, role, budgetAccess },
      });
    }
  };
  await addMember(reviewer.id, 'ADMIN', 'VIEW_ONLY');
  await addMember(members[0].id, 'ADMIN', 'APPROVE');
  await addMember(members[1].id, 'MEMBER', 'EDIT');
  await addMember(members[2].id, 'MEMBER', 'VIEW_ONLY');
  console.log('✓ Members added to organization');

  // ── 5. Create Team ────────────────────────────────────────────────────────
  let team = await prisma.team.findFirst({ where: { organizationId: org.id, deletedAt: null } });
  if (!team) {
    team = await prisma.team.create({
      data: {
        organizationId: org.id,
        name: 'Infrastructure Team',
        description: 'Responsible for water infrastructure projects across Ethiopia',
        icon: '💧',
        color: '#1C8C7D',
        createdBy: reviewer.id,
        members: {
          create: [
            { userId: reviewer.id,   role: 'LEAD', addedBy: reviewer.id },
            { userId: members[0].id, role: 'MEMBER', addedBy: reviewer.id },
            { userId: members[1].id, role: 'MEMBER', addedBy: reviewer.id },
          ],
        },
      },
    });
  }
  console.log('✓ Team created');

  // ── 6. Create Projects ────────────────────────────────────────────────────
  const projectDefs = [
    {
      name: 'Addis Ababa Water Supply Expansion',
      key: 'AAWS',
      description: 'Expand water supply infrastructure to underserved areas of Addis Ababa',
      icon: '🚰',
      color: '#1C8C7D',
      status: 'ACTIVE',
      priority: 'HIGH',
      type: 'CONSTRUCTION',
      entityType: 'GOVERNMENT',
      department: 'Urban Water Supply',
      startDate: new Date('2026-01-01'),
      dueDate: new Date('2026-12-31'),
    },
    {
      name: 'Awash River Basin Management',
      key: 'ARBM',
      description: 'Sustainable management of the Awash River basin resources',
      icon: '🌊',
      color: '#0065FF',
      status: 'ACTIVE',
      priority: 'CRITICAL',
      type: 'RESEARCH',
      entityType: 'GOVERNMENT',
      department: 'River Basin Authority',
      startDate: new Date('2025-07-01'),
      dueDate: new Date('2027-06-30'),
    },
    {
      name: 'Rural Borehole Drilling Program',
      key: 'RBDP',
      description: 'Drill 500 boreholes in rural communities across Oromia and SNNPR',
      icon: '⛏️',
      color: '#FF8B00',
      status: 'ACTIVE',
      priority: 'HIGH',
      type: 'CONSTRUCTION',
      entityType: 'GOVERNMENT',
      department: 'Rural Water Supply',
      startDate: new Date('2026-02-01'),
      dueDate: new Date('2026-10-31'),
    },
  ];

  const projects = [];
  for (const pd of projectDefs) {
    let proj = await prisma.project.findFirst({
      where: { organizationId: org.id, key: pd.key, deletedAt: null },
    });
    if (!proj) {
      proj = await prisma.project.create({
        data: {
          organizationId: org.id,
          name: pd.name,
          key: pd.key,
          description: pd.description,
          icon: pd.icon,
          color: pd.color,
          status: pd.status,
          priority: pd.priority,
          type: pd.type,
          entityType: pd.entityType,
          department: pd.department,
          startDate: pd.startDate,
          dueDate: pd.dueDate,
          createdBy: reviewer.id,
          leadId: members[0].id,
          ownerId: reviewer.id,
          members: {
            create: [
              { userId: reviewer.id,   role: 'ADMIN',  addedBy: reviewer.id },
              { userId: members[0].id, role: 'ADMIN',  addedBy: reviewer.id },
              { userId: members[1].id, role: 'MEMBER', addedBy: reviewer.id },
              { userId: members[2].id, role: 'VIEWER', addedBy: reviewer.id },
            ],
          },
        },
      });
    }
    projects.push(proj);
  }
  console.log('✓ Projects created');

  // ── 7. Create Issues / Tasks ──────────────────────────────────────────────
  const taskDefs = [
    // Project 0 — AAWS
    { proj: 0, key: 'AAWS-1', title: 'Conduct feasibility study for Zone 5 pipeline', status: 'DONE',        priority: 'HIGH',    type: 'TASK',  assignee: 0 },
    { proj: 0, key: 'AAWS-2', title: 'Procure 12-inch HDPE pipes (15,000 meters)',    status: 'IN_PROGRESS', priority: 'HIGHEST', type: 'TASK',  assignee: 1 },
    { proj: 0, key: 'AAWS-3', title: 'Environmental impact assessment — Subcity 7',   status: 'IN_REVIEW',   priority: 'HIGH',    type: 'TASK',  assignee: 0 },
    { proj: 0, key: 'AAWS-4', title: 'Hire 3 licensed civil engineers for site work', status: 'TODO',        priority: 'MEDIUM',  type: 'TASK',  assignee: 2 },
    { proj: 0, key: 'AAWS-5', title: 'Q1 progress report to Ministry HQ',             status: 'DONE',        priority: 'MEDIUM',  type: 'TASK',  assignee: 0 },
    { proj: 0, key: 'AAWS-6', title: 'Community consultation — Yeka subcity',         status: 'TODO',        priority: 'LOW',     type: 'STORY', assignee: 2 },
    // Project 1 — ARBM
    { proj: 1, key: 'ARBM-1', title: 'Install 8 hydrological monitoring stations',    status: 'IN_PROGRESS', priority: 'HIGHEST', type: 'TASK',  assignee: 1 },
    { proj: 1, key: 'ARBM-2', title: 'Water quality sampling — Awash upper reach',    status: 'DONE',        priority: 'HIGH',    type: 'TASK',  assignee: 0 },
    { proj: 1, key: 'ARBM-3', title: 'Publish basin assessment report — Phase 1',     status: 'IN_REVIEW',   priority: 'HIGH',    type: 'TASK',  assignee: 0 },
    { proj: 1, key: 'ARBM-4', title: 'Bug: Monitoring dashboard data sync failure',   status: 'TODO',        priority: 'HIGHEST', type: 'BUG',   assignee: 1 },
    { proj: 1, key: 'ARBM-5', title: 'Stakeholder workshop — Oromia Regional State',  status: 'BACKLOG',     priority: 'MEDIUM',  type: 'TASK',  assignee: 2 },
    // Project 2 — RBDP
    { proj: 2, key: 'RBDP-1', title: 'Site selection — 120 borehole locations',       status: 'DONE',        priority: 'HIGH',    type: 'TASK',  assignee: 0 },
    { proj: 2, key: 'RBDP-2', title: 'Drill boreholes — Batch 1 (40 sites)',          status: 'IN_PROGRESS', priority: 'HIGHEST', type: 'TASK',  assignee: 1 },
    { proj: 2, key: 'RBDP-3', title: 'Procure water pumps and solar panels',          status: 'IN_REVIEW',   priority: 'HIGH',    type: 'TASK',  assignee: 0 },
    { proj: 2, key: 'RBDP-4', title: 'Train community water committees (40 groups)',   status: 'TODO',        priority: 'MEDIUM',  type: 'STORY', assignee: 2 },
  ];

  for (const td of taskDefs) {
    const proj = projects[td.proj];
    const exists = await prisma.task.findFirst({ where: { projectId: proj.id, key: td.key } });
    if (!exists) {
      await prisma.task.create({
        data: {
          projectId:  proj.id,
          key:        td.key,
          title:      td.title,
          status:     td.status,
          priority:   td.priority,
          type:       td.type,
          assigneeId: members[td.assignee].id,
          reporterId: reviewer.id,
          dueDate:    new Date(Date.now() + (td.proj + 1) * 30 * 24 * 60 * 60 * 1000),
          completedAt: td.status === 'DONE' ? new Date() : null,
        },
      });
    }
  }
  console.log('✓ Issues/tasks created');

  // ── 8. Create Budget ──────────────────────────────────────────────────────
  let budget = await prisma.budget.findUnique({ where: { projectId: projects[0].id } });
  if (!budget) {
    budget = await prisma.budget.create({
      data: {
        projectId:   projects[0].id,
        totalBudget: 45000000,
        currency:    'ETB',
        status:      'ACTIVE',
        createdBy:   reviewer.id,
        approvedBy:  reviewer.id,
        approvedAt:  new Date('2026-01-15'),
        fiscalYearStart: new Date('2026-01-01'),
        fiscalYearEnd:   new Date('2026-12-31'),
        categories: {
          create: [
            { name: 'Civil Works',         allocatedAmount: 25000000, currency: 'ETB', order: 1 },
            { name: 'Materials & Equipment', allocatedAmount: 12000000, currency: 'ETB', order: 2 },
            { name: 'Consultancy',          allocatedAmount: 4000000,  currency: 'ETB', order: 3 },
            { name: 'Community Engagement', allocatedAmount: 2000000,  currency: 'ETB', order: 4 },
            { name: 'Contingency',          allocatedAmount: 2000000,  currency: 'ETB', order: 5 },
          ],
        },
      },
      include: { categories: true },
    });

    // Add some expenses
    const catCivil = budget.categories.find(c => c.name === 'Civil Works');
    const catMat   = budget.categories.find(c => c.name === 'Materials & Equipment');
    if (catCivil && catMat) {
      await prisma.expense.createMany({
        data: [
          {
            budgetId: budget.id, categoryId: catCivil.id,
            description: 'Excavation works — Zone 5 main pipeline', amount: 3200000,
            currency: 'ETB', type: 'ACTUAL', status: 'APPROVED', paymentStatus: 'PAID',
            transactionDate: new Date('2026-02-10'), vendor: 'Abay Construction PLC',
            submittedBy: members[1].id, approvedBy: reviewer.id, approvedAt: new Date('2026-02-12'),
          },
          {
            budgetId: budget.id, categoryId: catMat.id,
            description: 'HDPE pipes — 5,000m batch delivery', amount: 1875000,
            currency: 'ETB', type: 'ACTUAL', status: 'APPROVED', paymentStatus: 'PAID',
            transactionDate: new Date('2026-03-01'), vendor: 'Ethiopian Plastics Factory',
            submittedBy: members[1].id, approvedBy: reviewer.id, approvedAt: new Date('2026-03-03'),
          },
          {
            budgetId: budget.id, categoryId: catCivil.id,
            description: 'Pump station foundation — Subcity 7', amount: 980000,
            currency: 'ETB', type: 'COMMITTED', status: 'PENDING', paymentStatus: 'UNPAID',
            transactionDate: new Date('2026-04-15'), vendor: 'Nile Engineering',
            submittedBy: members[1].id,
          },
        ],
      });
    }
  }
  console.log('✓ Budget and expenses created');

  // ── 9. Create Goals ───────────────────────────────────────────────────────
  const goalExists = await prisma.goal.findFirst({ where: { organizationId: org.id, deletedAt: null } });
  if (!goalExists) {
    await prisma.goal.create({
      data: {
        organizationId: org.id,
        title: 'Increase clean water access to 2M citizens by Dec 2026',
        description: 'Expand safe water access across Addis Ababa and surrounding regions through infrastructure investment',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        progress: 38,
        ownerId: reviewer.id,
        teamId: team.id,
        startDate: new Date('2026-01-01'),
        dueDate:   new Date('2026-12-31'),
        createdBy: reviewer.id,
        keyResults: {
          create: [
            { description: 'Complete Zone 5 pipeline (15,000m)', unit: 'meters', target: 15000, current: 5800 },
            { description: 'Drill rural boreholes',              unit: 'boreholes', target: 500, current: 40 },
            { description: 'Beneficiary households connected',   unit: 'households', target: 200000, current: 76000 },
          ],
        },
      },
    });

    await prisma.goal.create({
      data: {
        organizationId: org.id,
        title: 'Achieve ISO 14001 environmental certification',
        description: 'Demonstrate environmental management compliance across all water projects',
        status: 'NOT_STARTED',
        priority: 'HIGH',
        progress: 0,
        ownerId: members[0].id,
        startDate: new Date('2026-06-01'),
        dueDate:   new Date('2026-12-31'),
        createdBy: reviewer.id,
        keyResults: {
          create: [
            { description: 'Complete environmental audits',     unit: 'audits',   target: 5,   current: 0 },
            { description: 'Train staff on ISO procedures',     unit: 'staff',    target: 120, current: 0 },
          ],
        },
      },
    });
  }
  console.log('✓ Goals created');

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n✅ Reviewer account fully set up!');
  console.log('   Email:    reviewer@onekof.com');
  console.log('   Org:      Ministry of Water Resources');
  console.log('   Role:     ADMIN');
  console.log('   Projects: 3 (AAWS, ARBM, RBDP)');
  console.log('   Issues:   15');
  console.log('   Budget:   45,000,000 ETB with expenses');
  console.log('   Goals:    2 with key results');
}

main()
  .catch((e) => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
