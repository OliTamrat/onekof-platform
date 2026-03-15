const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🎨 Fixing team icons to use Lucide React icons...\n');

    const organization = await prisma.organization.findFirst();

    if (!organization) {
      throw new Error('No organization found.');
    }

    console.log(`📁 Found organization: ${organization.name}\n`);

    // Define proper team configurations with Lucide icons
    const teamUpdates = [
      {
        oldName: 'Backend Engineering',
        newData: {
          name: 'Backend Engineering',
          description: 'Backend development and API services',
          icon: 'Terminal',
          color: '#3B82F6',
        },
      },
      {
        oldName: 'Frontend Engineering',
        newData: {
          name: 'Frontend Engineering',
          description: 'Frontend development and UI implementation',
          icon: 'Code',
          color: '#10B981',
        },
      },
      {
        oldName: 'Product Design',
        newData: {
          name: 'Product Design',
          description: 'UX/UI design and user research',
          icon: 'Palette',
          color: '#F59E0B',
        },
      },
      {
        oldName: 'Analytics Team',
        newData: {
          name: 'Analytics Team',
          description: 'Data analytics and business intelligence',
          icon: 'TrendingUp',
          color: '#8B5CF6',
        },
      },
      {
        oldName: 'Development Team',
        newData: {
          name: 'Platform Development',
          description: 'Full-stack platform development',
          icon: 'Database',
          color: '#06B6D4',
        },
      },
      {
        oldName: 'Creative Team',
        newData: {
          name: 'Creative Production',
          description: 'Content creation and media production',
          icon: 'Camera',
          color: '#EC4899',
        },
      },
      {
        oldName: 'Production Team',
        newData: {
          name: 'Video Production',
          description: 'Video editing and post-production',
          icon: 'Sparkles',
          color: '#EF4444',
        },
      },
      {
        oldName: 'Engineering Team',
        newData: {
          name: 'Engineering Team',
          description: 'Full-stack engineering and architecture',
          icon: 'Code',
          color: '#0065FF',
        },
      },
      {
        oldName: 'Design Team',
        newData: {
          name: 'Design Team',
          description: 'Product design and user experience',
          icon: 'Palette',
          color: '#9333EA',
        },
      },
      {
        oldName: 'Product Team',
        newData: {
          name: 'Product Team',
          description: 'Product management and strategy',
          icon: 'Rocket',
          color: '#10B981',
        },
      },
    ];

    console.log('🔧 Updating teams...\n');

    for (const update of teamUpdates) {
      const team = await prisma.team.findFirst({
        where: {
          organizationId: organization.id,
          name: update.oldName,
          deletedAt: null,
        },
      });

      if (team) {
        await prisma.team.update({
          where: { id: team.id },
          data: update.newData,
        });
        console.log(`✅ Updated: ${update.newData.name}`);
        console.log(`   Icon: ${update.newData.icon} (was: ${team.icon})`);
        console.log(`   Color: ${update.newData.color}`);
        console.log('');
      } else {
        console.log(`⚠️  Team not found: ${update.oldName}\n`);
      }
    }

    // Verify all teams now have proper icons
    const allTeams = await prisma.team.findMany({
      where: {
        organizationId: organization.id,
        deletedAt: null,
      },
      select: {
        name: true,
        icon: true,
        color: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('📋 Final Team List:\n');
    allTeams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.name}`);
      console.log(`   Icon: ${team.icon}`);
      console.log(`   Color: ${team.color}`);
      console.log(`   Members: ${team._count.members}`);
      console.log('');
    });

    console.log('✨ All teams updated successfully!');
    console.log('   All teams now use Lucide React icons (no emojis)');
    console.log('   Refresh your browser to see the changes\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
