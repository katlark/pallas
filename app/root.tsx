import {
  Form,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  type LoaderFunctionArgs,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { getUser } from "~/lib/session.server";
import {
  Navbar,
  NavbarDivider,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "./components/catalyst/navbar";
import { Text } from "./components/catalyst/text";
import { useOptionalUser } from "./lib/utils";
import { Button } from "./components/catalyst/button";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  return { user: await getUser(request) };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const user = useOptionalUser();
  const { pathname } = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/decks", label: "Decks" },
    { href: "/account", label: "Account" },
  ];

  return (
    <html
      lang="en"
      className="bg-white antialiased lg:bg-stone-100 dark:bg-stone-900 dark:lg:bg-stone-950"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="relative isolate flex min-h-svh w-full flex-col bg-white lg:bg-stone-100 dark:bg-stone-900 dark:lg:bg-stone-950">
          <header className="px-4">
            <Navbar>
              <NavbarItem href="/">Home</NavbarItem>
              <NavbarDivider />
              <NavbarSection>
                {navItems.map((navItem) => (
                  <NavbarItem
                    key={navItem.href}
                    href="/"
                    current={navItem.href === pathname}
                  >
                    {navItem.label}
                  </NavbarItem>
                ))}
              </NavbarSection>
              <NavbarSpacer />
              <Text>{user?.email}</Text>
              <Form method="post" action="/logout">
                <Button plain type="submit">
                  Logout
                </Button>
              </Form>
            </Navbar>
          </header>

          <main className="flex flex-1 flex-col pb-2 lg:px-2">
            <div className="grow p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-stone-950/5 dark:lg:bg-stone-900 dark:lg:ring-white/10">
              <div className="mx-auto max-w-6xl">{children}</div>
            </div>
          </main>
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
