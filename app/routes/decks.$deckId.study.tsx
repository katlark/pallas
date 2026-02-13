import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";

import {
  Form,
  Link,
  data,
  isRouteErrorResponse,
  redirect,
  useLoaderData,
  useRouteError,
} from "react-router";
import invariant from "tiny-invariant";

import { Button } from "~/components/catalyst/button";
import { Divider } from "~/components/catalyst/divider";
import { Heading } from "~/components/catalyst/heading";
import { Text } from "~/components/catalyst/text";
import { requireUserId } from "~/lib/session.server";
import { getDeckForStudy } from "~/models/deck.server";
import {
  createStudySession,
  getStudyChapterSummaries,
  getStudySession,
  reviewStudyItem,
  DEFAULT_CHAPTER_SIZE,
} from "~/models/study.server";

function parsePositiveInt(value: string | null) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return undefined;
  return parsed;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "Study" }];
  }
  return [
    { title: `Study Chapter ${data.activeChapter} | ${data.deck.title}` },
    {
      name: "description",
      content: `Study chapters in ${data.deck.title} with a snapshot study session.`,
    },
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.deckId, "deckId not found");

  const deck = await getDeckForStudy({ id: params.deckId });
  if (!deck) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const requestedStudyId = url.searchParams.get("studyId");
  const requestedChapter = parsePositiveInt(url.searchParams.get("chapter")) ?? 1;
  const maxChapter = Math.max(1, Math.ceil(deck.cards.length / DEFAULT_CHAPTER_SIZE));
  const activeChapter = Math.min(Math.max(requestedChapter, 1), maxChapter);

  if (!requestedStudyId) {
    const createdStudy = await createStudySession({
      userId,
      deckId: deck.id,
      chapterNumber: activeChapter,
    });
    throw redirect(
      `/decks/${deck.id}/study?studyId=${createdStudy.id}&chapter=${activeChapter}`,
    );
  }

  const study = await getStudySession({ studyId: requestedStudyId, userId });
  if (!study || study.deckId !== deck.id) {
    throw new Response("Not Found", { status: 404 });
  }

  const chapterSummaries = getStudyChapterSummaries(study.items).filter(
    (chapter) => chapter.chapterNumber === activeChapter,
  );
  const activeChapterItems = study.items.filter(
    (item) => item.chapterNumber === activeChapter,
  );
  const nextItem =
    activeChapterItems.find((item) => item.reviewedAt === null) ?? null;
  const reviewedCount = study.items.filter((item) => item.reviewedAt).length;

  return {
    deck: study.deck,
    study: {
      id: study.id,
      createdAt: study.createdAt,
      completedAt: study.completedAt,
      totalCards: study.items.length,
      reviewedCount,
    },
    chapterSummaries,
    maxChapter,
    activeChapter,
    activeChapterItems,
    nextItem,
  };
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.deckId, "deckId not found");

  const formData = await request.formData();
  const action = formData.get("_action");
  const studyId = formData.get("studyId");
  const chapter = parsePositiveInt(formData.get("chapter")?.toString() ?? null);

  if (action === "start-new-study") {
    const chapterNumber = chapter ?? 1;
    const study = await createStudySession({
      userId,
      deckId: params.deckId,
      chapterNumber,
    });
    return redirect(`/decks/${params.deckId}/study?studyId=${study.id}&chapter=${chapterNumber}`);
  }

  if (action === "answer") {
    const studyItemId = formData.get("studyItemId");
    const outcome = formData.get("outcome");

    if (typeof studyId !== "string" || studyId.length === 0) {
      return data({ error: "Study is required" }, { status: 400 });
    }
    if (typeof studyItemId !== "string" || studyItemId.length === 0) {
      return data({ error: "Study item is required" }, { status: 400 });
    }
    if (outcome !== "correct" && outcome !== "incorrect") {
      return data({ error: "Outcome is required" }, { status: 400 });
    }

    const reviewed = await reviewStudyItem({
      userId,
      studyId,
      studyItemId,
      outcome,
    });

    if (!reviewed) {
      return data({ error: "Study item not found" }, { status: 404 });
    }

    const chapterPart = chapter ? `&chapter=${chapter}` : "";
    return redirect(
      `/decks/${params.deckId}/study?studyId=${studyId}${chapterPart}`,
    );
  }

  return data({ error: "Unknown action" }, { status: 400 });
};

export default function StudyDeckPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Heading>
          Study Chapter {data.activeChapter}: {data.deck.title}
        </Heading>
        <Form method="post">
          <input type="hidden" name="_action" value="start-new-study" />
          <input type="hidden" name="chapter" value={data.activeChapter} />
          <Button type="submit">New Session</Button>
        </Form>
      </div>

      <Text className="text-sm text-stone-600">
        Session {data.study.id.slice(0, 8)}: {data.study.reviewedCount}/
        {data.study.totalCards} cards reviewed
      </Text>

      <Divider />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: data.maxChapter }, (_, index) => {
          const chapterNumber = index + 1;
          const isActive = chapterNumber === data.activeChapter;
          return (
          <Link
            key={chapterNumber}
            to={`?chapter=${chapterNumber}`}
            className={`rounded-lg border p-3 ${
              isActive
                ? "border-sky-400 bg-sky-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <Text className="font-medium text-stone-900">
              Chapter {chapterNumber}
            </Text>
            <Text className="text-sm text-stone-600">
              Start or continue this chapter
            </Text>
          </Link>
        );
        })}
      </div>

      <Divider />

      {data.nextItem ? (
        <div className="space-y-3 rounded-lg border border-stone-200 p-4">
          <Text className="font-medium text-stone-900">
            Chapter {data.activeChapter}
          </Text>
          <Text className="font-medium text-stone-900">Front</Text>
          <Text className="whitespace-pre-wrap">{data.nextItem.frontSnapshot}</Text>

          <details className="rounded-md bg-stone-50 p-3">
            <summary className="cursor-pointer font-medium text-stone-800">
              Show answer
            </summary>
            <Text className="mt-2 whitespace-pre-wrap">
              {data.nextItem.backSnapshot}
            </Text>
          </details>

          <div className="flex gap-2">
            <Form method="post">
              <input type="hidden" name="_action" value="answer" />
              <input type="hidden" name="studyId" value={data.study.id} />
              <input type="hidden" name="studyItemId" value={data.nextItem.id} />
              <input type="hidden" name="chapter" value={data.activeChapter} />
              <input type="hidden" name="outcome" value="incorrect" />
              <Button type="submit" color="rose">
                Incorrect
              </Button>
            </Form>
            <Form method="post">
              <input type="hidden" name="_action" value="answer" />
              <input type="hidden" name="studyId" value={data.study.id} />
              <input type="hidden" name="studyItemId" value={data.nextItem.id} />
              <input type="hidden" name="chapter" value={data.activeChapter} />
              <input type="hidden" name="outcome" value="correct" />
              <Button type="submit" color="green">
                Correct
              </Button>
            </Form>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-stone-200 p-4">
          <Text className="font-medium text-stone-900">
            Chapter {data.activeChapter} complete
          </Text>
          <Text className="text-stone-600">No remaining cards in this chapter.</Text>
        </div>
      )}
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
    return <div>Study session not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
