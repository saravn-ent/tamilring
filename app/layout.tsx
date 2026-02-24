import type { Metadata, Viewport } from "next";
import Script from "next/script";


import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { LanguageProvider } from "@/context/LanguageContext";
import BottomNav from "@/components/BottomNav";
import BackToTop from "@/components/BackToTop";
import LegalFooter from "@/components/LegalFooter";
import SiteHeader from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { generateBaseMetadata } from "@/lib/seo";

import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
});

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
import ThemeFix from "@/components/ThemeFix";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical external domains for faster loading */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8222339857289632"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body
        className={`${jakarta.className} font-sans antialiased scrollbar-hide transition-colors duration-300 bg-background text-foreground`}
        suppressHydrationWarning
      >
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --font-jakarta: ${jakarta.style.fontFamily};
            --font-display: ${jakarta.style.fontFamily};
            --font-sans: ${jakarta.style.fontFamily};
          }
        `}} />
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-07CW71VTGB`}
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-07CW71VTGB');
          `}
        </Script>
        <Script
          id="microsoft-clarity"
          strategy="lazyOnload"
        >
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uwj430adcz");
          `}
        </Script>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemeFix />

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
                <SiteHeader />
                <MainLayout>
                  {children}
                </MainLayout>
                <div className="pb-20">
                  <LegalFooter />
                </div>
                <BackToTop />
                <BottomNav />
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
