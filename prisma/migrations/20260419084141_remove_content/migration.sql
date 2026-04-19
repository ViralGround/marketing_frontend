/*
  Warnings:

  - You are about to drop the `contents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contents" DROP CONSTRAINT "contents_author_id_fkey";

-- DropTable
DROP TABLE "contents";

-- DropEnum
DROP TYPE "ContentStatus";
