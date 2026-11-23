"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useActiveChild } from "@/components/parent/ActiveChildProvider";
import { t } from "@/lib/i18n/messages";
import { syncLocalAttemptsForChild } from "@/lib/storage/sync-client";

function subscribeOnlineStatus(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot(): boolean {
  if (typeof navigator === "undefined") {
    return true;
  }
  return navigator.onLine;
}

function getServerOnlineSnapshot(): boolean {
  return true;
}

export function OfflineStatusBanner() {
  const { activeChild } = useActiveChild();
  const isOnline = useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );

  useEffect(() => {
    if (!isOnline || !activeChild?.id) {
      return;
    }
    void syncLocalAttemptsForChild(activeChild.id);
  }, [isOnline, activeChild?.id]);

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="offline-status-banner"
      className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-khmer-body font-medium text-amber-950"
    >
      {t("offlineBannerMessage")}
    </div>
  );
}
