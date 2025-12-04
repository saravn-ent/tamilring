import type { Metadata } from "next";
import { Inter, Hind_Madurai } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const hindMadurai = Hind_Madurai({
  weight: ['400', '500', '600', '700'],
  subsets: ['tamil', 'latin'],
  variable: '--font-hind'
});

export const metadata: Metadata = {
  title: "TamilRing - Mobile First Ringtones",
  description: "Download high quality ringtones.",
};

import Background from "@/components/Background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${hindMadurai.variable} font-sans text-zinc-100 antialiased scrollbar-hide bg-black`}>
        {/* Aurora Background */}
        <Background />

        <PlayerProvider>
          <FavoritesProvider>
            <TopBar />
            <main className="min-h-screen pt-14 pb-32 relative z-0">
              {children}
            </main>
            <BottomNav />
          </FavoritesProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
