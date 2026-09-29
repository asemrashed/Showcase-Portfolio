import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { TAGS } from "@/lib/cache";
import { paginated } from "@/lib/schemas/common";
import type { PublicProjectQuery } from "@/lib/schemas/project";

/**
 * Public read layer. Everything here is cached with tags and invalidated via revalidateTag()
 * from the service layer. Return values are JSON-safe (dates as ISO strings) and only expose
 * public fields — no audit ids, no repo URLs, no notify email.
 */
const FALLBACK_TTL = 300;

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  shortDescription: true,
  featured: true,
  demoUrl: true,
  publishedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  images: { where: { type: "DESKTOP" }, take: 1, select: { url: true, alt: true } },
  technologies: { orderBy: { order: "asc" }, take: 6, select: { name: true, icon: true } },
} satisfies Prisma.ProjectSelect;

const toCard = (p: Prisma.ProjectGetPayload<{ select: typeof cardSelect }>) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  shortDescription: p.shortDescription,
  featured: p.featured,
  demoUrl: p.demoUrl,
  publishedAt: p.publishedAt?.toISOString() ?? null,
  category: p.category,
  image: p.images[0] ?? null,
  technologies: p.technologies,
});

export const getProjects = unstable_cache(
  async (q: PublicProjectQuery) => {
    const where: Prisma.ProjectWhereInput = {
      status: "PUBLISHED",
      deletedAt: null,
      category: { deletedAt: null, ...(q.category ? { slug: q.category } : {}) },
      ...(q.featured !== undefined && { featured: q.featured }),
      ...(q.search && {
        OR: [
          { name: { contains: q.search, mode: "insensitive" } },
          { shortDescription: { contains: q.search, mode: "insensitive" } },
          { technologies: { some: { name: { contains: q.search, mode: "insensitive" } } } },
        ],
      }),
    };
    const [rows, total] = await Promise.all([
      db.project.findMany({
        where,
        select: cardSelect,
        orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      db.project.count({ where }),
    ]);
    return paginated(rows.map(toCard), total, q.page, q.pageSize);
  },
  ["public-projects"],
  { tags: [TAGS.projects], revalidate: FALLBACK_TTL },
);

const detailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { order: "asc" } },
  roles: { orderBy: { order: "asc" }, include: { images: { orderBy: { order: "asc" } } } },
  features: { orderBy: { order: "asc" } },
  technologies: { orderBy: { order: "asc" } },
} satisfies Prisma.ProjectInclude;

export const getProjectBySlug = unstable_cache(
  async (slug: string) => {
    const p = await db.project.findFirst({
      where: { slug, status: "PUBLISHED", deletedAt: null, category: { deletedAt: null } },
      include: detailInclude,
    });
    if (!p) return null;
    const img = (t: "DESKTOP" | "MOBILE") => {
      const i = p.images.find((x) => x.type === t);
      return i ? { url: i.url, alt: i.alt } : null;
    };
    const hasPricing = p.minPrice != null && p.maxPrice != null && p.minDuration != null && p.maxDuration != null;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      featured: p.featured,
      category: p.category,
      images: {
        desktop: img("DESKTOP"),
        mobile: img("MOBILE"),
      },
      technologies: p.technologies.map((t) => ({ name: t.name, icon: t.icon })),
      features: p.features.map((f) => ({ title: f.title, description: f.description, icon: f.icon })),
      roles: p.roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        images: r.images.map((i) => ({ url: i.url, alt: i.alt, device: i.device })),
      })),
      links: { live: p.liveUrl, demo: p.demoUrl },
      pricing: hasPricing
        ? { minPrice: p.minPrice!, maxPrice: p.maxPrice!, minDuration: p.minDuration!, maxDuration: p.maxDuration! }
        : null, // null => frontend hides the pricing block
      seo: { metaTitle: p.metaTitle, metaDescription: p.metaDescription, ogImage: p.ogImageUrl },
      publishedAt: p.publishedAt?.toISOString() ?? null,
      updatedAt: p.updatedAt.toISOString(),
    };
  },
  ["public-project"],
  { tags: [TAGS.projects], revalidate: FALLBACK_TTL },
);

