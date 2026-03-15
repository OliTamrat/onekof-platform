const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n👤 Creating Ministry User Login...\n');

  // Get Ministry organization
  const ministry = await prisma.organization.findUnique({
    where: { slug: 'ministry-water-irrigation' }
  });

  if (!ministry) {
    console.log('❌ Ministry organization not found!');
    return;
  }

  console.log(`✅ Found organization: ${ministry.name}\n`);

  // Get the Jira project
  const project = await prisma.project.findFirst({
    where: {
      organizationId: ministry.id,
      key: 'JIRA'
    }
  });

  if (!project) {
    console.log('❌ Jira project not found!');
    return;
  }

  console.log(`✅ Found project: ${project.name}\n`);

  // Create or update user
  const userEmail = 'ministry@hakimet.com';

  let user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (user) {
    console.log(`✅ User already exists: ${user.email}`);
  } else {
    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'Ministry Administrator',
        timezone: 'Africa/Addis_Ababa',
        language: 'AM'
      }
    });
    console.log(`✅ Created new user: ${user.email}`);
  }

  // Add user to organization if not already a member
  const orgMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: ministry.id,
        userId: user.id
      }
    }
  });

  if (!orgMember) {
    await prisma.organizationMember.create({
      data: {
        organizationId: ministry.id,
        userId: user.id,
        role: 'ADMIN',
        budgetAccess: 'FULL_CONTROL'
      }
    });
    console.log(`✅ Added user to organization with ADMIN role and FULL_CONTROL budget access`);
  } else {
    console.log(`✅ User already member of organization (${orgMember.role})`);
  }

  // Add user to project if not already a member
  const projectMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: user.id
      }
    }
  });

  if (!projectMember) {
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: 'ADMIN',
        budgetAccess: 'FULL_CONTROL',
        addedBy: user.id
      }
    });
    console.log(`✅ Added user to project with ADMIN role\n`);
  } else {
    console.log(`✅ User already member of project (${projectMember.role})\n`);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✨ LOGIN CREDENTIALS CREATED!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('🌐 URL: http://localhost:3000');
  console.log('📧 Email: ministry@hakimet.com');
  console.log('🔑 Password: (Use passwordless login or set password in NextAuth)');
  console.log('');
  console.log('👤 User Details:');
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ADMIN`);
  console.log(`   Budget Access: FULL_CONTROL`);
  console.log('');
  console.log('🏛️  Organization: Ministry of Water and Irrigation');
  console.log('📊 Project: Jira Water Dam & Irrigation');
  console.log('💰 Budget: 250,000,000 ETB');
  console.log('');
  console.log('🔗 Direct Budget Link:');
  console.log(`   http://localhost:3000/projects/${project.id}/budget`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main();
