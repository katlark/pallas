-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    CONSTRAINT "Study_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Study_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapterNumber" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "frontSnapshot" TEXT NOT NULL,
    "backSnapshot" TEXT NOT NULL,
    "knowledgeAtStart" INTEGER NOT NULL DEFAULT 0,
    "knowledgeAfter" INTEGER,
    "reviewedAt" DATETIME,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "studyId" TEXT NOT NULL,
    "cardId" TEXT,
    CONSTRAINT "StudyItem_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudyItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Study_userId_deckId_createdAt_idx" ON "Study"("userId", "deckId", "createdAt");

-- CreateIndex
CREATE INDEX "Study_deckId_createdAt_idx" ON "Study"("deckId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudyItem_studyId_position_key" ON "StudyItem"("studyId", "position");

-- CreateIndex
CREATE INDEX "StudyItem_studyId_chapterNumber_position_idx" ON "StudyItem"("studyId", "chapterNumber", "position");

-- CreateIndex
CREATE INDEX "StudyItem_cardId_idx" ON "StudyItem"("cardId");
