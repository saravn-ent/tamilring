export const MOODS = ["Love", "Mass", "Sad", "BGM", "Funny", "Melody", "Remix", "Devotional"];
export const COLLECTIONS = [
  { label: "Mom", emoji: "❤️" },
  { label: "Dad", emoji: "👨‍👧" },
  { label: "Love", emoji: "💑" },
  { label: "Bestie", emoji: "👯" },
  { label: "Brother", emoji: "👫" },
  { label: "Sister", emoji: "👭" }
];

export const ERAS = [
  { label: "70s", query: "1970-1979", color: "from-amber-700 to-orange-900", startYear: 1970, endYear: 1979 },
  { label: "80s", query: "1980-1989", color: "from-pink-700 to-rose-900", startYear: 1980, endYear: 1989 },
  { label: "90s", query: "1990-1999", color: "from-purple-700 to-indigo-900", startYear: 1990, endYear: 1999 },
  { label: "2ks", query: "2000-2009", color: "from-blue-700 to-cyan-900", startYear: 2000, endYear: 2009 },
  { label: "2k10s", query: "2010-2019", color: "from-emerald-700 to-teal-900", startYear: 2010, endYear: 2019 },
  { label: "2k20s", query: "2020-2029", color: "from-neutral-700 to-zinc-900", startYear: 2020, endYear: 2029 },
];

// Helper function to get artist bio (Placeholder for now as we don't have a bio DB)
export function getArtistBio(artistName: string): string | undefined {
  return undefined;
}
