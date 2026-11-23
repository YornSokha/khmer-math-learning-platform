import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { ChoicePictorialActivity } from "./ChoicePictorialActivity";
import { CompareGroupsActivity } from "./CompareGroupsActivity";
import { CountTapActivity } from "./CountTapActivity";
import { DragToGroupActivity } from "./DragToGroupActivity";
import { MoneyPayActivity } from "./MoneyPayActivity";
import { NumberBondActivity } from "./NumberBondActivity";
import { PartitionActivity } from "./PartitionActivity";
import { PatternSequenceActivity } from "./PatternSequenceActivity";
import { PlaceValueBlocksActivity } from "./PlaceValueBlocksActivity";

describe("Extended Grade 1 SVG activity components", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("counts tapped fruit in CountTapActivity", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [val, setVal] = useState("");
      return (
        <NumeralPreferenceProvider>
          <output data-testid="out">{val}</output>
          <CountTapActivity mode="count" count={4} value={val} onChange={setVal} />
        </NumeralPreferenceProvider>
      );
    }
    render(<Harness />);

    await user.click(screen.getByTestId("count-tap-item-0"));
    await user.click(screen.getByTestId("count-tap-item-1"));
    await user.click(screen.getByTestId("count-tap-item-2"));
    expect(screen.getByTestId("out")).toHaveTextContent("3");
  });

  it("selects pictorial option in ChoicePictorialActivity and symbol in CompareGroupsActivity", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [choice, setChoice] = useState("");
      const [symbol, setSymbol] = useState("");
      return (
        <NumeralPreferenceProvider>
          <output data-testid="choice-out">{choice}</output>
          <output data-testid="symbol-out">{symbol}</output>
          <ChoicePictorialActivity
            options={[
              { id: "equal", label: { km: "ស្មើគ្នា" }, visual: "half-equal" },
              { id: "unequal", label: { km: "មិនស្មើគ្នា" }, visual: "half-unequal" },
            ]}
            value={choice}
            onChange={setChoice}
          />
          <CompareGroupsActivity
            leftCount={7}
            rightCount={4}
            value={symbol}
            onChange={setSymbol}
            activeHintCue="highlight-compare-counts"
          />
        </NumeralPreferenceProvider>
      );
    }
    render(<Harness />);

    await user.click(screen.getByTestId("choice-option-equal"));
    expect(screen.getByTestId("choice-out")).toHaveTextContent("equal");

    expect(screen.getByTestId("compare-count-left")).toHaveTextContent("៧");
    await user.click(screen.getByTestId("compare-symbol->"));
    expect(screen.getByTestId("symbol-out")).toHaveTextContent(">");
  });

  it("adds/removes items in DragToGroupActivity and solves NumberBondActivity", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [basket, setBasket] = useState(3);
      const [bond, setBond] = useState("");
      return (
        <NumeralPreferenceProvider>
          <output data-testid="basket-out">{basket}</output>
          <output data-testid="bond-out">{bond}</output>
          <DragToGroupActivity mode="add" initialCount={3} onChange={setBasket} />
          <NumberBondActivity whole={10} knownPart={6} value={bond} onChange={setBond} />
        </NumeralPreferenceProvider>
      );
    }
    render(<Harness />);

    await user.click(screen.getByTestId("basket-add-button"));
    await user.click(screen.getByTestId("basket-add-button"));
    expect(screen.getByTestId("basket-out")).toHaveTextContent("5");

    await user.click(screen.getByTestId("keypad-digit-4"));
    expect(screen.getByTestId("bond-out")).toHaveTextContent("4");
  });

  it("composes tens and ones in PlaceValueBlocksActivity", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [total, setTotal] = useState(0);
      return (
        <NumeralPreferenceProvider>
          <output data-testid="pv-out">{total}</output>
          <PlaceValueBlocksActivity onChange={setTotal} />
        </NumeralPreferenceProvider>
      );
    }
    render(<Harness />);

    await user.click(screen.getByTestId("place-value-tens-plus"));
    await user.click(screen.getByTestId("place-value-tens-plus"));
    for (let i = 0; i < 4; i += 1) {
      await user.click(screen.getByTestId("place-value-ones-plus"));
    }

    expect(screen.getByTestId("pv-out")).toHaveTextContent("24");
    expect(screen.getByTestId("place-value-total")).toHaveTextContent("២៤");
  });

  it("extends patterns, shades halves, and pays with R50 and R100 riel notes", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [pat, setPat] = useState("");
      const [shaded, setShaded] = useState(0);
      const [riel, setRiel] = useState(0);
      return (
        <NumeralPreferenceProvider>
          <output data-testid="pat-out">{pat}</output>
          <output data-testid="shaded-out">{shaded}</output>
          <output data-testid="riel-out">{riel}</output>
          <PatternSequenceActivity
            pattern={["krama-red", "krama-teal", "krama-red", "?"]}
            options={[
              { id: "krama-red", label: { km: "ក្រហម" }, visual: "krama-red" },
              { id: "krama-teal", label: { km: "បៃតង" }, visual: "krama-teal" },
            ]}
            value={pat}
            onChange={setPat}
          />
          <PartitionActivity parts={2} onChange={setShaded} />
          <MoneyPayActivity onChange={setRiel} />
        </NumeralPreferenceProvider>
      );
    }
    render(<Harness />);

    await user.click(screen.getByTestId("pattern-option-krama-teal"));
    expect(screen.getByTestId("pat-out")).toHaveTextContent("krama-teal");

    await user.click(screen.getByTestId("partition-part-0"));
    expect(screen.getByTestId("shaded-out")).toHaveTextContent("1");

    await user.click(screen.getByTestId("add-riel-100"));
    await user.click(screen.getByTestId("add-riel-100"));
    await user.click(screen.getByTestId("add-riel-50"));
    await user.click(screen.getByTestId("add-riel-50"));
    expect(screen.getByTestId("riel-out")).toHaveTextContent("300");
    expect(screen.getByTestId("money-pay-total")).toHaveTextContent("៣០០");
  });
});
