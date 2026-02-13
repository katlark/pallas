import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("join", "routes/join.tsx"),
  route("login", "routes/login.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("logout", "routes/logout.tsx"),
  route("terms", "routes/terms.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("cookies", "routes/cookies.tsx"),
  route("decks/new", "routes/decks.new.tsx"),
  route("decks/:deckId", "routes/decks.$deckId.tsx"),
  route("decks/:deckId/study", "routes/decks.$deckId.study.tsx"),
] satisfies RouteConfig;