const toCategory = (c: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  _count: { projects: number };
}) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image: c.imageUrl ? { url: c.imageUrl, alt: c.imageAlt ?? c.name } : null,
  projectCount: c._count.projects,
});

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  imageAlt: true,
  _count: { select: { projects: { where: { status: "PUBLISHED", deletedAt: null } } } },
} satisfies Prisma.CategorySelect;

export const getCategories = unstable_cache(
  async (limit?: number) => {
    const rows = await db.category.findMany({
      where: { deletedAt: null },
      select: categorySelect,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: limit,
    });
    return rows.map(toCategory);
  },
  ["public-categories"],
  { tags: [TAGS.categories], revalidate: FALLBACK_TTL },
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    const c = await db.category.findFirst({ where: { slug, deletedAt: null }, select: categorySelect });
    return c ? toCategory(c) : null;
  },
  ["public-category"],
  { tags: [TAGS.categories], revalidate: FALLBACK_TTL },
);

export const getHero = unstable_cache(
  async () => {
    const rows = await db.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { project: { select: { slug: true, name: true, status: true, deletedAt: true } } },
    });
    return rows.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      cta: s.ctaLabel && s.ctaUrl ? { label: s.ctaLabel, url: s.ctaUrl } : null,
      image: { url: s.imageUrl, alt: s.imageAlt },
      project: s.project && s.project.status === "PUBLISHED" && !s.project.deletedAt ? { slug: s.project.slug, name: s.project.name } : null,
    }));
  },
  ["public-hero"],
  { tags: [TAGS.hero], revalidate: FALLBACK_TTL },
);

export const getReviews = unstable_cache(
  async (opts: { projectSlug?: string; limit: number }) => {
    const rows = await db.review.findMany({
      where: { published: true, deletedAt: null, ...(opts.projectSlug ? { project: { slug: opts.projectSlug } } : {}) },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: opts.limit,
      include: { project: { select: { slug: true, name: true, status: true, deletedAt: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      authorRole: r.authorRole,
      company: r.company,
      avatarUrl: r.avatarUrl,
      rating: r.rating,
      content: r.content,
      project: r.project && r.project.status === "PUBLISHED" && !r.project.deletedAt ? { slug: r.project.slug, name: r.project.name } : null,
      createdAt: r.createdAt.toISOString(),
    }));
  },
  ["public-reviews"],
  { tags: [TAGS.reviews, TAGS.projects], revalidate: FALLBACK_TTL },
);

export const getAbout = unstable_cache(
  async () => {
    const a = await db.aboutSection.findUnique({ where: { id: "singleton" } });
    if (!a) return null;
    return {
      title: a.title,
      description: a.description,
      image: a.imageUrl ? { url: a.imageUrl, alt: a.imageAlt ?? a.title } : null,
      stats: a.stats as { label: string; value: string }[],
      skills: a.skills as string[],
    };
  },
  ["public-about"],
  { tags: [TAGS.about], revalidate: FALLBACK_TTL },
);

export const getContactInfo = unstable_cache(
  async () => {
    const c = await db.contactInfo.findUnique({ where: { id: "singleton" } });
    if (!c) return null;
    return {
      email: c.email,
      phone: c.phone,
      address: c.address,
      mapUrl: c.mapUrl,
      workingHours: c.workingHours,
      socials: c.socials as { platform: string; url: string }[],
    };
  },
  ["public-contact-info"],
  { tags: [TAGS.contactInfo], revalidate: FALLBACK_TTL },
);

export const getSettings = unstable_cache(
  async () => {
    const s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!s) return null;
    return {
      siteName: s.siteName,
      tagline: s.tagline,
      logoUrl: s.logoUrl,
      defaultOgImage: s.defaultOgImageUrl,
      currency: s.currency,
      footerText: s.footerText,
      socials: s.socials as { platform: string; url: string }[],
    };
  },
  ["public-settings"],
  { tags: [TAGS.settings], revalidate: FALLBACK_TTL },
);

/** For generateStaticParams() and sitemap.ts in Phase 2. */
export const getPublishedSlugs = unstable_cache(
  async () => {
    const rows = await db.project.findMany({
      where: { status: "PUBLISHED", deletedAt: null, category: { deletedAt: null } },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });
    return rows.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt.toISOString() }));
  },
  ["public-slugs"],
  { tags: [TAGS.projects], revalidate: FALLBACK_TTL },
);
