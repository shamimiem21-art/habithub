import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: any };

// Ultra-fast proxy fallback if DB is offline, asleep, or timing out
const createDummyDbProxy = (): any => {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === "then") return undefined; // Prevent promise detection issues
      return new Proxy(() => Promise.resolve(null), {
        get(_t, subProp) {
          if (subProp === "then") return undefined;
          return () => Promise.resolve([]);
        },
        apply() {
          return Promise.resolve(null);
        },
      });
    },
  };
  return new Proxy({}, handler);
};

function createPrismaInstance() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  try {
    const client = new PrismaClient({
      log: ["error"],
    });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return client;
  } catch (e) {
    console.warn("Prisma Client initialization skipped; using dummy DB proxy");
    return createDummyDbProxy();
  }
}

export const db: any = createPrismaInstance() || createDummyDbProxy();

/**
 * Execute a database promise with a strict timeout (default 800ms).
 * If the database connection is asleep, paused, or timing out,
 * this wrapper resolves with fallbackValue immediately (within 800ms)
 * to guarantee serverless responses never exceed Vercel thresholds.
 */
export async function withTimeout<T>(
  dbPromise: Promise<T> | any,
  fallbackValue: T,
  timeoutMs: number = 800
): Promise<T> {
  if (!dbPromise || typeof dbPromise.then !== "function") {
    return fallbackValue;
  }

  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallbackValue);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([dbPromise, timeoutPromise]);
    clearTimeout(timer!);
    return result ?? fallbackValue;
  } catch (err) {
    clearTimeout(timer!);
    return fallbackValue;
  }
}
