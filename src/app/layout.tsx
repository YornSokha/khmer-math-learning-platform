import type { Metadata } from "next";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { OfflineStatusBanner } from "@/components/offline/OfflineStatusBanner";
import { ActiveChildProvider } from "@/components/parent/ActiveChildProvider";
import { kantumruyPro, notoSansKhmer } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "គណិតវិទ្យាខ្មែរ",
  description: "Interactive Khmer math learning platform for children",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" className={`${kantumruyPro.variable} ${notoSansKhmer.variable}`}>
      <body className="min-h-screen bg-surface font-sans text-khmer-body text-ink antialiased">
        <NumeralPreferenceProvider>
          <ActiveChildProvider>
            <OfflineStatusBanner />
            {children}
          </ActiveChildProvider>
        </NumeralPreferenceProvider>
      </body>
    </html>
  );
}
