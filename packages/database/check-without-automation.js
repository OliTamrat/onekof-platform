const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const orgs = await prisma.organization.findMany({ select: { name: true } });
    const projects = await prisma.project.findMany({ select: { name: true, key: true } });
    const teams = await prisma.team.findMany({ select: { name: true } });
    const goals = await prisma.goal.findMany({ select: { title: true } });
    
    console.log('\n=== CURRENT DATABASE STATE ===\n');
    console.log(`Organizations (${orgs.length}):`, orgs.map(o => o.name));
    console.log(`\nProjects (${projects.length}):`, projects.map(p => `${p.name} (${p.key})`));
    console.log(`\nTeams (${teams.length}):`, teams.map(t => t.name));
    console.log(`\nGoals (${goals.length}):`, goals.map(g => g.title));
  } catch (e) {
    console.error('Error:', e.message);
  }
  await prisma.$disconnect();
}

main();
