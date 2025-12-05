export interface Ringtone {
  id: string;
  title: string;
  slug: string;
  movie_name: string;
  movie_year: string;
  singers: string;
  music_director?: string;
  movie_director?: string;
  poster_url: string;
  backdrop_url: string;
  audio_url: string;
  waveform_url: string;
  tags?: string[];
  mood?: string;
  cast?: string;
  downloads: number;
  likes: number;
  apple_music_link?: string;
  spotify_link?: string;
  created_at: string;
}
