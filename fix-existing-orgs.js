const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function fixOrganizationMemberships() {
  console.log('🔧 Fixing organization memberships...\n');

  try {
    // Find all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        members: true,
      },
    });

    console.log(`Found ${organizations.length} organizations\n`);

    let fixed = 0;
    let skipped = 0;

    for (const org of organizations) {
      if (org.members.length === 0) {
        console.log(`❌ ${org.name} (${org.slug}) - NO MEMBERS`);

        // Get the owner ID from the organization
        if (org.ownerId) {
          // Add owner as member
          await prisma.organizationMember.create({
            data: {
              organizationId: org.id,
              userId: org.ownerId,
              role: 'OWNER',
              budgetAccess: 'FULL',
            },
          });

          console.log(`   ✅ Added owner as OWNER member\n`);
          fixed++;
        } else {
          console.log(`   ⚠️  No ownerId found, skipping\n`);
          skipped++;
        }
      } else {
        console.log(`✅ ${org.name} (${org.slug}) - ${org.members.length} members`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${organizations.length}`);

    console.log('\n✅ Done! 403 errors should be resolved.');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixOrganizationMemberships()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
