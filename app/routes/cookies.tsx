import type { MetaFunction } from "react-router";
import { Heading } from "~/components/catalyst/heading";
import { Divider } from "~/components/catalyst/divider";
import { Strong, Text, TextLink } from "~/components/catalyst/text";

const LAST_UPDATED = "February 13, 2026";

export const meta: MetaFunction = () => [
  { title: "Cookie Policy" },
  {
    name: "description",
    content: "How Cards uses cookies and similar technologies.",
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Heading>Cookie Policy</Heading>
      <Text className="text-sm text-stone-600 dark:text-stone-400">
        Last updated: {LAST_UPDATED}
      </Text>

      <Divider />

      <section className="space-y-2">
        <Strong>1. What Are Cookies?</Strong>
        <Text>
          Cookies are small text files placed on your device when you visit a
          website. Similar technologies can store or access information on your
          device.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>2. Cookies We Use</Strong>
        <Text>
          We use strictly necessary cookies for core functionality such as login
          sessions and security. If we introduce analytics or marketing cookies,
          we will request consent where required by law.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>3. Legal Basis (UK PECR and UK GDPR)</Strong>
        <Text>
          Strictly necessary cookies are used based on necessity. Non-essential
          cookies require prior consent under PECR, and consent can be
          withdrawn.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>4. Managing Cookies</Strong>
        <Text>
          You can manage cookies via browser settings and any in-product cookie
          controls we provide. Disabling necessary cookies may prevent parts of
          the service from working.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>5. Changes to This Policy</Strong>
        <Text>
          We may update this policy as our use of cookies changes. We will post
          the latest version on this page with the updated date.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>6. Contact</Strong>
        <Text>
          Replace with your contact email before launch for cookie/privacy
          questions.
        </Text>
      </section>

      <Divider />
      <Text className="text-sm text-stone-600 dark:text-stone-400">
        See our <TextLink href="/privacy">Privacy Policy</TextLink> and{" "}
        <TextLink href="/terms">Terms of Use</TextLink>.
      </Text>
    </div>
  );
}
