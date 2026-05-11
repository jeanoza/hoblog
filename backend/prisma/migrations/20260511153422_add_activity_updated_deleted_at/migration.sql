-- AlterTable
ALTER TABLE "Activity"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now();

UPDATE "Activity" SET "updatedAt" = "createdAt";

ALTER TABLE "Activity" ALTER COLUMN "updatedAt" DROP DEFAULT;
