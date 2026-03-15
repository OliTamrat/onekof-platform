const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'ministry@hakimet.com';
  const password = 'Ministry@2026';

  console.log('\n🔐 Setting password for Ministry user...\n');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log('✅ Password set successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 MINISTRY OF WATER & IRRIGATION - LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('🌐 URL: http://localhost:3000/auth/signin');
  console.log('📧 Email: ministry@hakimet.com');
  console.log('🔑 Password: Ministry@2026');
  console.log('\n👤 User: ' + user.name);
  console.log('🏛️  Organization: Ministry of Water and Irrigation');
  console.log('📊 Project: Jira Water Dam & Irrigation');
  console.log('💰 Budget: 250,000,000 ETB');
  console.log('\n🔗 After login, visit:');
  console.log('   http://localhost:3000/projects/cmmcb2li60001i1z0o4mqfqer/budget');
  console.log('\n═══════════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main();
