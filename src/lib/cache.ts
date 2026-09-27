import "server-only";
import { revalidateTag } from "next/cache";

export const TAGS = {
  projects: "projects",
  categories: "categories",
  hero: "hero",
  reviews: "reviews",
  about: "about",
  contactInfo: "contact-info",
  settings: "settings",
} as const;

export function revalidate(...tags: string[]) {
  for (const t of new Set(tags)) revalidateTag(t);
}

/** A project change can affect every list that embeds project data. */
export function revalidateProjectGraph() {
  revalidate(TAGS.projects, TAGS.categories, TAGS.hero, TAGS.reviews);
}
