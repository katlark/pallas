import clsx from "clsx";
import type { CSSProperties } from "react";

const deckGradientColors = {
  stone: [
    "from-stone-100 to-stone-300",
    "from-stone-200 to-stone-400",
    "from-stone-300 to-stone-500",
  ],
  red: [
    "from-red-100 to-red-300",
    "from-red-200 to-red-400",
    "from-red-300 to-red-500",
  ],
  orange: [
    "from-orange-100 to-orange-300",
    "from-orange-200 to-orange-400",
    "from-orange-300 to-orange-500",
  ],
  amber: [
    "from-amber-100 to-amber-300",
    "from-amber-200 to-amber-400",
    "from-amber-300 to-amber-500",
  ],
  yellow: [
    "from-yellow-100 to-yellow-300",
    "from-yellow-200 to-yellow-400",
    "from-yellow-300 to-yellow-500",
  ],
  lime: [
    "from-lime-100 to-lime-300",
    "from-lime-200 to-lime-400",
    "from-lime-300 to-lime-500",
  ],
  green: [
    "from-green-100 to-green-300",
    "from-green-200 to-green-400",
    "from-green-300 to-green-500",
  ],
  emerald: [
    "from-emerald-100 to-emerald-300",
    "from-emerald-200 to-emerald-400",
    "from-emerald-300 to-emerald-500",
  ],
  teal: [
    "from-teal-100 to-teal-300",
    "from-teal-200 to-teal-400",
    "from-teal-300 to-teal-500",
  ],
  cyan: [
    "from-cyan-100 to-cyan-300",
    "from-cyan-200 to-cyan-400",
    "from-cyan-300 to-cyan-500",
  ],
  sky: [
    "from-sky-100 to-sky-300",
    "from-sky-200 to-sky-400",
    "from-sky-300 to-sky-500",
  ],
  blue: [
    "from-blue-100 to-blue-300",
    "from-blue-200 to-blue-400",
    "from-blue-300 to-blue-500",
  ],
  indigo: [
    "from-indigo-100 to-indigo-300",
    "from-indigo-200 to-indigo-400",
    "from-indigo-300 to-indigo-500",
  ],
  violet: [
    "from-violet-100 to-violet-300",
    "from-violet-200 to-violet-400",
    "from-violet-300 to-violet-500",
  ],
  purple: [
    "from-purple-100 to-purple-300",
    "from-purple-200 to-purple-400",
    "from-purple-300 to-purple-500",
  ],
  fuchsia: [
    "from-fuchsia-100 to-fuchsia-300",
    "from-fuchsia-200 to-fuchsia-400",
    "from-fuchsia-300 to-fuchsia-500",
  ],
  pink: [
    "from-pink-100 to-pink-300",
    "from-pink-200 to-pink-400",
    "from-pink-300 to-pink-500",
  ],
  rose: [
    "from-rose-100 to-rose-300",
    "from-rose-200 to-rose-400",
    "from-rose-300 to-rose-500",
  ],
};

type DeckGradientColor = keyof typeof deckGradientColors;
const deckGradientColorKeys = Object.keys(
  deckGradientColors,
) as DeckGradientColor[];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getRandomDeckGradientColor(deckId: string): DeckGradientColor {
  const hash = hashString(deckId);
  return deckGradientColorKeys[hash % deckGradientColorKeys.length];
}

function getRandomDeckGradientShade(deckId: string, color: DeckGradientColor) {
  const shades = deckGradientColors[color];
  const shadeHash = hashString(`${deckId}-${color}-shade`);
  return shades[shadeHash % shades.length];
}

export function getDeckGradientClassNameById(deckId: string) {
  const color = getRandomDeckGradientColor(deckId);
  const shade = getRandomDeckGradientShade(deckId, color);
  return clsx("aspect-10/7 relative rounded-lg bg-radial", shade);
}

export const deckGradientNoiseStyle: CSSProperties = {
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
};
