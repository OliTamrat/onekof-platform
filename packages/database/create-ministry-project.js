const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🏛️ Creating Ministry of Water and Irrigation...\n');

  // 1. Create or find Organization
  let ministry = await prisma.organization.findUnique({
    where: { slug: 'ministry-water-irrigation' }
  });

  if (ministry) {
    console.log(`✅ Found existing organization: ${ministry.name} (ID: ${ministry.id})\n`);
  } else {
    ministry = await prisma.organization.create({
    data: {
      name: 'Ministry of Water and Irrigation',
      slug: 'ministry-water-irrigation',
      schemaName: 'onekof_ministry_water',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      maxMembers: 500,
      maxProjects: 100,
      maxStorage: 1000, // 1TB
      preferredCalendar: 'ETHIOPIAN',
      primaryLanguage: 'AM', // Amharic
      settings: {
        ministryCode: 'MoWI',
        sector: 'Infrastructure',
        region: 'Federal'
      },
      features: [
        'budget_management',
        'public_transparency',
        'audit_logs',
        'multi_currency',
        'expense_approval_workflow'
      ]
    }
    });

    console.log(`✅ Created organization: ${ministry.name} (ID: ${ministry.id})\n`);
  }

  // 2. Create admin user for the ministry
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@mowi.gov.et' }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@mowi.gov.et',
        name: 'Ministry Administrator',
        timezone: 'Africa/Addis_Ababa',
        language: 'AM',
        defaultOrganizationId: ministry.id
      }
    });
    console.log(`✅ Created admin user: ${adminUser.email}\n`);
  } else {
    console.log(`✅ Using existing admin user: ${adminUser.email}\n`);
  }

  // 3. Add admin as organization member with FULL_CONTROL budget access
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: ministry.id,
        userId: adminUser.id
      }
    }
  });

  if (!existingMember) {
    await prisma.organizationMember.create({
      data: {
        organizationId: ministry.id,
        userId: adminUser.id,
        role: 'OWNER',
        budgetAccess: 'FULL_CONTROL'
      }
    });
    console.log(`✅ Added admin to organization with FULL_CONTROL budget access\n`);
  } else {
    console.log(`✅ Admin already member of organization\n`);
  }

  // 4. Create the Jira Water Dam & Irrigation Project
  const fiscalYearStart = new Date('2026-07-08'); // Ethiopian fiscal year (Hamle 1, 2018 EC)
  const fiscalYearEnd = new Date('2031-07-07'); // 5-year project
  const projectStart = new Date('2026-07-08');
  const projectDue = new Date('2031-07-07');

  const project = await prisma.project.create({
    data: {
      organizationId: ministry.id,
      name: 'Jira Water Dam & Irrigation',
      key: 'JIRA',
      description: 'Major infrastructure project to construct the Jira Water Dam and irrigation system, providing water access to over 500,000 hectares of agricultural land in the Oromia region. This project aims to enhance food security, support agricultural productivity, and improve livelihoods for rural communities.',
      icon: '🌊',
      color: '#0EA5E9', // Water blue
      leadId: adminUser.id,
      template: 'CUSTOM', // Government infrastructure project
      status: 'ACTIVE',
      settings: {
        projectType: 'Infrastructure',
        fundingSources: ['Federal Budget', 'World Bank', 'African Development Bank'],
        impactArea: 'Oromia Region',
        beneficiaries: '500,000+ hectares'
      },
      createdBy: adminUser.id
    }
  });

  console.log(`✅ Created project: ${project.name} (${project.key})\n`);

  // 5. Add admin as project member
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: adminUser.id,
      role: 'ADMIN',
      budgetAccess: 'FULL_CONTROL',
      addedBy: adminUser.id
    }
  });

  console.log(`✅ Added admin to project\n`);

  // 6. Create Budget for the project
  const budget = await prisma.budget.create({
    data: {
      projectId: project.id,
      totalBudget: 250000000.00, // 250 Million ETB
      currency: 'ETB',
      status: 'ACTIVE',
      isPublic: true, // Government transparency
      fiscalYearStart,
      fiscalYearEnd,
      additionalFunding: [
        {
          source: 'World Bank',
          amount: 50000000,
          currency: 'USD',
          exchangeRate: 57.8,
          date: '2026-07-08',
          amountInETB: 2890000000 // 50M USD * 57.8
        },
        {
          source: 'African Development Bank',
          amount: 30000000,
          currency: 'USD',
          exchangeRate: 57.8,
          date: '2026-07-08',
          amountInETB: 1734000000 // 30M USD * 57.8
        }
      ],
      settings: {
        alertThresholds: [50, 75, 90, 95], // Alert at 50%, 75%, 90%, 95%
        autoApproval: false,
        requireReceipts: true,
        approvalLevels: {
          'under_100000': ['PROJECT_MANAGER'],
          '100000_to_1000000': ['PROJECT_MANAGER', 'FINANCE_DIRECTOR'],
          'over_1000000': ['PROJECT_MANAGER', 'FINANCE_DIRECTOR', 'MINISTER']
        }
      },
      visibilitySettings: {
        publicFields: ['totalBudget', 'spent', 'progress', 'categories'],
        restrictedFields: ['vendor_details', 'payment_methods']
      },
      createdBy: adminUser.id,
      approvedBy: adminUser.id,
      approvedAt: new Date()
    }
  });

  console.log(`✅ Created budget: ${budget.totalBudget.toLocaleString()} ${budget.currency}\n`);

  // 7. Create Budget Categories (Government standard categories)
  const categories = [
    {
      name: 'Personnel & Salaries',
      code: '5210',
      description: 'Project staff salaries, benefits, and allowances',
      allocatedAmount: 25000000.00, // 10%
      order: 1
    },
    {
      name: 'Construction & Infrastructure',
      code: '5220',
      description: 'Dam construction, irrigation channels, and infrastructure',
      allocatedAmount: 150000000.00, // 60%
      order: 2
    },
    {
      name: 'Equipment & Machinery',
      code: '5230',
      description: 'Construction equipment, vehicles, and machinery',
      allocatedAmount: 30000000.00, // 12%
      order: 3
    },
    {
      name: 'Environmental & Social Impact',
      code: '5240',
      description: 'Environmental studies, resettlement, and community programs',
      allocatedAmount: 20000000.00, // 8%
      order: 4
    },
    {
      name: 'Project Management & Consultancy',
      code: '5250',
      description: 'Project management, technical consultancy, and oversight',
      allocatedAmount: 15000000.00, // 6%
      order: 5
    },
    {
      name: 'Contingency & Emergency',
      code: '5260',
      description: 'Contingency fund for unforeseen circumstances',
      allocatedAmount: 10000000.00, // 4%
      order: 6
    }
  ];

  for (const cat of categories) {
    const category = await prisma.budgetCategory.create({
      data: {
        budgetId: budget.id,
        ...cat,
        currency: 'ETB'
      }
    });
    console.log(`  ✅ Category: ${category.name} - ${category.allocatedAmount.toLocaleString()} ETB`);
  }

  console.log('\n🎉 Ministry of Water and Irrigation setup complete!\n');
  console.log('📊 Project Summary:');
  console.log(`   Organization: ${ministry.name}`);
  console.log(`   Project: ${project.name} (${project.key})`);
  console.log(`   Budget: ${budget.totalBudget.toLocaleString()} ${budget.currency}`);
  console.log(`   Duration: ${projectStart.toLocaleDateString()} - ${projectDue.toLocaleDateString()}`);
  console.log(`   Fiscal Year: ${fiscalYearStart.toLocaleDateString()} - ${fiscalYearEnd.toLocaleDateString()}`);
  console.log(`   Budget Categories: ${categories.length}`);
  console.log(`   Public Access: ${budget.isPublic ? 'Yes (Government Transparency)' : 'No'}\n`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
