/*
  Warnings:

  - The values [COMPANY] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/

-- COMPANY role 제거 전 기존 COMPANY 회원을 CREATOR로 전환
UPDATE "members" SET "role" = 'CREATOR' WHERE "role" = 'COMPANY';

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EditingTool" AS ENUM ('CAPCUT', 'PREMIERE', 'FINAL_CUT', 'VN', 'OTHER', 'NONE');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUBMITTED', 'SETTLED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('CREATOR', 'ADMIN');
ALTER TABLE "members" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "creator_profiles" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "editing_tool" "EditingTool",
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "tiktok_id" TEXT,
ADD COLUMN     "youtube_id" TEXT;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "reward_amount" INTEGER NOT NULL,
    "thumbnail_url" TEXT,
    "requirements" TEXT,
    "deadline" TIMESTAMP(3),
    "max_participants" INTEGER NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'OPEN',
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_applications" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "submission_url" TEXT,
    "reward_paid_amount" INTEGER,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_applications_campaign_id_creator_id_key" ON "campaign_applications"("campaign_id", "creator_id");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_applications" ADD CONSTRAINT "campaign_applications_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_applications" ADD CONSTRAINT "campaign_applications_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
