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
  { label: "70s", query: "1970-1979", color: "from-yellow-600 via-orange-600 to-red-700", startYear: 1970, endYear: 1979 },
  { label: "80s", query: "1980-1989", color: "from-fuchsia-500 via-purple-600 to-indigo-600", startYear: 1980, endYear: 1989 },
  { label: "90s", query: "1990-1999", color: "from-blue-600 via-indigo-600 to-purple-700", startYear: 1990, endYear: 1999 },
  { label: "2ks", query: "2000-2009", color: "from-cyan-500 via-blue-500 to-sky-600", startYear: 2000, endYear: 2009 },
  { label: "2k10s", query: "2010-2019", color: "from-teal-500 via-emerald-500 to-green-600", startYear: 2010, endYear: 2019 },
  { label: "2k20s", query: "2020-2029", color: "from-zinc-700 via-slate-800 to-zinc-950", startYear: 2020, endYear: 2029 },
];

export const INSTRUMENTS = [
  { label: "Flute", query: "flute" },
  { label: "Violin", query: "violin" },
  { label: "Guitar", query: "guitar" },
  { label: "Piano", query: "piano" },
  { label: "Whistle", query: "whistle" },
  { label: "Sax", query: "saxophone" },
  { label: "Veena", query: "veena" },
  { label: "Trumpet", query: "trumpet" }
];

export const DEITY_CATEGORIES = {
  "Hindu": [
    "Ayyappan",
    "Murugan",
    "Vinayagar",
    "Siva",
    "Vishnu",
    "Amman",
    "Krishna",
    "Rama",
    "Hanuman",
    "Karuppusamy",
    "Perumal",
    "Mariamman",
    "Kali"
  ],
  "Christian": ["Jesus", "Mary", "Saint"],
  "Muslim": ["Allah"],
  "Other": ["Buddha", "Mahavira", "Other"]
};

// Helper function to get artist bio (Placeholder for now as we don't have a bio DB)
export function getArtistBio(artistName: string): string | undefined {
  return undefined;
}

