-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('NONE', 'PENDING_DEPOSIT', 'DEPOSIT_CONFIRMING', 'FUNDED', 'PARTIALLY_RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EscrowTxType" AS ENUM ('DEPOSIT', 'RELEASE', 'REFUND');

-- AlterEnum
ALTER TYPE "CampaignStatus" ADD VALUE 'DRAFT';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COMPANY';

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "deposit_requested_at" TIMESTAMP(3),
ADD COLUMN     "escrow_status" "EscrowStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "funded_at" TIMESTAMP(3),
ADD COLUMN     "refunded_at" TIMESTAMP(3),
ADD COLUMN     "total_budget" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "company_name" TEXT NOT NULL,
    "business_number" TEXT NOT NULL,
    "representative_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "address" TEXT,
    "homepage" TEXT,
    "industry" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_transactions" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "application_id" INTEGER,
    "type" "EscrowTxType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "memo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_member_id_key" ON "company_profiles"("member_id");

-- CreateIndex
CREATE INDEX "escrow_transactions_campaign_id_idx" ON "escrow_transactions"("campaign_id");

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
