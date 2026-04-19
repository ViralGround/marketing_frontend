-- Migrate existing ARCHIVED rows to CLOSED before narrowing the enum
UPDATE "campaigns" SET "status" = 'CLOSED' WHERE "status" = 'ARCHIVED';

-- Recreate CampaignStatus enum without ARCHIVED
ALTER TYPE "CampaignStatus" RENAME TO "CampaignStatus_old";
CREATE TYPE "CampaignStatus" AS ENUM ('OPEN', 'CLOSED');

ALTER TABLE "campaigns" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "campaigns"
  ALTER COLUMN "status" TYPE "CampaignStatus"
  USING ("status"::text::"CampaignStatus");
ALTER TABLE "campaigns" ALTER COLUMN "status" SET DEFAULT 'OPEN';

DROP TYPE "CampaignStatus_old";
