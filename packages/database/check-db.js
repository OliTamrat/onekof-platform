const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.count();
  const teams = await prisma.team.count();
  const automations = await prisma.automationRule.count();
  const orgs = await prisma.organization.count();
  
  console.log('Current database state:');
  console.log(`Organizations: ${orgs}`);
  console.log(`Projects: ${projects}`);
  console.log(`Teams: ${teams}`);
  console.log(`Automation Rules: ${automations}`);
  
  // Show actual data
  const projectsList = await prisma.project.findMany({ select: { name: true } });
  console.log('\nProjects:', projectsList.map(p => p.name));
}

main().then(() => process.exit(0)).catch(console.error);
