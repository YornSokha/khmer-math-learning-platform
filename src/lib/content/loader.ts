import fs from "node:fs";
import path from "node:path";
import { isLessonPublishable, parseLessonYaml, type Lesson } from "./schema";
import { applyZwspToUnknown } from "./zwsp";

export const DEFAULT_LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

export interface FileValidationError {
  filePath: string;
  errors: string[];
}

export interface DirectoryValidationResult {
  valid: boolean;
  lessons: Lesson[];
  failures: FileValidationError[];
}

export function loadLessonFromFile(filePath: string):
  | {
      success: true;
      lesson: Lesson;
    }
  | {
      success: false;
      errors: string[];
    } {
  const source = fs.readFileSync(filePath, "utf8");
  const parsed = parseLessonYaml(source);
  if (!parsed.success) {
    return parsed;
  }

  return {
    success: true,
    lesson: applyZwspToUnknown(parsed.lesson),
  };
}

export function validateLessonsInDirectory(
  lessonsDir: string = DEFAULT_LESSONS_DIR,
): DirectoryValidationResult {
  if (!fs.existsSync(lessonsDir)) {
    return {
      valid: false,
      lessons: [],
      failures: [{ filePath: lessonsDir, errors: ["Lessons directory does not exist"] }],
    };
  }

  const entries = fs
    .readdirSync(lessonsDir)
    .filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))
    .sort();

  if (entries.length === 0) {
    return {
      valid: false,
      lessons: [],
      failures: [{ filePath: lessonsDir, errors: ["No lesson YAML files found"] }],
    };
  }

  const lessons: Lesson[] = [];
  const failures: FileValidationError[] = [];
  const seenLessonIds = new Map<string, string>();

  for (const filename of entries) {
    const filePath = path.join(lessonsDir, filename);
    const result = loadLessonFromFile(filePath);
    if (!result.success) {
      failures.push({ filePath, errors: result.errors });
      continue;
    }

    const duplicateFile = seenLessonIds.get(result.lesson.id);
    if (duplicateFile) {
      failures.push({
        filePath,
        errors: [`Duplicate lesson id "${result.lesson.id}" already defined in ${duplicateFile}`],
      });
      continue;
    }

    seenLessonIds.set(result.lesson.id, filename);
    lessons.push(result.lesson);
  }

  return {
    valid: failures.length === 0,
    lessons,
    failures,
  };
}

export function getAllLessons(lessonsDir: string = DEFAULT_LESSONS_DIR): Lesson[] {
  const result = validateLessonsInDirectory(lessonsDir);
  if (!result.valid) {
    const detail = result.failures
      .map((f) => `${f.filePath}:\n  - ${f.errors.join("\n  - ")}`)
      .join("\n");
    throw new Error(`Invalid lesson content detected:\n${detail}`);
  }
  return result.lessons;
}

export function getPublishedLessons(lessonsDir: string = DEFAULT_LESSONS_DIR): Lesson[] {
  return getAllLessons(lessonsDir).filter(isLessonPublishable);
}

export function getLessonById(
  lessonId: string,
  lessonsDir: string = DEFAULT_LESSONS_DIR,
): Lesson | null {
  const lessons = getAllLessons(lessonsDir);
  return lessons.find((lesson) => lesson.id === lessonId) ?? null;
}
