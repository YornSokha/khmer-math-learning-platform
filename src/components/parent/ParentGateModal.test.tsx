import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { isValidParentGateAnswer, ParentGateModal } from "./ParentGateModal";

describe("ParentGateModal", () => {
  it("accepts both Khmer (៤២) and Arabic (42) digits and rejects wrong answers", () => {
    expect(isValidParentGateAnswer("42")).toBe(true);
    expect(isValidParentGateAnswer("៤២")).toBe(true);
    expect(isValidParentGateAnswer("41")).toBe(false);
    expect(isValidParentGateAnswer("")).toBe(false);
  });

  it("blocks wrong answers with a gentle message and unlocks on correct Khmer input", async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn();
    const onClose = vi.fn();

    render(
      <NumeralPreferenceProvider>
        <ParentGateModal open onClose={onClose} onUnlock={onUnlock} />
      </NumeralPreferenceProvider>,
    );

    const input = screen.getByTestId("parent-gate-input");
    await user.type(input, "12");
    await user.click(screen.getByTestId("parent-gate-submit"));

    expect(screen.getByTestId("parent-gate-error")).toBeInTheDocument();
    expect(onUnlock).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "៤២");
    await user.click(screen.getByTestId("parent-gate-submit"));

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });
});
