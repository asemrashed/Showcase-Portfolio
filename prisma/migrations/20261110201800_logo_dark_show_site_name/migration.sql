-- AlterTable
ALTER TABLE "SiteSettings" ALTER COLUMN "siteName" SET DEFAULT 'ByteNex Solutions';
ALTER TABLE "SiteSettings" ADD COLUMN "logoDarkUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "logoDarkKey" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "showSiteName" BOOLEAN NOT NULL DEFAULT false;
