const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Fixing team members setup...\n');

    // Get the organization
    const organization = await prisma.organization.findFirst({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        projects: true,
      },
    });

    if (!organization) {
      throw new Error('No organization found.');
    }

    const creatorId = organization.members[0]?.userId;
    if (!creatorId) {
      throw new Error('No organization members found.');
    }

    console.log(`📁 Found organization: ${organization.name}\n`);

    // Step 1: Delete the incorrectly created projects
    console.log('🗑️  Deleting incorrectly created projects...\n');

    const projectsToDelete = await prisma.project.findMany({
      where: {
        organizationId: organization.id,
        name: {
          in: ['Oli Oli', 'Boni Oli', 'Barii Oli'],
        },
      },
    });

    for (const project of projectsToDelete) {
      await prisma.project.delete({
        where: { id: project.id },
      });
      console.log(`✅ Deleted project: ${project.name}`);
    }
    console.log('');

    // Step 2: Get existing projects
    console.log('📋 Finding existing projects...\n');

    const existingProjects = await prisma.project.findMany({
      where: {
        organizationId: organization.id,
      },
    });

    console.log(`Found ${existingProjects.length} existing projects:`);
    existingProjects.forEach(p => console.log(`   - ${p.name}`));
    console.log('');

    // Step 3: Create three individuals as team members
    console.log('👥 Creating individual team members...\n');

    const password = await bcrypt.hash('Test@123456', 10);

    const individuals = [
      {
        name: 'Oli Oli',
        email: 'oli.oli@test.onekof.com',
        role: 'MEMBER',
        bio: 'Software Developer',
        projects: existingProjects.slice(0, 2).map(p => p.name), // First 2 projects
      },
      {
        name: 'Boni Oli',
        email: 'boni.oli@test.onekof.com',
        role: 'MEMBER',
        bio: 'QA Engineer',
        projects: existingProjects.slice(1, 3).map(p => p.name), // Middle 2 projects
      },
      {
        name: 'Barii Oli',
        email: 'barii.oli@test.onekof.com',
        role: 'MEMBER',
        bio: 'DevOps Engineer',
        projects: existingProjects.slice(2, 4).map(p => p.name), // Last 2 projects
      },
    ];

    const createdUsers = [];

    for (const individualData of individuals) {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: individualData.email },
      });

      if (user) {
        console.log(`⚠️  User already exists: ${individualData.email}`);
      } else {
        // Create user
        user = await prisma.user.create({
          data: {
            email: individualData.email,
            name: individualData.name,
            bio: individualData.bio,
            password: password,
            emailVerified: new Date(),
            timezone: 'Africa/Addis_Ababa',
            language: 'EN',
            defaultOrganizationId: organization.id,
          },
        });
        console.log(`✅ Created user: ${individualData.name} (${individualData.email})`);
      }

      createdUsers.push(user);

      // Add to organization
      const existingOrgMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: user.id,
          },
        },
      });

      if (!existingOrgMember) {
        await prisma.organizationMember.create({
          data: {
            organizationId: organization.id,
            userId: user.id,
            role: individualData.role,
          },
        });
        console.log(`   └─ Added to organization as ${individualData.role}`);
      } else {
        console.log(`   └─ Already a member of organization`);
      }

      // Assign to projects
      for (const projectName of individualData.projects) {
        const project = existingProjects.find(p => p.name === projectName);

        if (project) {
          const existingProjectMember = await prisma.projectMember.findUnique({
            where: {
              projectId_userId: {
                projectId: project.id,
                userId: user.id,
              },
            },
          });

          if (!existingProjectMember) {
            await prisma.projectMember.create({
              data: {
                projectId: project.id,
                userId: user.id,
                role: 'MEMBER',
                addedBy: creatorId,
              },
            });
            console.log(`   └─ Assigned to project: ${projectName}`);
          } else {
            console.log(`   └─ Already assigned to project: ${projectName}`);
          }
        }
      }
      console.log('');
    }

    // Step 4: Assign to teams
    console.log('🔧 Assigning to teams...\n');

    const teams = await prisma.team.findMany({
      where: {
        organizationId: organization.id,
      },
    });

    if (teams.length > 0) {
      // Assign Oli Oli to Engineering Team
      const engineeringTeam = teams.find(t => t.name === 'Engineering Team');
      if (engineeringTeam && createdUsers[0]) {
        const existingMember = await prisma.teamMember.findUnique({
          where: {
            teamId_userId: {
              teamId: engineeringTeam.id,
              userId: createdUsers[0].id,
            },
          },
        });

        if (!existingMember) {
          await prisma.teamMember.create({
            data: {
              teamId: engineeringTeam.id,
              userId: createdUsers[0].id,
              role: 'MEMBER',
              addedBy: creatorId,
            },
          });
          console.log(`✅ Added ${createdUsers[0].name} to Engineering Team`);
        }
      }

      // Assign Boni Oli to Product Team
      const productTeam = teams.find(t => t.name === 'Product Team');
      if (productTeam && createdUsers[1]) {
        const existingMember = await prisma.teamMember.findUnique({
          where: {
            teamId_userId: {
              teamId: productTeam.id,
              userId: createdUsers[1].id,
            },
          },
        });

        if (!existingMember) {
          await prisma.teamMember.create({
            data: {
              teamId: productTeam.id,
              userId: createdUsers[1].id,
              role: 'MEMBER',
              addedBy: creatorId,
            },
          });
          console.log(`✅ Added ${createdUsers[1].name} to Product Team`);
        }
      }

      // Assign Barii Oli to Engineering Team
      if (engineeringTeam && createdUsers[2]) {
        const existingMember = await prisma.teamMember.findUnique({
          where: {
            teamId_userId: {
              teamId: engineeringTeam.id,
              userId: createdUsers[2].id,
            },
          },
        });

        if (!existingMember) {
          await prisma.teamMember.create({
            data: {
              teamId: engineeringTeam.id,
              userId: createdUsers[2].id,
              role: 'MEMBER',
              addedBy: creatorId,
            },
          });
          console.log(`✅ Added ${createdUsers[2].name} to Engineering Team`);
        }
      }
    }

    console.log('\n✨ Team members setup completed!');
    console.log('\n📋 Summary:');
    console.log(`   Organization: ${organization.name}`);
    console.log(`   Deleted projects: 3 (Oli Oli, Boni Oli, Barii Oli)`);
    console.log(`   Created individuals: 3 (Oli Oli, Boni Oli, Barii Oli)`);
    console.log(`   Existing projects: ${existingProjects.map(p => p.name).join(', ')}`);
    console.log(`\n🔐 Default password for new users: Test@123456\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
