import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma as db } from '@/lib/prisma';
import { getPresetForOrgType } from '@/lib/presets/organization-presets';
import { avatarUrlSchema, organizationSettingsPutSchema } from '@/lib/validation/schemas';
import type { OrganizationSettings } from '@/types/organization-settings';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/organizations/[organizationId]/settings
 * Get organization settings with feature flags
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;

    // Check if user has access to this organization
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get organization settings
    let settings = await db.organizationSettings.findUnique({
      where: { organizationId },
    });

    // If no settings exist, create default settings based on org type
    if (!settings) {
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        select: { type: true },
      });

      const preset = organization?.type
        ? getPresetForOrgType(organization.type)
        : getPresetForOrgType('business'); // Default to business

      // Create settings with preset defaults
      settings = await db.organizationSettings.create({
        data: {
          organizationId,
          enabledSections: preset.enabledSections,
          budgetFeatures: preset.features.budget as any,
          teamsFeatures: preset.features.teams as any,
          goalsFeatures: preset.features.goals as any,
          automationsFeatures: preset.features.automations as any,
          documentsFeatures: preset.features.documents as any,
          docsFeatures: preset.features.docs as any,
          aiAssistant: preset.features.aiAssistant,
          analytics: preset.features.analytics,
          integrations: preset.features.integrations,
          customBranding: preset.features.customBranding,
        },
      });
    }

    // Convert database format to TypeScript type
    const response: OrganizationSettings = {
      enabledSections: settings.enabledSections as any[],
      features: {
        budget: settings.budgetFeatures as any,
        teams: settings.teamsFeatures as any,
        goals: settings.goalsFeatures as any,
        automations: settings.automationsFeatures as any,
        documents: settings.documentsFeatures as any,
        docs: settings.docsFeatures as any,
        aiAssistant: settings.aiAssistant,
        analytics: settings.analytics,
        integrations: settings.integrations,
        customBranding: settings.customBranding,
      },
      customization: {
        primaryColor: settings.primaryColor,
        logoUrl: settings.logoUrl ?? undefined,
        budgetCurrency: settings.budgetCurrency,
        fiscalYearStart: settings.fiscalYearStart,
        dateFormat: settings.dateFormat as any,
        language: settings.language as any,
      },
      permissions: {
        allowMemberInvites: settings.allowMemberInvites,
        requireBudgetApproval: settings.requireBudgetApproval,
        publicProjectsVisible: settings.publicProjectsVisible,
      },
      terminologyScheme: (settings as any).terminologyScheme ?? 'AGILE',
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching organization settings', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/[organizationId]/settings
 * Update organization settings
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;

    // Check if user is admin or owner
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const parsed = organizationSettingsPutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid settings payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const body = parsed.data as unknown as OrganizationSettings;

    // 🔒 SECURITY: Validate logo URL to prevent Blind SSRF
    if (body.customization?.logoUrl) {
      const logoResult = avatarUrlSchema.safeParse(body.customization.logoUrl);
      if (!logoResult.success) {
        return NextResponse.json(
          { error: 'Logo URL must be a valid HTTPS URL from a public host' },
          { status: 400 }
        );
      }
    }

    const previous = await db.organizationSettings.findUnique({
      where: { organizationId },
    });

    // Update or create settings
    const settings = await db.organizationSettings.upsert({
      where: { organizationId },
      create: {
        organizationId,
        enabledSections: body.enabledSections,
        budgetFeatures: body.features.budget as any,
        teamsFeatures: body.features.teams as any,
        goalsFeatures: body.features.goals as any,
        automationsFeatures: body.features.automations as any,
        documentsFeatures: body.features.documents as any,
        docsFeatures: body.features.docs as any,
        aiAssistant: body.features.aiAssistant,
        analytics: body.features.analytics,
        integrations: body.features.integrations,
        customBranding: body.features.customBranding,
        primaryColor: body.customization.primaryColor,
        logoUrl: body.customization.logoUrl,
        budgetCurrency: body.customization.budgetCurrency,
        fiscalYearStart: body.customization.fiscalYearStart,
        dateFormat: body.customization.dateFormat,
        language: body.customization.language as any,
        allowMemberInvites: body.permissions.allowMemberInvites,
        requireBudgetApproval: body.permissions.requireBudgetApproval,
        publicProjectsVisible: body.permissions.publicProjectsVisible,
        ...(body.terminologyScheme && { terminologyScheme: body.terminologyScheme }),
      },
      update: {
        enabledSections: body.enabledSections,
        budgetFeatures: body.features.budget as any,
        teamsFeatures: body.features.teams as any,
        goalsFeatures: body.features.goals as any,
        automationsFeatures: body.features.automations as any,
        documentsFeatures: body.features.documents as any,
        docsFeatures: body.features.docs as any,
        aiAssistant: body.features.aiAssistant,
        analytics: body.features.analytics,
        integrations: body.features.integrations,
        customBranding: body.features.customBranding,
        primaryColor: body.customization.primaryColor,
        logoUrl: body.customization.logoUrl,
        budgetCurrency: body.customization.budgetCurrency,
        fiscalYearStart: body.customization.fiscalYearStart,
        dateFormat: body.customization.dateFormat,
        language: body.customization.language as any,
        allowMemberInvites: body.permissions.allowMemberInvites,
        requireBudgetApproval: body.permissions.requireBudgetApproval,
        publicProjectsVisible: body.permissions.publicProjectsVisible,
        ...(body.terminologyScheme && { terminologyScheme: body.terminologyScheme }),
      },
    });

    // INSA audit trail: org settings changes are privileged actions
    logOrgAction({
      organizationId,
      actorId: session.user.id,
      actorEmail: session.user.email || '',
      actorRole: membership.role,
      action: OrgActions.ORG_SETTINGS_UPDATED,
      resource: 'organization',
      resourceId: organizationId,
      before: previous ? { enabledSections: previous.enabledSections, aiAssistant: previous.aiAssistant, analytics: previous.analytics, integrations: previous.integrations, customBranding: previous.customBranding, language: previous.language } : undefined,
      after: { enabledSections: settings.enabledSections, aiAssistant: settings.aiAssistant, analytics: settings.analytics, integrations: settings.integrations, customBranding: settings.customBranding, language: settings.language },
      request: req,
    });

    // Convert back to TypeScript format
    const response: OrganizationSettings = {
      enabledSections: settings.enabledSections as any[],
      features: {
        budget: settings.budgetFeatures as any,
        teams: settings.teamsFeatures as any,
        goals: settings.goalsFeatures as any,
        automations: settings.automationsFeatures as any,
        documents: settings.documentsFeatures as any,
        docs: settings.docsFeatures as any,
        aiAssistant: settings.aiAssistant,
        analytics: settings.analytics,
        integrations: settings.integrations,
        customBranding: settings.customBranding,
      },
      customization: {
        primaryColor: settings.primaryColor,
        logoUrl: settings.logoUrl ?? undefined,
        budgetCurrency: settings.budgetCurrency,
        fiscalYearStart: settings.fiscalYearStart,
        dateFormat: settings.dateFormat as any,
        language: settings.language as any,
      },
      permissions: {
        allowMemberInvites: settings.allowMemberInvites,
        requireBudgetApproval: settings.requireBudgetApproval,
        publicProjectsVisible: settings.publicProjectsVisible,
      },
      terminologyScheme: (settings as any).terminologyScheme ?? 'AGILE',
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error updating organization settings', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
