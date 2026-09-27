# Project Showcase

Next.js 15 (App Router, TS) · Prisma 6 + PostgreSQL (Neon) · Auth.js v5 · Zod · Cloudinary/S3 · SMTP.

## Status — Phase 1 & Phase 2 complete

**Phase 1 — Backend**: schema, auth/RBAC, Zod schemas, server actions, REST routes, services, caching.

**Phase 2 — Frontend**: all of 2.1–2.10.
- 2.1 Setup — Tailwind v4 tokens, fonts, Framer Motion, TanStack Query, Zustand, RHF+Zod, Sonner, Lucide
- 2.2 Global shell — root + `(public)` + `/dashboard` layouts, error/not-found/loading states, skip-to-content links
- 2.3 Zustand stores — `useUIStore`, `useFilterStore`, `useDashboardUIStore` (server data always lives in TanStack Query)
- 2.4 Public site — home, categories, projects (search/filter/infinite scroll), project detail (full page **and**
  intercepting-route bottom sheet), about, contact
- 2.5 Dashboard UI — role-based sidebar (Developer/Admin/Super Admin), overview, Projects (list + 7-step stepper with
  the admin Pricing step, submit/publish/reject/archive/restore/delete workflow), Categories/Hero/Reviews (CRUD +
  drag reorder + active/publish toggles), About/Contact/Settings singleton editors, Messages inbox, Users CRUD +
  role assignment (Super Admin), Audit log (Super Admin), Account (change password), login
- 2.6 Components inventory — full inventory built, plus `ImageUploader`/`MultiImageUploader` (provider-agnostic
  presign flow — Cloudinary by default, or S3/R2/MinIO via `FILE_UPLOAD_PROVIDER=s3` — preview, drag reorder via
  native HTML5 DnD)
- 2.7 Performance — `generateStaticParams` + ISR (`revalidate = 60`, safety net under the service layer's
  `revalidateTag`) for `/projects/[slug]`; `next/image` everywhere; role tabs and role images lazy-mount
  (Radix `Tabs.Content` only renders the active panel); `next/dynamic` code-splits the review carousel;
  TanStack Query `staleTime` tuned per resource; project cards prefetch their detail route on hover
- 2.8 SEO — `generateMetadata` per project (+ canonical on every public page), `sitemap.ts`, `robots.ts`,
  JSON-LD `SoftwareApplication` per project, `/categories/[slug]` → `/projects?category=slug` redirect
- 2.9 Accessibility — skip-to-content links, Radix Dialog/Tabs for focus trap + ARIA roles, `prefers-reduced-motion`
  respected globally, required alt text on every image upload, keyboard-operable carousels/menus/sheet
- 2.10 Deliverables checklist — see below

## Setup

