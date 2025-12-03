import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import StickyPlayer from "@/components/StickyPlayer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TamilRing - Mobile First Ringtones",
  description: "Download high quality ringtones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-900 text-zinc-100 antialiased pb-24`}>
        <PlayerProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <StickyPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
