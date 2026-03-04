const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌊 Creating sample expenses for Jira Water Dam & Irrigation project...\n');

  try {
    // 1. Find the Jira Water Dam project
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { key: 'JIRA' },
          { name: { contains: 'Jira Water Dam', mode: 'insensitive' } },
        ],
      },
      include: {
        budget: {
          include: {
            categories: true,
          },
        },
      },
    });

    if (!project) {
      console.log('❌ Could not find Jira Water Dam project. Please run create-ministry-project.js first.');
      return;
    }

    console.log(`✅ Found project: ${project.name} (${project.key})`);

    if (!project.budget) {
      console.log('❌ Project does not have a budget configured.');
      return;
    }

    console.log(`✅ Found budget with ${project.budget.categories.length} categories\n`);

    // 2. Get admin user (the one who created the project)
    const adminUser = await prisma.user.findFirst({
      where: {
        email: { contains: 'mowi.gov.et' },
      },
    });

    if (!adminUser) {
      console.log('❌ Could not find admin user.');
      return;
    }

    console.log(`✅ Using admin user: ${adminUser.email}\n`);

    // 3. Category mapping for expenses
    const categories = {
      personnel: project.budget.categories.find((c) => c.code === '5210'),
      construction: project.budget.categories.find((c) => c.code === '5220'),
      equipment: project.budget.categories.find((c) => c.code === '5230'),
      environmental: project.budget.categories.find((c) => c.code === '5240'),
      management: project.budget.categories.find((c) => c.code === '5250'),
      contingency: project.budget.categories.find((c) => c.code === '5260'),
    };

    // 4. Sample expenses with realistic data
    const sampleExpenses = [
      // Personnel expenses (Approved & Paid)
      {
        categoryId: categories.personnel?.id,
        description: 'January 2026 - Project Manager & Engineering Team Salaries',
        amount: 850000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-01-15'),
        invoiceNumber: 'PAY-2026-001',
        vendor: 'Ministry of Water Irrigation - HR Department',
        status: 'PAID',
        paymentStatus: 'PAID',
        paidDate: new Date('2026-01-20'),
        notes: 'Monthly salaries for 25 project staff members',
      },
      {
        categoryId: categories.personnel?.id,
        description: 'February 2026 - Project Staff Salaries',
        amount: 850000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-02-15'),
        invoiceNumber: 'PAY-2026-002',
        vendor: 'Ministry of Water & Irrigation - HR Department',
        status: 'APPROVED',
        notes: 'Monthly salaries for project team',
      },

      // Construction expenses (Mix of statuses)
      {
        categoryId: categories.construction?.id,
        description: 'Dam Foundation Excavation - Phase 1',
        amount: 12500000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-01-10'),
        invoiceNumber: 'CONST-2026-001',
        vendor: 'Ethiopian Construction Corporation',
        receiptUrl: 'https://example.com/receipts/const-001.pdf',
        status: 'PAID',
        paymentStatus: 'PAID',
        paidDate: new Date('2026-01-25'),
        notes: 'Initial excavation work for dam foundation, including site preparation',
      },
      {
        categoryId: categories.construction?.id,
        description: 'Concrete Supply for Dam Structure - Batch 1',
        amount: 8750000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-02-05'),
        invoiceNumber: 'CONST-2026-002',
        vendor: 'Addis Concrete Manufacturing PLC',
        receiptUrl: 'https://example.com/receipts/const-002.pdf',
        status: 'APPROVED',
        notes: '5000 cubic meters of high-grade concrete',
      },
      {
        categoryId: categories.construction?.id,
        description: 'Reinforcement Steel - Phase 1',
        amount: 6200000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-02-20'),
        invoiceNumber: 'CONST-2026-003',
        vendor: 'Metals and Engineering Corporation',
        status: 'PENDING',
        notes: '850 tons of reinforcement steel for dam structure',
      },
      {
        categoryId: categories.construction?.id,
        description: 'Irrigation Canal Construction - Section A',
        amount: 15000000,
        currency: 'ETB',
        type: 'COMMITTED',
        transactionDate: new Date('2026-03-01'),
        invoiceNumber: 'CONST-2026-004',
        vendor: 'Nile Valley Construction',
        status: 'PENDING',
        notes: 'Commitment for 25km irrigation canal construction',
      },

      // Equipment expenses
      {
        categoryId: categories.equipment?.id,
        description: 'Heavy Excavator Rental - 3 Months',
        amount: 2100000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-01-05'),
        invoiceNumber: 'EQP-2026-001',
        vendor: 'Africa Heavy Equipment Rentals',
        receiptUrl: 'https://example.com/receipts/eqp-001.pdf',
        status: 'PAID',
        paymentStatus: 'PAID',
        paidDate: new Date('2026-01-10'),
        notes: 'Caterpillar 390F excavator rental for foundation work',
      },
      {
        categoryId: categories.equipment?.id,
        description: 'Concrete Mixer and Pump Equipment',
        amount: 3500000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-02-01'),
        invoiceNumber: 'EQP-2026-002',
        vendor: 'Construction Equipment Suppliers Ltd',
        status: 'APPROVED',
        notes: 'Purchase of 2 industrial concrete mixers and pump systems',
      },
      {
        categoryId: categories.equipment?.id,
        description: 'Surveying and Monitoring Equipment',
        amount: 1850000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-02-28'),
        invoiceNumber: 'EQP-2026-003',
        vendor: 'Precision Engineering & Surveying',
        status: 'PENDING',
        notes: 'Advanced GPS surveying equipment and monitoring sensors',
      },

      // Environmental expenses
      {
        categoryId: categories.environmental?.id,
        description: 'Environmental Impact Assessment - Phase 1',
        amount: 1200000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2025-12-15'),
        invoiceNumber: 'ENV-2025-001',
        vendor: 'Environmental Sciences Institute - AAU',
        receiptUrl: 'https://example.com/receipts/env-001.pdf',
        status: 'PAID',
        paymentStatus: 'PAID',
        paidDate: new Date('2025-12-20'),
        notes: 'Comprehensive environmental impact study',
      },
      {
        categoryId: categories.environmental?.id,
        description: 'Community Relocation Support - Village A',
        amount: 4500000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-01-20'),
        invoiceNumber: 'ENV-2026-001',
        vendor: 'Community Development Agency',
        status: 'APPROVED',
        notes: 'Relocation assistance for 120 families affected by dam construction',
      },
      {
        categoryId: categories.environmental?.id,
        description: 'Wildlife Corridor Development',
        amount: 2800000,
        currency: 'ETB',
        type: 'COMMITTED',
        transactionDate: new Date('2026-03-15'),
        invoiceNumber: 'ENV-2026-002',
        vendor: 'Wildlife Conservation Authority',
        status: 'PENDING',
        notes: 'Creation of wildlife passages around reservoir area',
      },

      // Management & Consultancy expenses
      {
        categoryId: categories.management?.id,
        description: 'International Dam Engineering Consultancy - Q1 2026',
        amount: 2500000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-01-30'),
        invoiceNumber: 'MGT-2026-001',
        vendor: 'Hydropower Engineering International',
        receiptUrl: 'https://example.com/receipts/mgt-001.pdf',
        status: 'PAID',
        paymentStatus: 'PAID',
        paidDate: new Date('2026-02-05'),
        notes: 'Technical advisory and design review services',
      },
      {
        categoryId: categories.management?.id,
        description: 'Project Management Software & Tools',
        amount: 450000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-02-10'),
        invoiceNumber: 'MGT-2026-002',
        vendor: 'OneKOF Project Management Solutions',
        status: 'APPROVED',
        notes: 'Annual subscription for PM platform and collaboration tools',
      },

      // Contingency expenses
      {
        categoryId: categories.contingency?.id,
        description: 'Emergency Geological Survey - Unexpected Rock Formation',
        amount: 1800000,
        currency: 'ETB',
        type: 'ACTUAL',
        transactionDate: new Date('2026-02-15'),
        invoiceNumber: 'CONT-2026-001',
        vendor: 'Geological Survey of Ethiopia',
        status: 'APPROVED',
        notes: 'Additional geological assessment due to unexpected bedrock conditions',
      },
    ];

    // 5. Create all expenses
    console.log('📝 Creating sample expenses...\n');

    let createdCount = 0;
    let totalAmount = 0;

    for (const expenseData of sampleExpenses) {
      const expense = await prisma.expense.create({
        data: {
          ...expenseData,
          budgetId: project.budget.id,
          submittedBy: adminUser.id,
          approvedBy: ['APPROVED', 'PAID'].includes(expenseData.status) ? adminUser.id : null,
          approvedAt: ['APPROVED', 'PAID'].includes(expenseData.status) ? new Date(expenseData.transactionDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
        },
        include: {
          category: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      });

      createdCount++;
      totalAmount += Number(expense.amount);

      const statusIcon = {
        PENDING: '⏳',
        APPROVED: '✅',
        PAID: '💰',
        REJECTED: '❌',
      }[expense.status] || '📝';

      console.log(`${statusIcon} ${expense.category?.name || 'Uncategorized'} (${expense.category?.code || 'N/A'})`);
      console.log(`   ${expense.description}`);
      console.log(`   Amount: ${expense.amount.toLocaleString()} ${expense.currency} | Status: ${expense.status}`);
      console.log(`   Date: ${expense.transactionDate.toLocaleDateString()}\n`);
    }

    console.log('\n🎉 SUCCESS! Sample expenses created.\n');
    console.log('📊 Summary:');
    console.log(`   Total Expenses Created: ${createdCount}`);
    console.log(`   Total Amount: ${totalAmount.toLocaleString()} ETB`);
    console.log(`   Budget Total: ${Number(project.budget.totalBudget).toLocaleString()} ETB`);
    console.log(`   Utilization: ${((totalAmount / Number(project.budget.totalBudget)) * 100).toFixed(2)}%`);
    console.log('\n✨ The budget dashboard is now ready to demo with real data!');
    console.log(`\n🔗 View at: http://localhost:3000/projects/${project.id}/budget\n`);
  } catch (error) {
    console.error('❌ Error creating sample expenses:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
