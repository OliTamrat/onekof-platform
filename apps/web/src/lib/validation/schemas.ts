import { z } from 'zod';

/**
 * Validation Schemas
 *
 * SECURITY: Prevents injection attacks, data corruption, and ensures data integrity
 * All API routes should validate input using these schemas
 */

// Common field validators
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .trim()
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Entity IDs are Prisma cuids (e.g. "cm3k9x2ab0001lz08qwerty12"), not RFC
// UUIDs — a strict .uuid() validator rejects every real ID in the database.
// Accept cuid/cuid2/uuid shapes: opaque url-safe token, bounded length.
export const uuidSchema = z
  .string()
  .min(10, 'Invalid ID format')
  .max(40, 'Invalid ID format')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid ID format');

export const urlSchema = z.string().url('Invalid URL format').max(2048, 'URL too long');

/**
 * 🔒 SECURITY (INSA Finding #2): Avatar URL validation to prevent Blind SSRF.
 * Only allows HTTPS URLs from public hosts — blocks private IPs, localhost,
 * and internal network ranges that could be used for server-side request forgery.
 */
const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\.0\.0\.0$/,
  /^169\.254\./, // link-local
  /^\[::1\]$/,   // IPv6 loopback
  /^\[fc/i,      // IPv6 ULA
  /^\[fd/i,      // IPv6 ULA
  /^\[fe80:/i,   // IPv6 link-local
  /\.internal$/i,
  /\.local$/i,
  /\.localhost$/i,
  /metadata\.google\.internal/i, // GCP metadata
  /169\.254\.169\.254/,          // cloud metadata endpoint
];

export const avatarUrlSchema = z
  .string()
  .max(2048, 'URL too long')
  .refine(
    (val) => {
      // Allow empty/null (clearing avatar)
      if (!val || val.trim() === '') return true;
      try {
        const url = new URL(val);
        // Must be HTTPS (or http in development)
        if (url.protocol !== 'https:') {
          if (!(process.env.NODE_ENV === 'development' && url.protocol === 'http:')) {
            return false;
          }
        }
        // Block private/internal hostnames
        const hostname = url.hostname;
        if (PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
          return false;
        }
        // Block URLs with authentication credentials
        if (url.username || url.password) return false;
        // Block non-standard ports (common for internal services)
        if (url.port && url.port !== '443' && url.port !== '80') return false;
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Avatar URL must be a valid HTTPS URL from a public host' }
  )
  .optional()
  .nullable();

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .toLowerCase();

// Auth Schemas

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().length(64, 'Invalid reset token'),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().length(64, 'Invalid verification token'),
});

export const sendVerificationSchema = z.object({
  email: emailSchema,
});

// Project Schemas

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key must be less than 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Project key must contain only uppercase letters and numbers')
    .toUpperCase(),
  organizationId: uuidSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(50, 'Icon name too long').optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .trim()
    .optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(50, 'Icon name too long').optional(),
});

// Issue (Task) Schemas

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string().max(10000, 'Description must be less than 10,000 characters').optional(),
  type: z.enum(['TASK', 'BUG', 'EPIC', 'STORY', 'SUBTASK']),
  priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED', 'BACKLOG']).default('TODO'),
  projectId: uuidSchema,
  assigneeId: uuidSchema.optional(),
  reporterId: uuidSchema,
  parentId: uuidSchema.optional(),
  labels: z.array(z.string().max(50)).max(10, 'Maximum 10 labels allowed').optional(),
  dueDate: z.string().datetime().optional(),
  estimate: z.number().int().min(0).max(1000, 'Estimate must be between 0 and 1000 hours').optional(),
  // Department classification — validated against the catalog in the route
  // (pair rules need the task's post-update state, not just this payload)
  department: z.string().max(50).nullable().optional(),
  workstream: z.string().max(50).nullable().optional(),
  // M2 — care item. Accepted here but authorized in the route: the caller
  // needs FULL patient access and the patient must belong to the same
  // organization, neither of which a schema can see.
  patientId: uuidSchema.nullable().optional(),
});

export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),
  description: z.string().max(10000, 'Description must be less than 10,000 characters').optional(),
  type: z.enum(['TASK', 'BUG', 'FEATURE', 'EPIC', 'STORY']).optional(),
  priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST']).optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).optional(),
  assigneeId: uuidSchema.nullable().optional(),
  parentId: uuidSchema.nullable().optional(),
  labels: z.array(z.string().max(50)).max(10, 'Maximum 10 labels allowed').optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimate: z.number().int().min(0).max(1000).optional(),
  timeSpent: z.number().int().min(0).max(1000).optional(),
  sprintId: uuidSchema.nullable().optional(), // null = move back to backlog
  sprintOrder: z.number().int().min(0).nullable().optional(),
  storyPoints: z.number().int().min(0).max(1000).nullable().optional(),
  department: z.string().max(50).nullable().optional(),
  workstream: z.string().max(50).nullable().optional(),
  // M2 — care item. null detaches the task from the patient. Authorized in
  // the route; see createIssueSchema.
  patientId: uuidSchema.nullable().optional(),
});

