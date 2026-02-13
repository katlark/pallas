import type { Card, Deck, Study, StudyItem, User } from "../../generated/prisma/client";

import { prisma } from "~/lib/prisma.server";
import { reviewCard } from "~/models/card.server";
import type { ReviewOutcome } from "~/lib/spaced-repetition";

export const DEFAULT_CHAPTER_SIZE = 8;

export async function createStudySession({
  userId,
  deckId,
  chapterNumber,
  chapterSize = DEFAULT_CHAPTER_SIZE,
}: {
  userId: User["id"];
  deckId: Deck["id"];
  chapterNumber?: number;
  chapterSize?: number;
}) {
  const allCards = await prisma.card.findMany({
    where: { deckId },
    orderBy: { createdAt: "asc" },
  });
  const cardsWithChapter = allCards.map((card, index) => ({
    card,
    chapterNumber: Math.floor(index / chapterSize) + 1,
    position: index,
  }));
  const selectedCards =
    chapterNumber === undefined
      ? cardsWithChapter
      : cardsWithChapter.filter((entry) => entry.chapterNumber === chapterNumber);

  const progressRows = await prisma.cardProgress.findMany({
    where: {
      userId,
      cardId: { in: selectedCards.map((entry) => entry.card.id) },
    },
  });
  const knowledgeByCardId = new Map(
    progressRows.map((progress) => [progress.cardId, progress.knowledgeLevel]),
  );

  const study = await prisma.study.create({
    data: {
      userId,
      deckId,
      items: {
        create: selectedCards.map((entry) => ({
          position: entry.position,
          chapterNumber: entry.chapterNumber,
          frontSnapshot: entry.card.front,
          backSnapshot: entry.card.back,
          knowledgeAtStart: knowledgeByCardId.get(entry.card.id) ?? 0,
          cardId: entry.card.id,
        })),
      },
    },
  });

  return study;
}

export async function getStudySession({
  studyId,
  userId,
}: {
  studyId: Study["id"];
  userId: User["id"];
}) {
  return prisma.study.findFirst({
    where: { id: studyId, userId },
    include: {
      deck: {
        select: {
          id: true,
          title: true,
          userId: true,
        },
      },
      items: {
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function getOrCreateStudySession({
  userId,
  deckId,
  chapterNumber,
  chapterSize = DEFAULT_CHAPTER_SIZE,
}: {
  userId: User["id"];
  deckId: Deck["id"];
  chapterNumber?: number;
  chapterSize?: number;
}) {
  const activeStudy = await prisma.study.findFirst({
    where: {
      userId,
      deckId,
      completedAt: null,
      ...(chapterNumber
        ? {
            items: {
              some: { chapterNumber },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  if (activeStudy) return activeStudy;
  return createStudySession({ userId, deckId, chapterNumber, chapterSize });
}

export type StudyChapterSummary = {
  chapterNumber: number;
  totalCards: number;
  reviewedCards: number;
  remainingCards: number;
};

export function getStudyChapterSummaries(items: StudyItem[]): StudyChapterSummary[] {
  const grouped = new Map<number, StudyItem[]>();
  for (const item of items) {
    const existing = grouped.get(item.chapterNumber) ?? [];
    existing.push(item);
    grouped.set(item.chapterNumber, existing);
  }

  const chapterNumbers = [...grouped.keys()].sort((a, b) => a - b);
  return chapterNumbers.map((chapterNumber) => {
    const chapterItems = grouped.get(chapterNumber) ?? [];
    const reviewedCards = chapterItems.filter((item) => item.reviewedAt).length;
    const totalCards = chapterItems.length;
    return {
      chapterNumber,
      totalCards,
      reviewedCards,
      remainingCards: totalCards - reviewedCards,
    };
  });
}

export async function reviewStudyItem({
  userId,
  studyId,
  studyItemId,
  outcome,
  reviewedAt = new Date(),
}: {
  userId: User["id"];
  studyId: Study["id"];
  studyItemId: StudyItem["id"];
  outcome: ReviewOutcome;
  reviewedAt?: Date;
}) {
  const item = await prisma.studyItem.findFirst({
    where: {
      id: studyItemId,
      studyId,
      study: { userId },
    },
  });

  if (!item) return null;

  let knowledgeAfter = item.knowledgeAtStart;
  if (item.cardId) {
    const progress = await reviewCard({
      userId,
      cardId: item.cardId as Card["id"],
      outcome,
      reviewedAt,
    });
    knowledgeAfter = progress.knowledgeLevel;
  }

  const updatedItem = await prisma.studyItem.update({
    where: { id: item.id },
    data: {
      reviewedAt,
      outcome,
      knowledgeAfter,
    },
  });

  const remainingCount = await prisma.studyItem.count({
    where: {
      studyId,
      reviewedAt: null,
    },
  });

  if (remainingCount === 0) {
    await prisma.study.update({
      where: { id: studyId },
      data: { completedAt: reviewedAt },
    });
  }

  return updatedItem;
}
