"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n/messages";
import { getLessonCompletion } from "@/lib/storage/progress-db";

export function LessonCompletionBadge({ lessonId }: { lessonId: string }) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    void getLessonCompletion(lessonId).then((record) => {
      if (active && record) {
        setCompleted(true);
      }
    });
    return () => {
      active = false;
    };
  }, [lessonId]);

  if (!completed) {
    return null;
  }

  return (
    <p
      data-testid={`lesson-completed-badge-${lessonId}`}
      className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-center text-sm font-semibold text-emerald-900"
    >
      ✓ {t("lessonCompletedBadge")}
    </p>
  );
}
