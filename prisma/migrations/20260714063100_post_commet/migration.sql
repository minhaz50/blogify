/*
  Warnings:

  - You are about to drop the column `isFreatured` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "isFreatured",
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
