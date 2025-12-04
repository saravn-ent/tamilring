export const TOP_SINGERS = [
  {
    name: "Sid Sriram",
    img: "https://i.scdn.co/image/ab6761610000e5ebcb6926f44f620555ba444fca",
    bio: "Sid Sriram is an Indian-American Carnatic musician, music producer, playback singer, and songwriter. Known for his soulful voice and emotional renditions."
  },
  {
    name: "Shreya Ghoshal",
    img: "https://i.scdn.co/image/ab6761610000e5eb0261696c5df3be99da6ed3c3",
    bio: "Shreya Ghoshal is an Indian playback singer. Noted for her wide vocal range and versatility, she is one of the most popular singers in India."
  },
  {
    name: "S. P. Balasubrahmanyam",
    img: "",
    bio: "S. P. Balasubrahmanyam was an Indian playback singer, television presenter, music director, actor and dubbing artist who worked predominantly in Telugu, Tamil, Kannada, Hindi and Malayalam films."
  },
  {
    name: "K. S. Chithra",
    img: "",
    bio: "K. S. Chithra is an Indian playback singer and Carnatic musician. She has recorded more than 25,000 songs in various Indian languages."
  },
  {
    name: "Hariharan",
    img: "",
    bio: "Hariharan is an Indian playback singer who has sung for Tamil, Hindi, Malayalam, Kannada, Marathi, Bhojpuri and Telugu films, an established ghazal singer, and one of the pioneers of Indian fusion music."
  },
];

export const POPULAR_ACTORS = [
  {
    name: "Vijay",
    img: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Vijay_at_the_Nadigar_Sangam_Protest.jpg",
    bio: "Joseph Vijay Chandrasekhar, known professionally as Vijay, is one of the highest-paid actors in Indian cinema and a leading star in Tamil cinema."
  },
  {
    name: "Ajith",
    img: "https://upload.wikimedia.org/wikipedia/commons/8/81/Ajith_Kumar_at_Mankatha_Audio_Launch.jpg",
    bio: "Ajith Kumar is an Indian actor who works predominantly in Tamil cinema. Known for his versatile roles and massive fan following."
  },
  {
    name: "Rajinikanth",
    img: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Rajinikanth_at_2.0_Press_Meet.jpg",
    bio: "Rajinikanth is an Indian actor who works primarily in Tamil cinema. One of the most successful and popular actors in the history of Indian cinema."
  },
  {
    name: "Suriya",
    img: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Suriya_at_24_Movie_Press_Meet.jpg",
    bio: "Suriya is an Indian actor and producer who works predominantly in Tamil cinema. Known for his intense performances and social activism."
  },
  {
    name: "Dhanush",
    img: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Dhanush_at_the_62nd_Filmfare_Awards_South.jpg",
    bio: "Dhanush is an Indian actor, producer, lyricist and playback singer who works primarily in Tamil cinema. Winner of multiple National Film Awards."
  },
];

export const MUSIC_DIRECTORS = [
  {
    name: "Anirudh",
    img: "https://i.scdn.co/image/ab6761610000e5eb006ff3c0136a71bfb9928d34",
    bio: "Anirudh Ravichander is an Indian music composer and playback singer who works primarily in Tamil cinema. Known for his energetic and youthful compositions."
  },
  {
    name: "A.R. Rahman",
    img: "https://i.scdn.co/image/ab6761610000e5ebb19af0ea736c6228d6eb539c",
    bio: "A.R. Rahman is an Indian music composer, record producer, singer and songwriter. Winner of multiple Academy Awards and one of the world's best-selling music artists."
  },
  {
    name: "Yuvan",
    img: "https://i.scdn.co/image/ab6761610000e5eb9e528993949127542c35effc",
    bio: "Yuvan Shankar Raja is an Indian composer and playback singer. Known for his innovative use of Western music elements in Tamil film music."
  },
  {
    name: "Harris Jayaraj",
    img: "https://i.scdn.co/image/ab6761610000e5eb2f373b253769005239012383",
    bio: "Harris Jayaraj is an Indian composer from Chennai, Tamil Nadu. He composes soundtracks predominantly for Tamil films."
  },
  {
    name: "Santhosh Narayanan",
    img: "https://i.scdn.co/image/ab6761610000e5eb5a8188f4c47947d185f96984",
    bio: "Santhosh Narayanan is an Indian film composer and musician who has worked predominantly in Tamil cinema. Known for his unique musical style."
  },
];

export const MOODS = ["Love", "Mass", "Sad", "BGM", "Funny", "Melody", "Remix", "Devotional"];

export const TOP_CONTRIBUTORS = [
  {
    name: "RingtoneKing",
    uploads: 124,
    img: ""
  },
  {
    name: "TamilBeats",
    uploads: 89,
    img: ""
  },
  {
    name: "MelodyLover",
    uploads: 65,
    img: ""
  },
  {
    name: "BGMAddict",
    uploads: 42,
    img: ""
  },
  {
    name: "CinemaFan",
    uploads: 38,
    img: ""
  }
];

// Helper function to get artist bio
export function getArtistBio(artistName: string): string | undefined {
  const allArtists = [...TOP_SINGERS, ...MUSIC_DIRECTORS, ...POPULAR_ACTORS];
  return allArtists.find(artist => artist.name === artistName)?.bio;
}
