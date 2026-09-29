import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProjectDetail } from "@/components/project/project-detail";
import { load } from "@/lib/data";
import { getProjectBySlug, getSettings, getPublishedSlugs } from "@/lib/queries/public";
import { siteUrl } from "@/lib/site";

// ISR: pages for every published slug are built at deploy time, then revalidated at most
// this often. A publish/update also calls revalidateTag() from the service layer for instant
// invalidation — this interval is just the safety-net upper bound.
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await load(() => getPublishedSlugs(), []);
  return slugs.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await load(() => getProjectBySlug(slug), null);
  if (!project) return {};

  const title = project.seo.metaTitle || project.name;
  const description = project.seo.metaDescription || project.shortDescription;
  const ogImage = project.seo.ogImage || project.images.desktop?.url;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/projects/${slug}` },
    openGraph: { title, description, images: ogImage ? [ogImage] : undefined, type: "article", url: `${siteUrl}/projects/${slug}` },
    twitter: { card: "summary_large_image", title, description, images: ogImage ? [ogImage] : undefined },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([load(() => getProjectBySlug(slug), null), load(() => getSettings(), null)]);

  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.shortDescription,
    applicationCategory: project.category.name,
    url: `${siteUrl}/projects/${project.slug}`,
    image: project.images.desktop?.url,
    ...(project.pricing
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: settings?.currency ?? "USD",
            lowPrice: project.pricing.minPrice,
            highPrice: project.pricing.maxPrice,
          },
        }
      : {}),
    ...(project.technologies.length
      ? { softwareRequirements: project.technologies.map((t) => t.name).join(", ") }
      : {}),
  };

  return (
    <Container className="pt-10 sm:pt-14">
      {/* eslint-disable-next-line react/no-danger -- static JSON, not user-controlled HTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProjectDetail project={project} currency={settings?.currency ?? "USD"} />
    </Container>
  );
}
