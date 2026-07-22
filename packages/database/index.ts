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

const tenantClients = new Map<string, PrismaClient>();

export function getTenantClient(schemaName: string) {
  const cached = tenantClients.get(schemaName);
  if (cached) return cached;

  const client = new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?schema=${schemaName}`,
      },
    },
  });
  tenantClients.set(schemaName, client);
  return client;
}
