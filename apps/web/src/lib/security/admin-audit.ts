import { prisma } from '@onekof/database';
import { NextRequest } from 'next/server';

interface AuditLogParams {
  adminUsername: string;
  adminRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  outcome?: 'SUCCESS' | 'FAILURE' | 'DENIED';
  request?: NextRequest;
}

/**
 * Log an admin action to the AdminAuditLog table.
 *
 * Usage in admin API routes:
 *   await logAdminAction({
 *     adminUsername: admin.username,
 *     adminRole: admin.role,
 *     action: 'USER_VIEW',
 *     resource: 'user',
 *     resourceId: userId,
 *     request,
 *   });
 *
 * This is fire-and-forget — errors are caught and logged, never thrown.
 */
export async function logAdminAction(params: AuditLogParams): Promise<void> {
  try {
    const ipAddress = params.request
      ? params.request.headers.get('x-forwarded-for')?.split(',')[0] ||
        params.request.headers.get('x-real-ip') ||
        params.request.headers.get('cf-connecting-ip') ||
        undefined
      : undefined;

    const userAgent = params.request
      ? params.request.headers.get('user-agent') || undefined
      : undefined;

    await prisma.adminAuditLog.create({
      data: {
        adminUsername: params.adminUsername,
        adminRole: params.adminRole,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details || {},
        outcome: params.outcome || 'SUCCESS',
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // Never let audit logging break the admin action itself
    console.error('[AdminAudit] Failed to log action:', err);
  }
}

/**
 * Standard admin actions for consistent logging.
 */
export const AdminActions = {
  // Auth
  LOGIN: 'LOGIN',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',

  // User management
  USER_LIST: 'USER_LIST',
  USER_VIEW: 'USER_VIEW',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',

  // Organization management
  ORG_LIST: 'ORG_LIST',
  ORG_VIEW: 'ORG_VIEW',
  ORG_UPDATE: 'ORG_UPDATE',
  ORG_DELETE: 'ORG_DELETE',

  // System
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  CLEANUP: 'CLEANUP',
  BACKUP: 'BACKUP',
  DEBUG_ACCESS: 'DEBUG_ACCESS',
  HEALTH_CHECK: 'HEALTH_CHECK',

  // Data
  SEED_DATA: 'SEED_DATA',
  MIGRATION: 'MIGRATION',
} as const;
