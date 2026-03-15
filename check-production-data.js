const { PrismaClient } = require('./node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkData() {
  try {
    console.log('\n=== CHECKING DATABASE ===');
    console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'NOT SET');

    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log(`\nOrganizations found: ${orgs.length}`);
    orgs.forEach(org => {
      console.log(`  - ${org.name} (${org.slug})`);
    });

    const users = await prisma.user.count();
    console.log(`\nTotal users: ${users}`);

    const projects = await prisma.project.count();
    console.log(`Total projects: ${projects}`);

    const issues = await prisma.issue.count();
    console.log(`Total issues: ${issues}`);

    const members = await prisma.organizationMember.findMany({
      include: {
        user: { select: { email: true, name: true } },
        organization: { select: { name: true, slug: true } }
      }
    });
    console.log(`\nTotal organization members: ${members.length}`);
    members.forEach(m => {
      console.log(`  - ${m.user.email} -> ${m.organization.name} (${m.role})`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('\nERROR:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkData();
