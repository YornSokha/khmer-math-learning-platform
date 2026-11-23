import { Kantumruy_Pro, Noto_Sans_Khmer } from "next/font/google";

export const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  display: "swap",
  variable: "--font-kantumruy-pro",
});

export const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer", "latin"],
  display: "swap",
  variable: "--font-noto-sans-khmer",
});
