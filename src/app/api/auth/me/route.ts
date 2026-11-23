import { NextResponse } from "next/server";
import { getAuthenticatedParent } from "@/lib/server/auth";
import { getDataStore } from "@/lib/server/db";
import { toPublicChildProfile, toPublicParent } from "@/lib/server/store";

export async function GET(request: Request) {
  const store = getDataStore();
  const parent = await getAuthenticatedParent(request, store);
  if (!parent) {
    return NextResponse.json({ parent: null, children: [] });
  }

  const children = await store.listChildrenByParent(parent.id);
  return NextResponse.json({
    parent: toPublicParent(parent),
    children: children.map(toPublicChildProfile),
  });
}
