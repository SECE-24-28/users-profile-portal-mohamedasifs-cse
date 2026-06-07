// Prisma client singleton — reuses the same instance across hot reloads in dev

import { PrismaClient } from "@prisma/client";

// Store client on the global object in development to prevent too many connections
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
