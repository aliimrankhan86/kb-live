import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/lib/generated/prisma/client';

// Prisma 7 uses the "prisma-client" generator which requires a driver adapter.
// Pool uses DATABASE_URL (pgBouncer, port 6543) — optimal for serverless / concurrent queries.
// prisma.config.ts uses DIRECT_URL (port 5432) for CLI schema engine operations only.

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
