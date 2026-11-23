import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  getAllLessons,
  getLessonById,
  getPublishedLessons,
  validateLessonsInDirectory,
} from "./loader";

const tempDirs: string[] = [];

function createTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "khmer-math-lessons-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("Lesson content loader", () => {
  it("loads and segments all 12 ordered Grade 1 curriculum lessons with ZWSP", () => {
    const all = getAllLessons();
    expect(all).toHaveLength(12);
    expect(all[0]?.id).toBe("g1-01-subitize-1-5");
    expect(all[4]?.id).toBe("g1-make-ten");
    expect(all[11]?.id).toBe("g1-12-riel-money");
    expect(all.map((lesson) => lesson.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    const makeTen = getLessonById("g1-make-ten");
    expect(makeTen).not.toBeNull();
    expect(makeTen?.steps).toHaveLength(8);
    expect(makeTen?.title.km).toContain("\u200B");

    // Draft Khmer lessons remain excluded from published list until teacher checkpoint
    const published = getPublishedLessons();
    expect(published.some((l) => l.id === "g1-make-ten")).toBe(false);
  });

  it("reports clear validation errors for invalid lesson fixtures", () => {
    const dir = createTempDir();
    fs.writeFileSync(
      path.join(dir, "broken.yaml"),
      `
id: g1-broken
version: 1
title: { km: "សាកល្បង" }
grade: 1
strand: number-sense
moeysRef: ["G1-U1"]
skills: [test]
estimatedMinutes: 5
steps:
  - id: bad-math
    type: activity
    activity: equation-fill
    mode: solve
    prompt: { km: "រកលេខ" }
    params:
      a: { randInt: [1, 5] }
    answer:
      kind: equals
      expr: "a / 2"
    feedback:
      correct: { km: "ត្រូវ" }
    hints:
      - km: "សាកម្តងទៀត"
review:
  items: [bad-math]
reviewStatus:
  math: draft
  khmer: draft
`,
      "utf8",
    );

    const result = validateLessonsInDirectory(dir);
    expect(result.valid).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]?.errors.join("\n")).toMatch(/non-integer/);
  });
});
