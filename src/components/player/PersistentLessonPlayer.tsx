"use client";

import { useCallback, useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import {
  LessonPlayer,
  type LessonAttemptEvent,
  type LessonCompletionEvent,
} from "@/components/player/LessonPlayer";
import type { Lesson } from "@/lib/content/schema";
import { t } from "@/lib/i18n/messages";
import { recordAttempt, recordLessonCompletion } from "@/lib/storage/progress-db";

export interface PersistentLessonPlayerProps {
  lesson: Lesson;
}

export function PersistentLessonPlayer({ lesson }: PersistentLessonPlayerProps) {
  const [savedAttempts, setSavedAttempts] = useState(0);
  const [completionSaved, setCompletionSaved] = useState(false);

  const handleAttempt = useCallback((attempt: LessonAttemptEvent) => {
    void recordAttempt(attempt).then(() => {
      setSavedAttempts((count) => count + 1);
    });
  }, []);

  const handleComplete = useCallback((summary: LessonCompletionEvent) => {
    void recordLessonCompletion(summary).then(() => {
      setCompletionSaved(true);
    });
  }, []);

  return (
    <div className="pb-6">
      <LessonPlayer lesson={lesson} onAttempt={handleAttempt} onComplete={handleComplete} />
      {savedAttempts > 0 && (
        <p
          data-testid="local-progress-indicator"
          data-completion-saved={completionSaved ? "true" : "false"}
          className="mx-auto max-w-xl px-4 text-center text-sm text-ink-muted"
        >
          {t("progressSavedLocally")} (<FormattedNumber value={savedAttempts} />)
        </p>
      )}
    </div>
  );
}
