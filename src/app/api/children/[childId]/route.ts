import { NextResponse } from "next/server";
import { getAuthenticatedParent } from "@/lib/server/auth";
import { getDataStore } from "@/lib/server/db";
import { toPublicChildProfile } from "@/lib/server/store";
import { UpdateChildSchema } from "@/lib/server/validation";

interface ChildRouteContext {
  params: Promise<{ childId: string }>;
}

export async function PATCH(request: Request, context: ChildRouteContext) {
  const store = getDataStore();
  const parent = await getAuthenticatedParent(request, store);
  if (!parent) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = UpdateChildSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid child profile update payload",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { childId } = await context.params;
  const updated = await store.updateChildProfile(parent.id, childId, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Child profile not found" }, { status: 404 });
  }

  return NextResponse.json({ child: toPublicChildProfile(updated) });
}

export async function DELETE(request: Request, context: ChildRouteContext) {
  const store = getDataStore();
  const parent = await getAuthenticatedParent(request, store);
  if (!parent) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { childId } = await context.params;
  const deleted = await store.deleteChildProfile(parent.id, childId);
  if (!deleted) {
    return NextResponse.json({ error: "Child profile not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true, childId });
}
