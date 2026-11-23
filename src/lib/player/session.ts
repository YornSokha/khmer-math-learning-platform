export interface LessonSessionState {
  lessonId: string;
  lessonVersion: number;
  stepIndex: number;
  sessionSeed: number;
  completedStepIds: string[];
  fixedMistakes: number;
  completed: boolean;
  updatedAt: string;
}

export const DEFAULT_SESSION_SEED = 101;

const sessionListeners = new Set<() => void>();
const snapshotCache = new Map<string, { raw: string | null; value: LessonSessionState }>();

export function getLessonSessionStorageKey(lessonId: string): string {
  return `khmer-math:lesson-session:${lessonId}`;
}

export function createInitialLessonSession(
  lessonId: string,
  lessonVersion: number,
  sessionSeed = DEFAULT_SESSION_SEED,
): LessonSessionState {
  return {
    lessonId,
    lessonVersion,
    stepIndex: 0,
    sessionSeed,
    completedStepIds: [],
    fixedMistakes: 0,
    completed: false,
    updatedAt: "",
  };
}

export function getStepSeed(sessionSeed: number, stepIndex: number): number {
  return sessionSeed * 31 + (stepIndex + 1) * 17;
}

function notifySessionListeners() {
  for (const listener of sessionListeners) {
    listener();
  }
}

function parseSession(
  raw: string | null,
  lessonId: string,
  lessonVersion: number,
  totalSteps: number,
): LessonSessionState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<LessonSessionState>;
    if (
      parsed.lessonId !== lessonId ||
      parsed.lessonVersion !== lessonVersion ||
      typeof parsed.stepIndex !== "number" ||
      !Number.isInteger(parsed.stepIndex) ||
      parsed.stepIndex < 0 ||
      parsed.stepIndex >= Math.max(1, totalSteps) ||
      typeof parsed.sessionSeed !== "number" ||
      !Array.isArray(parsed.completedStepIds) ||
      typeof parsed.fixedMistakes !== "number" ||
      typeof parsed.completed !== "boolean"
    ) {
      return null;
    }

    return {
      lessonId,
      lessonVersion,
      stepIndex: parsed.stepIndex,
      sessionSeed: parsed.sessionSeed,
      completedStepIds: parsed.completedStepIds.filter((x): x is string => typeof x === "string"),
      fixedMistakes: parsed.fixedMistakes,
      completed: parsed.completed,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function loadLessonSession(
  lessonId: string,
  lessonVersion: number,
  totalSteps: number,
): LessonSessionState {
  const key = getLessonSessionStorageKey(lessonId);
  let raw: string | null = null;

  if (typeof window !== "undefined") {
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
  }

  const cacheKey = `${lessonId}:${lessonVersion}:${totalSteps}`;
  const cached = snapshotCache.get(cacheKey);
  if (cached && cached.raw === raw) {
    return cached.value;
  }

  const value =
    parseSession(raw, lessonId, lessonVersion, totalSteps) ??
    createInitialLessonSession(lessonId, lessonVersion);

  snapshotCache.set(cacheKey, { raw, value });
  return value;
}

export function saveLessonSession(state: LessonSessionState): void {
  const key = getLessonSessionStorageKey(state.lessonId);
  const serialized = JSON.stringify({
    ...state,
    updatedAt: new Date().toISOString(),
  });

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, serialized);
    } catch {
      // Ignore restricted storage environments.
    }
  }

  snapshotCache.clear();
  notifySessionListeners();
}

export function clearLessonSession(lessonId: string): void {
  const key = getLessonSessionStorageKey(lessonId);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore restricted storage environments.
    }
  }

  snapshotCache.clear();
  notifySessionListeners();
}

export function subscribeLessonSession(lessonId: string, callback: () => void): () => void {
  sessionListeners.add(callback);

  if (typeof window === "undefined") {
    return () => {
      sessionListeners.delete(callback);
    };
  }

  const storageKey = getLessonSessionStorageKey(lessonId);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === storageKey) {
      snapshotCache.clear();
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    sessionListeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}
