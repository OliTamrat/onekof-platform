import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  slugSchema,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  createProjectSchema,
  updateProjectSchema,
  createIssueSchema,
  updateIssueSchema,
  createBudgetSchema,
  updateBudgetSchema,
  createExpenseSchema,
  createOrganizationSchema,
} from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('accepts valid email', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    it('lowercases email', () => {
      expect(emailSchema.parse('Test@Example.COM')).toBe('test@example.com');
    });

    it('rejects invalid email', () => {
      expect(() => emailSchema.parse('not-an-email')).toThrow();
    });

    it('rejects empty string', () => {
      expect(() => emailSchema.parse('')).toThrow();
    });

    it('rejects email over 255 chars', () => {
      const longEmail = 'a'.repeat(250) + '@b.com';
      expect(() => emailSchema.parse(longEmail)).toThrow();
    });
  });

  describe('passwordSchema', () => {
    it('accepts valid password', () => {
      expect(passwordSchema.parse('SecurePass1')).toBe('SecurePass1');
    });

    it('rejects password under 8 chars', () => {
      expect(() => passwordSchema.parse('Ab1')).toThrow();
    });

    it('rejects password without uppercase', () => {
      expect(() => passwordSchema.parse('lowercase1')).toThrow();
    });

    it('rejects password without lowercase', () => {
      expect(() => passwordSchema.parse('UPPERCASE1')).toThrow();
    });

    it('rejects password without number', () => {
      expect(() => passwordSchema.parse('NoNumber!')).toThrow();
    });

    it('rejects password over 128 chars', () => {
      const longPassword = 'A1' + 'a'.repeat(127);
      expect(() => passwordSchema.parse(longPassword)).toThrow();
    });
  });

  describe('nameSchema', () => {
    it('accepts valid name', () => {
      expect(nameSchema.parse('John Doe')).toBe('John Doe');
    });

    it('accepts name with hyphens and apostrophes', () => {
      expect(nameSchema.parse("O'Brien-Smith")).toBe("O'Brien-Smith");
    });

    it('rejects empty name', () => {
      expect(() => nameSchema.parse('')).toThrow();
    });

    it('rejects name with numbers', () => {
      expect(() => nameSchema.parse('John123')).toThrow();
    });

    it('rejects name over 100 chars', () => {
      expect(() => nameSchema.parse('A'.repeat(101))).toThrow();
    });
  });

  describe('slugSchema', () => {
    it('accepts valid slug', () => {
      expect(slugSchema.parse('my-project')).toBe('my-project');
    });

    it('lowercases input', () => {
      expect(slugSchema.parse('my-project-123')).toBe('my-project-123');
    });

    it('rejects slug under 3 chars', () => {
      expect(() => slugSchema.parse('ab')).toThrow();
    });

    it('rejects slug with uppercase (regex requires lowercase)', () => {
      expect(() => slugSchema.parse('MY-PROJECT')).toThrow();
    });

    it('rejects slug with special characters', () => {
      expect(() => slugSchema.parse('my project!')).toThrow();
    });

    it('rejects slug over 50 chars', () => {
      expect(() => slugSchema.parse('a'.repeat(51))).toThrow();
    });
  });

  describe('signupSchema', () => {
    const validSignup = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass1',
    };

    it('accepts valid signup data', () => {
      const result = signupSchema.parse(validSignup);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('rejects missing name', () => {
      const { name, ...rest } = validSignup;
      expect(() => signupSchema.parse(rest)).toThrow();
    });

    it('rejects missing email', () => {
      const { email, ...rest } = validSignup;
      expect(() => signupSchema.parse(rest)).toThrow();
    });

    it('rejects weak password', () => {
      expect(() => signupSchema.parse({ ...validSignup, password: 'weak' })).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.parse({ email: 'test@example.com', password: 'any-password' });
      expect(result.email).toBe('test@example.com');
    });

    it('rejects missing password', () => {
      expect(() => loginSchema.parse({ email: 'test@example.com' })).toThrow();
    });

    it('rejects empty password', () => {
      expect(() => loginSchema.parse({ email: 'test@example.com', password: '' })).toThrow();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('accepts valid email', () => {
      const result = forgotPasswordSchema.parse({ email: 'user@test.com' });
      expect(result.email).toBe('user@test.com');
    });

    it('rejects invalid email', () => {
      expect(() => forgotPasswordSchema.parse({ email: 'bad' })).toThrow();
    });
  });

  describe('resetPasswordSchema', () => {
    it('accepts valid token and password', () => {
      const token = 'a'.repeat(64);
      const result = resetPasswordSchema.parse({ token, password: 'NewPass123' });
      expect(result.token).toBe(token);
    });

    it('rejects token not exactly 64 chars', () => {
      expect(() => resetPasswordSchema.parse({ token: 'short', password: 'NewPass123' })).toThrow();
    });
  });

  describe('verifyEmailSchema', () => {
    it('accepts 64-char token', () => {
      const token = 'b'.repeat(64);
      const result = verifyEmailSchema.parse({ token });
      expect(result.token).toBe(token);
    });
  });

  describe('createProjectSchema', () => {
    const validProject = {
      name: 'My Project',
      key: 'PROJ',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('accepts valid project data', () => {
      const result = createProjectSchema.parse(validProject);
      expect(result.name).toBe('My Project');
      expect(result.key).toBe('PROJ');
    });

    it('requires uppercase project key (validated before transform)', () => {
      expect(() => createProjectSchema.parse({ ...validProject, key: 'proj' })).toThrow();
    });

    it('rejects key with special characters', () => {
      expect(() => createProjectSchema.parse({ ...validProject, key: 'PR-J' })).toThrow();
    });

    it('rejects invalid organization ID', () => {
      expect(() => createProjectSchema.parse({ ...validProject, organizationId: 'bad' })).toThrow();
    });

    it('accepts optional fields', () => {
      const result = createProjectSchema.parse({
        ...validProject,
        description: 'A test project',
        color: '#FF5733',
        icon: 'rocket',
      });
      expect(result.description).toBe('A test project');
      expect(result.color).toBe('#FF5733');
    });

    it('rejects invalid color format', () => {
      expect(() => createProjectSchema.parse({ ...validProject, color: 'red' })).toThrow();
    });
  });

  describe('updateProjectSchema', () => {
    it('accepts partial updates', () => {
      const result = updateProjectSchema.parse({ name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('accepts valid status', () => {
      const result = updateProjectSchema.parse({ status: 'ACTIVE' });
      expect(result.status).toBe('ACTIVE');
    });

    it('rejects invalid status', () => {
      expect(() => updateProjectSchema.parse({ status: 'INVALID' })).toThrow();
    });
  });

  describe('createIssueSchema', () => {
    const validIssue = {
      title: 'Fix login bug',
      type: 'BUG' as const,
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      reporterId: '550e8400-e29b-41d4-a716-446655440001',
    };

    it('accepts valid issue data', () => {
      const result = createIssueSchema.parse(validIssue);
      expect(result.title).toBe('Fix login bug');
      expect(result.priority).toBe('MEDIUM');
    });

    it('accepts all issue types', () => {
      for (const type of ['TASK', 'BUG', 'FEATURE', 'EPIC', 'STORY']) {
        expect(() => createIssueSchema.parse({ ...validIssue, type })).not.toThrow();
      }
    });

    it('rejects title over 200 chars', () => {
      expect(() => createIssueSchema.parse({ ...validIssue, title: 'A'.repeat(201) })).toThrow();
    });

    it('rejects estimate over 1000', () => {
      expect(() => createIssueSchema.parse({ ...validIssue, estimate: 1001 })).toThrow();
    });

    it('rejects more than 10 labels', () => {
      const labels = Array.from({ length: 11 }, (_, i) => `label${i}`);
      expect(() => createIssueSchema.parse({ ...validIssue, labels })).toThrow();
    });
  });

  describe('createBudgetSchema', () => {
    const validBudget = {
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      fiscalYearStart: '2024-01-01T00:00:00.000Z',
      fiscalYearEnd: '2024-12-31T23:59:59.000Z',
      totalBudget: 100000,
    };

    it('accepts valid budget data', () => {
      const result = createBudgetSchema.parse(validBudget);
      expect(result.totalBudget).toBe(100000);
      expect(result.currency).toBe('ETB');
    });

    it('rejects negative budget', () => {
      expect(() => createBudgetSchema.parse({ ...validBudget, totalBudget: -1000 })).toThrow();
    });

    it('rejects zero budget', () => {
      expect(() => createBudgetSchema.parse({ ...validBudget, totalBudget: 0 })).toThrow();
    });

    it('rejects budget over 999999999', () => {
      expect(() => createBudgetSchema.parse({ ...validBudget, totalBudget: 1000000000 })).toThrow();
    });

    it('accepts custom currency', () => {
      const result = createBudgetSchema.parse({ ...validBudget, currency: 'ETB' });
      expect(result.currency).toBe('ETB');
    });
  });

  describe('createExpenseSchema', () => {
    const validExpense = {
      budgetId: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Office supplies',
      amount: 250.50,
      transactionDate: '2024-03-15T00:00:00.000Z',
    };

    it('accepts valid expense data', () => {
      const result = createExpenseSchema.parse(validExpense);
      expect(result.amount).toBe(250.50);
    });

    it('rejects negative amount', () => {
      expect(() => createExpenseSchema.parse({ ...validExpense, amount: -10 })).toThrow();
    });

    it('rejects missing description', () => {
      const { description, ...rest } = validExpense;
      expect(() => createExpenseSchema.parse(rest)).toThrow();
    });

    it('accepts optional fields', () => {
      const result = createExpenseSchema.parse({
        ...validExpense,
        vendor: 'Staples',
        invoiceNumber: 'INV-001',
        notes: 'Monthly supplies',
      });
      expect(result.vendor).toBe('Staples');
    });
  });

  describe('createOrganizationSchema', () => {
    it('accepts valid organization data', () => {
      const result = createOrganizationSchema.parse({
        name: 'Onekof Inc',
        slug: 'onekof-inc',
      });
      expect(result.name).toBe('Onekof Inc');
      expect(result.slug).toBe('onekof-inc');
    });

    it('rejects empty name', () => {
      expect(() => createOrganizationSchema.parse({ name: '', slug: 'test' })).toThrow();
    });

    it('accepts optional website', () => {
      const result = createOrganizationSchema.parse({
        name: 'Test Org',
        slug: 'test-org',
        website: 'https://example.com',
      });
      expect(result.website).toBe('https://example.com');
    });

    it('rejects invalid website URL', () => {
      expect(() => createOrganizationSchema.parse({
        name: 'Test Org',
        slug: 'test-org',
        website: 'not-a-url',
      })).toThrow();
    });
  });
});
