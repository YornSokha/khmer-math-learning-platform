import "fake-indexeddb/auto";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import {
  ACTIVE_CHILD_STORAGE_KEY,
  ActiveChildProvider,
} from "@/components/parent/ActiveChildProvider";
import { clearProgressDb, recordAttempt } from "@/lib/storage/progress-db";
import { AppNavigationShell, isFocusRoute } from "./AppNavigationShell";

let mockPathname = "/";
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: pushMock }),
}));

function renderShell(
  reviewLessons?: Array<{ id: string; skills: string[]; reviewItemIds?: string[] }>,
) {
  return render(
    <NumeralPreferenceProvider>
      <ActiveChildProvider>
        <AppNavigationShell reviewLessons={reviewLessons}>
          <main id="main-content">
            <h1>Page Content</h1>
          </main>
        </AppNavigationShell>
      </ActiveChildProvider>
    </NumeralPreferenceProvider>,
  );
}

describe("AppNavigationShell", () => {
  beforeEach(async () => {
    mockPathname = "/";
    pushMock.mockReset();
    window.localStorage.clear();
    await clearProgressDb();
  });

  it("identifies focus-mode routes cleanly", () => {
    expect(isFocusRoute("/lessons/g1-make-ten")).toBe(true);
    expect(isFocusRoute("/placement")).toBe(true);
    expect(isFocusRoute("/preview/g1-make-ten")).toBe(true);
    expect(isFocusRoute("/offline")).toBe(true);

    expect(isFocusRoute("/")).toBe(false);
    expect(isFocusRoute("/learn")).toBe(false);
    expect(isFocusRoute("/review")).toBe(false);
    expect(isFocusRoute("/daily-challenge")).toBe(false);
    expect(isFocusRoute("/parent")).toBe(false);
  });

  it("hides header and mobile bottom nav on focus-mode routes", () => {
    mockPathname = "/lessons/g1-make-ten";
    renderShell();

    expect(screen.queryByTestId("app-top-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mobile-bottom-nav")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Page Content" })).toBeInTheDocument();
  });

  it("renders sticky top header and 4-tab mobile bottom nav on /learn with active aria-current and single NumeralToggle", () => {
    mockPathname = "/learn";
    renderShell();

    expect(screen.getByTestId("app-top-header")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-bottom-nav")).toBeInTheDocument();
    expect(screen.getByTestId("nav-numeral-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-nav-learn")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("mobile-nav-review")).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("mobile-nav-daily")).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("mobile-nav-parents")).not.toHaveAttribute("aria-current");
  });

  it("omits header NumeralToggle on / so the home page keeps a single toggle", () => {
    mockPathname = "/";
    renderShell();

    expect(screen.getByTestId("app-top-header")).toBeInTheDocument();
    expect(screen.queryByTestId("nav-numeral-toggle")).not.toBeInTheDocument();
  });

  it("displays active child chip and gates Parents navigation via ParentGateModal when a child is active", async () => {
    const user = userEvent.setup();
    mockPathname = "/learn";
    window.localStorage.setItem(
      ACTIVE_CHILD_STORAGE_KEY,
      JSON.stringify({
        id: "chd_1",
        nickname: "សុខា",
        avatarId: "tuktuk",
        grade: 1,
        numeralPref: "khmer",
      }),
    );

    renderShell();

    expect(screen.getByTestId("nav-active-child-chip")).toHaveTextContent("សុខា");

    await user.click(screen.getByTestId("mobile-nav-parents"));
    expect(screen.getByTestId("parent-gate-modal")).toBeInTheDocument();

    await user.type(screen.getByTestId("parent-gate-input"), "៤២");
    await user.click(screen.getByTestId("parent-gate-submit"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/parent");
    });
  });

  it("does not open ParentGateModal when no child is active", async () => {
    const user = userEvent.setup();
    mockPathname = "/";
    renderShell();

    await user.click(screen.getByTestId("mobile-nav-parents"));
    expect(screen.queryByTestId("parent-gate-modal")).not.toBeInTheDocument();
  });

  it("surfaces a subtle due-review count badge when local reviews are due", async () => {
    mockPathname = "/learn";
    await recordAttempt({
      lessonId: "g1-make-ten",
      lessonVersion: 1,
      stepId: "mastery-check-bond-10",
      correct: true,
      hintsUsed: 0,
      durationMs: 10_000,
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

    renderShell([
      {
        id: "g1-make-ten",
        skills: ["g1-bond-10"],
        reviewItemIds: ["mastery-check-bond-10"],
      },
    ]);

    await waitFor(() => {
      expect(screen.getByTestId("mobile-nav-review-badge")).toHaveTextContent("១");
    });
  });
});
