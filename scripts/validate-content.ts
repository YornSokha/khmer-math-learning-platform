import path from "node:path";
import { DEFAULT_LESSONS_DIR, validateLessonsInDirectory } from "../src/lib/content/loader";
import { isLessonPublishable } from "../src/lib/content/schema";

const targetArg = process.argv[2];
const targetDir = targetArg ? path.resolve(process.cwd(), targetArg) : DEFAULT_LESSONS_DIR;

const result = validateLessonsInDirectory(targetDir);

if (!result.valid) {
  console.error(`Lesson content validation failed (${result.failures.length} file(s)):\n`);
  for (const failure of result.failures) {
    console.error(`✖ ${failure.filePath}`);
    for (const error of failure.errors) {
      console.error(`  - ${error}`);
    }
  }
  process.exit(1);
}

console.log(`✓ Validated ${result.lessons.length} lesson file(s) in ${targetDir}`);
for (const lesson of result.lessons) {
  const publishState = isLessonPublishable(lesson) ? "publishable" : "draft";
  console.log(
    `  - ${lesson.id} (v${lesson.version}, G${lesson.grade}, ${lesson.steps.length} steps, math=${lesson.reviewStatus.math}, khmer=${lesson.reviewStatus.khmer} -> ${publishState})`,
  );
}
