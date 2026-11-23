import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as meGet } from "@/app/api/auth/me/route";
import { POST as signupPost } from "@/app/api/auth/signup/route";
import { DELETE as childDelete, PATCH as childPatch } from "@/app/api/children/[childId]/route";
import { GET as childrenGet, POST as childrenPost } from "@/app/api/children/route";
import { SESSION_COOKIE_NAME, hashPassword, verifyPassword } from "./auth";
import { setDataStoreForTesting } from "./db";
import { MemoryDataStore } from "./memory-store";

function extractCookieHeader(response: Response): string {
  const setCookie = response.headers.get("set-cookie") ?? "";
  const match = setCookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? `${SESSION_COOKIE_NAME}=${match[1]}` : "";
}

describe("Parent auth, consent, child profiles, and cascading deletion", () => {
  let store: MemoryDataStore;

  beforeEach(() => {
    store = new MemoryDataStore();
    setDataStoreForTesting(store);
  });

  afterEach(() => {
    setDataStoreForTesting(null);
  });

  it("hashes and verifies passwords safely with random salts", async () => {
    const hashA = await hashPassword("secret-pass-123");
    const hashB = await hashPassword("secret-pass-123");
    expect(hashA).not.toBe(hashB);
    expect(await verifyPassword("secret-pass-123", hashA)).toBe(true);
    expect(await verifyPassword("wrong-password", hashA)).toBe(false);
  });

  it("rejects signup without explicit under-16 parental consent", async () => {
    const res = await signupPost(
      new Request("http://localhost:3123/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "parent@example.com",
          password: "password123",
          consentAccepted: false,
        }),
      }),
    );

    expect(res.status).toBe(400);
    expect(await store.findParentByEmail("parent@example.com")).toBeNull();
  });

  it("creates parent with consent, sets HttpOnly session cookie, and rejects duplicate emails", async () => {
    const res = await signupPost(
      new Request("http://localhost:3123/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "Parent@Example.com",
          password: "password123",
          consentAccepted: true,
        }),
      }),
    );

    expect(res.status).toBe(201);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie.toLowerCase()).toContain("httponly");

    const data = (await res.json()) as { parent: { email: string; consentVersion: string } };
    expect(data.parent.email).toBe("parent@example.com");
    expect(data.parent.consentVersion).toBe("v1-under-16-pdpl");

    // Duplicate email rejected with 409
    const dup = await signupPost(
      new Request("http://localhost:3123/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "parent@example.com",
          password: "password123",
          consentAccepted: true,
        }),
      }),
    );
    expect(dup.status).toBe(409);

    // Session cookie works on /api/auth/me and clears on logout
    const cookie = extractCookieHeader(res);
    const meRes = await meGet(
      new Request("http://localhost:3123/api/auth/me", {
        headers: { cookie },
      }),
    );
    const meData = (await meRes.json()) as { parent: { email: string } | null };
    expect(meData.parent?.email).toBe("parent@example.com");

    await logoutPost(
      new Request("http://localhost:3123/api/auth/logout", {
        method: "POST",
        headers: { cookie },
      }),
    );
    const afterLogout = await meGet(
      new Request("http://localhost:3123/api/auth/me", {
        headers: { cookie },
      }),
    );
    const afterLogoutData = (await afterLogout.json()) as { parent: unknown };
    expect(afterLogoutData.parent).toBeNull();

    // Login works again
    const loginRes = await loginPost(
      new Request("http://localhost:3123/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "parent@example.com", password: "password123" }),
      }),
    );
    expect(loginRes.status).toBe(200);
  });

  it("enforces no-PII child profiles, cross-parent isolation, and cascading delete", async () => {
    const signupA = await signupPost(
      new Request("http://localhost:3123/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "a@example.com",
          password: "password123",
          consentAccepted: true,
        }),
      }),
    );
    const cookieA = extractCookieHeader(signupA);

    const signupB = await signupPost(
      new Request("http://localhost:3123/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "b@example.com",
          password: "password123",
          consentAccepted: true,
        }),
      }),
    );
    const cookieB = extractCookieHeader(signupB);

    // Rejects forbidden child PII fields
    const piiAttempt = await childrenPost(
      new Request("http://localhost:3123/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          nickname: "ដារ៉ា",
          avatarId: "mango",
          grade: 1,
          birthdate: "2019-05-01",
        }),
      }),
    );
    expect(piiAttempt.status).toBe(400);

    // Creates valid non-PII child profile
    const createRes = await childrenPost(
      new Request("http://localhost:3123/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          nickname: "ដារ៉ា",
          avatarId: "tuktuk",
          grade: 1,
          numeralPref: "khmer",
        }),
      }),
    );
    expect(createRes.status).toBe(201);
    const { child } = (await createRes.json()) as {
      child: { id: string; nickname: string; avatarId: string; grade: number; numeralPref: string };
    };
    expect(child).toMatchObject({
      nickname: "ដារ៉ា",
      avatarId: "tuktuk",
      grade: 1,
      numeralPref: "khmer",
    });

    // Seed attempts, skill state, and achievement for child
    await store.insertAttemptsIdempotent([
      {
        clientEventId: "evt-1",
        childProfileId: child.id,
        lessonId: "g1-make-ten",
        lessonVersion: 1,
        stepId: "s1",
        correct: true,
        hintsUsed: 0,
        durationMs: 4200,
        attemptedAt: new Date(),
      },
    ]);
    await store.upsertSkillState({
      childProfileId: child.id,
      skillId: "bond-10",
      independentSessions: 1,
      lastMasteredDate: "2026-11-23",
      masteredAt: null,
      reviewStage: 0,
      nextReviewAt: null,
    });
    await store.awardAchievement(child.id, "first-lesson");

    // Parent B cannot patch or delete Parent A's child
    const unauthorizedPatch = await childPatch(
      new Request(`http://localhost:3123/api/children/${child.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: cookieB },
        body: JSON.stringify({ numeralPref: "arabic" }),
      }),
      { params: Promise.resolve({ childId: child.id }) },
    );
    expect(unauthorizedPatch.status).toBe(404);

    const unauthorizedDelete = await childDelete(
      new Request(`http://localhost:3123/api/children/${child.id}`, {
        method: "DELETE",
        headers: { cookie: cookieB },
      }),
      { params: Promise.resolve({ childId: child.id }) },
    );
    expect(unauthorizedDelete.status).toBe(404);

    // Parent A can update and then permanently delete the child
    const patchRes = await childPatch(
      new Request(`http://localhost:3123/api/children/${child.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({ numeralPref: "arabic" }),
      }),
      { params: Promise.resolve({ childId: child.id }) },
    );
    expect(patchRes.status).toBe(200);
    expect(((await patchRes.json()) as { child: { numeralPref: string } }).child.numeralPref).toBe(
      "arabic",
    );

    const deleteRes = await childDelete(
      new Request(`http://localhost:3123/api/children/${child.id}`, {
        method: "DELETE",
        headers: { cookie: cookieA },
      }),
      { params: Promise.resolve({ childId: child.id }) },
    );
    expect(deleteRes.status).toBe(200);

    // Verify all child records cascaded away
    expect(await store.listAttemptsForChild(child.id)).toHaveLength(0);
    expect(await store.listSkillStatesForChild(child.id)).toHaveLength(0);
    expect(await store.listAchievementsForChild(child.id)).toHaveLength(0);

    const listRes = await childrenGet(
      new Request("http://localhost:3123/api/children", {
        headers: { cookie: cookieA },
      }),
    );
    expect(((await listRes.json()) as { children: unknown[] }).children).toHaveLength(0);
  });
});
