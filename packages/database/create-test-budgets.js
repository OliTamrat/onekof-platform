const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('💰 Creating test budgets for existing projects...\n');

  try {
    // Get all projects
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null
      },
      include: {
        budget: true, // Check if budget already exists
        members: {
          where: {
            role: 'ADMIN'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`📊 Found ${projects.length} projects\n`);

    if (projects.length === 0) {
      console.log('❌ No projects found. Please create some projects first.');
      return;
    }

    // Display projects
    console.log('Available projects:');
    projects.forEach((project, index) => {
      const hasBudget = project.budget ? '✓' : '✗';
      console.log(`${index + 1}. [${hasBudget}] ${project.name} (${project.key})`);
    });

    // Select 2 projects without budgets (or first 2 if all have budgets)
    const projectsWithoutBudget = projects.filter(p => !p.budget);
    const selectedProjects = projectsWithoutBudget.slice(0, 2);

    if (selectedProjects.length < 2) {
      // If less than 2 without budgets, add some that have budgets (will update them)
      const additionalProjects = projects
        .filter(p => p.budget)
        .slice(0, 2 - selectedProjects.length);
      selectedProjects.push(...additionalProjects);
    }

    if (selectedProjects.length === 0) {
      console.log('\n✅ All projects already have budgets!');
      return;
    }

    console.log(`\n💡 Creating budgets for ${selectedProjects.length} projects:\n`);

    // Create realistic budgets for selected projects
    for (const project of selectedProjects) {
      // Determine budget amount based on project name
      let totalBudget = 1000000; // Default: 1M ETB
      let currency = 'ETB';
      let categories = [];

      // Customize based on project name/type
      const projectName = project.name.toLowerCase();

      if (projectName.includes('hakim') || projectName.includes('health')) {
        // Healthcare project: 5M ETB
        totalBudget = 5000000;
        categories = [
          { name: 'Medical Equipment', code: '5100', allocatedAmount: 2000000 },
          { name: 'Staff Salaries', code: '5200', allocatedAmount: 1500000 },
          { name: 'Infrastructure', code: '5300', allocatedAmount: 1000000 },
          { name: 'Training & Capacity', code: '5400', allocatedAmount: 500000 }
        ];
      } else if (projectName.includes('fleet') || projectName.includes('bus')) {
        // Fleet/Transport project: 10M ETB
        totalBudget = 10000000;
        categories = [
          { name: 'Vehicle Purchase', code: '5100', allocatedAmount: 6000000 },
          { name: 'GPS & Tracking Systems', code: '5200', allocatedAmount: 2000000 },
          { name: 'Maintenance & Repairs', code: '5300', allocatedAmount: 1000000 },
          { name: 'Staff & Operations', code: '5400', allocatedAmount: 1000000 }
        ];
      } else if (projectName.includes('website') || projectName.includes('redesign')) {
        // Website project: 500K ETB
        totalBudget = 500000;
        categories = [
          { name: 'Design & UX', code: '5100', allocatedAmount: 150000 },
          { name: 'Frontend Development', code: '5200', allocatedAmount: 200000 },
          { name: 'Backend Development', code: '5300', allocatedAmount: 100000 },
          { name: 'Project Management', code: '5400', allocatedAmount: 50000 }
        ];
      } else {
        // Generic project: 2M ETB
        totalBudget = 2000000;
        categories = [
          { name: 'Personnel Costs', code: '5100', allocatedAmount: 800000 },
          { name: 'Equipment & Materials', code: '5200', allocatedAmount: 600000 },
          { name: 'Operations', code: '5300', allocatedAmount: 400000 },
          { name: 'Contingency', code: '5400', allocatedAmount: 200000 }
        ];
      }

      // Get creator (first admin member or use project creator)
      const creatorId = project.members[0]?.userId || project.createdBy;

      if (project.budget) {
        // Update existing budget
        console.log(`🔄 Updating budget for: ${project.name}`);

        await prisma.budget.update({
          where: { id: project.budget.id },
          data: {
            totalBudget,
            currency,
            status: 'ACTIVE'
          }
        });

        // Delete old categories
        await prisma.budgetCategory.deleteMany({
          where: { budgetId: project.budget.id }
        });

        // Create new categories
        for (let i = 0; i < categories.length; i++) {
          await prisma.budgetCategory.create({
            data: {
              budgetId: project.budget.id,
              ...categories[i],
              currency,
              order: i + 1
            }
          });
        }

        console.log(`   ✅ Budget updated: ${totalBudget.toLocaleString()} ${currency}`);
        console.log(`   ✅ Created ${categories.length} budget categories\n`);
      } else {
        // Create new budget
        console.log(`➕ Creating budget for: ${project.name}`);

        const budget = await prisma.budget.create({
          data: {
            projectId: project.id,
            totalBudget,
            currency,
            status: 'ACTIVE',
            createdBy: creatorId,
            fiscalYearStart: new Date('2025-01-01'),
            fiscalYearEnd: new Date('2025-12-31'),
            settings: {
              alertThresholds: [50, 80, 90],
              requireReceipts: true
            }
          }
        });

        // Create budget categories
        for (let i = 0; i < categories.length; i++) {
          await prisma.budgetCategory.create({
            data: {
              budgetId: budget.id,
              ...categories[i],
              currency,
              order: i + 1
            }
          });
        }

        console.log(`   ✅ Budget created: ${totalBudget.toLocaleString()} ${currency}`);
        console.log(`   ✅ Created ${categories.length} budget categories\n`);
      }
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 Budget Summary:\n');

    const budgetsWithDetails = await prisma.budget.findMany({
      where: {
        projectId: {
          in: selectedProjects.map(p => p.id)
        }
      },
      include: {
        project: {
          select: {
            name: true,
            key: true
          }
        },
        categories: true,
        _count: {
          select: {
            categories: true,
            expenses: true
          }
        }
      }
    });

    budgetsWithDetails.forEach((budget, index) => {
      console.log(`${index + 1}. ${budget.project.name} (${budget.project.key})`);
      console.log(`   Total Budget: ${Number(budget.totalBudget).toLocaleString()} ${budget.currency}`);
      console.log(`   Status: ${budget.status}`);
      console.log(`   Categories: ${budget._count.categories}`);
      console.log(`   Expenses: ${budget._count.expenses}`);
      console.log('');
    });

    console.log('═'.repeat(60));
    console.log('\n🎉 Test budgets created successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Build budget API endpoints');
    console.log('   2. Create budget UI components');
    console.log('   3. Integrate into project dashboard\n');

  } catch (error) {
    console.error('❌ Error creating test budgets:', error.message);
    console.error(error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
