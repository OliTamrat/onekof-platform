const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing admin access...\n');

  try {
    // Find the admin user from Olink Technologies
    const admin = await prisma.user.findFirst({
      where: {
        email: {
          contains: '@',  // Any email
        }
      },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'  // Get the first user (likely admin)
      }
    });

    if (!admin) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`📧 Found user: ${admin.email}`);
    console.log(`👤 Name: ${admin.name || 'Not set'}`);
    console.log(`🏢 Organizations: ${admin.organizations.length}\n`);

    // Update all org memberships to OWNER with FULL_CONTROL
    for (const orgMember of admin.organizations) {
      await prisma.organizationMember.update({
        where: { id: orgMember.id },
        data: {
          role: 'OWNER',
          budgetAccess: 'FULL_CONTROL'
        }
      });

      console.log(`✅ Updated access in: ${orgMember.organization.name}`);
      console.log(`   Role: OWNER`);
      console.log(`   Budget Access: FULL_CONTROL\n`);
    }

    // Set default organization if not set
    if (!admin.defaultOrganizationId && admin.organizations.length > 0) {
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          defaultOrganizationId: admin.organizations[0].organizationId
        }
      });

      console.log(`✅ Set default organization to: ${admin.organizations[0].organization.name}\n`);
    }

    console.log('🎉 Admin access restored successfully!');
    console.log(`\n💡 You can now login with: ${admin.email}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
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
