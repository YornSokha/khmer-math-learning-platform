import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, getMessages, t, type MessageKey } from "./messages";

describe("UI messages dictionary", () => {
  it("defaults to Khmer locale", () => {
    expect(DEFAULT_LOCALE).toBe("km");
    expect(t("appTitle")).toBe("គណិតវិទ្យាខ្មែរ");
    expect(t("appTagline")).toBe("រៀនគណិតវិទ្យាតាមការអនុវត្តផ្ទាល់។");
    expect(getMessages()).toEqual(getMessages("km"));
  });

  it("provides full English developer/QA fallback parity for every UI key", () => {
    const km = getMessages("km");
    const en = getMessages("en");

    const kmKeys = Object.keys(km).sort();
    const enKeys = Object.keys(en).sort();

    expect(enKeys).toEqual(kmKeys);

    for (const key of kmKeys as MessageKey[]) {
      expect(km[key].trim().length).toBeGreaterThan(0);
      expect(en[key].trim().length).toBeGreaterThan(0);
      expect(t(key, "km")).toBe(km[key]);
      expect(t(key, "en")).toBe(en[key]);
    }
  });
});
