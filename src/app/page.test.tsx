import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the Khmer heading and tagline", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "គណិតវិទ្យាខ្មែរ" })).toBeInTheDocument();
    expect(screen.getByText("រៀនគណិតវិទ្យាតាមការអនុវត្តផ្ទាល់។")).toBeInTheDocument();
  });
});
