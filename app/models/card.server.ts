import type { Card, CardProgress, Deck, User } from "../../generated/prisma/client";

import { prisma } from "~/lib/prisma.server";
import {
  MAX_KNOWLEDGE_LEVEL,
  MIN_KNOWLEDGE_LEVEL,
  scheduleNextReview,
  type KnowledgeLevel,
  type ReviewOutcome,
} from "~/lib/spaced-repetition";

export function createCard({
  deckId,
  front,
  back,
}: Pick<Card, "front" | "back"> & {
  deckId: Deck["id"];
}) {
  return prisma.card.create({
    data: {
      front,
      back,
      deck: {
        connect: {
          id: deckId,
        },
      },
    },
  });
}

export function deleteCard({
  id,
  deckId,
}: Pick<Card, "id"> & { deckId: Deck["id"] }) {
  return prisma.card.delete({
    where: {
      id,
      deckId,
    },
  });
}

type StudyCardProgress = Pick<
  CardProgress,
  "id" | "knowledgeLevel" | "nextReviewAt" | "lastReviewedAt"
>;

export type StudyCard = Pick<
  Card,
  "id" | "front" | "back" | "deckId" | "createdAt" | "updatedAt"
> & {
  progress: StudyCardProgress;
  due: boolean;
};

function toKnowledgeLevel(level: number): KnowledgeLevel {
  const clamped = Math.min(MAX_KNOWLEDGE_LEVEL, Math.max(MIN_KNOWLEDGE_LEVEL, level));
  return clamped as KnowledgeLevel;
}

function defaultProgress(now: Date): StudyCardProgress {
  return {
    id: "",
    knowledgeLevel: MIN_KNOWLEDGE_LEVEL,
    nextReviewAt: now,
    lastReviewedAt: null,
  };
}

export async function getOrCreateCardProgress({
  userId,
  cardId,
}: {
  userId: User["id"];
  cardId: Card["id"];
}) {
  return prisma.cardProgress.upsert({
    where: {
      userId_cardId: {
        userId,
        cardId,
      },
    },
    update: {},
    create: {
      userId,
      cardId,
      knowledgeLevel: MIN_KNOWLEDGE_LEVEL,
      nextReviewAt: new Date(),
    },
  });
}

export async function getStudyCardsForDeck({
  deckId,
  userId,
  now = new Date(),
}: {
  deckId: Deck["id"];
  userId: User["id"];
  now?: Date;
}): Promise<StudyCard[]> {
  const cards = await prisma.card.findMany({
    where: { deckId },
    orderBy: { createdAt: "asc" },
  });

  const progressRows = await prisma.cardProgress.findMany({
    where: {
      userId,
      cardId: { in: cards.map((card) => card.id) },
    },
  });

  const progressByCardId = new Map(
    progressRows.map((progress) => [progress.cardId, progress]),
  );

  return cards.map((card) => {
    const progress = progressByCardId.get(card.id) ?? defaultProgress(now);
    return {
      id: card.id,
      front: card.front,
      back: card.back,
      deckId: card.deckId,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      progress,
      due: progress.nextReviewAt.getTime() <= now.getTime(),
    };
  });
}

export async function getDueStudyCardsForDeck({
  deckId,
  userId,
  now = new Date(),
}: {
  deckId: Deck["id"];
  userId: User["id"];
  now?: Date;
}) {
  const cards = await getStudyCardsForDeck({ deckId, userId, now });
  return cards.filter((card) => card.due);
}

export async function reviewCard({
  userId,
  cardId,
  outcome,
  reviewedAt = new Date(),
}: {
  userId: User["id"];
  cardId: Card["id"];
  outcome: ReviewOutcome;
  reviewedAt?: Date;
}) {
  const progress = await getOrCreateCardProgress({ userId, cardId });
  const schedule = scheduleNextReview({
    currentLevel: toKnowledgeLevel(progress.knowledgeLevel),
    outcome,
    reviewedAt,
  });

  return prisma.cardProgress.update({
    where: { id: progress.id },
    data: {
      knowledgeLevel: schedule.nextLevel,
      lastReviewedAt: reviewedAt,
      nextReviewAt: schedule.nextReviewAt,
    },
  });
}
