const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const issues = await prisma.task.findMany({
    include: {
      project: { select: { name: true, key: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📊 Found ${issues.length} issues in database:`);
  issues.forEach(issue => {
    console.log(`- ${issue.key}: ${issue.title} [${issue.status}]`);
  });

  await prisma.$disconnect();
}

check();
