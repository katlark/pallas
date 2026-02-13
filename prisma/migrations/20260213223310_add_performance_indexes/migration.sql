-- CreateIndex
CREATE INDEX "Deck_userId_updatedAt_idx" ON "Deck"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Card_deckId_createdAt_idx" ON "Card"("deckId", "createdAt");

-- CreateIndex
CREATE INDEX "Study_userId_deckId_completedAt_createdAt_idx" ON "Study"("userId", "deckId", "completedAt", "createdAt");

-- CreateIndex
CREATE INDEX "StudyItem_studyId_reviewedAt_idx" ON "StudyItem"("studyId", "reviewedAt");
