/*
  Warnings:

  - You are about to drop the `auth.users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."notes" DROP CONSTRAINT "notes_userId_fkey";

-- DropTable
DROP TABLE "public"."auth.users";
