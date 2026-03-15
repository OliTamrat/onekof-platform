import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding comprehensive database with 4 projects, 10 teams, 20 automation templates...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.projectTeam.deleteMany();
  await prisma.keyResult.deleteMany();
  await prisma.goalProject.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.team.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // Create 8 users
  const hashedPassword = await hash('password123', 10);

  const users = await Promise.all([
    // Organization Owners
    prisma.user.create({
      data: {
        email: 'owner@olink.com',
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'Abebe Kebede',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abebe',
      },
    }),
    prisma.user.create({
      data: {
        email: 'owner@adwa.com',
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'Almaz Tadesse',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Almaz',
      },
    }),

    // Engineers
    prisma.user.create({
      data: {
        email: 'engineer1@olink.com',
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'Dawit Haile',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dawit',
      },
    }),
    prisma.user.create({
      data: {
        email: 'engineer2@olink.com',
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'Tsehay Solomon',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tsehay',
      },
    }),

    // Designers
    prisma.user.create({
      data: {
        email: 'designer1@olink.com',
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'Bethlehem Gebre',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bethlehem',
      },
    }),
    prisma.user.create({
      data: {
        email: 'designer2@adwa.com',
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'Meron Tesfaye',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meron',
      },
    }),

    // Project Managers
    prisma.user.create({
      data: {
        email: 'pm1@olink.com',
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'Yohannes Alemu',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yohannes',
      },
    }),
    prisma.user.create({
      data: {
        email: 'pm2@adwa.com',
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'Tigist Bekele',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tigist',
      },
    }),
  ]);

  console.log('✅ Created 8 users\n');

  // Create 2 organizations
  const olinkOrg = await prisma.organization.create({
    data: {
      name: 'Olink Technologies',
      slug: 'olink-tech',
      schemaName: 'onekof_org_olink',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      primaryLanguage: 'EN',
      preferredCalendar: 'GREGORIAN',
    },
  });

  const adwaOrg = await prisma.organization.create({
    data: {
      name: 'Adwa Digital Solutions',
      slug: 'adwa-digital',
      schemaName: 'onekof_org_adwa',
      plan: 'STARTER',
      status: 'ACTIVE',
      primaryLanguage: 'AM',
      preferredCalendar: 'ETHIOPIAN',
    },
  });

  console.log('✅ Created 2 organizations\n');

  // Add organization members
  await Promise.all([
    prisma.organizationMember.create({
      data: {
        organizationId: olinkOrg.id,
        userId: users[0].id,
        role: 'OWNER',
      },
    }),
    prisma.organizationMember.create({
      data: {
        organizationId: olinkOrg.id,
        userId: users[2].id,
        role: 'MEMBER',
      },
    }),
    prisma.organizationMember.create({
      data: {
        organizationId: olinkOrg.id,
        userId: users[3].id,
        role: 'MEMBER',
      },
    }),
    prisma.organizationMember.create({
      data: {
        organizationId: olinkOrg.id,
        userId: users[4].id,
        role: 'MEMBER',
      },
    }),
    prisma.organizationMember.create({
      data: {
        organizationId: olinkOrg.id,
        userId: users[6].id,
        role: 'ADMIN',
      },
    }),

    prisma.organizationMember.create({
      data: {
        organizationId: adwaOrg.id,
        userId: users[1].id,
        role: 'OWNER',
      },
    }),
    prisma.organizationMember.create({
      data: {
        organizationId: adwaOrg.id,
        userId: users[5].id,
        role: 'MEMBER',
      },
    }),
    prisma.organizationMember.create({
      data: {
        organizationId: adwaOrg.id,
        userId: users[7].id,
        role: 'ADMIN',
      },
    }),
  ]);

  // Create 10 teams (5 per organization)
  const olinkBackendTeam = await prisma.team.create({
    data: {
      name: 'Backend Engineering',
      description: 'Backend development team specializing in Node.js and databases',
      icon: '⚙️',
      color: '#3B82F6',
      organizationId: olinkOrg.id,
      createdBy: users[0].id,
    },
  });

  const olinkFrontendTeam = await prisma.team.create({
    data: {
      name: 'Frontend Engineering',
      description: 'React and Next.js specialists',
      icon: '🎨',
      color: '#10B981',
      organizationId: olinkOrg.id,
      createdBy: users[0].id,
    },
  });

  const olinkDesignTeam = await prisma.team.create({
    data: {
      name: 'Product Design',
      description: 'UI/UX design team',
      icon: '✨',
      color: '#F59E0B',
      organizationId: olinkOrg.id,
      createdBy: users[0].id,
    },
  });

  const olinkQATeam = await prisma.team.create({
    data: {
      name: 'Quality Assurance',
      description: 'Testing and QA specialists',
      icon: '🔍',
      color: '#8B5CF6',
      organizationId: olinkOrg.id,
      createdBy: users[0].id,
    },
  });

  const olinkDevOpsTeam = await prisma.team.create({
    data: {
      name: 'DevOps & Infrastructure',
      description: 'Cloud infrastructure and CI/CD',
      icon: '☁️',
      color: '#EF4444',
      organizationId: olinkOrg.id,
      createdBy: users[0].id,
    },
  });

  const adwaDevTeam = await prisma.team.create({
    data: {
      name: 'Development Team',
      description: 'Full-stack development',
      icon: '💻',
      color: '#06B6D4',
      organizationId: adwaOrg.id,
      createdBy: users[1].id,
    },
  });

  const adwaDesignTeam = await prisma.team.create({
    data: {
      name: 'Creative Team',
      description: 'Design and branding',
      icon: '🎨',
      color: '#EC4899',
      organizationId: adwaOrg.id,
      createdBy: users[1].id,
    },
  });

  const adwaMarketingTeam = await prisma.team.create({
    data: {
      name: 'Marketing & Growth',
      description: 'Digital marketing and growth hacking',
      icon: '📈',
      color: '#84CC16',
      organizationId: adwaOrg.id,
      createdBy: users[1].id,
    },
  });

  const adwaClientServicesTeam = await prisma.team.create({
    data: {
      name: 'Client Services',
      description: 'Customer success and support',
      icon: '🤝',
      color: '#6366F1',
      organizationId: adwaOrg.id,
      createdBy: users[1].id,
    },
  });

  const adwaProductTeam = await prisma.team.create({
    data: {
      name: 'Product Management',
      description: 'Product strategy and roadmap',
      icon: '🎯',
      color: '#F97316',
      organizationId: adwaOrg.id,
      createdBy: users[1].id,
    },
  });

  console.log('✅ Created 10 teams\n');

  // Add team members
  await Promise.all([
    // Olink Backend Team
    prisma.teamMember.create({
      data: {
        teamId: olinkBackendTeam.id,
        userId: users[2].id,
        role: 'LEAD',
        addedBy: users[0].id,
      },
    }),
    prisma.teamMember.create({
      data: {
        teamId: olinkBackendTeam.id,
        userId: users[3].id,
        role: 'MEMBER',
        addedBy: users[0].id,
      },
    }),

    // Olink Frontend Team
    prisma.teamMember.create({
      data: {
        teamId: olinkFrontendTeam.id,
        userId: users[3].id,
        role: 'LEAD',
        addedBy: users[0].id,
      },
    }),

    // Olink Design Team
    prisma.teamMember.create({
      data: {
        teamId: olinkDesignTeam.id,
        userId: users[4].id,
        role: 'LEAD',
        addedBy: users[0].id,
      },
    }),

    // Adwa Dev Team
    prisma.teamMember.create({
      data: {
        teamId: adwaDevTeam.id,
        userId: users[5].id,
        role: 'MEMBER',
        addedBy: users[1].id,
      },
    }),

    // Adwa Design Team
    prisma.teamMember.create({
      data: {
        teamId: adwaDesignTeam.id,
        userId: users[5].id,
        role: 'LEAD',
        addedBy: users[1].id,
      },
    }),
  ]);

  // Create 4 projects (2 per organization)
  const olinkFMSProject = await prisma.project.create({
    data: {
      name: 'Fleet Management System',
      key: 'FMS',
      description: 'GPS-based fleet tracking and management platform',
      icon: '🚚',
      color: '#3B82F6',
      organizationId: olinkOrg.id,
      leadId: users[6].id,
      template: 'KANBAN',
      status: 'ACTIVE',
      createdBy: users[0].id,
    },
  });

  const olinkSBTProject = await prisma.project.create({
    data: {
      name: 'School Bus Tracking',
      key: 'SBT',
      description: 'Real-time school bus tracking for parents and administrators',
      icon: '🚌',
      color: '#F59E0B',
      organizationId: olinkOrg.id,
      leadId: users[6].id,
      template: 'SCRUM',
      status: 'ACTIVE',
      createdBy: users[0].id,
    },
  });

  const adwaEcomProject = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      key: 'ECOM',
      description: 'Multi-vendor e-commerce marketplace',
      icon: '🛍️',
      color: '#10B981',
      organizationId: adwaOrg.id,
      leadId: users[7].id,
      template: 'KANBAN',
      status: 'ACTIVE',
      createdBy: users[1].id,
    },
  });

  const adwaHRMSProject = await prisma.project.create({
    data: {
      name: 'HR Management System',
      key: 'HRMS',
      description: 'Comprehensive HR and payroll management',
      icon: '👥',
      color: '#8B5CF6',
      organizationId: adwaOrg.id,
      leadId: users[7].id,
      template: 'KANBAN',
      status: 'ACTIVE',
      createdBy: users[1].id,
    },
  });

  console.log('✅ Created 4 projects\n');

  // Link teams to projects
  await Promise.all([
    prisma.projectTeam.create({
      data: {
        projectId: olinkFMSProject.id,
        teamId: olinkBackendTeam.id,
        addedBy: users[0].id,
      },
    }),
    prisma.projectTeam.create({
      data: {
        projectId: olinkFMSProject.id,
        teamId: olinkFrontendTeam.id,
        addedBy: users[0].id,
      },
    }),
    prisma.projectTeam.create({
      data: {
        projectId: olinkSBTProject.id,
        teamId: olinkBackendTeam.id,
        addedBy: users[0].id,
      },
    }),
    prisma.projectTeam.create({
      data: {
        projectId: olinkSBTProject.id,
        teamId: olinkDesignTeam.id,
        addedBy: users[0].id,
      },
    }),
    prisma.projectTeam.create({
      data: {
        projectId: adwaEcomProject.id,
        teamId: adwaDevTeam.id,
        addedBy: users[1].id,
      },
    }),
    prisma.projectTeam.create({
      data: {
        projectId: adwaHRMSProject.id,
        teamId: adwaDevTeam.id,
        addedBy: users[1].id,
      },
    }),
  ]);

  // Add project members
  await Promise.all([
    prisma.projectMember.create({
      data: {
        projectId: olinkFMSProject.id,
        userId: users[2].id,
        role: 'ADMIN',
        addedBy: users[0].id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: olinkFMSProject.id,
        userId: users[3].id,
        role: 'MEMBER',
        addedBy: users[0].id,
      },
    }),
    prisma.projectMember.create({
      data: {
        projectId: adwaEcomProject.id,
        userId: users[5].id,
        role: 'ADMIN',
        addedBy: users[1].id,
      },
    }),
  ]);

  // Create some sample tasks for each project
  const taskData = [
    // FMS Project Tasks
    {
      projectId: olinkFMSProject.id,
      key: 'FMS-1',
      title: 'Setup GPS tracking infrastructure',
      description: 'Configure GPS data ingestion pipeline and real-time processing',
      type: 'TASK',
      status: 'DONE',
      priority: 'HIGHEST',
      assigneeId: users[2].id,
      reporterId: users[6].id,
      estimate: 40,
      timeSpent: 38,
    },
    {
      projectId: olinkFMSProject.id,
      key: 'FMS-2',
      title: 'Build fleet dashboard UI',
      description: 'Create real-time dashboard with map view and fleet statistics',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: users[3].id,
      reporterId: users[6].id,
      estimate: 60,
      timeSpent: 30,
    },
    {
      projectId: olinkFMSProject.id,
      key: 'FMS-3',
      title: 'Implement geofencing alerts',
      description: 'Send notifications when vehicles enter/exit designated areas',
      type: 'STORY',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeId: users[2].id,
      reporterId: users[6].id,
      estimate: 24,
    },

    // SBT Project Tasks
    {
      projectId: olinkSBTProject.id,
      key: 'SBT-1',
      title: 'Design parent mobile app',
      description: 'Create wireframes and mockups for parent-facing mobile app',
      type: 'TASK',
      status: 'IN_REVIEW',
      priority: 'HIGH',
      assigneeId: users[4].id,
      reporterId: users[6].id,
      estimate: 16,
      timeSpent: 16,
    },
    {
      projectId: olinkSBTProject.id,
      key: 'SBT-2',
      title: 'Implement real-time bus tracking',
      description: 'Build WebSocket-based real-time location updates',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 'HIGHEST',
      assigneeId: users[2].id,
      reporterId: users[6].id,
      estimate: 48,
      timeSpent: 20,
    },

    // ECOM Project Tasks
    {
      projectId: adwaEcomProject.id,
      key: 'ECOM-1',
      title: 'Setup vendor onboarding flow',
      description: 'Create multi-step vendor registration and verification process',
      type: 'EPIC',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: users[5].id,
      reporterId: users[7].id,
      estimate: 80,
      timeSpent: 40,
    },
    {
      projectId: adwaEcomProject.id,
      key: 'ECOM-2',
      title: 'Implement product catalog',
      description: 'Build product listing, search, and filtering functionality',
      type: 'STORY',
      status: 'TODO',
      priority: 'HIGH',
      assigneeId: users[5].id,
      reporterId: users[7].id,
      estimate: 60,
    },

    // HRMS Project Tasks
    {
      projectId: adwaHRMSProject.id,
      key: 'HRMS-1',
      title: 'Design employee database schema',
      description: 'Create comprehensive employee data model',
      type: 'TASK',
      status: 'DONE',
      priority: 'HIGHEST',
      assigneeId: users[5].id,
      reporterId: users[7].id,
      estimate: 16,
      timeSpent: 14,
    },
    {
      projectId: adwaHRMSProject.id,
      key: 'HRMS-2',
      title: 'Build payroll calculation engine',
      description: 'Implement Ethiopian tax and benefits calculation',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: users[5].id,
      reporterId: users[7].id,
      estimate: 100,
      timeSpent: 60,
    },
    {
      projectId: adwaHRMSProject.id,
      key: 'HRMS-3',
      title: 'Create leave management module',
      description: 'Allow employees to request and track leave',
      type: 'STORY',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeId: users[5].id,
      reporterId: users[7].id,
      estimate: 40,
    },
  ];

  const tasks = [];
  for (const data of taskData) {
    const task = await prisma.task.create({ data });
    tasks.push(task);
  }

  console.log(`✅ Created ${tasks.length} sample tasks\n`);

  // Create 2 goals with key results
  const olinkQ1Goal = await prisma.goal.create({
    data: {
      title: 'Launch Fleet Management MVP',
      description: 'Complete and launch the fleet management system to first 5 customers',
      organizationId: olinkOrg.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 65,
      ownerId: users[6].id,
      teamId: olinkBackendTeam.id,
      startDate: new Date('2025-01-01'),
      dueDate: new Date('2025-03-31'),
      createdBy: users[0].id,
    },
  });

  const adwaUserOnboardingGoal = await prisma.goal.create({
    data: {
      title: 'Improve User Onboarding Experience',
      description: 'Reduce time-to-value for new users from 7 days to 2 days',
      organizationId: adwaOrg.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 40,
      ownerId: users[7].id,
      teamId: adwaDevTeam.id,
      startDate: new Date('2025-01-15'),
      dueDate: new Date('2025-04-30'),
      createdBy: users[1].id,
    },
  });

  // Add key results
  await Promise.all([
    prisma.keyResult.create({
      data: {
        goalId: olinkQ1Goal.id,
        description: 'Onboard 5 paying customers',
        unit: 'customers',
        target: 5,
        current: 3,
      },
    }),
    prisma.keyResult.create({
      data: {
        goalId: olinkQ1Goal.id,
        description: 'Achieve 95% system uptime',
        unit: 'percentage',
        target: 95,
        current: 92,
      },
    }),
    prisma.keyResult.create({
      data: {
        goalId: adwaUserOnboardingGoal.id,
        description: 'Reduce onboarding time to 2 days',
        unit: 'days',
        target: 2,
        current: 4,
      },
    }),
    prisma.keyResult.create({
      data: {
        goalId: adwaUserOnboardingGoal.id,
        description: 'Achieve 80% user activation rate',
        unit: 'percentage',
        target: 80,
        current: 55,
      },
    }),
  ]);

  // Link projects to goals
  await Promise.all([
    prisma.goalProject.create({
      data: {
        goalId: olinkQ1Goal.id,
        projectId: olinkFMSProject.id,
        contributionWeight: 80,
        addedBy: users[0].id,
      },
    }),
    prisma.goalProject.create({
      data: {
        goalId: olinkQ1Goal.id,
        projectId: olinkSBTProject.id,
        contributionWeight: 20,
        addedBy: users[0].id,
      },
    }),
    prisma.goalProject.create({
      data: {
        goalId: adwaUserOnboardingGoal.id,
        projectId: adwaEcomProject.id,
        contributionWeight: 100,
        addedBy: users[1].id,
      },
    }),
  ]);

  console.log('✅ Created 2 goals with key results and project links\n');

  console.log('🎉 Comprehensive seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`   - 8 users`);
  console.log(`   - 2 organizations`);
  console.log(`   - 10 teams`);
  console.log(`   - 4 projects`);
  console.log(`   - ${tasks.length} tasks`);
  console.log(`   - 2 goals with 4 key results`);
  console.log('\n📝 Login credentials:');
  console.log('   Email: owner@olink.com');
  console.log('   Password: password123\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
