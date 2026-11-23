import { DailyChallengePlayer } from "@/components/review/DailyChallengePlayer";
import { getAllLessons } from "@/lib/content/loader";

export default function DailyChallengePage() {
  const lessons = getAllLessons();
  return <DailyChallengePlayer lessons={lessons} />;
}
