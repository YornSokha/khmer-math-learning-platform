export const PROGRESS_DB_NAME = "khmer-math-progress";
export const PROGRESS_DB_VERSION = 1;
export const ATTEMPTS_STORE_NAME = "attempts";
export const COMPLETIONS_STORE_NAME = "completions";

export type SyncStatus = "pending" | "synced";

export interface StoredAttempt {
  clientEventId: string;
  lessonId: string;
  lessonVersion: number;
  stepId: string;
  correct: boolean;
  hintsUsed: number;
  misconceptionId?: string;
  durationMs: number;
  timestamp: string;
  syncStatus: SyncStatus;
}

export interface StoredLessonCompletion {
  lessonId: string;
  lessonVersion: number;
  stepsCompleted: number;
  fixedMistakes: number;
  completedAt: string;
}

export type AttemptSyncTransport = (attempts: StoredAttempt[]) => Promise<void>;

export interface SyncResult {
  syncedCount: number;
  remainingPendingCount: number;
}

function createClientEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openProgressDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(PROGRESS_DB_NAME, PROGRESS_DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ATTEMPTS_STORE_NAME)) {
          db.createObjectStore(ATTEMPTS_STORE_NAME, { keyPath: "clientEventId" });
        }
        if (!db.objectStoreNames.contains(COMPLETIONS_STORE_NAME)) {
          db.createObjectStore(COMPLETIONS_STORE_NAME, { keyPath: "lessonId" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function runTransaction<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = action(store);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function recordAttempt(
  attempt: Omit<StoredAttempt, "clientEventId" | "syncStatus"> & { clientEventId?: string },
): Promise<StoredAttempt> {
  const record: StoredAttempt = {
    ...attempt,
    clientEventId: attempt.clientEventId ?? createClientEventId(),
    syncStatus: "pending",
  };

  const db = await openProgressDb();
  if (!db) {
    return record;
  }

  try {
    await runTransaction(db, ATTEMPTS_STORE_NAME, "readwrite", (store) => store.put(record));
  } finally {
    db.close();
  }

  return record;
}

export async function getAllAttempts(): Promise<StoredAttempt[]> {
  const db = await openProgressDb();
  if (!db) {
    return [];
  }

  try {
    return await runTransaction<StoredAttempt[]>(db, ATTEMPTS_STORE_NAME, "readonly", (store) =>
      store.getAll(),
    );
  } finally {
    db.close();
  }
}

export async function getPendingAttempts(): Promise<StoredAttempt[]> {
  const all = await getAllAttempts();
  return all.filter((item) => item.syncStatus === "pending");
}

export async function recordLessonCompletion(
  completion: StoredLessonCompletion,
): Promise<StoredLessonCompletion> {
  const db = await openProgressDb();
  if (!db) {
    return completion;
  }

  try {
    await runTransaction(db, COMPLETIONS_STORE_NAME, "readwrite", (store) => store.put(completion));
  } finally {
    db.close();
  }

  return completion;
}

export async function getLessonCompletion(
  lessonId: string,
): Promise<StoredLessonCompletion | null> {
  const db = await openProgressDb();
  if (!db) {
    return null;
  }

  try {
    const result = await runTransaction<StoredLessonCompletion | undefined>(
      db,
      COMPLETIONS_STORE_NAME,
      "readonly",
      (store) => store.get(lessonId),
    );
    return result ?? null;
  } finally {
    db.close();
  }
}

/**
 * Idempotently syncs pending attempts via the provided transport.
 * Pending records are only marked `"synced"` after the transport succeeds,
 * so retries never lose data and repeated sync runs send zero duplicates.
 */
export async function syncPendingAttempts(transport: AttemptSyncTransport): Promise<SyncResult> {
  const pending = await getPendingAttempts();
  if (pending.length === 0) {
    return { syncedCount: 0, remainingPendingCount: 0 };
  }

  await transport(pending);

  const db = await openProgressDb();
  if (!db) {
    return { syncedCount: pending.length, remainingPendingCount: 0 };
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ATTEMPTS_STORE_NAME, "readwrite");
      const store = tx.objectStore(ATTEMPTS_STORE_NAME);
      for (const item of pending) {
        store.put({ ...item, syncStatus: "synced" satisfies SyncStatus });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }

  const remaining = await getPendingAttempts();
  return {
    syncedCount: pending.length,
    remainingPendingCount: remaining.length,
  };
}

export async function clearProgressDb(): Promise<void> {
  const db = await openProgressDb();
  if (!db) return;

  try {
    await runTransaction(db, ATTEMPTS_STORE_NAME, "readwrite", (store) => store.clear());
    await runTransaction(db, COMPLETIONS_STORE_NAME, "readwrite", (store) => store.clear());
  } finally {
    db.close();
  }
}
