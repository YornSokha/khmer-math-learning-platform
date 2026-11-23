import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { ActiveChildProvider } from "./ActiveChildProvider";
import { ParentPortal } from "./ParentPortal";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("ParentPortal", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requires explicit parental consent, creates a child profile, and hands off to /learn", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url === "/api/auth/me") {
        return new Response(JSON.stringify({ parent: null, children: [] }), { status: 200 });
      }
      if (url === "/api/auth/signup" && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            parent: {
              id: "par_1",
              email: "mom@example.com",
              consentAcceptedAt: new Date().toISOString(),
              consentVersion: "v1-under-16-pdpl",
            },
            children: [],
          }),
          { status: 201 },
        );
      }
      if (url === "/api/children" && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            child: {
              id: "chd_1",
              nickname: "សុខា",
              avatarId: "tuktuk",
              grade: 1,
              numeralPref: "arabic",
            },
          }),
          { status: 201 },
        );
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    render(
      <NumeralPreferenceProvider>
        <ActiveChildProvider>
          <ParentPortal />
        </ActiveChildProvider>
      </NumeralPreferenceProvider>,
    );

    await screen.findByTestId("parent-auth-card");

    await user.type(screen.getByTestId("parent-email-input"), "mom@example.com");
    await user.type(screen.getByTestId("parent-password-input"), "password123");

    // Submit without consent -> blocked locally with Khmer error
    await user.click(screen.getByTestId("parent-auth-submit"));
    expect(screen.getByTestId("parent-auth-error")).toBeInTheDocument();

    // Check consent and submit -> signed in
    await user.click(screen.getByTestId("parent-consent-checkbox"));
    await user.click(screen.getByTestId("parent-auth-submit"));

    await screen.findByTestId("parent-account-summary");
    expect(screen.getByTestId("parent-account-summary")).toHaveTextContent("mom@example.com");

    // Create child profile
    await user.type(screen.getByTestId("child-nickname-input"), "សុខា");
    await user.click(screen.getByTestId("avatar-option-tuktuk"));
    await user.click(screen.getByTestId("child-numeral-arabic"));
    await user.click(screen.getByTestId("add-child-submit"));

    await screen.findByTestId("child-card-chd_1");
    await user.click(screen.getByTestId("child-hand-device-chd_1"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/learn");
    });
    expect(fetchMock).toHaveBeenCalled();
  });
});
