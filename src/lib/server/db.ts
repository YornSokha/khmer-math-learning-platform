import { MemoryDataStore } from "./memory-store";
import { PrismaDataStore } from "./prisma-store";
import type { DataStore } from "./store";

const globalForStore = globalThis as unknown as {
  __khmerMathDataStore?: DataStore;
  __khmerMathTestStore?: DataStore | null;
};

export function getDataStore(): DataStore {
  if (globalForStore.__khmerMathTestStore) {
    return globalForStore.__khmerMathTestStore;
  }

  if (!globalForStore.__khmerMathDataStore) {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    if (databaseUrl) {
      globalForStore.__khmerMathDataStore = new PrismaDataStore(databaseUrl);
    } else {
      globalForStore.__khmerMathDataStore = new MemoryDataStore();
    }
  }

  return globalForStore.__khmerMathDataStore;
}

export function setDataStoreForTesting(store: DataStore | null): void {
  globalForStore.__khmerMathTestStore = store;
}
