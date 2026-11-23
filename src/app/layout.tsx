import type { Metadata } from "next";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { OfflineStatusBanner } from "@/components/offline/OfflineStatusBanner";
import { ActiveChildProvider } from "@/components/parent/ActiveChildProvider";
import { t } from "@/lib/i18n/messages";
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
        <a
          href="#main-content"
          data-testid="skip-to-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:inline-flex focus:min-h-touch focus:items-center focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-khmer-body focus:font-semibold focus:text-white focus:shadow-md"
        >
          {t("a11ySkipToContent")}
        </a>
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
