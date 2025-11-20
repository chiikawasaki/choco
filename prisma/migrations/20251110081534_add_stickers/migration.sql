-- CreateTable
CREATE TABLE "public"."stickers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stickers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."note_stickers" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "stickerId" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_stickers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."note_stickers" ADD CONSTRAINT "note_stickers_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."note_stickers" ADD CONSTRAINT "note_stickers_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "public"."stickers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
