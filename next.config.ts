import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision = crypto.randomUUID();

function discoverLessonPrecacheEntries() {
  const lessonsDir = path.join(process.cwd(), "content", "lessons");
  if (!fs.existsSync(lessonsDir)) {
    return [];
  }

  return fs
    .readdirSync(lessonsDir)
    .filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))
    .sort()
    .map((filename) => {
      const content = fs.readFileSync(path.join(lessonsDir, filename), "utf8");
      const match = content.match(/^id:\s*([a-z0-9-]+)\s*$/m);
      const id = match?.[1] ?? filename.replace(/\.ya?ml$/, "");
      return { url: `/lessons/${id}`, revision };
    });
}

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    { url: "/", revision },
    { url: "/offline", revision },
    ...discoverLessonPrecacheEntries(),
  ],
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
