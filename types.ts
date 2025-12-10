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
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  user_id?: string;
  audio_url_iphone?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  points: number;
  level: number;
  bio?: string;
  website_url?: string;
  instagram_handle?: string;
  twitter_handle?: string;
  upi_id?: string;
  btc_address?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  condition_type: 'uploads_count' | 'likes_received_count' | 'manual';
  condition_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge?: Badge;
}
