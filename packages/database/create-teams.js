const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting teams creation...\n');

    // Get the first organization
    const organization = await prisma.organization.findFirst({
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organization) {
      throw new Error('No organization found. Please create an organization first.');
    }

    // Get the first organization member to use as creator
    const firstMember = organization.members[0];
    if (!firstMember) {
      throw new Error('No organization members found.');
    }

    const creatorId = firstMember.userId;

    console.log(`📁 Found organization: ${organization.name} (${organization.id})\n`);

    // Get the test users we created
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'abebe.bekele@test.onekof.com',
            'chaltu.getachew@test.onekof.com',
            'dawit.haile@test.onekof.com',
          ],
        },
      },
    });

    if (testUsers.length === 0) {
      throw new Error('No test users found. Please run create-test-members.js first.');
    }

    console.log(`👥 Found ${testUsers.length} test users\n`);

    // Define teams to create
    const teamsData = [
      {
        name: 'Engineering Team',
        description: 'Full-stack and backend development team',
        icon: '💻',
        color: '#0065FF',
        members: [
          { email: 'abebe.bekele@test.onekof.com', role: 'LEAD' },
          { email: 'dawit.haile@test.onekof.com', role: 'MEMBER' },
        ],
      },
      {
        name: 'Design Team',
        description: 'UI/UX and product design team',
        icon: '🎨',
        color: '#9333EA',
        members: [
          { email: 'chaltu.getachew@test.onekof.com', role: 'LEAD' },
        ],
      },
      {
        name: 'Product Team',
        description: 'Cross-functional product development team',
        icon: '🚀',
        color: '#10B981',
        members: [
          { email: 'abebe.bekele@test.onekof.com', role: 'MEMBER' },
          { email: 'chaltu.getachew@test.onekof.com', role: 'MEMBER' },
          { email: 'dawit.haile@test.onekof.com', role: 'MEMBER' },
        ],
      },
    ];

    console.log('🔧 Creating teams...\n');

    for (const teamData of teamsData) {
      // Check if team already exists
      const existingTeam = await prisma.team.findFirst({
        where: {
          organizationId: organization.id,
          name: teamData.name,
        },
      });

      let team;
      if (existingTeam) {
        console.log(`⚠️  Team already exists: ${teamData.name}`);
        team = existingTeam;
      } else {
        // Create team
        team = await prisma.team.create({
          data: {
            organizationId: organization.id,
            name: teamData.name,
            description: teamData.description,
            icon: teamData.icon,
            color: teamData.color,
            createdBy: creatorId,
          },
        });
        console.log(`✅ Created team: ${teamData.name}`);
      }

      // Add members to team
      for (const memberData of teamData.members) {
        const user = testUsers.find(u => u.email === memberData.email);

        if (!user) {
          console.log(`   ⚠️  User not found: ${memberData.email}`);
          continue;
        }

        // Check if team member already exists
        const existingTeamMember = await prisma.teamMember.findUnique({
          where: {
            teamId_userId: {
              teamId: team.id,
              userId: user.id,
            },
          },
        });

        if (existingTeamMember) {
          console.log(`   └─ ${user.name} already in team`);
        } else {
          await prisma.teamMember.create({
            data: {
              teamId: team.id,
              userId: user.id,
              role: memberData.role,
              addedBy: creatorId,
            },
          });
          console.log(`   └─ Added ${user.name} as ${memberData.role}`);
        }
      }
      console.log('');
    }

    console.log('✨ Teams created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Organization: ${organization.name}`);
    console.log(`   Teams created: ${teamsData.length}`);
    console.log(`   Teams: ${teamsData.map(t => t.name).join(', ')}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
