const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Fixing user organization assignments...\n');

    // Get the organization
    const organization = await prisma.organization.findFirst();

    if (!organization) {
      throw new Error('No organization found.');
    }

    console.log(`📁 Found organization: ${organization.name} (${organization.id})\n`);

    // Get all users who are members of this organization
    const orgMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        user: true,
      },
    });

    console.log(`👥 Found ${orgMembers.length} organization members\n`);

    // Update each user's defaultOrganizationId
    for (const member of orgMembers) {
      if (member.user.defaultOrganizationId !== organization.id) {
        await prisma.user.update({
          where: { id: member.userId },
          data: { defaultOrganizationId: organization.id },
        });
        console.log(`✅ Updated ${member.user.name || member.user.email} - set default organization`);
      } else {
        console.log(`✓  ${member.user.name || member.user.email} - already has correct organization`);
      }
    }

    console.log('\n✨ All users now have correct default organization!');
    console.log(`\nTo see teams, log in as any of these users:`);
    orgMembers.forEach(m => {
      console.log(`   - ${m.user.email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
