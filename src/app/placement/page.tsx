import { PlacementCheck } from "@/components/path/PlacementCheck";
import { getAllLessons } from "@/lib/content/loader";

export default function PlacementPage() {
  const lessons = getAllLessons().map((lesson, idx) => ({
    id: lesson.id,
    order: lesson.order ?? idx + 1,
    titleKm: lesson.title.km,
    moeysRef: lesson.moeysRef,
    estimatedMinutes: lesson.estimatedMinutes,
    skills: lesson.skills,
  }));

  return <PlacementCheck lessons={lessons} />;
}
