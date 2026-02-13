import { AuthLayout } from "~/components/catalyst/auth-layout";
import { Button } from "~/components/catalyst/button";
import { Checkbox, CheckboxField } from "~/components/catalyst/checkbox";
import { ErrorMessage, Field, Label } from "~/components/catalyst/fieldset";
import { Heading } from "~/components/catalyst/heading";
import { Input } from "~/components/catalyst/input";
import { Strong, Text, TextLink } from "~/components/catalyst/text";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  redirect,
  Form,
  Link,
  useActionData,
  useSearchParams,
  data,
} from "react-router";

import { useEffect, useRef } from "react";

import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/lib/session.server";
import { safeRedirect, validateEmail } from "~/lib/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

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

  const user = await verifyLogin(email, password);

  if (!user) {
    return data(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 },
    );
  }

  return createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id,
  });
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const resetSuccess = searchParams.get("reset") === "1";
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
        <Heading>Sign in to your account</Heading>
        {resetSuccess ? (
          <Text className="text-green-700 dark:text-green-400">
            Your password has been reset. Please sign in.
          </Text>
        ) : null}

        <Field>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            ref={emailRef}
            required
            autoFocus={true}
            autoComplete="email"
            invalid={actionData?.errors?.email ? true : undefined}
          />
          {actionData?.errors?.email ? (
            <ErrorMessage>{actionData.errors.email}</ErrorMessage>
          ) : null}
        </Field>

        <Field>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            ref={passwordRef}
            autoComplete="current-password"
            invalid={actionData?.errors?.password ? true : undefined}
          />
          {actionData?.errors?.password ? (
            <ErrorMessage>{actionData.errors.password}</ErrorMessage>
          ) : null}
        </Field>

        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="flex items-center justify-between">
          <CheckboxField>
            <Checkbox name="remember" />
            <Label>Remember me</Label>
          </CheckboxField>

          <Text>
            <TextLink href="/forgot-password">
              <Strong>Forgot password?</Strong>
            </TextLink>
          </Text>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Text>
          Don’t have an account?{" "}
          <TextLink
            href={{
              pathname: "/join",
              search: searchParams.toString(),
            }}
          >
            <Strong>Sign up</Strong>
          </TextLink>
        </Text>
      </Form>
    </AuthLayout>
  );
}
