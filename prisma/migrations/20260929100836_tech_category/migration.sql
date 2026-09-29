-- CreateEnum
CREATE TYPE "TechnologyCategory" AS ENUM ('FRONTEND_FRAMEWORKS', 'STATE_DATA_FETCHING', 'BACKEND', 'DATABASE_ORM', 'AUTHENTICATION', 'VALIDATION_UTILITIES', 'SERVICES', 'APIS_PAYMENTS', 'INFRASTRUCTURE', 'DEVOPS_TOOLING', 'OTHER');

-- AlterTable
ALTER TABLE "Technology" ADD COLUMN     "category" "TechnologyCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "iconKey" TEXT;

-- CreateIndex
CREATE INDEX "Technology_category_idx" ON "Technology"("category");
