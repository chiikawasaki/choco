-- CreateTable
CREATE TABLE "public"."note_relationships" (
    "id" TEXT NOT NULL,
    "sourceNoteId" TEXT NOT NULL,
    "targetNoteId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL DEFAULT 'connection',
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "note_relationships_sourceNoteId_targetNoteId_key" ON "public"."note_relationships"("sourceNoteId", "targetNoteId");

-- AddForeignKey
ALTER TABLE "public"."note_relationships" ADD CONSTRAINT "note_relationships_sourceNoteId_fkey" FOREIGN KEY ("sourceNoteId") REFERENCES "public"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."note_relationships" ADD CONSTRAINT "note_relationships_targetNoteId_fkey" FOREIGN KEY ("targetNoteId") REFERENCES "public"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
