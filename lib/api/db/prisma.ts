import { PrismaClient } from '@/lib/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prisma 7 generated client constructor requires an arg at type level but works with empty object
// @ts-expect-error — PrismaClient constructor type requires argument but empty object works at runtime
export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;