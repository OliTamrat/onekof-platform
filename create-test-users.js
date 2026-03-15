const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');

process.env.DATABASE_URL = 'postgresql://postgres.kxavbqpctaihavfoblta:Ncr$uck$@2026!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const prisma = new PrismaClient();

// Test user credentials
const testUsers = [
  {
    email: 'admin@onekof.com',
    name: 'Admin User',
    password: 'Admin@2026!',
    role: 'ADMIN'  // Will be set in OrganizationMember
  },
  {
    email: 'owner@onekof.com',
    name: 'Owner User',
    password: 'Owner@2026!',
    role: 'OWNER'
  },
  {
    email: 'user@onekof.com',
    name: 'Regular User',
    password: 'User@2026!',
    role: 'MEMBER'
  }
];

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users...\n');

    // Get the Ministry of Water organization
    const org = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: { contains: 'Ministry of Water', mode: 'insensitive' } },
          { slug: { contains: 'ministry', mode: 'insensitive' } }
        ]
      }
    });

    if (!org) {
      console.log('❌ Ministry of Water organization not found!');
      return;
    }

    console.log(`✅ Found organization: ${org.name} (${org.id})\n`);

    for (const userData of testUsers) {
      console.log(`Creating ${userData.email}...`);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      let user;
      if (existingUser) {
        console.log(`  ⏭️  User already exists, skipping creation`);
        user = existingUser;
      } else {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Create the user
        user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            emailVerified: new Date(),
            defaultOrganizationId: org.id,
          }
        });
        console.log(`  ✅ User created: ${user.id}`);
      }

      // Check if organization member exists
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: user.id
          }
        }
      });

      if (existingMember) {
        console.log(`  ⏭️  Already a member of organization`);
      } else {
        // Add to organization
        await prisma.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            role: userData.role,
          }
        });
        console.log(`  ✅ Added to organization with role: ${userData.role}`);
      }

      console.log('');
    }

    console.log('\n✅ Test users created successfully!');
    console.log('\nCredentials:');
    console.log('━'.repeat(60));
    testUsers.forEach(user => {
      console.log(`Email:    ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role:     ${user.role}`);
      console.log('━'.repeat(60));
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestUsers();
