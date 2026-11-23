export type NumeralSystem = "khmer" | "arabic";

export const DEFAULT_NUMERAL_SYSTEM: NumeralSystem = "khmer";

export interface FormatNumberOptions extends Omit<Intl.NumberFormatOptions, "numberingSystem"> {
  numeralSystem?: NumeralSystem;
}

const KHMER_ZERO_CODE_POINT = 0x17e0;
const KHMER_NINE_CODE_POINT = 0x17e9;
const ASCII_ZERO_CODE_POINT = 0x30;
const ASCII_NINE_CODE_POINT = 0x39;
const ZERO_WIDTH_SPACE_REGEX = /\u200B/g;
const NUMERIC_ANSWER_REGEX = /^-?\d+(?:[.,]\d+)?$/;

const defaultFormatters: Record<NumeralSystem, Intl.NumberFormat> = {
  khmer: new Intl.NumberFormat("km-KH", { numberingSystem: "khmr" }),
  arabic: new Intl.NumberFormat("km-KH", { numberingSystem: "latn" }),
};

function toNumberingSystem(numeralSystem: NumeralSystem): "khmr" | "latn" {
  return numeralSystem === "khmer" ? "khmr" : "latn";
}

export function formatNumber(value: number, options?: FormatNumberOptions): string {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Cannot format non-finite number: ${String(value)}`);
  }

  const normalizedValue = Object.is(value, -0) ? 0 : value;
  const { numeralSystem = DEFAULT_NUMERAL_SYSTEM, ...intlOptions } = options ?? {};

  if (Object.keys(intlOptions).length === 0) {
    return defaultFormatters[numeralSystem].format(normalizedValue);
  }

  return new Intl.NumberFormat("km-KH", {
    ...intlOptions,
    numberingSystem: toNumberingSystem(numeralSystem),
  }).format(normalizedValue);
}

export function stripZeroWidthSpaces(input: string): string {
  return input.replace(ZERO_WIDTH_SPACE_REGEX, "");
}

export function normalizeDigits(input: string): string {
  const cleaned = stripZeroWidthSpaces(input);
  let normalized = "";

  for (let i = 0; i < cleaned.length; i += 1) {
    const code = cleaned.charCodeAt(i);
    if (code >= KHMER_ZERO_CODE_POINT && code <= KHMER_NINE_CODE_POINT) {
      normalized += String.fromCharCode(ASCII_ZERO_CODE_POINT + (code - KHMER_ZERO_CODE_POINT));
    } else {
      normalized += cleaned[i];
    }
  }

  return normalized;
}

export function toKhmerDigits(input: string | number): string {
  if (typeof input === "number" && !Number.isFinite(input)) {
    throw new RangeError(`Cannot convert non-finite number to Khmer digits: ${String(input)}`);
  }

  const text = String(input);
  let converted = "";

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code >= ASCII_ZERO_CODE_POINT && code <= ASCII_NINE_CODE_POINT) {
      converted += String.fromCharCode(KHMER_ZERO_CODE_POINT + (code - ASCII_ZERO_CODE_POINT));
    } else {
      converted += text[i];
    }
  }

  return converted;
}

/**
 * Parses learner-entered numeric answers written in Khmer digits (`០–៩`),
 * Arabic digits (`0–9`), or mixed digits, after stripping zero-width spaces
 * (`U+200B`) and outer whitespace. Accepts `.` or `,` as a single decimal
 * separator (matching both Arabic `12.5` and Khmer textbook `១២,៥`).
 *
 * Note: Ungrouped numeric input is expected (on-screen keypad / tiles);
 * thousands-grouped strings are not supported as raw learner answers.
 */
export function parseNumericAnswer(input: string): number | null {
  const normalized = normalizeDigits(input).trim();
  if (normalized.length === 0 || !NUMERIC_ANSWER_REGEX.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized.replace(",", "."));
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Object.is(parsed, -0) ? 0 : parsed;
}
