'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Search, Music, Film, Check, Loader2 } from 'lucide-react';
import { searchMovies, MovieResult, getImageUrl } from '@/lib/tmdb';
import { searchSingers } from '@/lib/itunes';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function UploadForm() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [title, setTitle] = useState('');
  const [movieQuery, setMovieQuery] = useState('');
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [singers, setSingers] = useState('');
  const [mood, setMood] = useState('');
  const [slug, setSlug] = useState('');

  // Step 1: File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep(2);
    }
  };

  // Step 2: Movie Lookup
  const handleSearchMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const results = await searchMovies(movieQuery);
    setMovies(results);
    setLoading(false);
  };

  const selectMovie = (movie: MovieResult) => {
    setSelectedMovie(movie);
    setStep(3);
  };

  // Step 3: Details & Singer Lookup
  const handleSingerLookup = async () => {
    if (!title || !selectedMovie) return;
    setLoading(true);
    const artist = await searchSingers(title, selectedMovie.title);
    if (artist) setSingers(artist);
    setLoading(false);
  };

  // Generate Slug
  useEffect(() => {
    if (title && selectedMovie) {
      const text = `${title} ${selectedMovie.title} ringtone`;
      const newSlug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(newSlug);
    }
  }, [title, selectedMovie]);

  const handleSubmit = async () => {
    if (!file || !selectedMovie || !title) return;
    setLoading(true);

    try {
      // 1. Upload to Cloudinary (Mocking this part as we need signed upload usually)
      // In a real app, you'd use a signed upload preset or a server-side route.
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudinaryData = await cloudinaryRes.json();
      
      if (!cloudinaryData.secure_url) throw new Error('Upload failed');

      // 2. Insert into Supabase
      const { error } = await supabase.from('ringtones').insert({
        title,
        slug,
        movie_name: selectedMovie.title,
        movie_year: selectedMovie.release_date?.split('-')[0] || '',
        singers,
        poster_url: getImageUrl(selectedMovie.poster_path),
        backdrop_url: getImageUrl(selectedMovie.backdrop_path, 'original'),
        audio_url: cloudinaryData.secure_url,
        waveform_url: cloudinaryData.secure_url.replace('.mp3', '.png').replace('/upload/', '/upload/fl_waveform,co_white,b_transparent/'), // Cloudinary waveform hack
        mood,
      });

      if (error) throw error;

      alert('Ringtone uploaded successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error(error);
      alert('Error uploading ringtone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
      {/* Progress */}
      <div className="flex justify-between mb-8 text-sm font-medium text-zinc-500">
        <span className={step >= 1 ? 'text-emerald-500' : ''}>1. File</span>
        <span className={step >= 2 ? 'text-emerald-500' : ''}>2. Movie</span>
        <span className={step >= 3 ? 'text-emerald-500' : ''}>3. Details</span>
      </div>

      {/* Step 1: File */}
      {step === 1 && (
        <div className="border-2 border-dashed border-neutral-700 rounded-xl p-10 text-center hover:border-emerald-500 transition-colors">
          <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" id="audio-upload" />
          <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center text-emerald-500">
              <Upload size={32} />
            </div>
            <p className="text-zinc-300">Drag & Drop or Click to Upload</p>
            <p className="text-zinc-500 text-xs">MP3, M4A, WAV</p>
          </label>
        </div>
      )}

      {/* Step 2: Movie */}
      {step === 2 && (
        <div className="space-y-4">
          <form onSubmit={handleSearchMovie} className="flex gap-2">
            <input
              type="text"
              value={movieQuery}
              onChange={(e) => setMovieQuery(e.target.value)}
              placeholder="Search movie name..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="bg-emerald-500 text-neutral-900 p-3 rounded-lg hover:bg-emerald-400">
              <Search size={20} />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-emerald-500" /></div>
            ) : (
              movies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => selectMovie(movie)}
                  className="flex items-center gap-3 p-2 hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative w-10 h-14 bg-neutral-700 rounded overflow-hidden shrink-0">
                    {movie.poster_path && (
                      <Image src={getImageUrl(movie.poster_path)} alt={movie.title} fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-zinc-200 font-medium">{movie.title}</p>
                    <p className="text-zinc-500 text-xs">{movie.release_date?.split('-')[0]}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && selectedMovie && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-neutral-800 p-3 rounded-lg">
            <div className="relative w-12 h-16 bg-neutral-700 rounded overflow-hidden shrink-0">
              {selectedMovie.poster_path && (
                <Image src={getImageUrl(selectedMovie.poster_path)} alt={selectedMovie.title} fill className="object-cover" />
              )}
            </div>
            <div>
              <p className="text-zinc-200 font-bold">{selectedMovie.title}</p>
              <p className="text-zinc-500 text-xs">{selectedMovie.release_date?.split('-')[0]}</p>
            </div>
            <button onClick={() => setStep(2)} className="ml-auto text-xs text-emerald-500 hover:underline">Change</button>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Song Title</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bison Theme"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSingerLookup}
                type="button"
                className="bg-neutral-800 border border-neutral-700 text-zinc-400 p-3 rounded-lg hover:text-emerald-500 hover:border-emerald-500"
                title="Auto-fetch Singers"
              >
                <Music size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Singers</label>
            <input
              type="text"
              value={singers}
              onChange={(e) => setSingers(e.target.value)}
              placeholder="e.g. Anirudh Ravichander"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Mood</option>
              <option value="Mass">Mass</option>
              <option value="Love">Love</option>
              <option value="Sad">Sad</option>
              <option value="BGM">BGM</option>
              <option value="Melody">Melody</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">SEO Slug (Auto-generated)</label>
            <input
              type="text"
              value={slug}
              readOnly
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-zinc-500 text-sm font-mono"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-500 text-neutral-900 font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Check />}
            Upload Ringtone
          </button>
        </div>
      )}
    </div>
  );
}
