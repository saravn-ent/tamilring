export const MOODS = ["Love", "Mass", "Sad", "BGM", "Funny", "Melody", "Remix", "Devotional", "Motivational"];
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
  { label: "Trumpet", query: "trumpet" },
  { label: "Keyboard", query: "keyboard" },
  { label: "Drums", query: "drums" },
  { label: "Nadaswaram", query: "nadaswaram" }
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
    "Kali",
    "Durga",
    "Lakshmi",
    "Saraswathi",
    "Sai Baba",
    "Bairavar",
    "Muniswaran",
    "Muthumariamman",
    "Narasimha",
    "Ranganathar",
    "Venkateswara",
    "Ambedkar",
    "Natarajar",
    "Dakshinamurthy"
  ],
  "Christian": [
    "Jesus",
    "Mother Mary",
    "Velankanni Matha"
  ],
  "Muslim": [
    "Allah",
    "Nagore Andavar",
    "Prophet Muhammad"
  ],
  "Buddhist & Jain": [
    "Buddha",
    "Mahavira"
  ]
};

// Helper function to get artist bio (Placeholder for now as we don't have a bio DB)
export function getArtistBio(artistName?: string): string | undefined {
  void artistName;
  return undefined;
}

export const TOP_ACTORS_BY_LANGUAGE: Record<string, string[]> = {
  tamil: [
    'Vijay', 'Ajith Kumar', 'Rajinikanth', 'Suriya', 'Dhanush',
    'Sivakarthikeyan', 'Vikram', 'Kamal Haasan', 'Vijay Sethupathi', 'Karthi',
    'Silambarasan TR', 'Jayam Ravi', 'Arun Vijay', 'Arya', 'Vishal', 'Mamitha Baiju'
  ]
};

export const TOP_SINGERS_BY_LANGUAGE: Record<string, string[]> = {
  tamil: [
    'Anirudh Ravichander', 'A.R. Rahman', 'S.P. Balasubrahmanyam', 'Ilayaraja',
    'K.S. Chithra', 'Sid Sriram', 'Dhanush', 'Hariharan', 'Shreya Ghoshal',
    'Vijay Yesudas', 'Chinmayi Sripaada Prarthana', 'Chinmayi Sripaada'
  ]
};

export const TOP_MUSIC_DIRECTORS_BY_LANGUAGE: Record<string, string[]> = {
  tamil: [
    'Anirudh Ravichander', 'A.R. Rahman', 'Ilayaraja', 'Yuvan Shankar Raja',
    'Harris Jayaraj', 'Santhosh Narayanan', 'G.V. Prakash Kumar', 'D. Imman',
    'Hiphop Tamizha', 'Sam C.S.'
  ]
};

export const TOP_FEMALE_SINGERS_BY_LANGUAGE: Record<string, string[]> = {
  tamil: [
    'K.S. Chithra', 'Shreya Ghoshal', 'Chinmayi Sripaada', 'Sujatha Mohan',
    'Jonita Gandhi', 'Saindhavi', 'Shashaa Tirupati', 'Prarthana', 'Chinmayi Sripaada Prarthana'
  ]
};

export type ArtistRole = 'Music Director' | 'Singer' | 'Actor' | 'Movie Director' | 'Lyricist' | 'Deity';

const KNOWN_MUSIC_DIRECTORS = new Set([
  'a.r. rahman', 'a. r. rahman', 'ar rahman', 'rahman',
  'ilaiyaraaja', 'ilayaraja', 'raaja', 'isaignani',
  'anirudh ravichander', 'anirudh', 'rockstar anirudh',
  'yuvan shankar raja', 'yuvan', 'u1',
  'harris jayaraj', 'harris',
  'santhosh narayanan', 'sana',
  'g.v. prakash kumar', 'g.v. prakash', 'gv prakash kumar', 'gv prakash',
  'd. imman', 'imman',
  'vidyasagar', 'deva', 'thenisai thendral deva',
  'hiphop tamizha', 'adhi', 'hiphop aadhi',
  'sam c.s.', 'sam cs',
  'sean roldan',
  'vijay antony',
  'leon james',
  'justin prabhakaran',
  'nivas k. prasanna', 'nivas k prasanna',
  'ghibran', 'mohammad ghibran',
  's. thaman', 'thaman s', 'thaman',
  'devi sri prasad', 'dsp',
  'm.m. keeravani', 'm. m. keeravani', 'keeravani', 'maragathamani',
  'm.s. viswanathan', 'm. s. viswanathan', 'msv',
  'k.v. mahadevan', 't. rajendar', 'gangai amaran',
  'sirpy', 'soundaryan', 'bharadwaj', 'mani sharma',
  'dharan kumar', 'jassie gift', 'siddharth vipin', 'vishal chandrashekhar',
  'govind vasantha', 'kabir suman', 'pradeep kumar', 'karthik raja'
]);

