import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "គណិតវិទ្យាខ្មែរ",
    short_name: "គណិតវិទ្យា",
    description: "Interactive Khmer math learning platform for primary learners",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfcf8",
    theme_color: "#0f766e",
    lang: "km",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
