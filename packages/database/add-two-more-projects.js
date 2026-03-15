const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding Hakim Telehealth and DAPS Website Redesign projects...\n');

  // Get Olink organization
  const org = await prisma.organization.findFirst({
    where: { slug: 'olink-tech' }
  });

  // Get a user to be the lead
  const user = await prisma.user.findFirst({
    where: { email: 'owner@olink.com' }
  });

  if (!org || !user) {
    console.error('Organization or user not found');
    return;
  }

  // Create Hakim Telehealth project
  const hakimProject = await prisma.project.create({
    data: {
      name: 'Hakim Telehealth Platform',
      key: 'HAKIM',
      description: 'AI-powered telemedicine platform connecting patients with doctors',
      icon: '🏥',
      color: '#06B6D4',
      organizationId: org.id,
      leadId: user.id,
      template: 'KANBAN',
      status: 'ACTIVE',
      createdBy: user.id,
    },
  });

  // Create DAPS project
  const dapsProject = await prisma.project.create({
    data: {
      name: 'DAPS Website Redesign',
      key: 'DAPS',
      description: 'Modern redesign of DAPS Analytics platform website',
      icon: '🎨',
      color: '#EC4899',
      organizationId: org.id,
      leadId: user.id,
      template: 'SCRUM',
      status: 'ACTIVE',
      createdBy: user.id,
    },
  });

  console.log(`✅ Created Hakim Telehealth (${hakimProject.key})`);
  console.log(`✅ Created DAPS Website Redesign (${dapsProject.key})`);

  // Add some tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: hakimProject.id,
        key: 'HAKIM-1',
        title: 'Setup patient registration system',
        description: 'Implement secure patient onboarding with verification',
        type: 'EPIC',
        status: 'IN_PROGRESS',
        priority: 'HIGHEST',
        assigneeId: user.id,
        reporterId: user.id,
        estimate: 120,
        timeSpent: 60,
      },
      {
        projectId: hakimProject.id,
        key: 'HAKIM-2',
        title: 'Build video consultation module',
        description: 'Implement WebRTC-based video calling',
        type: 'STORY',
        status: 'TODO',
        priority: 'HIGH',
        assigneeId: user.id,
        reporterId: user.id,
        estimate: 80,
      },
      {
        projectId: dapsProject.id,
        key: 'DAPS-1',
        title: 'Design new homepage',
        description: 'Create modern, conversion-focused homepage design',
        type: 'TASK',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        assigneeId: user.id,
        reporterId: user.id,
        estimate: 24,
        timeSpent: 22,
      },
      {
        projectId: dapsProject.id,
        key: 'DAPS-2',
        title: 'Implement dark mode',
        description: 'Add dark mode support across all pages',
        type: 'TASK',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assigneeId: user.id,
        reporterId: user.id,
        estimate: 40,
        timeSpent: 15,
      },
    ],
  });

  console.log('✅ Added sample tasks\n');

  const allProjects = await prisma.project.findMany({
    select: { name: true, key: true }
  });

  console.log('📊 All projects:');
  allProjects.forEach(p => console.log(`   - ${p.name} (${p.key})`));
}

main().then(() => prisma.$disconnect()).catch(console.error);
