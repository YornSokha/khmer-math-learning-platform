import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { NumberLineActivity } from "./NumberLineActivity";

function NumberLineHarness({
  start = 6,
  target = 10,
  activeHintCue,
}: {
  start?: number;
  target?: number;
  activeHintCue?: string;
}) {
  const [hops, setHops] = useState(0);
  return (
    <NumeralPreferenceProvider>
      <output data-testid="reported-hops">{hops}</output>
      <NumberLineActivity
        mode="jump"
        start={start}
        target={target}
        max={10}
        value={hops}
        onChange={setHops}
        activeHintCue={activeHintCue}
      />
    </NumeralPreferenceProvider>
  );
}

describe("NumberLineActivity", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hops forward and backward with SVG jump arcs", async () => {
    const user = userEvent.setup();
    render(<NumberLineHarness start={6} target={10} />);

    const forward = screen.getByTestId("number-line-forward");
    const back = screen.getByTestId("number-line-back");
    expect(back).toBeDisabled();

    for (let i = 0; i < 4; i += 1) {
      await user.click(forward);
    }

    expect(screen.getByTestId("reported-hops")).toHaveTextContent("4");
    expect(screen.getByTestId("number-line-hops-count")).toHaveTextContent("៤");
    expect(screen.getByTestId("hop-arc-3")).toBeInTheDocument();
    expect(forward).toBeDisabled();

    await user.click(back);
    expect(screen.getByTestId("reported-hops")).toHaveTextContent("3");
  });

  it("displays dashed hint arcs when show-jump-arcs cue is active", () => {
    render(<NumberLineHarness start={7} target={10} activeHintCue="show-jump-arcs" />);

    expect(screen.getByTestId("hint-arc-0")).toBeInTheDocument();
    expect(screen.getByTestId("hint-arc-1")).toBeInTheDocument();
    expect(screen.getByTestId("hint-arc-2")).toBeInTheDocument();
  });
});
