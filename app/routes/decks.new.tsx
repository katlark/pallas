import type { ActionFunctionArgs } from "react-router";
import { redirect, Form, useActionData, data } from "react-router";

import { useEffect, useRef } from "react";

import { createDeck } from "~/models/deck.server";
import { requireUserId } from "~/lib/session.server";
import { AuthLayout } from "~/components/catalyst/auth-layout";
import { Button } from "~/components/catalyst/button";
import { ErrorMessage, Field, Label } from "~/components/catalyst/fieldset";
import { Input } from "~/components/catalyst/input";
import { useUser } from "~/lib/utils";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");

  if (typeof title !== "string" || title.length === 0) {
    return data(
      { errors: { body: null, title: "Title is required" } },
      { status: 400 },
    );
  }

  const deck = await createDeck({ title, userId });

  return redirect(`/`);
};

export default function NewDeck() {
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <AuthLayout>
      <Form method="post" className="grid w-full max-w-sm grid-cols-1 gap-8">
        <Field>
          <Label>Name</Label>
          <Input
            ref={titleRef}
            type="text"
            name="title"
            required
            autoFocus={true}
            autoComplete="title"
            invalid={actionData?.errors?.title ? true : undefined}
          />
          {actionData?.errors?.title ? (
            <ErrorMessage> {actionData.errors.title}</ErrorMessage>
          ) : null}
        </Field>

        <Button type="submit">Save</Button>
      </Form>
    </AuthLayout>
  );
}
