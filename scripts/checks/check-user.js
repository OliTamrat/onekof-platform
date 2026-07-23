// Import from the monorepo package
const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');

process.env.DATABASE_URL = 'postgresql://postgres.kxavbqpctaihavfoblta:Ncr$uck$@2026!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('Connecting to database...');

    const user = await prisma.user.findUnique({
      where: { email: 'admin@ministryofwater.et' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        defaultOrganizationId: true,
        emailVerified: true,
      }
    });

    if (user) {
      console.log('✅ User found:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  Default Organization ID:', user.defaultOrganizationId);
      console.log('  Email Verified:', user.emailVerified);
      console.log('  Has Password:', user.password ? 'Yes (hashed)' : 'No');
      console.log('  Password starts with:', user.password ? user.password.substring(0, 10) + '...' : 'N/A');
    } else {
      console.log('❌ User NOT found in database');
      console.log('Need to create the user first!');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkUser();
