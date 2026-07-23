const { PrismaClient } = require('./packages/database/dist');
const prisma = new PrismaClient();

async function fixOrganizationMembership() {
  console.log('🔍 Checking organization memberships...\n');

  try {
    // Get all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${organizations.length} organizations:\n`);

    for (const org of organizations) {
      console.log(`\n📋 Organization: ${org.name} (${org.slug})`);
      console.log(`   Members: ${org.members.length}`);

      if (org.members.length === 0) {
        console.log(`   ⚠️  NO MEMBERS! This will cause 403 errors.`);

        // Find the owner user
        const owner = await prisma.user.findUnique({
          where: { id: org.ownerId },
        });

        if (owner) {
          console.log(`   ✅ Found owner: ${owner.email}`);
          console.log(`   🔧 Adding owner as OWNER member...`);

          await prisma.organizationMember.create({
            data: {
              organizationId: org.id,
              userId: owner.id,
              role: 'OWNER',
              budgetAccess: 'FULL',
            },
          });

          console.log(`   ✅ Owner added successfully!`);
        } else {
          console.log(`   ❌ Owner user not found!`);
        }
      } else {
        org.members.forEach(member => {
          console.log(`   - ${member.user.email} (${member.role})`);
        });
      }
    }

    console.log('\n✅ Membership check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrganizationMembership();
