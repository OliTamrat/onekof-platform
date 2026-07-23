const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');

process.env.DATABASE_URL = 'postgresql://postgres.kxavbqpctaihavfoblta:Ncr$uck$@2026!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const prisma = new PrismaClient();

async function verifyPassword() {
  try {
    const email = 'admin@ministryofwater.et';
    const password = 'Ministry@2026!';

    console.log(`\n🔍 Checking password for: ${email}\n`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);

    if (!user.password) {
      console.log('\n❌ User has no password set!');
      console.log('   Need to set a password for this user.');
      return;
    }

    // Test password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log(`\n✅ Password "${password}" is CORRECT!`);
      console.log('   Login should work with these credentials.');
    } else {
      console.log(`\n❌ Password "${password}" is INCORRECT!`);
      console.log('   This password does not match the stored hash.');
      console.log('\n📝 To fix this, we need to update the password.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyPassword();
