const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Setting default budget access for existing users...\n');

  try {
    // Grant FULL_CONTROL to all organization owners and admins
    const ownersAndAdmins = await prisma.organizationMember.updateMany({
      where: {
        OR: [
          { role: 'OWNER' },
          { role: 'ADMIN' }
        ],
        budgetAccess: 'NO_ACCESS' // Only update those without access set
      },
      data: {
        budgetAccess: 'FULL_CONTROL'
      }
    });

    console.log(`✅ Granted FULL_CONTROL to ${ownersAndAdmins.count} owners/admins`);

    // Grant EDIT to project admins
    const projectAdmins = await prisma.projectMember.updateMany({
      where: {
        role: 'ADMIN',
        budgetAccess: null // Only update those without access set
      },
      data: {
        budgetAccess: 'EDIT'
      }
    });

    console.log(`✅ Granted EDIT to ${projectAdmins.count} project admins`);

    // All other users keep NO_ACCESS (default)
    console.log('✅ All other users have NO_ACCESS (default)\n');

    // Get summary
    const accessSummary = await prisma.$queryRaw`
      SELECT
        budget_access,
        COUNT(*)::int as count
      FROM organization_members
      GROUP BY budget_access
      ORDER BY budget_access
    `;

    console.log('📊 Budget Access Summary:');
    console.log('========================');
    accessSummary.forEach(row => {
      console.log(`   ${row.budget_access}: ${row.count} users`);
    });

    console.log('\n🎉 Budget access seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding budget access:', error.message);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
