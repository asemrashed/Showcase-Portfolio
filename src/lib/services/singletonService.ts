import "server-only";
import { db } from "@/lib/db";
import type { Actor } from "@/lib/auth/permissions";
import { revalidate, TAGS } from "@/lib/cache";
import type { AboutInput, ContactInfoInput, SiteSettingsInput } from "@/lib/schemas/content";
import * as audit from "./auditService";
import * as uploads from "./uploadService";

const ID = "singleton";

export const getAbout = () =>
  db.aboutSection.upsert({
    where: { id: ID },
    update: {},
    create: { id: ID, title: "About us", description: "", stats: [], skills: [] },
  });

export async function updateAbout(actor: Actor, input: AboutInput) {
  uploads.assertAssets([input.image]);
  const existing = await getAbout();
  const data = {
    title: input.title,
    description: input.description,
    imageUrl: input.image?.url ?? null,
    imageKey: input.image?.key ?? null,
    imageAlt: input.image?.alt ?? null,
    stats: input.stats,
    skills: input.skills,
  };
  const row = await db.$transaction(async (tx) => {
    const r = await tx.aboutSection.update({ where: { id: ID }, data });
    if (existing.imageKey && existing.imageKey !== input.image?.key) await uploads.queueDeletion(tx, [existing.imageKey]);
    await audit.log(tx, { actor, action: "about.update", entity: "AboutSection", entityId: ID });
    return r;
  });
  await uploads.flushSoon();
  revalidate(TAGS.about);
  return row;
}

export const getContactInfo = () =>
  db.contactInfo.upsert({ where: { id: ID }, update: {}, create: { id: ID, socials: [] } });

export async function updateContactInfo(actor: Actor, input: ContactInfoInput) {
  await getContactInfo();
  const row = await db.$transaction(async (tx) => {
    const r = await tx.contactInfo.update({
      where: { id: ID },
      data: {
        email: input.email ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
        mapUrl: input.mapUrl ?? null,
        workingHours: input.workingHours ?? null,
        socials: input.socials,
      },
    });
    await audit.log(tx, { actor, action: "contactInfo.update", entity: "ContactInfo", entityId: ID });
    return r;
  });
  revalidate(TAGS.contactInfo);
  return row;
}

export const getSettings = () =>
  db.siteSettings.upsert({ where: { id: ID }, update: {}, create: { id: ID, socials: [] } });

export async function updateSettings(actor: Actor, input: SiteSettingsInput) {
  uploads.assertAssets([input.logo, input.defaultOgImage]);
  const existing = await getSettings();
  const row = await db.$transaction(async (tx) => {
    const r = await tx.siteSettings.update({
      where: { id: ID },
      data: {
        siteName: input.siteName,
        tagline: input.tagline ?? null,
        logoUrl: input.logo?.url ?? null,
        logoKey: input.logo?.key ?? null,
        defaultOgImageUrl: input.defaultOgImage?.url ?? null,
        defaultOgImageKey: input.defaultOgImage?.key ?? null,
        currency: input.currency,
        footerText: input.footerText ?? null,
        contactNotifyEmail: input.contactNotifyEmail ?? null,
        socials: input.socials,
      },
    });
    const stale = [
      existing.logoKey !== (input.logo?.key ?? null) ? existing.logoKey : null,
      existing.defaultOgImageKey !== (input.defaultOgImage?.key ?? null) ? existing.defaultOgImageKey : null,
    ];
    await uploads.queueDeletion(tx, stale);
    await audit.log(tx, { actor, action: "settings.update", entity: "SiteSettings", entityId: ID });
    return r;
  });
  await uploads.flushSoon();
  revalidate(TAGS.settings);
  return row;
}
