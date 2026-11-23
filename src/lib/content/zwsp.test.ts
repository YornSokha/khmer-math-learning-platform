import { describe, expect, it } from "vitest";
import { applyZwspToUnknown, insertKhmerZwsp } from "./zwsp";

describe("Build-time Khmer ZWSP segmentation", () => {
  it("inserts zero-width spaces at Khmer word boundaries without duplicating them", () => {
    const segmented = insertKhmerZwsp("ម៉ាក់ត្រូវការចានដប់។");
    expect(segmented).toContain("\u200B");
    expect(segmented).not.toContain("\u200B\u200B");
    expect(segmented.replace(/\u200B/g, "")).toBe("ម៉ាក់ត្រូវការចានដប់។");

    // Idempotent when run twice
    expect(insertKhmerZwsp(segmented)).toBe(segmented);
  });

  it("preserves template placeholders and Latin text intact", () => {
    const input = "ម៉ាក់ត្រូវការចាន {total}។ មាន {given} ហើយ។";
    const segmented = insertKhmerZwsp(input);

    expect(segmented).toContain("{total}");
    expect(segmented).toContain("{given}");
    expect(segmented.replace(/\u200B/g, "")).toBe(input);
    expect(insertKhmerZwsp("Hello {name} 123")).toBe("Hello {name} 123");
  });

  it("recursively segments Khmer strings inside lesson-shaped objects", () => {
    const sample = {
      id: "g1-make-ten",
      title: { km: "បង្កើតដប់", en: "Make Ten" },
      steps: [{ id: "hook", text: { km: "រាប់ផ្លែស្វាយទាំងអស់។" } }],
    };

    const output = applyZwspToUnknown(sample);
    expect(output.id).toBe("g1-make-ten");
    expect(output.title.en).toBe("Make Ten");
    expect(output.steps[0]?.text.km).toContain("\u200B");
  });
});
