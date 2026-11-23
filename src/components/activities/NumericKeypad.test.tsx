import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { NumericKeypad } from "./NumericKeypad";

function KeypadHarness() {
  const [value, setValue] = useState("");
  return (
    <NumeralPreferenceProvider>
      <NumeralToggle />
      <output data-testid="buffer">{value}</output>
      <NumericKeypad value={value} onChange={setValue} />
    </NumeralPreferenceProvider>
  );
}

describe("NumericKeypad", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("displays Khmer digits by default, enters digits, supports backspace/clear, and adapts to Arabic mode", async () => {
    const user = userEvent.setup();
    render(<KeypadHarness />);

    expect(screen.getByTestId("keypad-digit-3")).toHaveTextContent("៣");
    expect(screen.getByTestId("keypad-digit-0")).toHaveTextContent("០");

    await user.click(screen.getByTestId("keypad-digit-1"));
    await user.click(screen.getByTestId("keypad-digit-0"));
    expect(screen.getByTestId("buffer")).toHaveTextContent("10");

    await user.click(screen.getByTestId("keypad-backspace"));
    expect(screen.getByTestId("buffer")).toHaveTextContent("1");

    await user.click(screen.getByTestId("keypad-clear"));
    expect(screen.getByTestId("buffer")).toHaveTextContent("");

    await user.click(screen.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" }));
    expect(screen.getByTestId("keypad-digit-3")).toHaveTextContent("3");
    expect(screen.getByTestId("keypad-digit-0")).toHaveTextContent("0");
  });
});
