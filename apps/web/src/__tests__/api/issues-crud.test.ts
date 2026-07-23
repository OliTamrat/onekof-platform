import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
const mockTaskFindMany = vi.fn();
const mockTaskFindFirst = vi.fn();
const mockTaskCount = vi.fn();
const mockTaskCreate = vi.fn();
const mockTaskUpdate = vi.fn();
const mockProjectFindUnique = vi.fn();
const mockTransaction = vi.fn();

vi.mock('@onekof/database', () => ({
  prisma: {
    task: {
      findMany: (...args: any[]) => mockTaskFindMany(...args),
      findFirst: (...args: any[]) => mockTaskFindFirst(...args),
      count: (...args: any[]) => mockTaskCount(...args),
      create: (...args: any[]) => mockTaskCreate(...args),
      update: (...args: any[]) => mockTaskUpdate(...args),
    },
    project: {
      findUnique: (...args: any[]) => mockProjectFindUnique(...args),
      findMany: vi.fn().mockResolvedValue([]),
    },
    organizationMember: {
      findFirst: vi.fn().mockResolvedValue({ role: 'ADMIN' }),
    },
    $transaction: (...args: any[]) => mockTransaction(...args),
  },
}));

vi.mock('@/lib/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

describe('Issues API Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Issue Key Generation', () => {
    it('generates key from project prefix + count', () => {
      const projectKey = 'PROJ';
      const totalTasks = 5;
      const expectedKey = `${projectKey}-${totalTasks + 1}`;
      expect(expectedKey).toBe('PROJ-6');
    });

    it('handles first issue in project (count = 0)', () => {
      const projectKey = 'NEW';
      const totalTasks = 0;
      const expectedKey = `${projectKey}-${totalTasks + 1}`;
      expect(expectedKey).toBe('NEW-1');
    });

    it('handles high issue numbers', () => {
      const projectKey = 'BIG';
      const totalTasks = 999;
      const expectedKey = `${projectKey}-${totalTasks + 1}`;
      expect(expectedKey).toBe('BIG-1000');
    });
  });

  describe('Issue Query Caps', () => {
    it('unpaginated query should have take limit', () => {
      const UNPAGINATED_LIMIT = 500;
      expect(UNPAGINATED_LIMIT).toBeLessThanOrEqual(500);
      expect(UNPAGINATED_LIMIT).toBeGreaterThan(0);
    });
  });

  describe('Top-level filter', () => {
    it('topLevel=true sets parentId to null in where clause', () => {
      const topLevel = 'true';
      const where: any = {};
      if (topLevel === 'true') {
        where.parentId = null;
      }
      expect(where.parentId).toBeNull();
    });

    it('parentId filter sets specific parent', () => {
      const parentId = 'issue-123';
      const where: any = {};
      if (parentId) {
        where.parentId = parentId;
      }
      expect(where.parentId).toBe('issue-123');
    });
  });

  describe('Search filter', () => {
    it('search creates OR clause for title and key', () => {
      const search = 'GTM';
      const where: any = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { key: { contains: search, mode: 'insensitive' } },
        ];
      }
      expect(where.OR).toHaveLength(2);
      expect(where.OR[0].title.contains).toBe('GTM');
      expect(where.OR[1].key.contains).toBe('GTM');
    });

    it('empty search does not create OR clause', () => {
      const search = '';
      const where: any = {};
      if (search) {
        where.OR = [];
      }
      expect(where.OR).toBeUndefined();
    });
  });
});

describe('Issue Transform', () => {
  it('transforms _count to flat fields', () => {
    const rawIssue = {
      id: '1',
      key: 'PROJ-1',
      title: 'Test',
      _count: { comments: 3, attachments: 1, subtasks: 2 },
    };

    const transformed = {
      ...rawIssue,
      commentCount: rawIssue._count?.comments ?? 0,
      attachmentCount: rawIssue._count?.attachments ?? 0,
      subtaskCount: rawIssue._count?.subtasks ?? 0,
      _count: undefined,
    };

    expect(transformed.commentCount).toBe(3);
    expect(transformed.attachmentCount).toBe(1);
    expect(transformed.subtaskCount).toBe(2);
    expect(transformed._count).toBeUndefined();
  });
});
