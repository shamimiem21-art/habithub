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

/**
 * Execute a database promise with a strict timeout (default 1500ms).
 * If the database connection is asleep, paused, or timing out,
 * this wrapper resolves with null or fallback immediately to prevent serverless function hang (504 / ERR_CONNECTION_TIMED_OUT).
 */
export async function withTimeout<T>(
  dbPromise: Promise<T>,
  fallbackValue: T,
  timeoutMs: number = 1500
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[DB Timeout] Query exceeded ${timeoutMs}ms limit. Falling back.`);
      resolve(fallbackValue);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([dbPromise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    console.error("[DB Error]", err);
    return fallbackValue;
  }
}
