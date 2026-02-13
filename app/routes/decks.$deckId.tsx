import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  Form,
  data,
  redirect,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "react-router";
import { Fragment, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { deleteDeck, getDeck } from "~/models/deck.server";
import {
  createCard,
  deleteCard,
  getStudyCardsForDeck,
} from "~/models/card.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/catalyst/button";
import { Divider } from "~/components/catalyst/divider";
import { Heading } from "~/components/catalyst/heading";
import { ErrorMessage, Field, Label } from "~/components/catalyst/fieldset";
import { Textarea } from "~/components/catalyst/textarea";
import { Text } from "~/components/catalyst/text";
import clsx from "clsx";
import {
  deckGradientNoiseStyle,
  getDeckGradientClassNameById,
} from "~/lib/deck-gradient";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from "~/components/catalyst/alert";
import { MAX_KNOWLEDGE_LEVEL } from "~/lib/spaced-repetition";

const CHAPTER_SIZE = 8;

type ChapterMastery = {
  chapterNumber: number;
  totalCards: number;
  averageLevel: number;
  masteryPercent: number;
};

function makeChapters<T>(cards: T[], chapterSize = CHAPTER_SIZE): T[][] {
  if (cards.length === 0) return [];
  if (chapterSize < 1) return [cards];

  const chapters: T[][] = [];
  for (let index = 0; index < cards.length; index += chapterSize) {
    chapters.push(cards.slice(index, index + chapterSize));
  }
  return chapters;
}

function calculateChapterMastery(
  cards: DeckCard[],
  knowledgeByCardId: Record<string, number>,
): ChapterMastery[] {
  return makeChapters(cards).map((chapterCards, chapterIndex) => {
    const totalLevel = chapterCards.reduce(
      (sum, card) => sum + (knowledgeByCardId[card.id] ?? 0),
      0,
    );
    const averageLevel =
      chapterCards.length === 0 ? 0 : totalLevel / chapterCards.length;
    const masteryPercent = Math.round(
      (averageLevel / MAX_KNOWLEDGE_LEVEL) * 100,
    );

    return {
      chapterNumber: chapterIndex + 1,
      totalCards: chapterCards.length,
      averageLevel: Number(averageLevel.toFixed(1)),
      masteryPercent,
    };
  });
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.deckId, "deckId not found");

  const deck = await getDeck({ id: params.deckId, userId });

  if (!deck) {
    throw new Response("Not Found", { status: 404 });
  }

  const studyCards = await getStudyCardsForDeck({
    deckId: params.deckId,
    userId,
  });
  const knowledgeByCardId = Object.fromEntries(
    studyCards.map((card) => [card.id, card.progress.knowledgeLevel]),
  );

  return { deck, knowledgeByCardId };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "Deck" },
      {
        name: "description",
        content: "Study your flashcard deck by chapters.",
      },
    ];
  }

  return [
    { title: `${data.deck.title} | Deck` },
    {
      name: "description",
      content: `Study cards in "${data.deck.title}" with bite-sized chapters.`,
    },
  ];
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  invariant(params.deckId, "deckId not found");

  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "delete") {
    await deleteDeck({ id: params.deckId, userId });
    return redirect("/");
  }

  if (action === "create-card") {
    const front = formData.get("front");
    const back = formData.get("back");

    if (typeof front !== "string" || front.length === 0) {
      return data(
        { errors: { front: "Front is required", back: null } },
        { status: 400 },
      );
    }

    if (typeof back !== "string" || back.length === 0) {
      return data(
        { errors: { front: null, back: "Back is required" } },
        { status: 400 },
      );
    }

    const deck = await getDeck({ id: params.deckId, userId });

    if (!deck) {
      throw new Response("Not Found", { status: 404 });
    }

    const card = await createCard({ deckId: params.deckId, front, back });
    return data({ card });
  }

  if (action === "delete-card") {
    const cardId = formData.get("cardId");

    if (typeof cardId !== "string" || cardId.length === 0) {
      return data(
        { errors: { cardId: "Card id is required" } },
        { status: 400 },
      );
    }

    const deck = await getDeck({ id: params.deckId, userId });

    if (!deck) {
      throw new Response("Not Found", { status: 404 });
    }

    await deleteCard({ id: cardId, deckId: params.deckId });
    return data({ deletedCardId: cardId });
  }

  return null;
};

