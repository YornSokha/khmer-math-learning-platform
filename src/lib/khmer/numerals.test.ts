import { describe, expect, it } from "vitest";
import {
  DEFAULT_NUMERAL_SYSTEM,
  formatNumber,
  normalizeDigits,
  parseNumericAnswer,
  stripZeroWidthSpaces,
  toKhmerDigits,
} from "./numerals";

describe("Khmer numeral formatting and digit normalization", () => {
  it("defaults to Khmer numerals for Grade 1", () => {
    expect(DEFAULT_NUMERAL_SYSTEM).toBe("khmer");
    expect(formatNumber(0)).toBe("០");
    expect(formatNumber(7)).toBe("៧");
    expect(formatNumber(10)).toBe("១០");
  });

  it("formats numbers in Arabic numerals when requested", () => {
    expect(formatNumber(0, { numeralSystem: "arabic" })).toBe("0");
    expect(formatNumber(7, { numeralSystem: "arabic" })).toBe("7");
    expect(formatNumber(10, { numeralSystem: "arabic" })).toBe("10");
  });

  it("formats negative, grouped, and decimal numbers consistently under both numeral systems", () => {
    const khmerFormatter = new Intl.NumberFormat("km-KH", { numberingSystem: "khmr" });
    const arabicFormatter = new Intl.NumberFormat("km-KH", { numberingSystem: "latn" });

    for (const value of [-5, 1000, 12.5]) {
      expect(formatNumber(value, { numeralSystem: "khmer" })).toBe(khmerFormatter.format(value));
      expect(formatNumber(value, { numeralSystem: "arabic" })).toBe(arabicFormatter.format(value));
    }

    expect(formatNumber(1000, { numeralSystem: "khmer", useGrouping: false })).toBe("១០០០");
    expect(formatNumber(1000, { numeralSystem: "arabic", useGrouping: false })).toBe("1000");
    expect(formatNumber(-0)).toBe("០");
  });

  it("rejects non-finite numbers when formatting or converting", () => {
    expect(() => formatNumber(Number.NaN)).toThrow(RangeError);
    expect(() => formatNumber(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => formatNumber(Number.NEGATIVE_INFINITY)).toThrow(RangeError);
    expect(() => toKhmerDigits(Number.NaN)).toThrow(RangeError);
  });

  it("maps all ten digits accurately between Khmer and Arabic", () => {
    expect(normalizeDigits("០១២៣៤៥៦៧៨៩")).toBe("0123456789");
    expect(toKhmerDigits("0123456789")).toBe("០១២៣៤៥៦៧៨៩");
    expect(toKhmerDigits(1234567890)).toBe("១២៣៤៥៦៧៨៩០");
  });

  it("strips zero-width spaces and parses Khmer, Arabic, mixed, negative, and decimal answers", () => {
    expect(stripZeroWidthSpaces("១\u200B០\u200B")).toBe("១០");
    expect(normalizeDigits(" ១\u200B០ ")).toBe(" 10 ");

    expect(parseNumericAnswer("៧")).toBe(7);
    expect(parseNumericAnswer("7")).toBe(7);
    expect(parseNumericAnswer(" ១\u200B០ ")).toBe(10);
    expect(parseNumericAnswer("១2")).toBe(12);
    expect(parseNumericAnswer("-៥")).toBe(-5);
    expect(parseNumericAnswer("12.5")).toBe(12.5);
    expect(parseNumericAnswer("១២,៥")).toBe(12.5);
    expect(parseNumericAnswer("១២.៥")).toBe(12.5);
    expect(parseNumericAnswer("-0")).toBe(0);
  });

  it("rejects empty, whitespace-only, and malformed numeric answers", () => {
    expect(parseNumericAnswer("")).toBeNull();
    expect(parseNumericAnswer("   ")).toBeNull();
    expect(parseNumericAnswer("\u200B")).toBeNull();
    expect(parseNumericAnswer("៧ក")).toBeNull();
    expect(parseNumericAnswer("12.3.4")).toBeNull();
    expect(parseNumericAnswer("១២,៣,៤")).toBeNull();
    expect(parseNumericAnswer("--5")).toBeNull();
    expect(parseNumericAnswer("1 0")).toBeNull();
    expect(parseNumericAnswer("5.")).toBeNull();
    expect(parseNumericAnswer(".5")).toBeNull();
  });
});
