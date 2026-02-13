import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  redirect,
  Form,
  useActionData,
  useSearchParams,
  data,
} from "react-router";

import { useEffect, useRef } from "react";

import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/lib/session.server";
import { safeRedirect, validateEmail } from "~/lib/utils";
import { AuthLayout } from "~/components/catalyst/auth-layout";
import { Heading } from "~/components/catalyst/heading";
import { ErrorMessage, Field, Label } from "~/components/catalyst/fieldset";
import { Input } from "~/components/catalyst/input";
import { Button } from "~/components/catalyst/button";
import { Strong, Text, TextLink } from "~/components/catalyst/text";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  console.log(userId);
  if (userId) return redirect("/");
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateEmail(email)) {
    return data(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return data(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return data(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return data(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
        },
      },
      { status: 400 },
    );
  }

  const user = await createUser(email, password);

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <AuthLayout>
      <Form method="post" className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Heading>Create your account</Heading>

        <Field>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            required
            autoFocus={true}
            autoComplete="email"
            invalid={actionData?.errors?.email ? true : undefined}
          />
          {actionData?.errors?.email ? (
            <ErrorMessage> {actionData.errors.email}</ErrorMessage>
          ) : null}
        </Field>

        <Field>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            ref={passwordRef}
            aria-invalid={actionData?.errors?.password ? true : undefined}
          />
          {actionData?.errors?.password ? (
            <ErrorMessage> {actionData.errors.password}</ErrorMessage>
          ) : null}
        </Field>

        <input type="hidden" name="redirectTo" value={redirectTo} />

        <Button type="submit" className="w-full">
          Create account
        </Button>

        <Text>
          Already have an account?{" "}
          <TextLink
            href={{
              pathname: "/login",
              search: searchParams.toString(),
            }}
          >
            <Strong>Sign in</Strong>
          </TextLink>
        </Text>
      </Form>
    </AuthLayout>
  );
}
