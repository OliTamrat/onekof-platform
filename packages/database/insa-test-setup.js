/**
 * INSA Test Accounts Setup Script
 * Creates 5 test accounts covering all roles in Ministry of Water and Irrigation
 * Run from: packages/database/
 * Command: node insa-test-setup.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const PASSWORD = 'Onekof@INSA2026'
const ORG_SLUG = 'ministry-water-irrigation'

const TEST_ACCOUNTS = [
  {
    name: 'INSA Reviewer — Owner',
    email: 'insa.owner@insa-test.et',
    role: 'OWNER',
    budgetAccess: 'FULL_CONTROL',
    label: 'Owner',
  },
  {
    name: 'INSA Reviewer — Admin',
    email: 'insa.admin@insa-test.et',
    role: 'ADMIN',
    budgetAccess: 'APPROVE',
    label: 'Admin',
  },
  {
    name: 'INSA Reviewer — Member',
    email: 'insa.member@insa-test.et',
    role: 'MEMBER',
    budgetAccess: 'EDIT',
    label: 'Member (Budget Edit)',
  },
  {
    name: 'INSA Reviewer — Viewer',
    email: 'insa.viewer@insa-test.et',
    role: 'MEMBER',
    budgetAccess: 'VIEW_ONLY',
    label: 'Member (Budget View Only)',
  },
  {
    name: 'INSA Reviewer — Guest',
    email: 'insa.guest@insa-test.et',
    role: 'GUEST',
    budgetAccess: 'NO_ACCESS',
    label: 'Guest',
  },
]

async function run() {
  console.log('\n================================================')
  console.log('  INSA Test Account Setup — onekof.com')
  console.log('================================================\n')

  // 1. Find org
  const org = await prisma.organization.findUnique({
    where: { slug: ORG_SLUG },
    select: { id: true, name: true, slug: true },
  })

  if (!org) {
    console.error(`❌ Organization "${ORG_SLUG}" not found.`)
    process.exit(1)
  }
  console.log(`✅ Organization: "${org.name}" (${org.id})\n`)

  // 2. Hash password
  console.log('Hashing password (bcrypt cost 12)...')
  const hashedPassword = await bcrypt.hash(PASSWORD, 12)
  console.log('✅ Password ready\n')

  // 3. Create / update accounts
  const results = []
  for (const account of TEST_ACCOUNTS) {
    process.stdout.write(`Setting up [${account.role}] ${account.email} ... `)
    try {
      const user = await prisma.user.upsert({
        where: { email: account.email },
        update: {
          name: account.name,
          password: hashedPassword,
          emailVerified: new Date(),
          passwordChangedAt: new Date(),
        },
        create: {
          name: account.name,
          email: account.email,
          password: hashedPassword,
          emailVerified: new Date(),
          passwordChangedAt: new Date(),
        },
      })

      await prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
        update: { role: account.role, budgetAccess: account.budgetAccess },
        create: {
          organizationId: org.id,
          userId: user.id,
          role: account.role,
          budgetAccess: account.budgetAccess,
        },
      })

      console.log('✅')
      results.push({ ...account, userId: user.id, success: true })
    } catch (err) {
      console.log('❌')
      console.error(`  Error: ${err.message}`)
      results.push({ ...account, success: false, error: err.message })
    }
  }

  // 4. Verification pass
  console.log('\n--- Verification ---\n')
  let allPassed = true

  for (const r of results) {
    if (!r.success) { allPassed = false; continue }

    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: org.id, userId: r.userId } },
      include: { user: { select: { email: true, emailVerified: true } } },
    })

    const roleOk   = member?.role === r.role
    const budgetOk = member?.budgetAccess === r.budgetAccess
    const verifOk  = !!member?.user?.emailVerified

    const ok = roleOk && budgetOk && verifOk
    if (!ok) allPassed = false

    console.log(`${ok ? '✅' : '❌'}  ${r.email}`)
    console.log(`     Role: ${member?.role} ${roleOk ? '✓' : `✗ (expected ${r.role})`}`)
    console.log(`     Budget: ${member?.budgetAccess} ${budgetOk ? '✓' : `✗ (expected ${r.budgetAccess})`}`)
    console.log(`     Email verified: ${verifOk ? 'yes ✓' : 'no ✗'}\n`)
  }

  // 5. Credential sheet
  console.log('\n================================================')
  console.log('  CREDENTIAL SHEET — INSA REVIEWER (Danielworku)')
  console.log('================================================\n')
  console.log(`  Platform URL  : https://onekof.com`)
  console.log(`  Organization  : ${org.name}`)
  console.log(`  Password      : ${PASSWORD}  (same for all)`)
  console.log(`  2FA           : Not enabled on test accounts\n`)
  console.log('  +-----------------------+-----------------------------+----------+------------------+')
  console.log('  | Role                  | Email                       | Org Role | Budget Access    |')
  console.log('  +-----------------------+-----------------------------+----------+------------------+')
  for (const r of results) {
    if (!r.success) continue
    const lbl    = r.label.padEnd(21).slice(0, 21)
    const email  = r.email.padEnd(27).slice(0, 27)
    const role   = r.role.padEnd(8).slice(0, 8)
    const budget = r.budgetAccess.padEnd(16).slice(0, 16)
    console.log(`  | ${lbl} | ${email} | ${role} | ${budget} |`)
  }
  console.log('  +-----------------------+-----------------------------+----------+------------------+\n')
  console.log(`  Result: ${allPassed ? '✅ ALL ACCOUNTS READY TO USE' : '❌ CHECK ERRORS ABOVE'}\n`)
  console.log('================================================\n')

  await prisma.$disconnect()
}

run().catch(async (e) => {
  console.error('Fatal:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
