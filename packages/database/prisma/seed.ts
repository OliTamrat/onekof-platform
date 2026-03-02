import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@onekof.com' },
    update: {},
    create: {
      email: 'test@onekof.com',
      name: 'Test User',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  console.log('✓ Created user:', user.email);

  // Create test organization
  const org = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-org',
      schemaName: 'onekof_test_org',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
    },
  });

  console.log('✓ Created organization:', org.name);

  // Add user to organization
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  console.log('✓ Added user to organization');

  // Create test project
  const project = await prisma.project.upsert({
    where: {
      organizationId_key: {
        organizationId: org.id,
        key: 'DEMO',
      },
    },
    update: {},
    create: {
      name: 'Demo Project',
      key: 'DEMO',
      description: 'A demo project to showcase the Kanban board',
      organizationId: org.id,
      leadId: user.id,
      createdBy: user.id,
      template: 'KANBAN',
      status: 'ACTIVE',
      settings: {
        color: '#3B82F6',
        icon: '🚀',
      },
    },
  });

  console.log('✓ Created project:', project.name);

  // Add user as project member
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      userId: user.id,
      role: 'ADMIN',
      addedBy: user.id,
    },
  });

  // Create sample issues
  const issues = [
    {
      key: 'DEMO-1',
      title: 'Set up project infrastructure',
      description: 'Configure the development environment and CI/CD pipeline',
      type: 'TASK',
      status: 'DONE',
      priority: 'HIGH',
      labels: ['infrastructure', 'setup'],
    },
    {
      key: 'DEMO-2',
      title: 'Design user authentication flow',
      description: 'Create wireframes and user flow for the authentication system',
      type: 'STORY',
      status: 'DONE',
      priority: 'HIGH',
      labels: ['design', 'authentication'],
    },
    {
      key: 'DEMO-3',
      title: 'Implement user registration',
      description: 'Build the user registration API endpoint and validation',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 'HIGHEST',
      labels: ['backend', 'authentication'],
    },
    {
      key: 'DEMO-4',
      title: 'Create dashboard layout',
      description: 'Build the main dashboard layout with navigation and sidebar',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      labels: ['frontend', 'ui'],
    },
    {
      key: 'DEMO-5',
      title: 'Fix login form validation bug',
      description: 'Email validation is not working correctly on the login form',
      type: 'BUG',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
      labels: ['bug', 'frontend'],
    },
    {
      key: 'DEMO-6',
      title: 'Add dark mode support',
      description: 'Implement dark mode theme switching across the application',
      type: 'TASK',
      status: 'IN_REVIEW',
      priority: 'LOW',
      labels: ['ui', 'enhancement'],
    },
    {
      key: 'DEMO-7',
      title: 'Write API documentation',
      description: 'Document all API endpoints with examples and response schemas',
      type: 'TASK',
      status: 'TODO',
      priority: 'MEDIUM',
      labels: ['documentation'],
    },
    {
      key: 'DEMO-8',
      title: 'Implement file upload feature',
      description: 'Add support for uploading files to issues and projects',
      type: 'TASK',
      status: 'TODO',
      priority: 'MEDIUM',
      labels: ['backend', 'feature'],
    },
    {
      key: 'DEMO-9',
      title: 'User onboarding experience',
      description: 'Design and implement a smooth onboarding flow for new users',
      type: 'EPIC',
      status: 'TODO',
      priority: 'LOW',
      labels: ['ux', 'onboarding'],
    },
    {
      key: 'DEMO-10',
      title: 'Add unit tests for auth module',
      description: 'Write comprehensive unit tests for authentication functions',
      type: 'TASK',
      status: 'TODO',
      priority: 'LOWEST',
      labels: ['testing', 'backend'],
    },
  ];

  for (const issueData of issues) {
    await prisma.task.upsert({
      where: {
        projectId_key: {
          projectId: project.id,
          key: issueData.key,
        },
      },
      update: {},
      create: {
        ...issueData,
        projectId: project.id,
        reporterId: user.id,
        assigneeId: issueData.status !== 'TODO' ? user.id : null,
      },
    });
  }

  console.log(`✓ Created ${issues.length} sample issues`);

  console.log('\n🎉 Seeding complete!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: test@onekof.com');
  console.log('   Password: password123');
  console.log('\n🚀 Navigate to /dashboard/issues to see the Kanban board!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
