import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  Form,
  data,
  redirect,
  useActionData,
  useSearchParams,
} from "react-router";

import { AuthLayout } from "~/components/catalyst/auth-layout";
import { Button } from "~/components/catalyst/button";
import { ErrorMessage, Field, Label } from "~/components/catalyst/fieldset";
import { Heading } from "~/components/catalyst/heading";
import { Input } from "~/components/catalyst/input";
import { Text, TextLink } from "~/components/catalyst/text";
import { getUserId } from "~/lib/session.server";
import { consumePasswordResetToken } from "~/models/password-reset.server";
import { setUserPassword } from "~/models/user.server";

export const meta: MetaFunction = () => [{ title: "Reset password" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const url = new URL(request.url);
  if (!url.searchParams.get("token")) {
    return redirect("/forgot-password");
  }

  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const emptyErrors = {
    token: null as string | null,
    password: null as string | null,
    confirmPassword: null as string | null,
  };

  if (typeof token !== "string" || token.length === 0) {
    return data(
      { errors: { ...emptyErrors, token: "Invalid or missing token" } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return data(
      {
        errors: {
          ...emptyErrors,
          password: "Password must be at least 8 characters",
        },
      },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return data(
      {
        errors: { ...emptyErrors, confirmPassword: "Passwords do not match" },
      },
      { status: 400 },
    );
  }

  const record = await consumePasswordResetToken(token);
  if (!record) {
    return data(
      {
        errors: { ...emptyErrors, token: "Reset link is invalid or expired" },
      },
      { status: 400 },
    );
  }

  await setUserPassword({ userId: record.userId, password });

  return redirect("/login?reset=1");
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const token = searchParams.get("token") ?? "";

  return (
    <AuthLayout>
      <Form method="post" className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Heading>Reset your password</Heading>

        <input type="hidden" name="token" value={token} />

        <Field>
          <Label>New password</Label>
          <Input type="password" name="password" autoComplete="new-password" required />
          {actionData?.errors?.password ? (
            <ErrorMessage>{actionData.errors.password}</ErrorMessage>
          ) : null}
        </Field>

        <Field>
          <Label>Confirm password</Label>
          <Input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
          />
          {actionData?.errors?.confirmPassword ? (
            <ErrorMessage>{actionData.errors.confirmPassword}</ErrorMessage>
          ) : null}
        </Field>

        {actionData?.errors?.token ? (
          <ErrorMessage>{actionData.errors.token}</ErrorMessage>
        ) : null}

        <Button type="submit" className="w-full">
          Update password
        </Button>

        <Text>
          Need a new link? <TextLink href="/forgot-password">Request reset email</TextLink>
        </Text>
      </Form>
    </AuthLayout>
  );
}
