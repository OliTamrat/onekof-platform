import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export all types from Prisma
export * from '@prisma/client';

// Cache tenant clients by schema name to avoid creating a new connection pool per call
const tenantClients = new Map<string, PrismaClient>();

export function getTenantClient(schemaName: string): PrismaClient {
  if (!tenantClients.has(schemaName)) {
    tenantClients.set(schemaName, new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schemaName}`,
        },
      },
    }));
  }
  return tenantClients.get(schemaName)!;
}
