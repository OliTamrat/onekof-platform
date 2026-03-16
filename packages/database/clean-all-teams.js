const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🧹 Cleaning up ALL teams...\n');

    const organization = await prisma.organization.findFirst();

    if (!organization) {
      throw new Error('No organization found.');
    }

    console.log(`📁 Organization: ${organization.name}\n`);

    // Get ALL teams (including those that might be marked as deleted)
    const allTeams = await prisma.team.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    console.log(`📊 Found ${allTeams.length} total teams\n`);

    // Group teams by whether they have emoji icons
    const emojiTeams = [];
    const lucideTeams = [];

    for (const team of allTeams) {
      // Check if icon starts with emoji pattern (unicode or actual emoji)
      const hasEmoji = team.icon && /[\u{1F300}-\u{1F9FF}]|[⚙️🎨✨📊💻🎬🎥]/u.test(team.icon);

      if (hasEmoji) {
        emojiTeams.push(team);
      } else {
        lucideTeams.push(team);
      }
    }

    console.log(`Teams with emojis: ${emojiTeams.length}`);
    console.log(`Teams with Lucide icons: ${lucideTeams.length}\n`);

    // Update or delete emoji teams
    if (emojiTeams.length > 0) {
      console.log('🔧 Updating teams with emoji icons:\n');

      for (const team of emojiTeams) {
        const name = team.name.toLowerCase();
        let newIcon = 'Users'; // Default
        let shouldUpdate = true;

        // Determine proper Lucide icon based on team name
        if (name.includes('analytics')) {
          newIcon = 'TrendingUp';
        } else if (name.includes('development') || name.includes('dev')) {
          newIcon = 'Database';
        } else if (name.includes('creative')) {
          newIcon = 'Camera';
        } else if (name.includes('production') || name.includes('video')) {
          newIcon = 'Sparkles';
        } else if (name.includes('backend')) {
          newIcon = 'Terminal';
        } else if (name.includes('frontend')) {
          newIcon = 'Code';
        } else if (name.includes('design')) {
          newIcon = 'Palette';
        } else if (name.includes('product')) {
          newIcon = 'Rocket';
        } else if (name.includes('engineering')) {
          newIcon = 'Code';
        }

        if (shouldUpdate) {
          await prisma.team.update({
            where: { id: team.id },
            data: {
              icon: newIcon,
            },
          });
          console.log(`✅ ${team.name}: ${team.icon} → ${newIcon}`);
        }
      }
    }

    // Final list
    const finalTeams = await prisma.team.findMany({
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

    console.log('\n\n📋 FINAL TEAM LIST:\n');
    console.log('='.repeat(70));

    finalTeams.forEach((team, index) => {
      console.log(`\n${index + 1}. ${team.name}`);
      console.log(`   📝 ${team.description || 'No description'}`);
      console.log(`   🎨 Icon: ${team.icon} (Lucide)`);
      console.log(`   🎨 Color: ${team.color}`);
      console.log(`   👥 Members: ${team._count.members}`);
      console.log(`   📁 Projects: ${team._count.projects}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log(`\n✨ Clean-up complete!`);
    console.log(`   Total active teams: ${finalTeams.length}`);
    console.log(`   All teams now use Lucide React icons`);
    console.log(`\n🔄 Refresh your browser at /dashboard/teams\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
