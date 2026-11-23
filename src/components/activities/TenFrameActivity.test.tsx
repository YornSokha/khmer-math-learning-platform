import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { TenFrameActivity } from "./TenFrameActivity";

function TenFrameHarness({ given = 7, activeHintCue }: { given?: number; activeHintCue?: string }) {
  const [added, setAdded] = useState(0);
  return (
    <NumeralPreferenceProvider>
      <output data-testid="reported-added">{added}</output>
      <TenFrameActivity
        mode="complete"
        given={given}
        value={added}
        onChange={setAdded}
        activeHintCue={activeHintCue}
      />
    </NumeralPreferenceProvider>
  );
}

describe("TenFrameActivity", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("locks given cells and lets learners toggle empty cells by click and keyboard", async () => {
    const user = userEvent.setup();
    render(<TenFrameHarness given={7} />);

    expect(screen.getByTestId("ten-frame-cell-0")).toHaveAttribute("data-state", "given");
    expect(screen.getByTestId("ten-frame-cell-6")).toHaveAttribute("data-state", "given");
    expect(screen.getByTestId("ten-frame-cell-7")).toHaveAttribute("data-state", "empty");

    await user.click(screen.getByTestId("ten-frame-cell-7"));
    await user.click(screen.getByTestId("ten-frame-cell-8"));

    const lastCell = screen.getByTestId("ten-frame-cell-9");
    lastCell.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("reported-added")).toHaveTextContent("3");
    expect(screen.getByTestId("ten-frame-added-count")).toHaveTextContent("៣");
    expect(screen.getByTestId("ten-frame-total-count")).toHaveTextContent("១០");

    // Toggling a filled cell removes it
    await user.click(lastCell);
    expect(screen.getByTestId("reported-added")).toHaveTextContent("2");
  });

  it("highlights remaining empty cells when highlight-empty-cells hint cue is active", () => {
    render(<TenFrameHarness given={7} activeHintCue="highlight-empty-cells" />);

    expect(screen.getByTestId("ten-frame-cell-6")).toHaveAttribute(
      "data-hint-highlighted",
      "false",
    );
    expect(screen.getByTestId("ten-frame-cell-7")).toHaveAttribute("data-hint-highlighted", "true");
    expect(screen.getByTestId("ten-frame-cell-8")).toHaveAttribute("data-hint-highlighted", "true");
    expect(screen.getByTestId("ten-frame-cell-9")).toHaveAttribute("data-hint-highlighted", "true");
  });
});
