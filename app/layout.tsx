import type { Metadata, Viewport } from "next";
import Script from "next/script";

import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import BottomNav from "@/components/BottomNav";
import LegalFooter from "@/components/LegalFooter";
import TopBar from "@/components/TopBar";
import { ThemeProvider } from "@/components/ThemeProvider";


import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://tamilring.in'),
  title: {
    default: "TamilRing - Mobile First Ringtones",
    template: "%s | TamilRing"
  },
  description: "Download high quality Tamil ringtones, BGM, and love songs. தமிழ் ரிங்டோன் தரவிறக்கம்.",
  keywords: [
    "tamil ringtones", "bgm download", "tamil cut songs", "latest tamil ringtones", "iphone ringtones",
    "love bgm", "mass bgm", "ringtone tamil", "தமிழ் ரிங்டோன்", "தமிழ் பிஜிஎம்",
    "tamil love songs", "south indian ringtones"
  ],
  openGraph: {
    title: 'TamilRing',
    description: 'Download high quality Tamil ringtones, BGM, and love songs.',
    url: 'https://tamilring.in',
    siteName: 'TamilRing',
    locale: 'en_US',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TamilRing",
  },
  formatDetection: {
    telephone: false,
  },
};

import Background from "@/components/Background";
import AuthCodeRedirect from "@/components/AuthCodeRedirect";
import ReloadOnUpdate from "@/components/ReloadOnUpdate";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} font-figtree antialiased scrollbar-hide bg-background text-foreground transition-colors duration-300`}>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-07CW71VTGB`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-07CW71VTGB');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <AuthCodeRedirect />
            <ReloadOnUpdate />
          </Suspense>
          {/* Aurora Background - Only visible in dark mode or adapted */}
          <div className="dark:block hidden">
            <Background />
          </div>

          <PlayerProvider>
            <FavoritesProvider>
              <TopBar />
              <main className="min-h-screen pt-14 pb-32 relative z-0">
                {children}
              </main>
              <div className="pb-24">
                <LegalFooter />
              </div>
              <BottomNav />
            </FavoritesProvider>
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
