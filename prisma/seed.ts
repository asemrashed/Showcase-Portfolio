import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CATEGORIES = [
  { name: "Web Applications", description: "Full-stack web apps built for real users." },
  { name: "E-commerce", description: "Storefronts, catalogs, carts and checkout flows." },
  { name: "Dashboards & Admin", description: "Data-rich internal tools and analytics." },
  { name: "Education & LMS", description: "Learning platforms with multi-role access." },
  { name: "SaaS Platforms", description: "Subscription products with billing and teams." },
  { name: "Mobile Apps", description: "Cross-platform and native mobile experiences." },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  let password = process.env.SEED_ADMIN_PASSWORD;
  let generated = false;
  if (!password) {
    password = randomBytes(12).toString("base64url");
    generated = true;
  }

  // update: {} => never overwrite an existing admin's password on re-seed
  await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Super Admin", role: "SUPER_ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });

  for (const [order, c] of CATEGORIES.entries()) {
    const slug = c.name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    await db.category.upsert({ where: { slug }, update: {}, create: { ...c, slug, order } });
  }

  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", siteName: "Project Showcase", tagline: "Software we've built, shown properly.", currency: "USD", socials: [] },
  });
  await db.aboutSection.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", title: "About us", description: "Tell visitors who you are.", stats: [], skills: [] },
  });
  await db.contactInfo.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton", email, socials: [] } });

  console.log("\n✔ Seed complete");
  console.log(`  Super Admin: ${email}`);
  if (generated) console.log(`  Password (shown once): ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
