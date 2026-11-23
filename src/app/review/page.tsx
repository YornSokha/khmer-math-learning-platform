import { SpacedReviewPlayer } from "@/components/review/SpacedReviewPlayer";
import { getAllLessons } from "@/lib/content/loader";

export default function ReviewPage() {
  const lessons = getAllLessons();
  return <SpacedReviewPlayer lessons={lessons} />;
}
