import { NextResponse } from "next/server";
import { createParentSession, hashPassword, setSessionCookie } from "@/lib/server/auth";
import { getDataStore } from "@/lib/server/db";
import { DuplicateEmailError } from "@/lib/server/memory-store";
import { toPublicParent } from "@/lib/server/store";
import { CONSENT_VERSION, ParentSignupSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = ParentSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const store = getDataStore();
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const parent = await store.createParent({
      email: parsed.data.email,
      passwordHash,
      consentAcceptedAt: new Date(),
      consentVersion: CONSENT_VERSION,
    });

    const session = await createParentSession(store, parent.id);
    const response = NextResponse.json(
      {
        parent: toPublicParent(parent),
        children: [],
      },
      { status: 201 },
    );
    setSessionCookie(response, session.token, request);
    return response;
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    throw error;
  }
}