type CardFormErrors = {
  front: string | null;
  back: string | null;
};

type DeckCard = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  front: string;
  back: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const isCardFormErrors = (value: unknown): value is CardFormErrors => {
  if (!isRecord(value)) return false;
  const isNullableString = (value: unknown) =>
    typeof value === "string" || value === null;
  return isNullableString(value.front) && isNullableString(value.back);
};

const getCardFormErrors = (result: unknown): CardFormErrors | undefined => {
  if (!isRecord(result) || !("errors" in result)) return undefined;
  return isCardFormErrors(result.errors) ? result.errors : undefined;
};

const isDeckCard = (value: unknown): value is DeckCard => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date &&
    typeof value.front === "string" &&
    typeof value.back === "string"
  );
};

const getCreatedCard = (result: unknown): DeckCard | undefined => {
  if (!isRecord(result) || !("card" in result)) return undefined;
  return isDeckCard(result.card) ? result.card : undefined;
};

const getDeletedCardId = (result: unknown): string | undefined => {
  if (!isRecord(result) || !("deletedCardId" in result)) return undefined;
  return typeof result.deletedCardId === "string"
    ? result.deletedCardId
    : undefined;
};

export default function DeckDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const actionData = fetcher.data;
  const cardFormErrors = getCardFormErrors(actionData);
  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const skipBlurSubmitRef = useRef(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [cards, setCards] = useState(data.deck.cards);
  const [knowledgeByCardId, setKnowledgeByCardId] = useState(
    data.knowledgeByCardId,
  );

  let [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (cardFormErrors?.front) {
      frontRef.current?.focus();
    } else if (cardFormErrors?.back) {
      backRef.current?.focus();
    }
  }, [cardFormErrors]);

  useEffect(() => {
    setCards(data.deck.cards);
  }, [data.deck.cards]);

  useEffect(() => {
    setKnowledgeByCardId(data.knowledgeByCardId);
  }, [data.knowledgeByCardId]);

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    const created = getCreatedCard(fetcher.data);
    if (!created) return;
    setCards((prev) =>
      prev.some((card) => card.id === created.id) ? prev : [...prev, created],
    );
    setKnowledgeByCardId((prev) =>
      created.id in prev ? prev : { ...prev, [created.id]: 0 },
    );
    setFront("");
    setBack("");
    frontRef.current?.focus();
    submittingRef.current = false;
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    const deletedCardId = getDeletedCardId(fetcher.data);
    if (!deletedCardId) return;
    setCards((prev) => prev.filter((card) => card.id !== deletedCardId));
    setKnowledgeByCardId((prev) => {
      if (!(deletedCardId in prev)) return prev;
      const next = { ...prev };
      delete next[deletedCardId];
      return next;
    });
    submittingRef.current = false;
  }, [fetcher.data, fetcher.state]);

  const submitIfComplete = () => {
    if (fetcher.state !== "idle") return;
    if (submittingRef.current) return;
    if (!front.trim() || !back.trim()) return;
    submittingRef.current = true;
    formRef.current?.requestSubmit();
  };

  const isSubmitting = fetcher.state !== "idle";

  const renderCards = () => {
    if (cards.length === 0) {
      return <Text>No cards yet.</Text>;
    }

    const chapters = makeChapters(cards);

    return chapters.map((chapterCards, chapterIndex) => (
      <section key={`chapter-${chapterIndex}`} className="space-y-3">
        <Text className="font-medium text-stone-700">
          Chapter {chapterIndex + 1}
        </Text>
        {chapterCards.map((card) => (
          <div
            key={card.id}
            className={clsx([
              "rounded-lg border border-stone-200 p-4",
              isSubmitting && "bg-stone-300 opacity-20",
            ])}
          >
            <div className="flex items-start justify-between gap-4">
              <Text className="font-medium text-stone-950">Front</Text>
              <fetcher.Form method="post">
                <input type="hidden" name="_action" value="delete-card" />
                <input type="hidden" name="cardId" value={card.id} />
                <Button type="submit" color="rose">
                  Delete
                </Button>
              </fetcher.Form>
            </div>
            <Text className="whitespace-pre-wrap">{card.front}</Text>
            <Text className="mt-3 font-medium text-stone-950">Back</Text>
            <Text className="whitespace-pre-wrap">{card.back}</Text>
          </div>
        ))}
      </section>
    ));
  };

  const renderCreateCardForm = () => (
    <fetcher.Form
      ref={formRef}
      method="post"
      className="rounded-lg border border-stone-200 p-4"
    >
      <input type="hidden" name="_action" value="create-card" />
      <div className="grid w-full grid-cols-1 gap-4">
        <Field>
          <Label>Front</Label>
          <Textarea
            ref={frontRef}
            name="front"
            rows={3}
            required
            value={front}
            onChange={(event) => setFront(event.target.value)}
            invalid={cardFormErrors?.front ? true : undefined}
          />
          {cardFormErrors?.front ? (
            <ErrorMessage>{cardFormErrors.front}</ErrorMessage>
          ) : null}
        </Field>
        <Field>
          <Label>Back</Label>
          <Textarea
            ref={backRef}
            name="back"
            rows={3}
            required
            value={back}
            onChange={(event) => setBack(event.target.value)}
            onBlur={() => {
              if (skipBlurSubmitRef.current) {
                skipBlurSubmitRef.current = false;
                return;
              }
              submitIfComplete();
            }}
            onKeyDown={(event) => {
              if (event.key !== "Tab" || event.shiftKey) return;
              if (!front.trim() || !back.trim()) return;
              event.preventDefault();
              skipBlurSubmitRef.current = true;
              submitIfComplete();
            }}
            invalid={cardFormErrors?.back ? true : undefined}
          />
          {cardFormErrors?.back ? (
            <ErrorMessage>{cardFormErrors.back}</ErrorMessage>
          ) : null}
        </Field>
        <Button type="submit">Add card</Button>
      </div>
    </fetcher.Form>
  );

  return (
    <div className="space-y-4">
      <Heading>{data.deck.title}</Heading>

      <Divider />

      <TabGroup className="">
        <div className="border-b border-stone-200">
          <TabList className="-mb-px flex space-x-8">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={clsx(
                    selected
                      ? "border-olive-500 text-olive-600"
                      : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700",
                    "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                  )}
                >
                  Chapters
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={clsx(
                    selected
                      ? "border-olive-500 text-olive-600"
                      : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700",
                    "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                  )}
                >
                  Cards
                </button>
              )}
            </Tab>
          </TabList>
        </div>
        <TabPanels className="mt-3">
          <TabPanel>
            <div className="space-y-3">
              {calculateChapterMastery(cards, knowledgeByCardId).map(
                (chapter) => (
                  <div
                    key={chapter.chapterNumber}
                    className="rounded-lg border border-stone-200 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <Text className="font-medium text-stone-900">
                        Chapter {chapter.chapterNumber}
                      </Text>
                      <Text className="text-sm text-stone-600">
                        {chapter.masteryPercent}% mastery
                      </Text>
                    </div>
                    <Text className="text-sm text-stone-600">
                      Avg level {chapter.averageLevel}/{MAX_KNOWLEDGE_LEVEL}{" "}
                      across {chapter.totalCards} cards
                    </Text>
                    <div className="mt-2">
                      <Button
                        href={`/decks/${data.deck.id}/study?chapter=${chapter.chapterNumber}`}
                      >
                        Study Chapter {chapter.chapterNumber}
                      </Button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </TabPanel>
          <TabPanel>
            <div className="space-y-4">
              {renderCards()}
              {renderCreateCardForm()}
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <Divider />
      <Button type="button" onClick={() => setIsDeleteConfirmOpen(true)}>
        Delete deck
      </Button>

      <Alert open={isDeleteConfirmOpen} onClose={setIsDeleteConfirmOpen}>
        <AlertTitle>Are you sure you want to delete this deck?</AlertTitle>
        <AlertDescription>You will not be able to recover it.</AlertDescription>
        <AlertActions>
          <Button plain onClick={() => setIsDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Form method="post">
            <input type="hidden" name="_action" value="delete" />
            <Button type="submit">Delete</Button>
          </Form>
        </AlertActions>
      </Alert>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Deck not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
