create table ringtones (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  movie_name text,
  movie_year text,
  singers text,
  poster_url text,
  backdrop_url text,
  audio_url text,
  waveform_url text,
  mood text,
  downloads int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index ringtones_slug_idx on ringtones (slug);
