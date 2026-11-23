import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import type { SupportsLevel } from "@/lib/content/schema";
import { EquationFillActivity } from "./EquationFillActivity";

function EquationHarness({
  supports = "none",
  activeHintCue,
}: {
  supports?: SupportsLevel;
  activeHintCue?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <NumeralPreferenceProvider>
      <output data-testid="raw-answer">{value}</output>
      <EquationFillActivity
        template="{a} + □ = 10"
        resolvedParams={{ a: 6 }}
        supports={supports}
        value={value}
        onChange={setValue}
        activeHintCue={activeHintCue}
      />
    </NumeralPreferenceProvider>
  );
}

describe("EquationFillActivity", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hides visual scaffold when supports is none and accepts answers via keypad", async () => {
    const user = userEvent.setup();
    render(<EquationHarness supports="none" />);

    expect(screen.queryByTestId("equation-visual-scaffold")).not.toBeInTheDocument();
    expect(screen.getByTestId("equation-display")).toHaveTextContent("៦ + ? = ១០");

    await user.click(screen.getByTestId("keypad-digit-4"));
    expect(screen.getByTestId("raw-answer")).toHaveTextContent("4");
    expect(screen.getByTestId("equation-answer-slot")).toHaveTextContent("៤");
  });

  it("reveals visual ten-frame scaffold when highlight-ten-frame-model hint cue is active", () => {
    render(<EquationHarness supports="none" activeHintCue="highlight-ten-frame-model" />);

    expect(screen.getByTestId("equation-visual-scaffold")).toBeInTheDocument();
    expect(screen.getByTestId("ten-frame-cell-6")).toHaveAttribute("data-hint-highlighted", "true");
  });

  it("supports keyboard input including Khmer digits", async () => {
    const user = userEvent.setup();
    render(<EquationHarness supports="partial" />);

    expect(screen.getByTestId("equation-visual-scaffold")).toBeInTheDocument();

    const display = screen.getByTestId("equation-display");
    display.focus();
    await user.keyboard("៤");
    expect(screen.getByTestId("raw-answer")).toHaveTextContent("4");
  });
});
