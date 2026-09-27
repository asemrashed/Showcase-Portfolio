import type {
  getAbout,
  getCategories,
  getContactInfo,
  getHero,
  getProjectBySlug,
  getProjects,
  getReviews,
  getSettings,
} from "@/lib/queries/public";

/**
 * Response shapes come straight from the Phase 1 read layer — Phase 2 never invents data shapes.
 * (`import type` is erased at build, so this never pulls server-only code into the client bundle.)
 */
export type ProjectsPage = Awaited<ReturnType<typeof getProjects>>;
export type ProjectCardData = ProjectsPage["items"][number];
export type ProjectDetailData = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>;
export type CategoryData = Awaited<ReturnType<typeof getCategories>>[number];
export type HeroSlideData = Awaited<ReturnType<typeof getHero>>[number];
export type ReviewData = Awaited<ReturnType<typeof getReviews>>[number];
export type AboutData = NonNullable<Awaited<ReturnType<typeof getAbout>>>;
export type ContactInfoData = NonNullable<Awaited<ReturnType<typeof getContactInfo>>>;
export type SettingsData = NonNullable<Awaited<ReturnType<typeof getSettings>>>;
