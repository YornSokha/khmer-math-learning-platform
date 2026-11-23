import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as signupPost } from "@/app/api/auth/signup/route";
import { GET as progressGet } from "@/app/api/children/[childId]/progress/route";
import { POST as childrenPost } from "@/app/api/children/route";
import { POST as syncPost } from "@/app/api/sync/attempts/route";
import { SESSION_COOKIE_NAME } from "./auth";
import { setDataStoreForTesting } from "./db";
import { MemoryDataStore } from "./memory-store";

function extractCookieHeader(response: Response): string {
  const setCookie = response.headers.get("set-cookie") ?? "";
  const match = setCookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? `${SESSION_COOKIE_NAME}=${match[1]}` : "";
}

describe("Attempt sync API and parent progress summary", () => {
  let store: MemoryDataStore;

  beforeEach(() => {
    store = new MemoryDataStore();
    setDataStoreForTesting(store);
  });

  afterEach(() => {
    setDataStoreForTesting(null);
  });

  it("syncs attempts idempotently, updates 2-session mastery, enforces ownership, and reports parent summary", async () => {
    const signupA = await signupPost(
      new Request("http://localhost:3123/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "sync-parent@example.com",
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
          email: "other-parent@example.com",
          password: "password123",
          consentAccepted: true,
        }),
      }),
    );
    const cookieB = extractCookieHeader(signupB);

    const childRes = await childrenPost(
      new Request("http://localhost:3123/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify({
          nickname: "ម៉ាលី",
          avatarId: "lotus",
          grade: 1,
          numeralPref: "khmer",
        }),
      }),
    );
    const { child } = (await childRes.json()) as { child: { id: string } };

    // Parent B cannot sync attempts for Parent A's child
    const forbiddenSync = await syncPost(
      new Request("http://localhost:3123/api/sync/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieB },
        body: JSON.stringify({
          childProfileId: child.id,
          attempts: [],
        }),
      }),
    );
    expect(forbiddenSync.status).toBe(404);

    // Day 1 & Day 2 independent correct challenges for g1-make-ten
    const day1 = new Date();
    day1.setUTCDate(day1.getUTCDate() - 1);
    const day2 = new Date();

    const batchPayload = {
      childProfileId: child.id,
      attempts: [
        {
          clientEventId: "evt-make-ten-day1",
          lessonId: "g1-make-ten",
          lessonVersion: 1,
          stepId: "mastery-check-bond-10",
          correct: true,
          hintsUsed: 0,
          durationMs: 65_000,
          timestamp: day1.toISOString(),
        },
        {
          clientEventId: "evt-make-ten-day2",
          lessonId: "g1-make-ten",
          lessonVersion: 1,
          stepId: "mastery-check-bond-10",
          correct: true,
          hintsUsed: 0,
          durationMs: 75_000,
          timestamp: day2.toISOString(),
        },
      ],
    };

    // First sync inserts both attempts and masters bond-10
    const firstSync = await syncPost(
      new Request("http://localhost:3123/api/sync/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify(batchPayload),
      }),
    );
    expect(firstSync.status).toBe(200);
    const firstData = (await firstSync.json()) as {
      acceptedCount: number;
      duplicateCount: number;
      skillStates: Array<{ skillId: string; masteredAt: string | null }>;
    };
    expect(firstData.acceptedCount).toBe(2);
    expect(firstData.duplicateCount).toBe(0);
    expect(firstData.skillStates.find((s) => s.skillId === "bond-10")?.masteredAt).not.toBeNull();

    // Second sync with identical clientEventIds creates zero duplicates
    const secondSync = await syncPost(
      new Request("http://localhost:3123/api/sync/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: cookieA },
        body: JSON.stringify(batchPayload),
      }),
    );
    expect(secondSync.status).toBe(200);
    const secondData = (await secondSync.json()) as {
      acceptedCount: number;
      duplicateCount: number;
    };
    expect(secondData.acceptedCount).toBe(0);
    expect(secondData.duplicateCount).toBe(2);
    expect(await store.listAttemptsForChild(child.id)).toHaveLength(2);

    // Parent progress endpoint returns mastered skills and learning minutes
    const progressRes = await progressGet(
      new Request(`http://localhost:3123/api/children/${child.id}/progress`, {
        headers: { cookie: cookieA },
      }),
      { params: Promise.resolve({ childId: child.id }) },
    );
    expect(progressRes.status).toBe(200);
    const progressData = (await progressRes.json()) as {
      summary: {
        masteredSkills: Array<{ skillId: string }>;
        minutesToday: number;
        minutesLast7Days: number;
        totalAttempts: number;
      };
    };
    expect(progressData.summary.masteredSkills.some((s) => s.skillId === "bond-10")).toBe(true);
    expect(progressData.summary.minutesToday).toBeGreaterThanOrEqual(1);
    expect(progressData.summary.minutesLast7Days).toBeGreaterThanOrEqual(2);
    expect(progressData.summary.totalAttempts).toBe(2);
  });
});
