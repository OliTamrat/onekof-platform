const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔧 Fixing Ministry User...\n');

  // Step 1: Delete incorrect user
  const wrongEmail = 'ministry@hakimet.com';
  const wrongUser = await prisma.user.findUnique({
    where: { email: wrongEmail }
  });

  if (wrongUser) {
    // Delete all related records first
    await prisma.projectMember.deleteMany({
      where: { userId: wrongUser.id }
    });
    await prisma.organizationMember.deleteMany({
      where: { userId: wrongUser.id }
    });
    await prisma.user.delete({
      where: { email: wrongEmail }
    });
    console.log(`✅ Deleted incorrect user: ${wrongEmail}\n`);
  }

  // Step 2: Get Ministry organization
  const ministry = await prisma.organization.findUnique({
    where: { slug: 'ministry-water-irrigation' }
  });

  if (!ministry) {
    console.log('❌ Ministry organization not found!');
    return;
  }

  console.log(`✅ Found organization: ${ministry.name}\n`);

  // Step 3: Get the Jira project
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

  // Step 4: Create correct user
  const correctEmail = 'admin@ministryofwater.et';
  const password = 'Ministry@2026';

  let user = await prisma.user.findUnique({
    where: { email: correctEmail }
  });

  if (user) {
    console.log(`✅ User already exists: ${user.email}`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: {
        email: correctEmail,
        name: 'Ministry Administrator',
        timezone: 'Africa/Addis_Ababa',
        language: 'AM',
        password: hashedPassword,
        defaultOrganizationId: ministry.id
      }
    });
    console.log(`✅ Created new user: ${user.email}`);
  }

  // Step 5: Add user to organization
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
        role: 'OWNER',
        budgetAccess: 'FULL_CONTROL'
      }
    });
    console.log(`✅ Added user to organization as OWNER with FULL_CONTROL budget access`);
  } else {
    console.log(`✅ User already member of organization (${orgMember.role})`);
  }

  // Step 6: Add user to project
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
    console.log(`✅ Added user to project as ADMIN\n`);
  } else {
    console.log(`✅ User already member of project (${projectMember.role})\n`);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✨ MINISTRY OF WATER & IRRIGATION - LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('🌐 URL: http://localhost:3000/auth/signin');
  console.log('📧 Email: admin@ministryofwater.et');
  console.log('🔑 Password: Ministry@2026');
  console.log('');
  console.log('👤 User Details:');
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: OWNER (Organization) / ADMIN (Project)`);
  console.log(`   Budget Access: FULL_CONTROL`);
  console.log('');
  console.log('🏛️  Organization: Ministry of Water and Irrigation');
  console.log('   (This is a separate SaaS organization, NOT related to Hakim)');
  console.log('');
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
