/*
  Warnings:

  - The values [MAIN,EXTRA] on the enum `ImageType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ImageType_new" AS ENUM ('DESKTOP', 'MOBILE');
ALTER TABLE "ProjectImage" ALTER COLUMN "type" TYPE "ImageType_new" USING ("type"::text::"ImageType_new");
ALTER TYPE "ImageType" RENAME TO "ImageType_old";
ALTER TYPE "ImageType_new" RENAME TO "ImageType";
DROP TYPE "public"."ImageType_old";
COMMIT;
