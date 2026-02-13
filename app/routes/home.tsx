import {
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { useOptionalUser } from "~/lib/utils";
import { Button } from "~/components/catalyst/button";
import { Link } from "~/components/catalyst/link";
import { getUserId } from "~/lib/session.server";
import { getDeckListItemsWithProgress } from "~/models/deck.server";
import { Text, Strong } from "~/components/catalyst/text";
import { Heading } from "~/components/catalyst/heading";
import { Divider } from "~/components/catalyst/divider";
import {
  deckGradientNoiseStyle,
  getDeckGradientClassNameById,
} from "~/lib/deck-gradient";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  const decks = userId ? await getDeckListItemsWithProgress({ userId }) : [];

  return { decks };
}

export const meta: MetaFunction = () => [
  { title: "Cards | Learn Faster" },
  {
    name: "description",
    content:
      "Build decks, study chapters, and use spaced repetition to keep what you learn.",
  },
];

export default function Home() {
  const user = useOptionalUser();
  const { decks } = useLoaderData<typeof loader>();

  if (!user) {
    return (
      <div className="space-y-12">
        <section className="relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-olive-100 via-olive-200 to-olive-300 p-8 sm:p-12 dark:border-stone-700 dark:from-olive-950 dark:via-olive-900 dark:to-olive-800">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={deckGradientNoiseStyle}
          />
          <div className="relative space-y-6">
            <Text className="text-sm font-medium uppercase tracking-wide">
              Cards
            </Text>
            <Heading className="text-white">
              Learn in chapters, remember for longer.
            </Heading>
            <Text>
              Create decks, run focused chapter sessions, and use spaced
              repetition to review at the right time.
            </Text>
            <div className="flex flex-wrap gap-3">
              <Button outline href="/join">
                Create free account
              </Button>
              <Button href="/login" plain>
                Sign in
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-stone-200 p-5 dark:border-stone-700 dark:bg-stone-900">
            <Strong className="dark:text-white">Chapter Sessions</Strong>
            <Text className="mt-2 text-stone-600 dark:text-stone-400">
              Study one chapter at a time with snapshot-based sessions.
            </Text>
          </div>
          <div className="rounded-xl border border-stone-200 p-5 dark:border-stone-700 dark:bg-stone-900">
            <Strong className="dark:text-white">Spaced Repetition</Strong>
            <Text className="mt-2 text-stone-600 dark:text-stone-400">
              Correct answers increase level and stretch review intervals.
            </Text>
          </div>
          <div className="rounded-xl border border-stone-200 p-5 dark:border-stone-700 dark:bg-stone-900">
            <Strong className="dark:text-white">Mastery Tracking</Strong>
            <Text className="mt-2 text-stone-600 dark:text-stone-400">
              See progress by deck and chapter as you learn.
            </Text>
          </div>
        </section>

        <section className="border-t border-stone-200 pt-6 dark:border-stone-700">
          <Text className="text-sm text-stone-600 dark:text-stone-400">
            By using Cards, you agree to our <Link href="/terms">Terms</Link>,{" "}
            <Link href="/privacy">Privacy Policy</Link>, and{" "}
            <Link href="/cookies">Cookie Policy</Link>.
          </Text>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Heading>Decks</Heading>
        <Button color="olive" href="/decks/new">
          New deck
        </Button>
        <Button color="mist" href="/decks/new">
          New deck
        </Button>
        <Button color="taupe" href="/decks/new">
          New deck
        </Button>
        <Button color="mauve" href="/decks/new">
          New deck
        </Button>
      </div>
      <Divider />
      {decks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center dark:border-stone-700 dark:bg-stone-900">
          <Heading className="text-2xl font-bold text-stone-900 dark:text-white">
            No decks yet
          </Heading>
          <Text className="mt-2 text-stone-600 dark:text-stone-400">
            Create your first deck and start a chapter study session.
          </Text>
          <div className="mt-4">
            <Button href="/decks/new">Create first deck</Button>
          </div>
        </div>
      ) : null}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {decks.map((deck) => (
          <li key={deck.id} className="space-y-2">
            <Link href={`/decks/${deck.id}`} className="block space-y-2">
              <div className={getDeckGradientClassNameById(deck.id)}>
                <div
                  className="absolute rounded-lg inset-0 opacity-20"
                  style={deckGradientNoiseStyle}
                />
              </div>
              <Strong>{deck.title}</Strong>

              <div className="h-2 mt-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-olive-500 transition-all"
                  style={{ width: `${deck.masteryPercent}%` }}
                />
              </div>
              <Text>
                {deck.masteryPercent}% mastery · {deck.reviewedCards}/
                {deck.totalCards} cards reviewed
              </Text>
            </Link>
          </li>
        ))}
      </ul>
      <Divider />
      <Text className="text-sm text-stone-600 dark:text-stone-400">
        Legal: <Link href="/terms">Terms</Link>,{" "}
        <Link href="/privacy">Privacy Policy</Link>,{" "}
        <Link href="/cookies">Cookie Policy</Link>
      </Text>
    </div>
  );
}
