import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  hashSessionToken,
  readSessionTokenFromRequest,
} from "@/lib/server/auth";
import { getDataStore } from "@/lib/server/db";

export async function POST(request: Request) {
  const token = readSessionTokenFromRequest(request);
  if (token) {
    const store = getDataStore();
    await store.deleteSessionByTokenHash(hashSessionToken(token));
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response, request);
  return response;
}
