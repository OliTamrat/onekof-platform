const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing user-organization relationships...\n');

  // Get existing organizations
  const orgs = await prisma.organization.findMany();
  console.log(`Found ${orgs.length} organizations`);

  if (orgs.length === 0) {
    console.log('No organizations found!');
    return;
  }

  const org1 = orgs[0];
  const org2 = orgs[1] || org1;

  console.log(`Organization 1: ${org1.name} (${org1.id})`);
  if (org2) console.log(`Organization 2: ${org2.name} (${org2.id})`);

  // Get all users
  const users = await prisma.user.findMany();
  console.log(`\nFound ${users.length} users`);

  // Update default organizations
  for (const user of users) {
    const org = user.email.includes('@adwa') ? org2 : org1;

    await prisma.user.update({
      where: { id: user.id },
      data: { defaultOrganizationId: org.id },
    });

    // Ensure user is member of organization
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        userId: user.id,
        role: user.email.includes('owner') ? 'OWNER' : 'MEMBER',
      },
    });

    console.log(`✅ ${user.email} → ${org.name}`);
  }

  console.log('\n✨ Done! All users have organizations.\n');
  console.log('📧 Login with:');
  console.log('   Email: owner@olink.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
