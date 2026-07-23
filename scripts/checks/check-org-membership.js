const { PrismaClient } = require('@onekof/database');
const prisma = new PrismaClient();

async function checkData() {
  console.log('\n=== ORGANIZATIONS ===');
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true }
  });
  orgs.forEach(org => {
    console.log(`${org.name} (${org.slug}) - ID: ${org.id}`);
  });

  console.log('\n=== ORGANIZATION MEMBERS ===');
  const members = await prisma.organizationMember.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      organization: { select: { name: true, slug: true } }
    }
  });
  members.forEach(m => {
    console.log(`User: ${m.user.email} (${m.user.name}) -> Org: ${m.organization.name} (${m.organization.slug}) - Role: ${m.role}`);
  });

  console.log('\n=== USERS ===');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true }
  });
  users.forEach(u => {
    console.log(`${u.email} (${u.name}) - ID: ${u.id}`);
  });

  await prisma.$disconnect();
}

checkData().catch(console.error);
