const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Quick seed: Creating users and organizations...\n');

  // Hash password once
  const hashedPassword = await hash('password123', 10);

  // Create users
  console.log('Creating 8 users...');

  const owner1 = await prisma.user.upsert({
    where: { email: 'owner@olink.com' },
    update: {},
    create: {
      email: 'owner@olink.com',
      password: hashedPassword,
      emailVerified: new Date(),
      name: 'Abebe Kebede',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abebe',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner@adwa.com' },
    update: {},
    create: {
      email: 'owner@adwa.com',
      password: hashedPassword,
      emailVerified: new Date(),
      name: 'Almaz Tadesse',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Almaz',
    },
  });

  const engineer1 = await prisma.user.upsert({
    where: { email: 'engineer1@olink.com' },
    update: {},
    create: {
      email: 'engineer1@olink.com',
      password: hashedPassword,
      emailVerified: new Date(),
      name: 'Dawit Haile',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dawit',
    },
  });

  const engineer2 = await prisma.user.upsert({
    where: { email: 'engineer2@olink.com' },
    update: {},
    create: {
      email: 'engineer2@olink.com',
      password: hashedPassword,
      emailVerified: new Date(),
      name: 'Tsehay Solomon',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tsehay',
    },
  });

  const designer1 = await prisma.user.upsert({
    where: { email: 'designer1@olink.com' },
    update: {},
    create: {
      email: 'designer1@olink.com',
      password: hashedPassword,
      emailVerified: new Date(),
      name: 'Bethlehem Gebre',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bethlehem',
    },
  });

  const designer2 = await prisma.user.upsert({
    where: { email: 'designer2@adwa.com' },
    update: {},
    create: {
      email: 'designer2@adwa.com',
      password: hashedPassword,
      emailVerified: new Date(),
      name: 'Meron Tesfaye',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meron',
    },
  });

  const pm1 = await prisma.user.upsert({
    where: { email: 'pm1@olink.com' },
    update: {},
    create: {
      email: 'pm1@olink.com',
      password: hashedPassword,
      emailVerified: new Date(),
      name: 'Yohannes Alemu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yohannes',
    },
  });

  const pm2 = await prisma.user.upsert({
    where: { email: 'pm2@adwa.com' },
    update: {},
    create: {
      email: 'pm2@adwa.com',
      password: hashedPassword,
      emailVerified: new Date(),
      name: 'Sara Mengistu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    },
  });

  console.log('✅ Users created!');

  // Create organizations
  console.log('\nCreating 2 organizations...');

  const org1 = await prisma.organization.upsert({
    where: { slug: 'olink-technologies' },
    update: {},
    create: {
      name: 'Olink Technologies',
      slug: 'olink-technologies',
      schemaName: 'onekof_org_olink',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      maxMembers: 50,
      maxProjects: 50,
      maxStorage: 100,
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { slug: 'adwa-digital' },
    update: {},
    create: {
      name: 'Adwa Digital Solutions',
      slug: 'adwa-digital',
      schemaName: 'onekof_org_adwa',
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      maxMembers: 100,
      maxProjects: 100,
      maxStorage: 500,
    },
  });

  console.log('✅ Organizations created!');

  // Add users to organizations
  console.log('\nAdding members to organizations...');

  // Olink Technologies members
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org1.id,
        userId: owner1.id,
      },
    },
    update: {},
    create: {
      organizationId: org1.id,
      userId: owner1.id,
      role: 'OWNER',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org1.id,
        userId: engineer1.id,
      },
    },
    update: {},
    create: {
      organizationId: org1.id,
      userId: engineer1.id,
      role: 'MEMBER',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org1.id,
        userId: engineer2.id,
      },
    },
    update: {},
    create: {
      organizationId: org1.id,
      userId: engineer2.id,
      role: 'MEMBER',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org1.id,
        userId: designer1.id,
      },
    },
    update: {},
    create: {
      organizationId: org1.id,
      userId: designer1.id,
      role: 'MEMBER',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org1.id,
        userId: pm1.id,
      },
    },
    update: {},
    create: {
      organizationId: org1.id,
      userId: pm1.id,
      role: 'ADMIN',
    },
  });

  // Adwa Digital members
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org2.id,
        userId: owner2.id,
      },
    },
    update: {},
    create: {
      organizationId: org2.id,
      userId: owner2.id,
      role: 'OWNER',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org2.id,
        userId: designer2.id,
      },
    },
    update: {},
    create: {
      organizationId: org2.id,
      userId: designer2.id,
      role: 'MEMBER',
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org2.id,
        userId: pm2.id,
      },
    },
    update: {},
    create: {
      organizationId: org2.id,
      userId: pm2.id,
      role: 'ADMIN',
    },
  });

  // Set default organizations
  await prisma.user.update({
    where: { id: owner1.id },
    data: { defaultOrganizationId: org1.id },
  });

  await prisma.user.update({
    where: { id: owner2.id },
    data: { defaultOrganizationId: org2.id },
  });

  console.log('✅ Members added to organizations!');

  console.log('\n✨ Seed complete!\n');
  console.log('📧 Test Credentials:');
  console.log('   Email: owner@olink.com');
  console.log('   Password: password123\n');
  console.log('   Email: owner@adwa.com');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
