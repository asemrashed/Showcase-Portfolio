import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver, FieldValues } from "react-hook-form";
import type { ZodTypeAny } from "zod";

/**
 * Schemas with `.default()` fields (arrays, booleans) make Zod's inferred *input* type optional
 * for those keys while the *output* type (what RHF's default values need to satisfy) requires
 * them — a known friction point between zod and @hookform/resolvers' generics. The runtime
 * behavior is correct either way; this just bridges the two type views for TypeScript.
 */
export function formResolver<T extends FieldValues>(schema: ZodTypeAny): Resolver<T> {
  return zodResolver(schema) as unknown as Resolver<T>;
}
