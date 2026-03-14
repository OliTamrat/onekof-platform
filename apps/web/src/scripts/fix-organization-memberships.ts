/**
 * Fix Organization Memberships
 *
 * This script finds organizations without members and adds the first user as a member.
 * Run this ONCE to fix existing organizations.
 */

import { prisma } from '@onekof/database';

async function fixOrganizationMemberships() {
  console.log('Fixing organization memberships...\n');

  try {
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
        console.log(`${org.name} (${org.slug}) - NO MEMBERS`);

        // Since there's no ownerId field, find the first user and add them
        const firstUser = await prisma.user.findFirst({
          select: { id: true },
        });

        if (firstUser) {
          await prisma.organizationMember.create({
            data: {
              organizationId: org.id,
              userId: firstUser.id,
              role: 'OWNER',
              budgetAccess: 'FULL_CONTROL',
            },
          });

          console.log(`   Added user as OWNER member\n`);
          fixed++;
        } else {
          console.log(`   No users found, skipping\n`);
          skipped++;
        }
      } else {
        console.log(`${org.name} (${org.slug}) - ${org.members.length} members`);
      }
    }

    console.log('\nSummary:');
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${organizations.length}`);

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixOrganizationMemberships()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
