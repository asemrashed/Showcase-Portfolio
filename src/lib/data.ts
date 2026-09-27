import "server-only";

/**
 * Server-side loader for public pages. Pages read through the cached public query layer
 * (src/lib/queries/public.ts) — the same functions the REST routes use — never Prisma directly.
 *
 * During `next build` an unreachable database yields the fallback so static generation
 * doesn't fail; at runtime errors propagate to error.tsx.
 */
export async function load<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("[data] build-time load failed, using fallback:", (e as Error).message);
      return fallback;
    }
    throw e;
  }
}
