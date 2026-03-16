const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Removing emoji icons and using Lucide icons...\n');

  // Update Jira project to use Lucide icon name instead of emoji
  const updated = await prisma.project.updateMany({
    where: { key: 'JIRA' },
    data: { icon: 'Waves' } // Lucide icon name for water waves
  });

  console.log(`✅ Updated ${updated.count} project(s) to use Lucide icon`);
  console.log('   Icon changed from 🌊 emoji to "Waves" Lucide icon\n');

  await prisma.$disconnect();
}

main();
