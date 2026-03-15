const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🌊 Creating comprehensive sample data for Jira Water Dam project...\n');

  // Get the Ministry organization and Jira project
  const ministry = await prisma.organization.findUnique({
    where: { slug: 'ministry-water-irrigation' },
    include: {
      projects: {
        where: { key: 'JIRA' }
      }
    }
  });

  if (!ministry || !ministry.projects[0]) {
    console.log('❌ Ministry or Jira project not found!');
    return;
  }

  const project = ministry.projects[0];
  console.log(`✅ Found project: ${project.name} (${project.key})\n`);

  // Get admin user
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@ministryofwater.et' }
  });

  if (!admin) {
    console.log('❌ Admin user not found!');
    return;
  }

  // Step 1: Create team members
  console.log('👥 Creating team members...');

  const teamMembers = [
    {
      email: 'projectmanager@ministryofwater.et',
      name: 'Ahmed Hassan',
      role: 'Project Manager',
      department: 'Engineering',
      memberRole: 'ADMIN',
      budgetAccess: 'APPROVE'
    },
    {
      email: 'chiefengineer@ministryofwater.et',
      name: 'Fatima Mohammed',
      role: 'Chief Engineer',
      department: 'Engineering',
      memberRole: 'MEMBER',
      budgetAccess: 'EDIT'
    },
    {
      email: 'financeofficer@ministryofwater.et',
      name: 'Yohannes Tesfaye',
      role: 'Finance Officer',
      department: 'Finance',
      memberRole: 'MEMBER',
      budgetAccess: 'FULL_CONTROL'
    },
    {
      email: 'environmental@ministryofwater.et',
      name: 'Sara Ibrahim',
      role: 'Environmental Specialist',
      department: 'Environmental',
      memberRole: 'MEMBER',
      budgetAccess: 'VIEW_ONLY'
    },
    {
      email: 'procurement@ministryofwater.et',
      name: 'Dawit Kebede',
      role: 'Procurement Officer',
      department: 'Procurement',
      memberRole: 'MEMBER',
      budgetAccess: 'EDIT'
    }
  ];

  const createdUsers = [];
  for (const member of teamMembers) {
    let user = await prisma.user.findUnique({
      where: { email: member.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: member.email,
          name: member.name,
          timezone: 'Africa/Addis_Ababa',
          language: 'AM'
        }
      });
      console.log(`  ✓ Created user: ${user.name} (${user.email})`);
    }

    // Add to organization
    const orgMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: ministry.id,
          userId: user.id
        }
      }
    });

    if (!orgMember) {
      await prisma.organizationMember.create({
        data: {
          organizationId: ministry.id,
          userId: user.id,
          role: member.memberRole === 'ADMIN' ? 'ADMIN' : 'MEMBER',
          budgetAccess: member.budgetAccess
        }
      });
    }

    // Add to project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: user.id
        }
      }
    });

    if (!projectMember) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: user.id,
          role: member.memberRole,
          budgetAccess: member.budgetAccess,
          addedBy: admin.id
        }
      });
      console.log(`  ✓ Added ${user.name} to project as ${member.memberRole}`);
    }

    createdUsers.push({ ...member, userId: user.id });
  }

  // Delete existing tasks first
  await prisma.task.deleteMany({ where: { projectId: project.id } });

  // Step 2: Create Tasks
  console.log('\n📋 Creating project tasks...');

  const tasks = [
    {
      title: 'Initial site survey and geological assessment',
      description: 'Conduct comprehensive geological survey of the dam site to assess soil composition, rock formation, and seismic activity.',
      type: 'TASK',
      status: 'DONE',
      priority: 'HIGHEST',
      assigneeEmail: 'chiefengineer@ministryofwater.et',
      estimate: 160, // hours
      dueDate: new Date('2026-02-15')
    },
    {
      title: 'Environmental impact assessment study',
      description: 'Complete environmental impact study covering wildlife, vegetation, water quality, and ecosystem effects.',
      type: 'TASK',
      status: 'DONE',
      priority: 'HIGHEST',
      assigneeEmail: 'environmental@ministryofwater.et',
      estimate: 320,
      dueDate: new Date('2026-02-28')
    },
    {
      title: 'Community consultation and resettlement planning',
      description: 'Engage with local communities, plan resettlement programs, and establish compensation frameworks.',
      type: 'EPIC',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeEmail: 'projectmanager@ministryofwater.et',
      estimate: 240,
      dueDate: new Date('2026-04-30')
    },
    {
      title: 'Procure heavy construction equipment',
      description: 'Tender process for excavators, bulldozers, cranes, and concrete mixing equipment.',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeEmail: 'procurement@ministryofwater.et',
      estimate: 80,
      dueDate: new Date('2026-05-15')
    },
    {
      title: 'Dam foundation excavation phase 1',
      description: 'Begin excavation work for the dam foundation, targeting 15,000 cubic meters of earth removal.',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeEmail: 'chiefengineer@ministryofwater.et',
      estimate: 400,
      dueDate: new Date('2026-06-30')
    },
    {
      title: 'Budget review for Q2 expenses',
      description: 'Review all Q2 expenditures, verify receipts, and prepare financial report for ministry review.',
      type: 'TASK',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      assigneeEmail: 'financeofficer@ministryofwater.et',
      estimate: 40,
      dueDate: new Date('2026-04-10')
    },
    {
      title: 'Design irrigation canal network',
      description: 'Engineering design for the irrigation canal system covering 500,000 hectares.',
      type: 'STORY',
      status: 'TODO',
      priority: 'HIGH',
      assigneeEmail: 'chiefengineer@ministryofwater.et',
      estimate: 200,
      dueDate: new Date('2026-07-31')
    },
    {
      title: 'Water quality monitoring setup',
      description: 'Install automated water quality sensors and establish baseline measurements.',
      type: 'TASK',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeEmail: 'environmental@ministryofwater.et',
      estimate: 60,
      dueDate: new Date('2026-05-30')
    },
    {
      title: 'Safety protocol training for construction workers',
      description: 'Mandatory safety training covering equipment operation, emergency procedures, and PPE usage.',
      type: 'TASK',
      status: 'TODO',
      priority: 'HIGHEST',
      assigneeEmail: 'projectmanager@ministryofwater.et',
      estimate: 24,
      dueDate: new Date('2026-04-20')
    },
    {
      title: 'Fix budget tracking discrepancy in construction category',
      description: 'Investigate 2.5M ETB discrepancy between reported and actual construction expenses.',
      type: 'BUG',
      status: 'IN_REVIEW',
      priority: 'HIGHEST',
      assigneeEmail: 'financeofficer@ministryofwater.et',
      estimate: 16,
      dueDate: new Date('2026-04-05')
    }
  ];

  let taskNumber = 1;
  for (const task of tasks) {
    const assignee = createdUsers.find(u => u.email === task.assigneeEmail);

    const taskKey = `${project.key}-${taskNumber}`;
    taskNumber++;

    const createdTask = await prisma.task.create({
      data: {
        key: taskKey,
        title: task.title,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        projectId: project.id,
        reporterId: admin.id,
        assigneeId: assignee?.userId || admin.id,
        estimate: task.estimate,
        dueDate: task.dueDate
      }
    });

    console.log(`  ✓ ${taskKey}: ${task.title}`);
  }

  // Step 3: Create Budget Expenses with various statuses
  console.log('\n💸 Creating budget expenses...');

  const budget = await prisma.budget.findFirst({
    where: { projectId: project.id },
    include: { categories: true }
  });

  if (!budget) {
    console.log('❌ Budget not found!');
    return;
  }

  const personnelCat = budget.categories.find(c => c.name.includes('Personnel'));
  const constructionCat = budget.categories.find(c => c.name.includes('Construction'));
  const equipmentCat = budget.categories.find(c => c.name.includes('Equipment'));
  const environmentalCat = budget.categories.find(c => c.name.includes('Environmental'));
  const managementCat = budget.categories.find(c => c.name.includes('Management'));

  const expenses = [
    {
      categoryId: personnelCat?.id,
      description: 'Q1 Engineering team salaries and benefits',
      amount: 5000000,
      status: 'APPROVED',
      submittedBy: createdUsers.find(u => u.email === 'financeofficer@ministryofwater.et')?.userId,
      date: new Date('2026-01-15'),
      receiptUrl: 'payroll-q1-2026.pdf'
    },
    {
      categoryId: constructionCat?.id,
      description: 'Dam foundation excavation - Phase 1',
      amount: 45000000,
      status: 'APPROVED',
      submittedBy: createdUsers.find(u => u.email === 'procurement@ministryofwater.et')?.userId,
      date: new Date('2026-01-20'),
      receiptUrl: 'construction-invoice-001.pdf'
    },
    {
      categoryId: equipmentCat?.id,
      description: 'Heavy machinery procurement (excavators x3)',
      amount: 12000000,
      status: 'PENDING',
      submittedBy: createdUsers.find(u => u.email === 'procurement@ministryofwater.et')?.userId,
      date: new Date('2026-02-01')
    },
    {
      categoryId: environmentalCat?.id,
      description: 'Environmental impact assessment study',
      amount: 8000000,
      status: 'APPROVED',
      submittedBy: createdUsers.find(u => u.email === 'environmental@ministryofwater.et')?.userId,
      date: new Date('2026-01-10'),
      receiptUrl: 'env-assessment-invoice.pdf'
    },
    {
      categoryId: managementCat?.id,
      description: 'Project management consulting Q1',
      amount: 3500000,
      status: 'APPROVED',
      submittedBy: createdUsers.find(u => u.email === 'projectmanager@ministryofwater.et')?.userId,
      date: new Date('2026-01-25'),
      receiptUrl: 'consulting-q1.pdf'
    },
    {
      categoryId: constructionCat?.id,
      description: 'Concrete materials bulk order',
      amount: 25000000,
      status: 'PENDING',
      submittedBy: createdUsers.find(u => u.email === 'procurement@ministryofwater.et')?.userId,
      date: new Date('2026-02-15')
    },
    {
      categoryId: personnelCat?.id,
      description: 'Q1 Construction crew wages',
      amount: 7500000,
      status: 'APPROVED',
      submittedBy: createdUsers.find(u => u.email === 'financeofficer@ministryofwater.et')?.userId,
      date: new Date('2026-02-01'),
      receiptUrl: 'wages-q1-construction.pdf'
    },
    {
      categoryId: environmentalCat?.id,
      description: 'Water quality monitoring equipment',
      amount: 1200000,
      status: 'REJECTED',
      submittedBy: createdUsers.find(u => u.email === 'environmental@ministryofwater.et')?.userId,
      date: new Date('2026-02-10'),
      rejectionReason: 'Awaiting environmental clearance certificate'
    },
    {
      categoryId: equipmentCat?.id,
      description: 'Safety equipment and PPE for 200 workers',
      amount: 800000,
      status: 'APPROVED',
      submittedBy: createdUsers.find(u => u.email === 'projectmanager@ministryofwater.et')?.userId,
      date: new Date('2026-02-05'),
      receiptUrl: 'safety-equipment.pdf'
    },
    {
      categoryId: managementCat?.id,
      description: 'Site office setup and facilities',
      amount: 2000000,
      status: 'APPROVED',
      submittedBy: createdUsers.find(u => u.email === 'projectmanager@ministryofwater.et')?.userId,
      date: new Date('2026-01-05'),
      receiptUrl: 'office-setup.pdf'
    }
  ];

  for (const expense of expenses) {
    if (!expense.categoryId) continue;

    const created = await prisma.expense.create({
      data: {
        budgetId: budget.id,
        categoryId: expense.categoryId,
        description: expense.description,
        amount: expense.amount,
        status: expense.status,
        transactionDate: expense.date,
        receiptUrl: expense.receiptUrl,
        rejectionReason: expense.rejectionReason,
        submittedBy: expense.submittedBy || admin.id,
        approvedBy: expense.status === 'APPROVED' ? admin.id : null,
        approvedAt: expense.status === 'APPROVED' ? new Date() : null
      }
    });

    console.log(`  ✓ ${created.description}: ${created.amount.toLocaleString()} ETB [${created.status}]`);
  }

  console.log('\n✅ SUCCESS! Comprehensive sample data created!\n');
  console.log('📊 Summary:');
  console.log(`   Project: ${project.name}`);
  console.log(`   Team Members: ${teamMembers.length}`);
  console.log(`   Tasks: ${tasks.length}`);
  console.log(`   Expenses: ${expenses.length}`);
  console.log(`   Budget Categories: ${budget.categories.length}`);
  console.log('\n🌐 View at: http://localhost:3000/projects/' + project.id + '/board\n');

  await prisma.$disconnect();
}

main();
