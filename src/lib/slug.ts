import { conflict } from "@/lib/errors";

export function slugify(input: string): string {
  return (
    input
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

/** `isTaken` returns true when the slug is already used. */
export async function uniqueSlug(base: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  let candidate = base;
  for (let i = 2; i < 100; i++) {
    if (!(await isTaken(candidate))) return candidate;
    candidate = `${base}-${i}`;
  }
  throw conflict("Could not generate a unique slug; please provide one");
}
