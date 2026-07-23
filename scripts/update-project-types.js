const { prisma } = require('./packages/database/src/index.ts');

async function updateProjectTypes() {
  try {
    console.log('🔍 Fetching all projects...');

    // Get all projects
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        key: true,
        type: true,
      }
    });

    console.log(`📊 Found ${projects.length} projects\n`);

    if (projects.length === 0) {
      console.log('ℹ️  No projects found. Navigation will use default "BUSINESS" type.');
      console.log('   Create projects and set their types for custom navigation.');
      return;
    }

    // Update each project to have a default type if not set
    for (const project of projects) {
      const currentType = project.type;

      // If no type is set, determine based on project name/key
      let suggestedType = 'BUSINESS'; // Default

      const nameLower = project.name.toLowerCase();
      const keyLower = project.key.toLowerCase();

      // Try to determine type from name
      if (nameLower.includes('software') || nameLower.includes('dev') || nameLower.includes('app') || keyLower.includes('dev')) {
        suggestedType = 'SOFTWARE';
      } else if (nameLower.includes('marketing') || nameLower.includes('campaign') || keyLower.includes('mkt')) {
        suggestedType = 'MARKETING';
      } else if (nameLower.includes('ops') || nameLower.includes('operation') || nameLower.includes('infrastructure') || keyLower.includes('ops')) {
        suggestedType = 'OPERATIONS';
      } else if (nameLower.includes('research') || nameLower.includes('study') || keyLower.includes('res')) {
        suggestedType = 'RESEARCH';
      } else if (nameLower.includes('construction') || nameLower.includes('building') || keyLower.includes('con')) {
        suggestedType = 'CONSTRUCTION';
      }

      if (!currentType || currentType === null) {
        console.log(`📝 Updating project "${project.name}" (${project.key})`);
        console.log(`   Type: null → ${suggestedType}`);

        await prisma.project.update({
          where: { id: project.id },
          data: { type: suggestedType }
        });
      } else {
        console.log(`✅ Project "${project.name}" (${project.key}) already has type: ${currentType}`);
      }
    }

    console.log('\n✨ Project types updated successfully!');
    console.log('\n💡 To manually change project types, use:');
    console.log('   UPDATE "Project" SET type = \'SOFTWARE\' WHERE name = \'YourProjectName\';');
    console.log('\n📚 Available types:');
    console.log('   - SOFTWARE: Dev projects with Code, Releases, Backlog');
    console.log('   - BUSINESS: General projects with Budget, Team, Goals');
    console.log('   - MARKETING: Campaigns, Social, Analytics');
    console.log('   - OPERATIONS: Incidents, Monitoring, SLAs');
    console.log('   - RESEARCH: Data, Findings, Objectives');
    console.log('   - CONSTRUCTION: Plans, Materials, Inspections');
    console.log('   - CUSTOM: Fully customizable navigation');

  } catch (error) {
    console.error('❌ Error updating project types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjectTypes();