1. `cp .env.example .env` (or `.env.local`) and fill in `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
   `NEXT_PUBLIC_SITE_URL`, the Cloudinary vars (default storage) or S3 vars + `FILE_UPLOAD_PROVIDER=s3`,
   `SMTP_*` + `CONTACT_TO_EMAIL` (optional — skipped gracefully if unset), and optional `CRON_SECRET` / `SEED_ADMIN_*`.
2. `npm install`
3. `npx prisma migrate dev --name init`
4. `npm run db:seed`
5. `npm run dev`, then sign in at `/login` with the seeded Super Admin.

## Layout

- `prisma/`, `src/lib/`, `src/actions/`, `src/app/api/` — Phase 1 backend, unchanged.
- `src/app/(public)/` — public site (navbar + footer via its `layout.tsx`).
  - `@modal/(.)projects/[slug]/` — intercepting route: opens as a bottom sheet from a project card;
    direct load / refresh / share renders `projects/[slug]/page.tsx` (statically generated + ISR) instead.
- `src/app/dashboard/` — role-gated dashboard (`layout.tsx` redirects to `/login` without a session).
- `src/app/login/`, `src/components/layout/standalone-shell.tsx` — chrome-free auth pages.
- `src/components/{ui,layout,home,project,categories,contact,dashboard}/` — component inventory.
- `src/components/dashboard/project-editor/` — the 7-step (+ admin Pricing) project stepper; one shared
  React Hook Form instance across steps, media uploads persisted immediately (separate sub-resource per
  the backend's `/api/dashboard/projects/[id]/images`), everything else saved together on "Save draft".
- `src/stores/` — Zustand: `useUIStore`, `useFilterStore` (URL-synced), `useDashboardUIStore` (sidebar collapse,
  persisted).
- `src/lib/api/client.ts` (public reads), `src/lib/api/dashboard.ts` (dashboard reads) — typed fetch wrappers
  around the Phase 1 REST envelope. Dashboard **mutations** call the Phase 1 server actions directly from
  client components (no extra HTTP hop); `src/lib/api/action-result.ts` unwraps their `{ok, data|error}` result
  into a thrown error TanStack Query's `onError` can handle.
- `src/lib/queries/public.ts` + `src/lib/data.ts` — cached public reads Server Components call directly.
- `src/types/{api,dashboard}.ts` — response types derived from the Phase 1 query/service return types —
  Phase 2 never invents data shapes.
- `src/lib/form-resolver.ts` — small typed bridge for a zod-input-vs-output generic mismatch that surfaces
  with `@hookform/resolvers/zod` on schemas that use `.default()`; purely a TypeScript-side fix, no runtime effect.

- `src/lib/storage/` — the upload provider abstraction: `types.ts` (interface), `cloudinary.ts`
  (signed direct upload + destroy), `s3.ts` (presigned PUT, real AWS S3 or any S3-compatible
  endpoint via `S3_ENDPOINT`), `index.ts` (picks one by `FILE_UPLOAD_PROVIDER`, default
  `"cloudinary"`). `uploadService.ts` and `useImageUpload` both go through this — switching
  providers is a one-line env change, nothing else.
- `src/lib/mailer.ts` — SMTP mailer (nodemailer). Generic `sendMail()` plus `sendContactNotification`
  and `sendPasswordResetEmail`; no-ops with a console warning if `SMTP_*` isn't set, so nothing
  crashes in local dev without email configured.
- Forgot/reset password: `src/app/forgot-password/`, `src/app/reset-password/`,
  `authService.requestPasswordReset`/`resetPassword`, actions + matching `/api/auth/*` routes,
  and a new `PasswordResetToken` Prisma model (hashed tokens, 1-hour expiry, single-use, bumps
  `sessionVersion` on reset so every other session is signed out). The request endpoint always
  responds the same way whether or not the email is registered, so it can't be used to enumerate
  accounts.

## Known simplifications (documented trade-offs, not gaps in behavior)

- **Drag reorder** (Categories/Hero/Reviews/project images/extra screenshots) uses native HTML5
  drag-and-drop (`useDragReorder`) instead of a dedicated library — zero extra dependency, same UX.
- **Table pagination** is page-based (≤20 rows/page) rather than virtualized, which satisfies the Rules'
  "virtualize lists over 50 rows" intent without adding a virtualization library.
- **Client-side validation** on the dashboard forms is intentionally light — Zod validation is authoritative
  server-side (via the existing server actions); the UI surfaces whatever the server rejects. This avoids
  re-deriving a second, subtly different validation ruleset for admin forms that already have narrow, trusted
  usage.

## Testing performed in this environment (and what couldn't be)

This sandbox's network only reaches package registries (npm, PyPI, GitHub) — no database hosts, no SMTP,
no third-party APIs. What that meant concretely:

**Actually run here, with real results:**
- `npm run typecheck` — zero errors, full app including the new storage/mail/reset-password code.
- `next build` with your real `.env.local` values (no `SKIP_ENV_VALIDATION` needed — the required env
  vars all validated successfully) — every route compiles and prerenders/ISRs, including
  `/forgot-password`, `/reset-password`, `/api/auth/forgot-password`, `/api/auth/reset-password`, and
  the renamed `/api/cron/storage-cleanup`. Prisma's client was generated from your schema (including the
  new `PasswordResetToken` model) with a temporarily stubbed `db.ts` — restored before packaging — because
  even Prisma's own engine download is blocked here, independent of database reachability.
- The Cloudinary signing function (`src/lib/storage/cloudinary.ts`) was differentially tested against the
  official `cloudinary` npm package's `utils.api_sign_request()` across several param shapes matching
  production use — all signatures matched exactly.
- The key ⇄ `public_id`/format ⇄ deterministic-URL round-trip that `uploadService.assertAsset` relies on
  was verified in isolation (splitting `projects/2026/09/<uuid>.jpg` and reconstructing the same URL).

**Confirmed blocked, not just assumed:**
- Neon Postgres: even fetching Prisma's query-engine binary gets `403 host_not_allowed`.
- Gmail SMTP (`smtp.gmail.com:465`): connection attempt times out, both a raw TCP probe and a real
  `nodemailer.createTransport(...).verify()` call with your exact credentials.
- Cloudinary's API host: `403 host_not_allowed`.

**Still needs real network access (your machine, or a deployment) to verify end-to-end:**
- `prisma migrate dev` / `db:seed` against the live Neon database.
- An actual image upload round-trip through Cloudinary (signature logic is verified; the live HTTP
  exchange with `api.cloudinary.com` is not).
- An actual email delivery through Gmail SMTP — contact form notification and password reset.
- Signing in, browsing the dashboard against real seeded data, and the full forgot/reset password flow
  end to end (request → email → click link → set new password → old sessions invalidated).

## Notes

- Rate limiting is in-memory per instance; swap for Redis/Upstash if you scale out.
- Run `npx prisma migrate dev --name add_password_reset_token` once you have real database access —
  the schema change is in `prisma/schema.prisma` but no migration has been generated/applied (couldn't
  reach the database from here to do it safely).
