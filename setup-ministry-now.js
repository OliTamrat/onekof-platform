const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🏛 Creating Ministry of Water & Irrigation...\n');

  try {
    // Get your user
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (!user) {
      console.log('❌ No user found. Please sign in first.');
      return;
    }

    console.log(`✅ Found user: ${user.email}`);

    // Create Ministry organization
    console.log('\n📋 Creating organization...');
    const org = await prisma.organization.create({
      data: {
        name: 'Ministry of Water and Irrigation',
        slug: 'ministry-water-irrigation',
        description: 'Federal Ministry responsible for water resource management and irrigation development in Ethiopia',
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN'
          }
        }
      }
    });

    console.log(`✅ Created organization: ${org.name} (ID: ${org.id})`);

    // Create Jira Water Dam project
    console.log('\n🌊 Creating Jira Water Dam project...');
    const project = await prisma.project.create({
      data: {
        name: 'Jira Water Dam & Irrigation',
        key: 'JIRA',
        description: 'Major water dam and irrigation infrastructure project for agricultural development',
        organizationId: org.id,
        ownerId: user.id,
        icon: '🌊',
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN'
          }
        }
      }
    });

    console.log(`✅ Created project: ${project.name} (ID: ${project.id})`);

    // Create budget
    console.log('\n💰 Creating budget (250M ETB)...');
    const budget = await prisma.budget.create({
      data: {
        projectId: project.id,
        totalAmount: 250000000,
        fiscalYear: '2026',
        status: 'ACTIVE',
        createdById: user.id
      }
    });

    console.log(`✅ Created budget: ${budget.fiscalYear} (ID: ${budget.id})`);

    // Create budget categories
    console.log('\n📊 Creating budget categories...');
    const categories = [
      { name: 'Personnel & Salaries', code: 'CAT-1001', allocated: 25000000, color: '#3B82F6' },
      { name: 'Construction & Infrastructure', code: 'CAT-2001', allocated: 150000000, color: '#10B981' },
      { name: 'Equipment & Machinery', code: 'CAT-3001', allocated: 30000000, color: '#F59E0B' },
      { name: 'Environmental Assessment', code: 'CAT-4001', allocated: 20000000, color: '#8B5CF6' },
      { name: 'Project Management', code: 'CAT-5001', allocated: 15000000, color: '#EC4899' },
      { name: 'Contingency Reserve', code: 'CAT-6001', allocated: 10000000, color: '#6B7280' }
    ];

    for (const cat of categories) {
      const category = await prisma.budgetCategory.create({
        data: {
          ...cat,
          budgetId: budget.id
        }
      });
      console.log(`  ✓ ${category.name}: ${category.allocated.toLocaleString()} ETB`);
    }

    // Create sample expenses
    console.log('\n💸 Creating sample expenses...');
    const allCategories = await prisma.budgetCategory.findMany({
      where: { budgetId: budget.id }
    });

    const expenses = [
      { categoryId: allCategories[0].id, description: 'Engineering team salaries - Q1', amount: 5000000, status: 'APPROVED', date: new Date('2026-01-15') },
      { categoryId: allCategories[1].id, description: 'Dam foundation excavation', amount: 45000000, status: 'APPROVED', date: new Date('2026-01-20') },
      { categoryId: allCategories[2].id, description: 'Heavy machinery procurement', amount: 12000000, status: 'PENDING', date: new Date('2026-02-01') },
      { categoryId: allCategories[3].id, description: 'Environmental impact study', amount: 8000000, status: 'APPROVED', date: new Date('2026-01-10') }
    ];

    for (const exp of expenses) {
      const expense = await prisma.expense.create({
        data: {
          ...exp,
          submittedById: user.id,
          approvedById: exp.status === 'APPROVED' ? user.id : null,
          approvedAt: exp.status === 'APPROVED' ? new Date() : null
        }
      });
      console.log(`  ✓ ${expense.description}: ${expense.amount.toLocaleString()} ETB [${expense.status}]`);
    }

    console.log('\n✅ SUCCESS! Ministry setup complete!\n');
    console.log('📋 Summary:');
    console.log(`   Organization: ${org.name}`);
    console.log(`   Project: ${project.name}`);
    console.log(`   Budget: ${budget.totalAmount.toLocaleString()} ETB`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Sample Expenses: ${expenses.length}`);
    console.log('\n🌐 View at: http://localhost:3000/projects/' + project.id + '/budget\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
