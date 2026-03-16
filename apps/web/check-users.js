const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
    take: 20,
  });

  console.log('\n=== Users in Database ===');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} - ${user.name || '(no name)'} - ID: ${user.id}`);
  });
  console.log(`\nTotal users found: ${users.length}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
