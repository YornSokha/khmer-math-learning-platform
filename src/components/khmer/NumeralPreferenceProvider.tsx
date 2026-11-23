"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEFAULT_NUMERAL_SYSTEM, type NumeralSystem } from "@/lib/khmer/numerals";

export const NUMERAL_PREFERENCE_STORAGE_KEY = "khmer-math:numeral-system";

export interface NumeralPreferenceContextValue {
  numeralSystem: NumeralSystem;
  setNumeralSystem: (system: NumeralSystem) => void;
  toggleNumeralSystem: () => void;
}

const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function isNumeralSystem(value: string | null): value is NumeralSystem {
  return value === "khmer" || value === "arabic";
}

function readStoredNumeralSystem(): NumeralSystem | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(NUMERAL_PREFERENCE_STORAGE_KEY);
    return isNumeralSystem(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredNumeralSystem(system: NumeralSystem): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(NUMERAL_PREFERENCE_STORAGE_KEY, system);
  } catch {
    // Ignore storage write errors in private or restricted browser contexts.
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
    if (event.key === null || event.key === NUMERAL_PREFERENCE_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

const defaultContextValue: NumeralPreferenceContextValue = {
  numeralSystem: DEFAULT_NUMERAL_SYSTEM,
  setNumeralSystem: () => {},
  toggleNumeralSystem: () => {},
};

const NumeralPreferenceContext = createContext<NumeralPreferenceContextValue>(defaultContextValue);

export interface NumeralPreferenceProviderProps {
  children: ReactNode;
  initialNumeralSystem?: NumeralSystem;
}

export function NumeralPreferenceProvider({
  children,
  initialNumeralSystem = DEFAULT_NUMERAL_SYSTEM,
}: NumeralPreferenceProviderProps) {
  const [inMemoryOverride, setInMemoryOverride] = useState<NumeralSystem | null>(null);

  const getSnapshot = useCallback((): NumeralSystem => {
    return readStoredNumeralSystem() ?? inMemoryOverride ?? initialNumeralSystem;
  }, [inMemoryOverride, initialNumeralSystem]);

  const getServerSnapshot = useCallback((): NumeralSystem => {
    return initialNumeralSystem;
  }, [initialNumeralSystem]);

  const numeralSystem = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setNumeralSystem = useCallback((nextSystem: NumeralSystem) => {
    setInMemoryOverride(nextSystem);
    writeStoredNumeralSystem(nextSystem);
    notifyListeners();
  }, []);

  const toggleNumeralSystem = useCallback(() => {
    const nextSystem: NumeralSystem = numeralSystem === "khmer" ? "arabic" : "khmer";
    setNumeralSystem(nextSystem);
  }, [numeralSystem, setNumeralSystem]);

  const value = useMemo<NumeralPreferenceContextValue>(
    () => ({
      numeralSystem,
      setNumeralSystem,
      toggleNumeralSystem,
    }),
    [numeralSystem, setNumeralSystem, toggleNumeralSystem],
  );

  return (
    <NumeralPreferenceContext.Provider value={value}>{children}</NumeralPreferenceContext.Provider>
  );
}

export function useNumeralPreference(): NumeralPreferenceContextValue {
  return useContext(NumeralPreferenceContext);
}
