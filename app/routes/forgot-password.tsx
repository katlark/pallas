import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { Form, data, redirect, useActionData } from "react-router";

import { AuthLayout } from "~/components/catalyst/auth-layout";
import { Button } from "~/components/catalyst/button";
import { ErrorMessage, Field, Label } from "~/components/catalyst/fieldset";
import { Heading } from "~/components/catalyst/heading";
import { Input } from "~/components/catalyst/input";
import { Text, TextLink } from "~/components/catalyst/text";
import { sendPasswordResetEmail } from "~/lib/email.server";
import { getUserId } from "~/lib/session.server";
import { validateEmail } from "~/lib/utils";
import { createPasswordResetToken } from "~/models/password-reset.server";
import { getUserByEmail } from "~/models/user.server";

export const meta: MetaFunction = () => [{ title: "Forgot password" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return data(
      {
        errors: {
          email: "Enter a valid email address",
        },
        success: false,
      },
      { status: 400 },
    );
  }

  const user = await getUserByEmail(email);
  if (user) {
    const token = await createPasswordResetToken({ userId: user.id });
    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl });
  }

  return data({ errors: { email: null }, success: true });
}

export default function ForgotPasswordPage() {
  const actionData = useActionData<typeof action>();

  return (
    <AuthLayout>
      <Form method="post" className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Heading>Forgot your password?</Heading>
        <Text>
          Enter your email and we&apos;ll send you a reset link if an account exists.
        </Text>

        <Field>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            required
            autoFocus
            autoComplete="email"
            invalid={actionData?.errors?.email ? true : undefined}
          />
          {actionData?.errors?.email ? (
            <ErrorMessage>{actionData.errors.email}</ErrorMessage>
          ) : null}
        </Field>

        <Button type="submit" className="w-full">
          Send reset email
        </Button>

        {actionData?.success ? (
          <Text className="text-green-700 dark:text-green-400">
            If that email exists, a reset link has been sent.
          </Text>
        ) : null}

        <Text>
          Back to <TextLink href="/login">Login</TextLink>
        </Text>
      </Form>
    </AuthLayout>
  );
}
