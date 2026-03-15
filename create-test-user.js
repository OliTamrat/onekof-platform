// Create a test user for email testing
const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash a simple password
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'olitamrat@gmail.com',
        name: 'Oli Test User',
        password: hashedPassword,
        emailVerified: new Date(), // Mark as verified
      },
    });

    console.log('✅ Test user created successfully!');
    console.log('Email:', user.email);
    console.log('Password: Test123!');
    console.log('User ID:', user.id);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  User already exists with email: olitamrat@gmail.com');
      console.log('You can use this email for testing.');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
