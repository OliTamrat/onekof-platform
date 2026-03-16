import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/create-ministry-project
 * Creates the Ministry of Water and Irrigation with Jira Water Dam project
 * This is an admin endpoint to set up demo data
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🏛️ Creating Ministry of Water and Irrigation...\n');

    // 1. Create or find Organization
    let ministry = await prisma.organization.findUnique({
      where: { slug: 'ministry-water-irrigation' }
    });

    if (ministry) {
      console.log(`✅ Found existing organization: ${ministry.name}`);
    } else {
      ministry = await prisma.organization.create({
        data: {
          name: 'Ministry of Water and Irrigation',
          slug: 'ministry-water-irrigation',
          schemaName: 'onekof_ministry_water',
          plan: 'ENTERPRISE',
          status: 'ACTIVE',
          maxMembers: 500,
          maxProjects: 100,
          maxStorage: 1000,
          preferredCalendar: 'ETHIOPIAN',
          primaryLanguage: 'AM',
          features: [
            'budget_management',
            'public_transparency',
            'audit_logs',
            'multi_currency',
            'expense_approval_workflow'
          ]
        }
      });
      console.log(`✅ Created organization: ${ministry.name}`);
    }

    // 2. Create or find admin user
    let adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Add user to organization if not already member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: ministry.id,
          userId: adminUser.id
        }
      }
    });

    if (!existingMember) {
      await prisma.organizationMember.create({
        data: {
          organizationId: ministry.id,
          userId: adminUser.id,
          role: 'OWNER',
          budgetAccess: 'FULL_CONTROL'
        }
      });
      console.log(`✅ Added ${adminUser.email} as organization owner`);
    }

    // 4. Check if Jira project already exists
    let project = await prisma.project.findFirst({
      where: {
        organizationId: ministry.id,
        key: 'JIRA'
      },
      include: {
        budget: {
          include: {
            categories: true
          }
        }
      }
    });

    if (project && project.budget) {
      return NextResponse.json({
        message: 'Ministry project already exists',
        project: {
          id: project.id,
          name: project.name,
          key: project.key,
          budgetId: project.budget.id,
          categoriesCount: project.budget.categories.length
        }
      });
    }

    // 5. Create project if it doesn't exist
    if (!project) {
      project = await prisma.project.create({
        data: {
          organizationId: ministry.id,
          name: 'Jira Water Dam & Irrigation',
          key: 'JIRA',
          description: 'Major infrastructure project to construct the Jira Water Dam and comprehensive irrigation system to serve agricultural communities in the Oromia region. This project aims to provide water security for over 500,000 hectares of farmland and generate 250 MW of hydroelectric power.',
          icon: '🌊',
          color: '#0EA5E9',
          leadId: adminUser.id,
          template: 'CUSTOM',
          status: 'ACTIVE',
          createdBy: adminUser.id
        } as any,
        include: {
          budget: {
            include: {
              categories: true
            }
          }
        }
      });
      console.log(`✅ Created project: ${project.name} (${project.key})`);
    }

    // 6. Create budget if it doesn't exist
    const fiscalYearStart = new Date('2026-07-08'); // Ethiopian fiscal year
    const fiscalYearEnd = new Date('2031-07-07');   // 5-year project

    let budget = await prisma.budget.findUnique({
      where: { projectId: project.id },
      include: { categories: true }
    });

    if (!budget) {
      budget = await prisma.budget.create({
        data: {
          projectId: project.id,
          totalBudget: 250000000.00, // 250 Million ETB
          currency: 'ETB',
          status: 'ACTIVE',
          isPublic: true,
          fiscalYearStart,
          fiscalYearEnd,
          additionalFunding: [
            {
              source: 'World Bank',
              amount: 50000000,
              currency: 'USD',
              exchangeRate: 57.8,
              amountInETB: 2890000000,
              approvedDate: '2025-11-15',
              disbursementSchedule: 'Quarterly over 5 years'
            },
            {
              source: 'African Development Bank',
              amount: 30000000,
              currency: 'USD',
              exchangeRate: 57.8,
              amountInETB: 1734000000,
              approvedDate: '2025-12-01',
              disbursementSchedule: 'Semi-annual over 4 years'
            }
          ],
          settings: {
            alertThresholds: [50, 75, 90, 95],
            requireApprovalAbove: 1000000,
            multiLevelApproval: true,
            publicDashboard: true
          },
          createdBy: adminUser.id
        },
        include: { categories: true }
      });
      console.log(`✅ Created budget: ${Number(budget.totalBudget).toLocaleString()} ${budget.currency}`);
    }

    // 7. Create budget categories if they don't exist
    if (budget.categories.length === 0) {
      const categories = [
        {
          name: 'Personnel & Salaries',
          code: '5210',
          description: 'Project staff, engineers, consultants, and administrative personnel',
          allocatedAmount: 25000000,
          order: 1
        },
        {
          name: 'Construction & Infrastructure',
          code: '5220',
          description: 'Dam construction, canal systems, and irrigation infrastructure',
          allocatedAmount: 150000000,
          order: 2
        },
        {
          name: 'Equipment & Machinery',
          code: '5230',
          description: 'Heavy equipment, vehicles, and technical machinery',
          allocatedAmount: 30000000,
          order: 3
        },
        {
          name: 'Environmental & Social Impact',
          code: '5240',
          description: 'Environmental assessments, community relocation, and mitigation measures',
          allocatedAmount: 20000000,
          order: 4
        },
        {
          name: 'Project Management & Consultancy',
          code: '5250',
          description: 'Technical consultancy, project management, and oversight',
          allocatedAmount: 15000000,
          order: 5
        },
        {
          name: 'Contingency & Emergency',
          code: '5260',
          description: 'Emergency funds for unforeseen circumstances and cost overruns',
          allocatedAmount: 10000000,
          order: 6
        }
      ];

      for (const cat of categories) {
        await prisma.budgetCategory.create({
          data: {
            budgetId: budget.id,
            ...cat,
            currency: 'ETB'
          }
        });
      }
      console.log(`✅ Created ${categories.length} budget categories`);
    }

    return NextResponse.json({
      success: true,
      message: 'Ministry of Water and Irrigation project created successfully',
      data: {
        organization: {
          id: ministry.id,
          name: ministry.name,
          slug: ministry.slug
        },
        project: {
          id: project.id,
          name: project.name,
          key: project.key
        },
        budget: {
          id: budget.id,
          totalBudget: Number(budget.totalBudget),
          currency: budget.currency,
          categoriesCount: budget.categories.length || 6
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Ministry project creation error:', error);
    return NextResponse.json({
      error: 'Failed to create ministry project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
