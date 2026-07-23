const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n📊 Found ${projects.length} projects in database:`);
    projects.forEach(project => {
      console.log(`  - ${project.name} (${project.key}) in ${project.organization.name}`);
    });

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });

    console.log(`\n👥 Users in database:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name || 'No name'})`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkProjects();
