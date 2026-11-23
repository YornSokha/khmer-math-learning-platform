import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import HomePage from "./page";

describe("HomePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the Khmer heading, tagline, specimen text, and Grade 1 Khmer numbers by default", () => {
    render(
      <NumeralPreferenceProvider>
        <HomePage />
      </NumeralPreferenceProvider>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "គណិតវិទ្យាខ្មែរ" })).toBeInTheDocument();
    expect(screen.getByText("រៀនគណិតវិទ្យាតាមការអនុវត្តផ្ទាល់។")).toBeInTheDocument();

    expect(screen.getByTestId("khmer-instruction")).toHaveTextContent("បង្កើតដប់");
    expect(screen.getByTestId("khmer-body")).toHaveTextContent("គ្រូបង្រៀន");
    expect(screen.getByTestId("khmer-body")).toHaveTextContent("ស្ត្រី");

    expect(screen.getByTestId("sample-number-0")).toHaveTextContent("០");
    expect(screen.getByTestId("sample-number-7")).toHaveTextContent("៧");
    expect(screen.getByTestId("sample-number-10")).toHaveTextContent("១០");
    expect(screen.getByTestId("sample-number-100")).toHaveTextContent("១០០");

    expect(screen.getByRole("button", { name: "ចាប់ផ្តើមអនុវត្ត" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ស្តាប់ម្តងទៀត" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ពិនិត្យចម្លើយ" })).toBeInTheDocument();
  });

  it("switches Grade 1 sample numbers between Khmer and Arabic via the numeral toggle", async () => {
    const user = userEvent.setup();

    render(
      <NumeralPreferenceProvider>
        <HomePage />
      </NumeralPreferenceProvider>,
    );

    await user.click(screen.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" }));

    expect(screen.getByTestId("sample-number-0")).toHaveTextContent("0");
    expect(screen.getByTestId("sample-number-7")).toHaveTextContent("7");
    expect(screen.getByTestId("sample-number-10")).toHaveTextContent("10");
    expect(screen.getByTestId("sample-number-100")).toHaveTextContent("100");
  });
});
