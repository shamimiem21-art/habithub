import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: any };

function createPrismaInstance() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  try {
    const client = new PrismaClient({
      log: ["error"],
    });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return client;
  } catch (e) {
    console.warn("Prisma Client initialization skipped on serverless container");
    return null;
  }
}

export const db: any = createPrismaInstance();