// Sprint Schemas

export const createSprintSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name must be less than 120 characters').trim(),
  goal: z.string().max(2000, 'Goal must be less than 2,000 characters').nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

export const updateSprintSchema = z.object({
  name: z.string().min(1).max(120).trim().optional(),
  goal: z.string().max(2000).nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  position: z.number().int().min(0).optional(),
});

export const completeSprintSchema = z.object({
  // Where unfinished items go: 'backlog' or the id of another non-completed sprint
  rolloverTo: z.union([z.literal('backlog'), uuidSchema]),
});

// Project Settings Schemas (nullable = inherit from organization)

export const updateProjectSettingsSchema = z.object({
  sprintsEnabled: z.boolean().nullable().optional(),
  estimationUnit: z.enum(['HOURS', 'POINTS']).nullable().optional(),
  enforceWorkflow: z.boolean().nullable().optional(),
  requireApproval: z.boolean().nullable().optional(),
  workflowTransitions: z.record(z.array(z.string().max(30)).max(10)).nullable().optional(),
});

// Organization Settings Schema — guards the full-object PUT that previously
// dereferenced body.features.* unvalidated (500s on malformed input).

export const organizationSettingsPutSchema = z.object({
  enabledSections: z.array(z.string().max(50)).max(30),
  features: z.object({
    // null = feature group disabled for this org type (e.g. the Ministry,
    // NGO, Education, and Healthcare presets ship automations: null)
    budget: z.record(z.boolean()).nullable(),
    teams: z.record(z.boolean()).nullable(),
    goals: z.record(z.boolean()).nullable(),
    automations: z.record(z.boolean()).nullable(),
    documents: z.record(z.boolean()).nullable(),
    docs: z.record(z.boolean()).nullable(),
    aiAssistant: z.boolean(),
    analytics: z.boolean(),
    integrations: z.boolean(),
    customBranding: z.boolean(),
  }),
  customization: z.object({
    primaryColor: z.string().max(20),
    logoUrl: z.string().max(2048).nullable().optional(),
    budgetCurrency: z.string().max(10),
    fiscalYearStart: z.number().int().min(1).max(12),
    dateFormat: z.string().max(20),
    language: z.string().max(10),
  }),
  permissions: z.object({
    allowMemberInvites: z.boolean(),
    requireBudgetApproval: z.boolean(),
    publicProjectsVisible: z.boolean(),
  }),
  terminologyScheme: z.enum(['AGILE', 'FORMAL']).optional(),
});

// Budget Schemas

export const createBudgetSchema = z.object({
  projectId: uuidSchema,
  fiscalYearStart: z.string().datetime(),
  fiscalYearEnd: z.string().datetime(),
  totalBudget: z.number().positive('Total budget must be positive').max(999999999, 'Budget too large'),
  currency: z.string().length(3, 'Currency must be 3-letter code').default('ETB'),
  settings: z.record(z.any()).optional(),
});

export const updateBudgetSchema = z.object({
  totalBudget: z.number().positive('Total budget must be positive').max(999999999, 'Budget too large').optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'LOCKED', 'CLOSED']).optional(),
  fiscalYearStart: z.string().datetime().optional(),
  fiscalYearEnd: z.string().datetime().optional(),
  settings: z.record(z.any()).optional(),
});

// Expense Schemas

export const createExpenseSchema = z.object({
  budgetId: uuidSchema,
  categoryId: uuidSchema.optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  amount: z.number().positive('Amount must be positive').max(999999999, 'Amount too large'),
  transactionDate: z.string().datetime(),
  vendor: z.string().max(200, 'Vendor name must be less than 200 characters').optional(),
  invoiceNumber: z.string().max(100, 'Invoice number must be less than 100 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1,000 characters').optional(),
});

export const updateExpenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  amount: z.number().positive('Amount must be positive').max(999999999, 'Amount too large').optional(),
  categoryId: uuidSchema.optional(),
  transactionDate: z.string().datetime().optional(),
  vendor: z.string().max(200, 'Vendor name must be less than 200 characters').optional(),
  invoiceNumber: z.string().max(100, 'Invoice number must be less than 100 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1,000 characters').optional(),
});

// Organization Schemas

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters')
    .trim(),
  slug: slugSchema,
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  website: urlSchema.optional(),
});

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters')
    .trim()
    .optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  website: urlSchema.optional(),
  logo: urlSchema.optional(),
});

/**
 * 🔒 SECURITY: Sanitize OAuth redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with / (no protocol-relative // or absolute URLs).
 */
export function sanitizeRedirectUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  // Must start with a single / and not be protocol-relative (//)
  if (!url.startsWith('/') || url.startsWith('//')) return fallback;
  // Block any URL that contains a protocol marker
  if (url.includes('://')) return fallback;
  return url;
}

// Type exports for TypeScript
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type SendVerificationInput = z.infer<typeof sendVerificationSchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
