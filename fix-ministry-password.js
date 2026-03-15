const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');

process.env.DATABASE_URL = 'postgresql://postgres.kxavbqpctaihavfoblta:Ncr$uck$@2026!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

const prisma = new PrismaClient();

async function fixPassword() {
  try {
    const email = 'admin@ministryofwater.et';
    const newPassword = 'Ministry@2026!';

    console.log(`\n🔧 Updating password for: ${email}\n`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log(`✅ Password hashed: ${hashedPassword.substring(0, 20)}...`);

    // Update the user's password
    const updated = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        emailVerified: new Date(), // Also mark email as verified
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    console.log(`\n✅ Password updated successfully!`);
    console.log(`  User: ${updated.name} (${updated.email})`);
    console.log(`\n📧 Credentials:`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${newPassword}`);
    console.log(`\n🎉 You can now log in with these credentials!`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixPassword();
