const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { slug: 'ministry-water-irrigation' },
    include: {
      projects: {
        include: {
          budget: {
            include: {
              categories: true
            }
          }
        }
      }
    }
  });

  if (!org) {
    console.log('❌ Ministry organization not found');
    return;
  }

  console.log('\n✅ SUCCESS! Ministry Setup Complete!\n');
  console.log('🏛  Organization:', org.name);
  console.log('📋 Projects:', org.projects.length);

  org.projects.forEach(p => {
    console.log(`\n  📊 ${p.name} (${p.key})`);
    if (p.budget) {
      console.log(`     💰 Budget: ${p.budget.totalBudget.toLocaleString()} ETB`);
      console.log(`     📁 Categories: ${p.budget.categories.length}`);
      p.budget.categories.forEach(c => {
        console.log(`        • ${c.name}: ${c.allocatedAmount.toLocaleString()} ETB`);
      });
    }
  });

  console.log('\n🌐 View in browser: http://localhost:3000/projects/' + org.projects[0]?.id + '/budget\n');

  await prisma.$disconnect();
}

main();