const KNOWN_ACTORS = new Set([
  'vijay', 'joseph vijay', 'thalapathy vijay', 'thalapathy',
  'rajinikanth', 'superstar rajinikanth', 'superstar',
  'ajith kumar', 'ajith', 'thala ajith', 'thala',
  'suriya', 'suriya sivakumar',
  'dhanush',
  'sivakarthikeyan', 'sk',
  'vikram', 'chiyaan vikram', 'chiyaan',
  'kamal haasan', 'kamal hassan', 'kamal', 'ulaganayagan',
  'vijay sethupathi', 'makkal selvan',
  'karthi', 'karthik sivakumar',
  'silambarasan tr', 'silambarasan', 'simbu', 'str',
  'jayam ravi', 'arun vijay', 'arya', 'vishal', 'jiiva',
  'santhanam', 'vadivelu', 'goundamani', 'senthil', 'vivek',
  'nayanthara', 'lady superstar', 'trisha', 'trisha krishnan',
  'samantha', 'keerthy suresh', 'sai pallavi', 'rashmika mandanna',
  'tamannaah', 'kajal aggarwal', 'priya bhavani shankar', 'aishwarya rajesh',
  'mamitha baiju', 'fahadh faasil', 'prithviraj'
]);

const KNOWN_DIRECTORS = new Set([
  'mani ratnam', 'maniratnam',
  'shankar', 's. shankar',
  'lokesh kanagaraj', 'lokesh',
  'nelson dilipkumar', 'nelson',
  'vetrimaaran', 'vetri maaran',
  'atlee', 'atlee kumar',
  'h. vinoth', 'h vinoth',
  'pa. ranjith', 'pa ranjith',
  'gautham vasudev menon', 'gautham menon', 'gvm',
  'karthik subbaraj',
  'a.r. murugadoss', 'ar murugadoss',
  'k.s. ravikumar', 'ks ravikumar',
  'bala', 'selvaraghavan', 'venkat prabhu',
  'mysskin', 'mari selvaraj', 'sudha kongara',
  'pradeep ranganathan', 'madonne ashwin', 'cibi chakravarthi',
  'ps mithran', 'p.s. mithran', 'mohan g', 'ajay gnanamuthu'
]);

const KNOWN_LYRICISTS = new Set([
  'vairamuthu', 'kaviperarasu vairamuthu',
  'na. muthukumar', 'na muthukumar',
  'vaali', 'kavignar vaali',
  'kabilan', 'yugabharathi',
  'madhan karky', 'karky',
  'vivek', 'lyricist vivek',
  'thamarai', 'pa. vijay', 'pa vijay',
  'snehan', 'kannadasan', 'kavignar kannadasan',
  'pattukkottai kalyanasundaram', 'pulamaipithan', 'wali'
]);

/**
 * Accurately resolve artist primary role (Music Director vs Actor vs Director vs Lyricist vs Singer)
 */
export function resolveArtistRole(name: string, tmdbDept?: string): ArtistRole {
  if (!name) return 'Singer';
  const n = name.toLowerCase().trim();

  // 1. Direct canonical lookup
  if (KNOWN_MUSIC_DIRECTORS.has(n)) return 'Music Director';
  if (KNOWN_DIRECTORS.has(n)) return 'Movie Director';
  if (KNOWN_ACTORS.has(n)) return 'Actor';
  if (KNOWN_LYRICISTS.has(n)) return 'Lyricist';

  // 2. Fuzzy substring check against curated maestros
  for (const md of KNOWN_MUSIC_DIRECTORS) {
    if (n.includes(md) || md.includes(n)) return 'Music Director';
  }
  for (const d of KNOWN_DIRECTORS) {
    if (n.includes(d) || d.includes(n)) return 'Movie Director';
  }
  for (const a of KNOWN_ACTORS) {
    if (n.includes(a) || a.includes(n)) return 'Actor';
  }
  for (const l of KNOWN_LYRICISTS) {
    if (n.includes(l) || l.includes(n)) return 'Lyricist';
  }

  // 3. Fallback to TMDB Department if available and not 'Manual'
  if (tmdbDept && tmdbDept !== 'Manual') {
    if (tmdbDept === 'Sound' || tmdbDept === 'Composing') return 'Music Director';
    if (tmdbDept === 'Directing') return 'Movie Director';
    if (tmdbDept === 'Acting') return 'Actor';
    if (tmdbDept === 'Writing') return 'Lyricist';
  }

  // 4. Default to Singer
  return 'Singer';
}


