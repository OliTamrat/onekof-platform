/**
 * Creates a store reviewer demo account with pre-populated data
 * Run: node create-reviewer-account.js
 */
const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'reviewer@onekof.com';
  const password = 'ReviewOnekof2026!';
  const hashedPassword = await bcrypt.hash(password, 12);

  // 1. Upsert reviewer user
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      name: 'App Reviewer',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });
  console.log('User:', user.email);

  // 2. Upsert demo organization
  let org = await prisma.organization.findFirst({ where: { slug: 'reviewer-demo' } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Onekof Demo',
        slug: 'reviewer-demo',
        plan: 'PROFESSIONAL',
        schemaName: 'onekof_org_reviewer_demo',
      },
    });
  }
  console.log('Org:', org.name);

  // 3. Add user as OWNER
  const existing = await prisma.organizationMember.findFirst({
    where: { userId: user.id, organizationId: org.id },
  });
  if (existing) {
    await prisma.organizationMember.update({
      where: { id: existing.id },
      data: { role: 'OWNER' },
    });
  } else {
    await prisma.organizationMember.create({
      data: { userId: user.id, organizationId: org.id, role: 'OWNER' },
    });
  }

  // 4. Create demo project
  let project = await prisma.project.findFirst({ where: { organizationId: org.id, key: 'DEMO' } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Mobile App Launch',
        key: 'DEMO',
        description: 'Planning and execution of the Onekof mobile app launch across Ethiopia.',
        organizationId: org.id,
        ownerId: user.id,
        createdBy: user.id,
        status: 'ACTIVE',
        color: '#1C8C7D',
      },
    });
  }
  console.log('Project:', project.name);

  // 5. Create sample issues
  const issueData = [
    { title: 'Design onboarding flow for new users', status: 'DONE',        priority: 'HIGH',    type: 'STORY' },
    { title: 'Integrate push notification service',   status: 'DONE',        priority: 'HIGH',    type: 'TASK'  },
    { title: 'Add biometric authentication lock',     status: 'DONE',        priority: 'MEDIUM',  type: 'STORY' },
    { title: 'AI receipt scanner — Phase 1',          status: 'IN_REVIEW',   priority: 'HIGH',    type: 'STORY' },
    { title: 'App Store submission checklist',        status: 'IN_PROGRESS', priority: 'HIGHEST', type: 'TASK'  },
    { title: 'Localize app into 5 languages',         status: 'DONE',        priority: 'HIGH',    type: 'TASK'  },
    { title: 'Performance audit — dashboard load',    status: 'TODO',        priority: 'MEDIUM',  type: 'BUG'   },
    { title: 'Screenshot preparation for stores',     status: 'TODO',        priority: 'HIGH',    type: 'TASK'  },
    { title: 'Set up Firebase Cloud Messaging',       status: 'DONE',        priority: 'HIGH',    type: 'TASK'  },
    { title: 'Write Privacy Policy and Terms pages',  status: 'DONE',        priority: 'MEDIUM',  type: 'TASK'  },
    { title: 'Implement offline session caching',     status: 'DONE',        priority: 'MEDIUM',  type: 'STORY' },
    { title: 'Document AI confidence scoring logic',  status: 'BACKLOG',     priority: 'LOW',     type: 'TASK'  },
  ];

  for (const [i, data] of issueData.entries()) {
    const existing = await prisma.task.findFirst({
      where: { projectId: project.id, title: data.title },
    });
    if (!existing) {
      await prisma.task.create({
        data: {
          ...data,
          key: `DEMO-${i + 1}`,
          projectId: project.id,
          reporterId: user.id,
          assigneeId: user.id,
          dueDate: new Date(Date.now() + (i % 3 === 0 ? -5 : 14) * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log('Issues: created');

  console.log('Budget: skipped (model may differ)');

  console.log('\n=== REVIEWER CREDENTIALS ===');
  console.log('Email:    reviewer@onekof.com');
  console.log('Password: ReviewOnekof2026!');
  console.log('Org:      Onekof Demo (reviewer-demo)');
  console.log('============================\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
