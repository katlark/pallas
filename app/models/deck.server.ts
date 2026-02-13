import type { Deck, User } from "../../generated/prisma/client";

import { prisma } from "~/lib/prisma.server";
import { MAX_KNOWLEDGE_LEVEL } from "~/lib/spaced-repetition";

export function getDeck({
  id,
  userId,
}: Pick<Deck, "id"> & {
  userId: User["id"];
}) {
  return prisma.deck.findFirst({
    select: {
      id: true,
      title: true,
      cards: {
        select: {
          id: true,
          front: true,
          back: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    where: { id, userId },
  });
}

export function getDeckForStudy({ id }: Pick<Deck, "id">) {
  return prisma.deck.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      userId: true,
      cards: {
        select: {
          id: true,
          front: true,
          back: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export function getDeckListItems({ userId }: { userId: User["id"] }) {
  return prisma.deck.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export type DeckListItemWithProgress = {
  id: string;
  title: string;
  totalCards: number;
  reviewedCards: number;
  averageKnowledgeLevel: number;
  masteryPercent: number;
};

export async function getDeckListItemsWithProgress({
  userId,
}: {
  userId: User["id"];
}): Promise<DeckListItemWithProgress[]> {
  const decks = await prisma.deck.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });

  if (decks.length === 0) return [];

  const cards = await prisma.card.findMany({
    where: { deckId: { in: decks.map((deck) => deck.id) } },
    select: { id: true, deckId: true },
  });

  const cardIds = cards.map((card) => card.id);
  const progressRows =
    cardIds.length === 0
      ? []
      : await prisma.cardProgress.findMany({
          where: {
            userId,
            cardId: { in: cardIds },
          },
          select: {
            cardId: true,
            knowledgeLevel: true,
          },
        });

  const cardsByDeckId = new Map<string, string[]>();
  for (const card of cards) {
    const existing = cardsByDeckId.get(card.deckId) ?? [];
    existing.push(card.id);
    cardsByDeckId.set(card.deckId, existing);
  }

  const progressByCardId = new Map(
    progressRows.map((progress) => [progress.cardId, progress.knowledgeLevel]),
  );

  return decks.map((deck) => {
    const deckCardIds = cardsByDeckId.get(deck.id) ?? [];
    const totalCards = deckCardIds.length;
    const reviewedCards = deckCardIds.filter((cardId) =>
      progressByCardId.has(cardId),
    ).length;
    const totalKnowledge = deckCardIds.reduce(
      (sum, cardId) => sum + (progressByCardId.get(cardId) ?? 0),
      0,
    );
    const averageKnowledgeLevel =
      totalCards === 0 ? 0 : totalKnowledge / totalCards;
    const masteryPercent = Math.round(
      (averageKnowledgeLevel / MAX_KNOWLEDGE_LEVEL) * 100,
    );

    return {
      id: deck.id,
      title: deck.title,
      totalCards,
      reviewedCards,
      averageKnowledgeLevel: Number(averageKnowledgeLevel.toFixed(1)),
      masteryPercent,
    };
  });
}

export function createDeck({
  title,
  userId,
}: Pick<Deck, "title"> & {
  userId: User["id"];
}) {
  return prisma.deck.create({
    data: {
      title,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteDeck({
  id,
  userId,
}: Pick<Deck, "id"> & { userId: User["id"] }) {
  return prisma.deck.deleteMany({
    where: { id, userId },
  });
}
