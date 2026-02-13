export const MIN_KNOWLEDGE_LEVEL = 0;
export const MAX_KNOWLEDGE_LEVEL = 6;

export type KnowledgeLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ReviewOutcome = "correct" | "incorrect";
export type IncorrectPolicy = "stay" | "reset";

export type ReviewScheduleInput = {
  currentLevel: KnowledgeLevel;
  outcome: ReviewOutcome;
  reviewedAt?: Date;
  incorrectPolicy?: IncorrectPolicy;
};

export type ReviewScheduleResult = {
  previousLevel: KnowledgeLevel;
  nextLevel: KnowledgeLevel;
  gapDays: number;
  nextReviewAt: Date;
};

function clampKnowledgeLevel(level: number): KnowledgeLevel {
  if (level <= MIN_KNOWLEDGE_LEVEL) return MIN_KNOWLEDGE_LEVEL;
  if (level >= MAX_KNOWLEDGE_LEVEL) return MAX_KNOWLEDGE_LEVEL;
  return level as KnowledgeLevel;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function getGapDaysForLevel(level: KnowledgeLevel) {
  if (level === 0) return 0;
  return 2 ** (level - 1);
}

export function getNextKnowledgeLevel({
  currentLevel,
  outcome,
  incorrectPolicy = "stay",
}: Pick<ReviewScheduleInput, "currentLevel" | "outcome" | "incorrectPolicy">) {
  if (outcome === "correct") {
    return clampKnowledgeLevel(currentLevel + 1);
  }

  if (incorrectPolicy === "reset") {
    return MIN_KNOWLEDGE_LEVEL;
  }

  return currentLevel;
}

export function scheduleNextReview({
  currentLevel,
  outcome,
  reviewedAt = new Date(),
  incorrectPolicy = "stay",
}: ReviewScheduleInput): ReviewScheduleResult {
  const nextLevel = getNextKnowledgeLevel({
    currentLevel,
    outcome,
    incorrectPolicy,
  });
  const gapDays = getGapDaysForLevel(nextLevel);

  return {
    previousLevel: currentLevel,
    nextLevel,
    gapDays,
    nextReviewAt: addDays(reviewedAt, gapDays),
  };
}

export function isCardDueForReview(nextReviewAt: Date, now = new Date()) {
  return nextReviewAt.getTime() <= now.getTime();
}
