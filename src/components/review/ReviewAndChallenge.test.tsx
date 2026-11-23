import "fake-indexeddb/auto";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { ActiveChildProvider } from "@/components/parent/ActiveChildProvider";
import { getAllLessons } from "@/lib/content/loader";
import { clearDailyChallengeStatus } from "@/lib/review/queue";
import { clearProgressDb, recordAttempt } from "@/lib/storage/progress-db";
import { DailyChallengePlayer } from "./DailyChallengePlayer";
import { SpacedReviewPlayer } from "./SpacedReviewPlayer";

describe("SpacedReviewPlayer and DailyChallengePlayer", () => {
  const lessons = getAllLessons();

  beforeEach(async () => {
    window.localStorage.clear();
    clearDailyChallengeStatus();
    await clearProgressDb();
  });

  it("shows a calm empty state on /review when no skills are due", async () => {
    render(
      <NumeralPreferenceProvider>
        <ActiveChildProvider>
          <SpacedReviewPlayer lessons={lessons} />
        </ActiveChildProvider>
      </NumeralPreferenceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("review-empty-state")).toBeInTheDocument();
    });
  });

  it("loads a due mastered skill on /review so the child can practice it", async () => {
    await recordAttempt({
      lessonId: "g1-make-ten",
      lessonVersion: 1,
      stepId: "mastery-check-bond-10",
      correct: true,
      hintsUsed: 0,
      durationMs: 12_000,
      timestamp: "2026-11-18T08:00:00.000Z",
    });
    await recordAttempt({
      lessonId: "g1-make-ten",
      lessonVersion: 1,
      stepId: "mastery-check-bond-10",
      correct: true,
      hintsUsed: 0,
      durationMs: 10_000,
      timestamp: "2026-11-19T08:00:00.000Z",
    });

    render(
      <NumeralPreferenceProvider>
        <ActiveChildProvider>
          <SpacedReviewPlayer lessons={lessons} />
        </ActiveChildProvider>
      </NumeralPreferenceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("review-step-card")).toHaveAttribute(
        "data-lesson-id",
        "g1-make-ten",
      );
    });
  });

  it("allows skipping today's 1-item Daily Challenge with zero penalty", async () => {
    const user = userEvent.setup();
    render(
      <NumeralPreferenceProvider>
        <ActiveChildProvider>
          <DailyChallengePlayer lessons={lessons} dateKeyOverride="2026-11-23" />
        </ActiveChildProvider>
      </NumeralPreferenceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("daily-challenge-card")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("daily-skip-button"));

    expect(screen.getByTestId("daily-skipped-screen")).toBeInTheDocument();
  });
});
