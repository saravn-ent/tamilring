import type { Metadata, Viewport } from "next";


import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { LanguageProvider } from "@/context/LanguageContext";
import BottomNav from "@/components/BottomNav";
import BackToTop from "@/components/BackToTop";
import LegalFooter from "@/components/LegalFooter";
import SiteHeader from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/context/ToastContext";
import { generateBaseMetadata } from "@/lib/seo";
import ThirdPartyScripts from "@/components/ThirdPartyScripts";



export const viewport: Viewport = {
  themeColor: "#F92445",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};



import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/structured-data";
import StructuredData from "@/components/StructuredData";

// Enhanced metadata using our SEO system
export const metadata: Metadata = {
  ...generateBaseMetadata(),
  title: {
    default: "TamilRing - Download Best Tamil Ringtones & BGM",
    template: "%s | TamilRing",
  },
};

import Background from "@/components/Background";
import AuthCodeRedirect from "@/components/AuthCodeRedirect";
import ReloadOnUpdate from "@/components/ReloadOnUpdate";
import { Suspense } from "react";
import MainLayout from "@/components/MainLayout";

// Force Rebuild - Fix Hydration V2
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="ta" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical external domains for faster loading */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body
        className="font-sans antialiased scrollbar-hide transition-colors duration-300 bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThirdPartyScripts />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
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
              <LanguageProvider>
                <ToastProvider>
                  <SiteHeader />
                  <MainLayout>
                    {children}
                  </MainLayout>
                  <LegalFooter />
                  <BackToTop />
                  <BottomNav />
                </ToastProvider>
              </LanguageProvider>
            </FavoritesProvider>
          </PlayerProvider>
          {/* Global Schemas for SEO/AEO */}
          <StructuredData data={orgSchema} />
          <StructuredData data={websiteSchema} />
        </ThemeProvider>
      </body>
    </html>
  );
}
