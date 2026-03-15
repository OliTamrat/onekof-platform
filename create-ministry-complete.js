const { PrismaClient } = require('./packages/database/node_modules/.prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🏛️ Setting up Ministry of Water & Irrigation...\n');

  try {
    // Get current user (you)
    const currentUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!currentUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`✅ Using user: ${currentUser.email}`);

    // 1. Create or find Ministry organization
    let ministry = await prisma.organization.findUnique({
      where: { slug: 'ministry-water-irrigation' }
    });

    if (ministry) {
      console.log(`✅ Ministry organization already exists`);
    } else {
      ministry = await prisma.organization.create({
        data: {
          name: 'Ministry of Water & Irrigation',
          slug: 'ministry-water-irrigation',
          schemaName: 'onekof_ministry_water',
          plan: 'ENTERPRISE',
          status: 'ACTIVE',
          maxMembers: 500,
          maxProjects: 100,
          maxStorage: 1000,
          preferredCalendar: 'ETHIOPIAN',
          primaryLanguage: 'AM',
          features: ['budget_management', 'public_transparency', 'audit_logs']
        }
      });
      console.log(`✅ Created Ministry organization`);
    }

    // 2. Add user as member if not already
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: ministry.id,
          userId: currentUser.id
        }
      }
    });

    if (!existingMember) {
      await prisma.organizationMember.create({
        data: {
          organizationId: ministry.id,
          userId: currentUser.id,
          role: 'OWNER',
          budgetAccess: 'FULL_CONTROL'
        }
      });
      console.log(`✅ Added you as organization owner with full budget access`);
    }

    // 3. Create or find Jira project
    let project = await prisma.project.findFirst({
      where: {
        organizationId: ministry.id,
        key: 'JIRA'
      }
    });

    if (project) {
      console.log(`✅ Jira Water Dam project already exists`);
    } else {
      project = await prisma.project.create({
        data: {
          organizationId: ministry.id,
          name: 'Jira Water Dam & Irrigation',
          key: 'JIRA',
          description: 'Major infrastructure project for the Jira Water Dam and irrigation system serving agricultural communities in Oromia region.',
          icon: '🌊',
          color: '#0EA5E9',
          leadId: currentUser.id,
          template: 'CUSTOM',
          status: 'ACTIVE',
          createdBy: currentUser.id
        }
      });
      console.log(`✅ Created Jira Water Dam project`);
    }

    // 4. Create budget
    let budget = await prisma.budget.findUnique({
      where: { projectId: project.id }
    });

    if (budget) {
      console.log(`✅ Budget already exists`);
    } else {
      budget = await prisma.budget.create({
        data: {
          projectId: project.id,
          totalBudget: 250000000,
          currency: 'ETB',
          status: 'ACTIVE',
          isPublic: true,
          fiscalYearStart: new Date('2026-07-08'),
          fiscalYearEnd: new Date('2031-07-07'),
          settings: {
            alertThresholds: [50, 75, 90, 95],
            requireApprovalAbove: 1000000
          },
          createdBy: currentUser.id
        }
      });
      console.log(`✅ Created budget: 250,000,000 ETB`);
    }

    // 5. Create budget categories
    const existingCategories = await prisma.budgetCategory.count({
      where: { budgetId: budget.id }
    });

    if (existingCategories === 0) {
      const categories = [
        { name: 'Personnel & Salaries', code: '5210', allocatedAmount: 25000000, order: 1 },
        { name: 'Construction & Infrastructure', code: '5220', allocatedAmount: 150000000, order: 2 },
        { name: 'Equipment & Machinery', code: '5230', allocatedAmount: 30000000, order: 3 },
        { name: 'Environmental & Social Impact', code: '5240', allocatedAmount: 20000000, order: 4 },
        { name: 'Project Management', code: '5250', allocatedAmount: 15000000, order: 5 },
        { name: 'Contingency', code: '5260', allocatedAmount: 10000000, order: 6 }
      ];

      for (const cat of categories) {
        await prisma.budgetCategory.create({
          data: { ...cat, budgetId: budget.id, currency: 'ETB' }
        });
      }
      console.log(`✅ Created 6 budget categories`);
    } else {
      console.log(`✅ Budget categories already exist`);
    }

    // 6. Create sample expenses
    const existingExpenses = await prisma.expense.count({
      where: { budgetId: budget.id }
    });

    if (existingExpenses === 0) {
      const cats = await prisma.budgetCategory.findMany({
        where: { budgetId: budget.id }
      });

      const construction = cats.find(c => c.code === '5220');
      const personnel = cats.find(c => c.code === '5210');
      const equipment = cats.find(c => c.code === '5230');

      const expenses = [
        {
          categoryId: construction?.id,
          description: 'Dam Foundation Excavation - Phase 1',
          amount: 12500000,
          status: 'PAID',
          transactionDate: new Date('2026-01-10')
        },
        {
          categoryId: construction?.id,
          description: 'Concrete Supply - Batch 1',
          amount: 8750000,
          status: 'APPROVED',
          transactionDate: new Date('2026-02-05')
        },
        {
          categoryId: personnel?.id,
          description: 'January 2026 - Staff Salaries',
          amount: 850000,
          status: 'PAID',
          transactionDate: new Date('2026-01-15')
        },
        {
          categoryId: equipment?.id,
          description: 'Heavy Excavator Rental',
          amount: 2100000,
          status: 'PAID',
          transactionDate: new Date('2026-01-05')
        }
      ];

      for (const exp of expenses) {
        await prisma.expense.create({
          data: {
            ...exp,
            budgetId: budget.id,
            currency: 'ETB',
            type: 'ACTUAL',
            submittedBy: currentUser.id,
            approvedBy: exp.status === 'PAID' || exp.status === 'APPROVED' ? currentUser.id : null,
            approvedAt: exp.status === 'PAID' || exp.status === 'APPROVED' ? new Date() : null,
            paymentStatus: exp.status === 'PAID' ? 'PAID' : 'UNPAID',
            paidDate: exp.status === 'PAID' ? new Date() : null
          }
        });
      }
      console.log(`✅ Created 4 sample expenses (24.2M ETB)`);
    } else {
      console.log(`✅ Sample expenses already exist`);
    }

    // Summary
    const totalExpenses = await prisma.expense.aggregate({
      where: { budgetId: budget.id },
      _sum: { amount: true }
    });

    const spent = Number(totalExpenses._sum.amount || 0);
    const utilization = ((spent / 250000000) * 100).toFixed(2);

    console.log('\n✨ SETUP COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   Organization: ${ministry.name}`);
    console.log(`   Project: ${project.name} (${project.key})`);
    console.log(`   Budget: 250,000,000 ETB`);
    console.log(`   Spent: ${spent.toLocaleString()} ETB (${utilization}%)`);
    console.log(`\n🔗 Access your budget dashboard at:`);
    console.log(`   http://localhost:3000/projects/${project.id}/budget\n`);

    return { projectId: project.id, budgetId: budget.id };

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

main()
  .then((result) => {
    console.log('✅ Script completed successfully\n');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Script failed\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
