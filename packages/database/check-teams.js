const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const teams = await prisma.team.findMany({ select: { name: true } });
    console.log('Teams in database:', teams);
    console.log('Total teams:', teams.length);
  } catch (e) {
    console.error('Error:', e.message);
  }
  await prisma.$disconnect();
}

main();
