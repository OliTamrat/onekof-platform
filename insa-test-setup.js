/**
 * INSA Test Accounts Setup Script
 * Creates 5 test accounts covering all roles in Ministry of Agriculture org
 * Run from: onekof-platform/ with production env
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env.production.local') })

const prisma = new PrismaClient()

const PASSWORD = 'Onekof@INSA2026'
const ORG_NAME_SEARCH = 'Agriculture'

const TEST_ACCOUNTS = [
  {
    name: 'INSA Test — Owner',
    email: 'insa.owner@insa-test.et',
    role: 'OWNER',
    budgetAccess: 'FULL_CONTROL',
    label: 'Owner (full organization control, full budget control)',
  },
  {
    name: 'INSA Test — Admin',
    email: 'insa.admin@insa-test.et',
    role: 'ADMIN',
    budgetAccess: 'APPROVE',
    label: 'Admin (manage members/settings, approve expenses)',
  },
  {
    name: 'INSA Test — Member',
    email: 'insa.member@insa-test.et',
    role: 'MEMBER',
    budgetAccess: 'EDIT',
    label: 'Member (standard work access, submit/edit expenses)',
  },
  {
    name: 'INSA Test — Budget Viewer',
    email: 'insa.viewer@insa-test.et',
    role: 'MEMBER',
    budgetAccess: 'VIEW_ONLY',
    label: 'Member with Budget View Only (can see budget, cannot edit)',
  },
  {
    name: 'INSA Test — Guest',
    email: 'insa.guest@insa-test.et',
    role: 'GUEST',
    budgetAccess: 'NO_ACCESS',
    label: 'Guest (read-only access, no budget visibility)',
  },
]

async function run() {
  console.log('\n========================================')
  console.log('  INSA Test Account Setup — onekof.com')
  console.log('========================================\n')

  // 1. Find Ministry of Agriculture org
  console.log(`Searching for "${ORG_NAME_SEARCH}" organization...`)
  const org = await prisma.organization.findFirst({
    where: { name: { contains: ORG_NAME_SEARCH, mode: 'insensitive' } },
    select: { id: true, name: true, slug: true },
  })

  if (!org) {
    console.error(`\n❌ No organization found matching "${ORG_NAME_SEARCH}".`)
    console.error('Please create the Ministry of Agriculture org first, then re-run.')
    process.exit(1)
  }

  console.log(`✅ Found org: "${org.name}" (ID: ${org.id})\n`)

  // 2. Hash password once
  console.log('Hashing password (bcrypt cost 12)...')
  const hashedPassword = await bcrypt.hash(PASSWORD, 12)
  console.log('✅ Password hashed\n')

  const results = []

  for (const account of TEST_ACCOUNTS) {
    process.stdout.write(`Creating ${account.role} account (${account.email})... `)

    try {
      // Upsert user
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

      // Upsert org membership
      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: user.id,
          },
        },
        update: {
          role: account.role,
          budgetAccess: account.budgetAccess,
        },
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
      console.log('❌ FAILED')
      console.error(`  Error: ${err.message}`)
      results.push({ ...account, success: false, error: err.message })
    }
  }

  // 3. Verification pass — confirm each account exists with correct role
  console.log('\n--- Verification Pass ---\n')
  let allPassed = true

  for (const r of results) {
    if (!r.success) { allPassed = false; continue }

    const member = await prisma.organizationMember.findFirst({
      where: {
        organization: { id: org.id },
        user: { email: r.email },
      },
      include: { user: { select: { email: true, emailVerified: true } } },
    })

    const roleOk = member?.role === r.role
    const budgetOk = member?.budgetAccess === r.budgetAccess
    const verifiedOk = member?.user?.emailVerified !== null

    const status = roleOk && budgetOk && verifiedOk ? '✅ PASS' : '❌ FAIL'
    if (!roleOk || !budgetOk || !verifiedOk) allPassed = false

    console.log(`${status}  ${r.email}`)
    console.log(`       Role: ${member?.role} (expected ${r.role}) ${roleOk ? '✓' : '✗'}`)
    console.log(`       Budget: ${member?.budgetAccess} (expected ${r.budgetAccess}) ${budgetOk ? '✓' : '✗'}`)
    console.log(`       Email verified: ${verifiedOk ? 'yes ✓' : 'no ✗'}\n`)
  }

  // 4. Print credential sheet
  console.log('\n========================================')
  console.log('  CREDENTIAL SHEET FOR INSA REVIEWER')
  console.log('========================================')
  console.log(`\nPlatform URL : https://onekof.com`)
  console.log(`Organization : ${org.name}`)
  console.log(`Password     : ${PASSWORD}  (same for all accounts)`)
  console.log(`2FA          : Not enabled on test accounts\n`)

  console.log('┌─────────────────────────────────┬──────────────────────────────────────────┬───────────┬──────────────┐')
  console.log('│ Account                         │ Email                                    │ Org Role  │ Budget Access│')
  console.log('├─────────────────────────────────┼──────────────────────────────────────────┼───────────┼──────────────┤')
  for (const r of results) {
    if (!r.success) continue
    const name = r.label.padEnd(31).slice(0, 31)
    const email = r.email.padEnd(40).slice(0, 40)
    const role = r.role.padEnd(9).slice(0, 9)
    const budget = r.budgetAccess.padEnd(12).slice(0, 12)
    console.log(`│ ${name} │ ${email} │ ${role} │ ${budget} │`)
  }
  console.log('└─────────────────────────────────┴──────────────────────────────────────────┴───────────┴──────────────┘')

  console.log(`\nOverall result: ${allPassed ? '✅ ALL ACCOUNTS READY' : '❌ SOME ACCOUNTS FAILED — check errors above'}`)
  console.log('========================================\n')

  await prisma.$disconnect()
}

run().catch(async (e) => {
  console.error('Fatal error:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
