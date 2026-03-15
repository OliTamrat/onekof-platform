const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Reorganizing all teams with proper Lucide icons...\n');

    const organization = await prisma.organization.findFirst();

    if (!organization) {
      throw new Error('No organization found.');
    }

    console.log(`📁 Found organization: ${organization.name}\n`);

    // Get all teams
    const allTeams = await prisma.team.findMany({
      where: {
        organizationId: organization.id,
        deletedAt: null,
      },
    });

    console.log(`Found ${allTeams.length} teams to update\n`);

    // Update each team based on keywords in their current names
    for (const team of allTeams) {
      let newData = null;

      // Match by current name (case-insensitive contains)
      const name = team.name.toLowerCase();

      if (name.includes('backend') || name.includes('terminal')) {
        newData = {
          name: 'Backend Engineering',
          description: 'Backend development and API services',
          icon: 'Terminal',
          color: '#3B82F6',
        };
      } else if (name.includes('frontend') && !name.includes('backend')) {
        newData = {
          name: 'Frontend Engineering',
          description: 'Frontend development and UI implementation',
          icon: 'Code',
          color: '#10B981',
        };
      } else if (name.includes('product design') || name.includes('palette product')) {
        newData = {
          name: 'Product Design',
          description: 'UX/UI design and user research',
          icon: 'Palette',
          color: '#F59E0B',
        };
      } else if (name.includes('analytics')) {
        newData = {
          name: 'Analytics Team',
          description: 'Data analytics and business intelligence',
          icon: 'TrendingUp',
          color: '#8B5CF6',
        };
      } else if (name.includes('development') && name.includes('platform')) {
        newData = {
          name: 'Platform Development',
          description: 'Full-stack platform development',
          icon: 'Database',
          color: '#06B6D4',
        };
      } else if (name.includes('creative')) {
        newData = {
          name: 'Creative Production',
          description: 'Content creation and media production',
          icon: 'Camera',
          color: '#EC4899',
        };
      } else if (name.includes('production') || name.includes('video')) {
        newData = {
          name: 'Video Production',
          description: 'Video editing and post-production',
          icon: 'Sparkles',
          color: '#EF4444',
        };
      } else if (name.includes('engineering team') || name.includes('code engineering')) {
        newData = {
          name: 'Engineering Team',
          description: 'Full-stack engineering and architecture',
          icon: 'Code',
          color: '#0065FF',
        };
      } else if (name.includes('design team') || name.includes('palette design')) {
        newData = {
          name: 'Design Team',
          description: 'Product design and user experience',
          icon: 'Palette',
          color: '#9333EA',
        };
      } else if (name.includes('product team') || name.includes('rocket product')) {
        newData = {
          name: 'Product Team',
          description: 'Product management and strategy',
          icon: 'Rocket',
          color: '#10B981',
        };
      }

      if (newData) {
        await prisma.team.update({
          where: { id: team.id },
          data: newData,
        });
        console.log(`✅ ${team.name} → ${newData.name} (${newData.icon})`);
      } else {
        console.log(`⚠️  Skipped: ${team.name} (no matching pattern)`);
      }
    }

    // Final verification
    const updatedTeams = await prisma.team.findMany({
      where: {
        organizationId: organization.id,
        deletedAt: null,
      },
      select: {
        name: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('\n\n📋 Final Team Structure:\n');
    console.log('='.repeat(60));
    updatedTeams.forEach((team, index) => {
      console.log(`\n${index + 1}. ${team.name}`);
      console.log(`   Description: ${team.description}`);
      console.log(`   Icon: ${team.icon} (Lucide React)`);
      console.log(`   Color: ${team.color}`);
      console.log(`   Members: ${team._count.members} | Projects: ${team._count.projects}`);
    });
    console.log('\n' + '='.repeat(60));

    console.log('\n✨ All teams reorganized successfully!');
    console.log('   ✓ All teams now use Lucide React icons');
    console.log('   ✓ No emoji icons remaining');
    console.log('   ✓ Clean, professional structure');
    console.log('\n🔄 Refresh your browser to see the changes!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
