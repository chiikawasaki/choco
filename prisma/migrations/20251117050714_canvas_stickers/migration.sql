/*
  Warnings:

  - You are about to drop the `note_stickers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."note_stickers" DROP CONSTRAINT "note_stickers_noteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."note_stickers" DROP CONSTRAINT "note_stickers_stickerId_fkey";

-- DropTable
DROP TABLE "public"."note_stickers";

-- CreateTable
CREATE TABLE "public"."canvas_stickers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stickerId" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 90,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 90,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canvas_stickers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."canvas_stickers" ADD CONSTRAINT "canvas_stickers_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "public"."stickers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
