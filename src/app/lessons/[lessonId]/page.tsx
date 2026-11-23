import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/player/LessonPlayer";
import { getAllLessons, getLessonById } from "@/lib/content/loader";

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ lessonId: lesson.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  return <LessonPlayer lesson={lesson} />;
}
