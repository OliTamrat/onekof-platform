const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting test team members creation...\n');

    // Get the first organization (assuming it exists)
    const organization = await prisma.organization.findFirst({
      include: {
        projects: true,
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

    // Get the first organization member to use as createdBy
    const firstMember = organization.members[0];
    if (!firstMember) {
      throw new Error('No organization members found. Please add at least one member first.');
    }

    const creatorId = firstMember.userId;

    console.log(`📁 Found organization: ${organization.name} (${organization.id})\n`);

    // Check for projects with the specified names
    let projects = await prisma.project.findMany({
      where: {
        organizationId: organization.id,
        name: {
          in: ['Oli Oli', 'Boni Oli', 'Barii Oli'],
        },
      },
    });

    // If projects don't exist, create them
    const projectNames = ['Oli Oli', 'Boni Oli', 'Barii Oli'];
    const missingProjects = projectNames.filter(
      name => !projects.find(p => p.name === name)
    );

    if (missingProjects.length > 0) {
      console.log(`🔧 Creating missing projects: ${missingProjects.join(', ')}\n`);

      for (const projectName of missingProjects) {
        const project = await prisma.project.create({
          data: {
            name: projectName,
            key: projectName.replace(/\s+/g, '-').toUpperCase().substring(0, 10),
            organizationId: organization.id,
            template: 'KANBAN',
            settings: {},
            createdBy: creatorId,
          },
        });
        projects.push(project);
        console.log(`✅ Created project: ${project.name} (${project.key})`);
      }
      console.log('');
    }

    // Define test team members
    const testUsers = [
      {
        name: 'Abebe Bekele',
        email: 'abebe.bekele@test.onekof.com',
        role: 'ADMIN',
        bio: 'Senior Software Engineer - Full Stack Development',
        projects: ['Oli Oli', 'Boni Oli'],
      },
      {
        name: 'Chaltu Getachew',
        email: 'chaltu.getachew@test.onekof.com',
        role: 'MEMBER',
        bio: 'Product Designer - UI/UX Specialist',
        projects: ['Oli Oli', 'Barii Oli'],
      },
      {
        name: 'Dawit Haile',
        email: 'dawit.haile@test.onekof.com',
        role: 'MEMBER',
        bio: 'Backend Engineer - API Development',
        projects: ['Boni Oli', 'Barii Oli'],
      },
    ];

    const password = await bcrypt.hash('Test@123456', 10);

    console.log('👥 Creating test team members...\n');

    for (const userData of testUsers) {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (user) {
        console.log(`⚠️  User already exists: ${userData.email}`);
      } else {
        // Create user
        user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            bio: userData.bio,
            password: password,
            emailVerified: new Date(),
            timezone: 'Africa/Addis_Ababa',
            language: 'EN',
            defaultOrganizationId: organization.id,
          },
        });
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      }

      // Check if organization member already exists
      const existingOrgMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: user.id,
          },
        },
      });

      if (!existingOrgMember) {
        // Create organization member
        await prisma.organizationMember.create({
          data: {
            organizationId: organization.id,
            userId: user.id,
            role: userData.role,
          },
        });
        console.log(`   └─ Added to organization as ${userData.role}`);
      } else {
        console.log(`   └─ Already a member of organization`);
      }

      // Assign to projects
      for (const projectName of userData.projects) {
        const project = projects.find(p => p.name === projectName);

        if (project) {
          // Check if project member already exists
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

    console.log('\n✨ Test team members created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Organization: ${organization.name}`);
    console.log(`   Projects: ${projects.map(p => p.name).join(', ')}`);
    console.log(`   Team Members: ${testUsers.length}`);
    console.log(`\n🔐 Default password for all test users: Test@123456\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
