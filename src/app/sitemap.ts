import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { load } from "@/lib/data";
import { getCategories, getPublishedSlugs } from "@/lib/queries/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, projectSlugs] = await Promise.all([
    load(() => getCategories(), []),
    load(() => getPublishedSlugs(), []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // /categories/[slug] redirects to /projects?category=slug (see next.config.mjs), so the
  // canonical, indexable URL for a category is the filtered list, not the redirect source.
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/projects?category=${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...projectRoutes];
}
