import { NextResponse } from "next/server";
import { getAuthenticatedParent } from "@/lib/server/auth";
import { getDataStore } from "@/lib/server/db";
import { toPublicChildProfile } from "@/lib/server/store";
import { CreateChildSchema } from "@/lib/server/validation";

export async function GET(request: Request) {
  const store = getDataStore();
  const parent = await getAuthenticatedParent(request, store);
  if (!parent) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const children = await store.listChildrenByParent(parent.id);
  return NextResponse.json({
    children: children.map(toPublicChildProfile),
  });
}

export async function POST(request: Request) {
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

  const parsed = CreateChildSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid child profile payload",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const child = await store.createChildProfile({
    parentId: parent.id,
    nickname: parsed.data.nickname,
    avatarId: parsed.data.avatarId,
    grade: parsed.data.grade,
    numeralPref: parsed.data.numeralPref,
  });

  return NextResponse.json(
    {
      child: toPublicChildProfile(child),
    },
    { status: 201 },
  );
}
