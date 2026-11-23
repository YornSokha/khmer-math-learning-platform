import { NextResponse } from "next/server";
import { createParentSession, setSessionCookie, verifyPassword } from "@/lib/server/auth";
import { getDataStore } from "@/lib/server/db";
import { toPublicChildProfile, toPublicParent } from "@/lib/server/store";
import { ParentLoginSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = ParentLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const store = getDataStore();
  const parent = await store.findParentByEmail(parsed.data.email);
  if (!parent) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, parent.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const [session, children] = await Promise.all([
    createParentSession(store, parent.id),
    store.listChildrenByParent(parent.id),
  ]);

  const response = NextResponse.json({
    parent: toPublicParent(parent),
    children: children.map(toPublicChildProfile),
  });
  setSessionCookie(response, session.token, request);
  return response;
}
