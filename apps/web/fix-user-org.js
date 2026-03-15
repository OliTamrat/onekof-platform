const { PrismaClient } = require('@onekof/database');

const prisma = new PrismaClient();

async function fixUserOrganization() {
  try {
    // Find the user by email
    const userEmail = 'oli@onekof.com';

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📊 Current User Status:');
    console.log(`Email: ${user.email}`);
    console.log(`Default Organization ID: ${user.defaultOrganizationId || 'NOT SET'}`);

    // Find user's organization memberships
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: {
        organization: true,
      },
    });

    console.log(`Organization Memberships: ${memberships.length}`);

    if (memberships.length > 0) {
      console.log('\n🏢 Organizations:');
      memberships.forEach((membership, index) => {
        console.log(`  ${index + 1}. ${membership.organization.name} (${membership.organization.id}) - Role: ${membership.role}`);
      });

      if (!user.defaultOrganizationId) {
        // Set the first organization as default (Olink Fleet)
        const firstOrgId = memberships[0].organization.id;

        await prisma.user.update({
          where: { id: user.id },
          data: { defaultOrganizationId: firstOrgId },
        });

        console.log(`\n✅ Set default organization to: ${memberships[0].organization.name}`);
      } else {
        console.log('\n✅ User already has a default organization set');
      }
    } else {
      console.log('\n❌ User has no organization memberships!');
    }

    console.log('\n✅ Done! You can now create teams and goals.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserOrganization();
