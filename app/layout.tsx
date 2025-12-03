import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

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
      <body className={`${inter.className} bg-neutral-900 text-zinc-100 antialiased`}>
        <PlayerProvider>
          <TopBar />
          <main className="min-h-screen pt-14 pb-32">
            {children}
          </main>
          <BottomNav />
        </PlayerProvider>
      </body>
    </html>
  );
}
