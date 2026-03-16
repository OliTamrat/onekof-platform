const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');

process.env.DATABASE_URL = 'postgresql://postgres.kxavbqpctaihavfoblta:Ncr$uck$@2026!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const prisma = new PrismaClient();

async function checkOrganizations() {
  try {
    console.log('\n🏢 Checking Organizations in Database...\n');

    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        schemaName: true,
        plan: true,
        status: true,
        _count: {
          select: {
            members: true,
            projects: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (organizations.length === 0) {
      console.log('❌ No organizations found!');
      return;
    }

    console.log(`✅ Found ${organizations.length} organization(s):\n`);
    console.log('━'.repeat(80));

    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`);
      console.log(`   ID:          ${org.id}`);
      console.log(`   Slug:        ${org.slug}`);
      console.log(`   Subdomain:   https://${org.slug}.onekof.com`);
      console.log(`   Schema:      ${org.schemaName}`);
      console.log(`   Plan:        ${org.plan}`);
      console.log(`   Status:      ${org.status}`);
      console.log(`   Members:     ${org._count.members}`);
      console.log(`   Projects:    ${org._count.projects}`);
      console.log('━'.repeat(80));
    });

    // Check user memberships
    console.log('\n👥 Checking User Organization Memberships...\n');

    const users = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'admin@ministryofwater.et',
            'admin@onekof.com',
            'owner@onekof.com',
            'user@onekof.com'
          ]
        }
      },
      select: {
        email: true,
        name: true,
        organizations: {
          select: {
            role: true,
            organization: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    users.forEach(user => {
      console.log(`📧 ${user.email} (${user.name})`);
      if (user.organizations.length === 0) {
        console.log('   ⚠️  Not a member of any organization');
      } else {
        user.organizations.forEach(membership => {
          console.log(`   ├─ ${membership.organization.name} (${membership.organization.slug})`);
          console.log(`   │  Role: ${membership.role}`);
          console.log(`   │  URL: https://${membership.organization.slug}.onekof.com`);
        });
      }
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkOrganizations();
