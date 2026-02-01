
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online Ringtone Cutter - Trim Audio & Make Ringtones Free",
    description: "Free online Ringtone Cutter & Audio Trimmer. Cut MP3, WAV, M4A files to create ringtones for iPhone & Android. Easy, fast, and secure processing in your browser.",
    keywords: ["ringtone cutter", "audio trimmer", "mp3 cutter", "cut mp3", "iphone ringtone maker", "android ringtone maker", "trim audio online"],
    openGraph: {
        title: "Online Ringtone Cutter - TamilRing Studio",
        description: "Create custom ringtones in seconds. precise cutting, fade effects, and AI tools.",
        type: "website",
    },
};

export default function TrimLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
