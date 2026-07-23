const { PrismaClient } = require('@onekof/database');
const prisma = new PrismaClient();

async function fixProductionMembership() {
  try {
    console.log('\n=== CHECKING CURRENT STATE ===');

    // Check current memberships for the admin user
    const currentMemberships = await prisma.organizationMember.findMany({
      where: {
        user: { email: 'admin@ministryofwater.et' }
      },
      include: {
        user: { select: { email: true, name: true } },
        organization: { select: { name: true, slug: true } }
      }
    });

    console.log('\nCurrent memberships for admin@ministryofwater.et:');
    currentMemberships.forEach(m => {
      console.log(`  - ${m.organization.name} (${m.organization.slug}) - Role: ${m.role}`);
    });

    // Find the incorrect membership
    const incorrectMembership = await prisma.organizationMember.findFirst({
      where: {
        user: { email: 'admin@ministryofwater.et' },
        organization: { slug: 'mint' }
      },
      include: {
        user: { select: { email: true, name: true } },
        organization: { select: { name: true, slug: true } }
      }
    });

    if (!incorrectMembership) {
      console.log('\n✅ No incorrect membership found. Database is already correct!');
      await prisma.$disconnect();
      return;
    }

    console.log('\n⚠️  FOUND INCORRECT MEMBERSHIP:');
    console.log(`   User: ${incorrectMembership.user.email}`);
    console.log(`   Organization: ${incorrectMembership.organization.name} (${incorrectMembership.organization.slug})`);
    console.log(`   Role: ${incorrectMembership.role}`);

    console.log('\n=== REMOVING INCORRECT MEMBERSHIP ===');

    // Delete the incorrect membership
    await prisma.organizationMember.delete({
      where: {
        id: incorrectMembership.id
      }
    });

    console.log('✅ Successfully removed incorrect membership!');

    // Verify the fix
    console.log('\n=== VERIFYING FIX ===');
    const updatedMemberships = await prisma.organizationMember.findMany({
      where: {
        user: { email: 'admin@ministryofwater.et' }
      },
      include: {
        user: { select: { email: true, name: true } },
        organization: { select: { name: true, slug: true } }
      }
    });

    console.log('\nUpdated memberships for admin@ministryofwater.et:');
    updatedMemberships.forEach(m => {
      console.log(`  - ${m.organization.name} (${m.organization.slug}) - Role: ${m.role}`);
    });

    console.log('\n✅ PRODUCTION DATABASE FIX COMPLETE!');
    console.log('The admin@ministryofwater.et user should now only see Ministry of Water and Irrigation.');

  } catch (error) {
    console.error('\n❌ Error fixing membership:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionMembership();
