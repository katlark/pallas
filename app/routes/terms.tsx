import type { MetaFunction } from "react-router";
import { Heading } from "~/components/catalyst/heading";
import { Divider } from "~/components/catalyst/divider";
import { Strong, Text, TextLink } from "~/components/catalyst/text";

const LAST_UPDATED = "February 13, 2026";

export const meta: MetaFunction = () => [
  { title: "Terms of Use" },
  {
    name: "description",
    content: "Terms governing use of the Cards app.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Heading>Terms of Use</Heading>
      <Text className="text-sm text-stone-600 dark:text-stone-400">
        Last updated: {LAST_UPDATED}
      </Text>

      <Divider />

      <section className="space-y-2">
        <Strong>1. Acceptance of Terms</Strong>
        <Text>
          By creating an account or using Cards, you agree to these Terms.
          If you do not agree, do not use the service.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>2. Who May Use the Service</Strong>
        <Text>
          You must be legally able to form a binding contract in your
          jurisdiction. You are responsible for your account credentials and all
          activity under your account.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>3. User Content</Strong>
        <Text>
          You retain ownership of the content you create (including decks and
          cards). You grant us a limited licence to host, process, and display
          that content solely to operate and improve the service.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>4. Acceptable Use</Strong>
        <Text>
          You must not use Cards to break the law, infringe rights, upload
          malicious code, abuse the service, or interfere with other users.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>5. Availability and Changes</Strong>
        <Text>
          We may modify, suspend, or discontinue features at any time. We do
          not guarantee uninterrupted availability.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>6. Disclaimers</Strong>
        <Text>
          Cards is provided on an "as is" and "as available" basis. To the
          extent permitted by law, we disclaim implied warranties, including
          fitness for a particular purpose and non-infringement.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>7. Limitation of Liability</Strong>
        <Text>
          To the extent permitted by law, we are not liable for indirect,
          incidental, special, consequential, or punitive damages, or loss of
          data, profits, or goodwill arising from your use of Cards.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>8. Termination</Strong>
        <Text>
          We may suspend or terminate accounts that breach these Terms. You may
          stop using the service at any time.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>9. Governing Law</Strong>
        <Text>
          These Terms are governed by the laws of England and Wales, unless
          mandatory local consumer law applies in your place of residence.
        </Text>
      </section>

      <section className="space-y-2">
        <Strong>10. Contact</Strong>
        <Text>
          Questions about these Terms: replace with your contact email before
          launch.
        </Text>
      </section>

      <Divider />
      <Text className="text-sm text-stone-600 dark:text-stone-400">
        Also read our <TextLink href="/privacy">Privacy Policy</TextLink> and{" "}
        <TextLink href="/cookies">Cookie Policy</TextLink>.
      </Text>
    </div>
  );
}
