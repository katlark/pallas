import type { MetaFunction } from "react-router";
import { Heading } from "~/components/catalyst/heading";
import { Divider } from "~/components/catalyst/divider";
import { Strong, Text, TextLink } from "~/components/catalyst/text";

const LAST_UPDATED = "February 13, 2026";

export const meta: MetaFunction = () => [
  { title: "Privacy Policy" },
  {
    name: "description",
    content: "How Cards collects, uses, and protects personal data.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Heading>Privacy Policy</Heading>
      <Text className="text-sm text-stone-600 dark:text-stone-400">
        Last updated: {LAST_UPDATED}
      </Text>

      <Divider />

      <section className="space-y-2">
        <Strong>1. Who We Are</Strong>
        <Text>
          Cards is a study platform for creating decks and reviewing chapters.
          Replace this section with your legal entity name and registered
          address before launch.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>2. Data We Collect</Strong>
        <Text>
          We process account data (such as email), content data (such as decks,
          cards, and study sessions), and technical data (such as log and
          device information needed for security and operations).
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>3. Why We Use Your Data</Strong>
        <Text>
          We use data to provide and secure the service, run study features,
          improve reliability, and comply with legal obligations.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>4. UK GDPR Lawful Bases</Strong>
        <Text>
          We rely on contract (to provide the service), legitimate interests
          (security and product improvement), consent (where required, e.g.
          non-essential cookies), and legal obligation (where applicable).
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>5. Sharing and Processors</Strong>
        <Text>
          We may share data with trusted service providers (for hosting,
          infrastructure, email, analytics, and support) under contracts that
          protect your information.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>6. International Transfers</Strong>
        <Text>
          If data is transferred outside the UK, we use appropriate safeguards,
          such as UK International Data Transfer Agreements or equivalent
          transfer mechanisms.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>7. Retention</Strong>
        <Text>
          We keep personal data only as long as needed for the purposes above,
          then delete or anonymise it unless we must retain it by law.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>8. Your Rights</Strong>
        <Text>
          Depending on applicable law, you may have rights to access, correct,
          delete, restrict, object, and port your data, and to withdraw consent
          where consent is the legal basis.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>9. Complaints</Strong>
        <Text>
          You can contact us first so we can try to resolve your concern. In the
          UK, you can also complain to the Information Commissioner&apos;s Office
          (ICO).
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>10. Contact</Strong>
        <Text>
          Replace with your privacy contact email before launch. If you have a
          Data Protection Officer, include their contact details.
        </Text>
      </section>

      <Divider />
      <Text className="text-sm text-stone-600 dark:text-stone-400">
        See also our <TextLink href="/terms">Terms of Use</TextLink> and{" "}
        <TextLink href="/cookies">Cookie Policy</TextLink>.
      </Text>
    </div>
  );
}
