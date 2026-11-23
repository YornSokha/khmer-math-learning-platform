import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormattedNumber } from "./FormattedNumber";
import {
  NUMERAL_PREFERENCE_STORAGE_KEY,
  NumeralPreferenceProvider,
} from "./NumeralPreferenceProvider";
import { NumeralToggle } from "./NumeralToggle";

describe("NumeralToggle and NumeralPreferenceProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to Khmer numerals and switches formatted numbers when toggled", async () => {
    const user = userEvent.setup();

    render(
      <NumeralPreferenceProvider>
        <NumeralToggle />
        <FormattedNumber value={7} data-testid="sample-seven" />
        <FormattedNumber value={10} data-testid="sample-ten" />
      </NumeralPreferenceProvider>,
    );

    const group = screen.getByRole("group", { name: "ជ្រើសរើសប្រព័ន្ធលេខ" });
    expect(group).toBeInTheDocument();

    const khmerButton = screen.getByRole("button", { name: "ប្រើលេខខ្មែរ (១២៣)" });
    const arabicButton = screen.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" });

    expect(khmerButton).toHaveAttribute("aria-pressed", "true");
    expect(arabicButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("sample-seven")).toHaveTextContent("៧");
    expect(screen.getByTestId("sample-ten")).toHaveTextContent("១០");

    await user.click(arabicButton);

    expect(khmerButton).toHaveAttribute("aria-pressed", "false");
    expect(arabicButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("sample-seven")).toHaveTextContent("7");
    expect(screen.getByTestId("sample-ten")).toHaveTextContent("10");
    expect(window.localStorage.getItem(NUMERAL_PREFERENCE_STORAGE_KEY)).toBe("arabic");

    await user.click(khmerButton);

    expect(khmerButton).toHaveAttribute("aria-pressed", "true");
    expect(arabicButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("sample-seven")).toHaveTextContent("៧");
    expect(window.localStorage.getItem(NUMERAL_PREFERENCE_STORAGE_KEY)).toBe("khmer");
  });

  it("restores the persisted numeral preference across mounts", () => {
    window.localStorage.setItem(NUMERAL_PREFERENCE_STORAGE_KEY, "arabic");

    render(
      <NumeralPreferenceProvider>
        <NumeralToggle />
        <FormattedNumber value={7} data-testid="persisted-seven" />
      </NumeralPreferenceProvider>,
    );

    expect(screen.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("persisted-seven")).toHaveTextContent("7");
  });

  it("handles restricted localStorage gracefully and still toggles in memory", async () => {
    const user = userEvent.setup();
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });

    try {
      render(
        <NumeralPreferenceProvider>
          <NumeralToggle />
          <FormattedNumber value={10} data-testid="memory-ten" />
        </NumeralPreferenceProvider>,
      );

      expect(screen.getByTestId("memory-ten")).toHaveTextContent("១០");

      await user.click(screen.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" }));

      expect(screen.getByTestId("memory-ten")).toHaveTextContent("10");
    } finally {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
    }
  });
});
