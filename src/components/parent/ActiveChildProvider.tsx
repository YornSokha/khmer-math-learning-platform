"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import type { PublicChildProfile } from "@/lib/server/store";

export const ACTIVE_CHILD_STORAGE_KEY = "khmer-math:active-child:v1";

export interface ActiveChildContextValue {
  activeChild: PublicChildProfile | null;
  setActiveChild: (child: PublicChildProfile | null) => void;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined = undefined;
let cachedParsed: PublicChildProfile | null = null;

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function readStoredActiveChild(): PublicChildProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_CHILD_STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedParsed;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedParsed = null;
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<PublicChildProfile>;
    if (
      typeof parsed.id === "string" &&
      typeof parsed.nickname === "string" &&
      typeof parsed.avatarId === "string" &&
      typeof parsed.grade === "number" &&
      (parsed.numeralPref === "khmer" || parsed.numeralPref === "arabic")
    ) {
      cachedParsed = parsed as PublicChildProfile;
      return cachedParsed;
    }
    cachedParsed = null;
    return null;
  } catch {
    cachedRaw = null;
    cachedParsed = null;
    return null;
  }
}

function writeStoredActiveChild(child: PublicChildProfile | null): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!child) {
      window.localStorage.removeItem(ACTIVE_CHILD_STORAGE_KEY);
      cachedRaw = null;
      cachedParsed = null;
    } else {
      const serialized = JSON.stringify(child);
      window.localStorage.setItem(ACTIVE_CHILD_STORAGE_KEY, serialized);
      cachedRaw = serialized;
      cachedParsed = child;
    }
  } catch {
    // Ignore storage write errors in private contexts.
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  if (typeof window === "undefined") {
    return () => {
      listeners.delete(callback);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ACTIVE_CHILD_STORAGE_KEY) {
      cachedRaw = undefined;
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

const defaultContextValue: ActiveChildContextValue = {
  activeChild: null,
  setActiveChild: () => {},
};

const ActiveChildContext = createContext<ActiveChildContextValue>(defaultContextValue);

export function ActiveChildProvider({ children }: { children: ReactNode }) {
  const { setNumeralSystem } = useNumeralPreference();
  const activeChild = useSyncExternalStore(subscribe, readStoredActiveChild, () => null);

  const setActiveChild = useCallback(
    (child: PublicChildProfile | null) => {
      writeStoredActiveChild(child);
      if (child) {
        setNumeralSystem(child.numeralPref);
      }
      notifyListeners();
    },
    [setNumeralSystem],
  );

  const value = useMemo<ActiveChildContextValue>(
    () => ({
      activeChild,
      setActiveChild,
    }),
    [activeChild, setActiveChild],
  );

  return <ActiveChildContext.Provider value={value}>{children}</ActiveChildContext.Provider>;
}

export function useActiveChild(): ActiveChildContextValue {
  return useContext(ActiveChildContext);
}
