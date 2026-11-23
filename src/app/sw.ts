import { defaultCache } from "@serwist/next/worker";
import { Serwist, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
});

async function getOfflineFallbackResponse(): Promise<Response> {
  const offline = await serwist.matchPrecache("/offline");
  if (offline) {
    const html = await offline.text();
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return new Response("Offline", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    (async () => {
      const precached = await serwist.matchPrecache(url.pathname);
      if (precached) {
        return precached;
      }

      if (!self.navigator.onLine) {
        return getOfflineFallbackResponse();
      }

      try {
        return await fetch(event.request);
      } catch {
        return getOfflineFallbackResponse();
      }
    })(),
  );
});

serwist.addEventListeners();
