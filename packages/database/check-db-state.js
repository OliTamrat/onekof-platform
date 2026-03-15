const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n');

    // Check organizations
    const orgs = await prisma.organization.count();
    console.log(`📊 Organizations: ${orgs}`);

    if (orgs > 0) {
      const orgList = await prisma.organization.findMany({
        select: {
          name: true,
          plan: true,
          createdAt: true
        },
        take: 5
      });
      console.log('   Organizations:', orgList.map(o => o.name).join(', '));
    }

    // Check users
    const users = await prisma.user.count();
    console.log(`\n👥 Users: ${users}`);

    // Check projects
    const projects = await prisma.project.count();
    console.log(`\n📁 Projects: ${projects}`);

    if (projects > 0) {
      const projectList = await prisma.project.findMany({
        select: {
          name: true,
          key: true,
          createdAt: true
        },
        take: 10
      });
      console.log('   Projects:', projectList.map(p => `${p.key} - ${p.name}`).join(', '));
    }

    // Check tasks
    const tasks = await prisma.task.count();
    console.log(`\n✓ Tasks: ${tasks}`);

    // Check teams
    const teams = await prisma.team.count();
    console.log(`\n👥 Teams: ${teams}`);

    // Check goals
    const goals = await prisma.goal.count();
    console.log(`\n🎯 Goals: ${goals}`);

    // Check automation rules
    const automationRules = await prisma.automationRule.count();
    console.log(`\n⚡ Automation Rules: ${automationRules}`);

    if (automationRules > 0) {
      const templates = await prisma.automationRule.count({
        where: { isTemplate: true }
      });
      console.log(`   Templates: ${templates}`);
      console.log(`   Active Rules: ${automationRules - templates}`);
    }

    console.log('\n✅ Database is accessible and has data!\n');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
