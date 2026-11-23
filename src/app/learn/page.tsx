import { LearningPathView } from "@/components/path/LearningPathView";
import { getAllLessons } from "@/lib/content/loader";

export default function LearnPage() {
  const lessons = getAllLessons().map((lesson, idx) => ({
    id: lesson.id,
    order: lesson.order ?? idx + 1,
    titleKm: lesson.title.km,
    moeysRef: lesson.moeysRef,
    estimatedMinutes: lesson.estimatedMinutes,
    skills: lesson.skills,
  }));

  return <LearningPathView lessons={lessons} />;
}
