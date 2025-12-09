import type { Metadata, Viewport } from "next";
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
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "TamilRing - Mobile First Ringtones",
  description: "Download high quality ringtones.",
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
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} font-figtree antialiased scrollbar-hide bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <AuthCodeRedirect />
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
