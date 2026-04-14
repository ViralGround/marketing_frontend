-- CreateEnum
CREATE TYPE "EditingSkill" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "creator_profiles" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "editing_skill" "EditingSkill" NOT NULL DEFAULT 'LOW',
    "face_exposure" BOOLEAN NOT NULL DEFAULT false,
    "profile_image" TEXT,
    "instagram_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_member_id_key" ON "creator_profiles"("member_id");

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
