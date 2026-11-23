const KHMER_CHAR_REGEX = /[\u1780-\u17FF]/;
const PLACEHOLDER_SPLIT_REGEX = /(\{[a-zA-Z_][a-zA-Z0-9_]*\})/g;
const ZERO_WIDTH_SPACE = "\u200B";

const khmerWordSegmenter = new Intl.Segmenter("km", { granularity: "word" });

function segmentKhmerPlainText(text: string): string {
  if (!KHMER_CHAR_REGEX.test(text)) {
    return text;
  }

  const normalized = text.replace(/\u200B+/g, ZERO_WIDTH_SPACE);
  const segments = Array.from(khmerWordSegmenter.segment(normalized));
  let output = "";
  let prevWasKhmerWord = false;

  for (const { segment, isWordLike } of segments) {
    const isKhmerWord = Boolean(isWordLike) && KHMER_CHAR_REGEX.test(segment);

    if (prevWasKhmerWord && isKhmerWord && !output.endsWith(ZERO_WIDTH_SPACE)) {
      output += ZERO_WIDTH_SPACE;
    }

    output += segment;
    prevWasKhmerWord = isKhmerWord;
  }

  return output.replace(/\u200B{2,}/g, ZERO_WIDTH_SPACE);
}

/**
 * Inserts U+200B (ZWSP) at Khmer word boundaries during content loading/build.
 * Preserves `{placeholder}` tokens, whitespace, and punctuation intact.
 */
export function insertKhmerZwsp(text: string): string {
  if (!KHMER_CHAR_REGEX.test(text)) {
    return text;
  }

  return text
    .split(PLACEHOLDER_SPLIT_REGEX)
    .map((part) => {
      if (part.startsWith("{") && part.endsWith("}")) {
        return part;
      }
      return segmentKhmerPlainText(part);
    })
    .join("");
}

export function applyZwspToUnknown<T>(value: T): T {
  if (typeof value === "string") {
    return insertKhmerZwsp(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => applyZwspToUnknown(item)) as T;
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (key === "km" && typeof entry === "string") {
        result[key] = insertKhmerZwsp(entry);
      } else {
        result[key] = applyZwspToUnknown(entry);
      }
    }
    return result as T;
  }

  return value;
}
