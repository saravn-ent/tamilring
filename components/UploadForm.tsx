'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, Music, Check, Loader2, X } from 'lucide-react';
import { searchMovies, MovieResult, getImageUrl } from '@/lib/tmdb';
import { searchSongs, iTunesSong } from '@/lib/itunes';
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
  const [musicDirector, setMusicDirector] = useState('');
  const [movieDirector, setMovieDirector] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [slug, setSlug] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const TAG_CATEGORIES = {
    "Moods": ["Love", "Sad", "Mass", "BGM", "Motivational", "Devotional", "Funny"],
    "Types": ["Instrumental", "Interlude", "Humming", "Dialogue", "Remix", "8D Audio"],
    "Vocals": ["Male", "Female", "Duet"],
    "Instruments": ["Flute", "Violin", "Guitar", "Piano"]
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Manual Override State
  const [manualMovieName, setManualMovieName] = useState('');
  const [manualMovieYear, setManualMovieYear] = useState('');

  // Song Search State
  const [songResults, setSongResults] = useState<iTunesSong[]>([]);
  const [isSearchingSong, setIsSearchingSong] = useState(false);

  // Step 1: File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep(2);
    }
  };

  // Step 2: Movie Lookup
  const handleMovieSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setMovieQuery(query);

    if (query.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchMovies(query);
        setMovies(results);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setMovies([]);
    }
  };

  const selectMovie = (movie: MovieResult) => {
    setSelectedMovie(movie);
    setManualMovieName(movie.title);
    setManualMovieYear(movie.release_date?.split('-')[0] || '');
    setMovieQuery(movie.title);
    setMovies([]);
    setStep(3);
  };

  // Step 3: Song Lookup (iTunes)
  const handleSongLookup = async () => {
    if (!manualMovieName) {
      alert('Please select a movie first!');
      return;
    }

    setIsSearchingSong(true);
    setSongResults([]); // Clear previous

    // If title is empty, search for the MOVIE name to get all songs from album
    // If title exists, search for MOVIE + SONG TITLE
    const searchTerm = title 
      ? `${manualMovieName} ${title}` 
      : manualMovieName;

    const songs = await searchSongs(searchTerm);
    
    if (songs.length === 0) {
      alert('No songs found. Try checking the spelling.');
    } else {
      setSongResults(songs);
    }
    setIsSearchingSong(false);
  };

  const selectSong = (song: iTunesSong) => {
    setTitle(song.trackName);
    setSingers(song.artistName);
    setSongResults([]); // Close dropdown
  };

  // Generate Slug
  useEffect(() => {
    if (title && manualMovieName) {
      const text = `${title} ${manualMovieName} ringtone`;
      const newSlug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(newSlug);
    }
  }, [title, manualMovieName]);

  const handleSubmit = async () => {
    if (!file || !title || !manualMovieName) return;
    setLoading(true);

    try {
      // 1. Upload File to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ringtone-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ringtone-files')
        .getPublicUrl(fileName);

      // 3. Insert into Database
      const { error: dbError } = await supabase
        .from('ringtones')
        .insert({
          title,
          slug,
          movie_name: manualMovieName,
          movie_year: manualMovieYear ? parseInt(manualMovieYear) : null,
          singers,
          music_director: musicDirector,
          poster_url: selectedMovie ? getImageUrl(selectedMovie.poster_path) : null,
          audio_url: publicUrl,
          tags: selectedTags,
        });

      if (dbError) throw dbError;

      alert('Ringtone uploaded successfully!');
      // Reset form
      setStep(1);
      setFile(null);
      setTitle('');
      setMovieQuery('');
      setSelectedMovie(null);
      setSingers('');
      setMusicDirector('');
      setMovieDirector('');
      setSelectedTags([]);

    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
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
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Search Movie (TMDB)
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={movieQuery}
                  onChange={handleMovieSearch}
                  placeholder="Type movie name..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="bg-emerald-500 text-neutral-900 p-3 rounded-lg font-bold flex items-center justify-center">
                  {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </div>
              </div>

              {/* Dropdown Results */}
              {movies.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {movies.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => selectMovie(movie)}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-700 flex items-center gap-3 border-b border-neutral-700 last:border-0 transition-colors"
                    >
                      {movie.poster_path ? (
                        <div className="relative w-10 h-14 shrink-0">
                          <Image 
                            src={getImageUrl(movie.poster_path, 'w500')} 
                            alt={movie.title} 
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-14 bg-neutral-600 rounded flex items-center justify-center text-xs text-zinc-400 shrink-0">
                          No Img
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-100">{movie.title}</p>
                        <p className="text-xs text-zinc-400">
                          {movie.release_date?.split('-')[0] || 'Unknown Year'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Manual Override Fields */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-zinc-500 mb-1">Movie Name</label>
                <input 
                  type="text" 
                  value={manualMovieName}
                  onChange={(e) => setManualMovieName(e.target.value)}
                  className="w-full bg-neutral-800/50 border border-neutral-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500"
                />
             </div>
             <div>
                <label className="block text-xs text-zinc-500 mb-1">Year</label>
                <input 
                  type="text" 
                  value={manualMovieYear}
                  onChange={(e) => setManualMovieYear(e.target.value)}
                  className="w-full bg-neutral-800/50 border border-neutral-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500"
                />
             </div>
          </div>

          <div className="flex justify-between pt-4">
             <button
              onClick={() => setStep(1)}
              className="text-zinc-400 hover:text-zinc-100 text-sm"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!manualMovieName}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-900 px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-neutral-800 p-3 rounded-lg">
            <div className="relative w-12 h-16 bg-neutral-700 rounded overflow-hidden shrink-0">
              {selectedMovie?.poster_path ? (
                <Image src={getImageUrl(selectedMovie.poster_path)} alt={manualMovieName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">No Img</div>
              )}
            </div>
            <div>
              <p className="text-zinc-200 font-bold">{manualMovieName}</p>
              <p className="text-zinc-500 text-xs">{manualMovieYear}</p>
            </div>
            <button onClick={() => setStep(2)} className="ml-auto text-xs text-emerald-500 hover:underline">Change</button>
          </div>

          {/* Song Title Input with Search */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Song Title</label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type song name OR leave empty to fetch all"
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSongLookup}
                  disabled={isSearchingSong}
                  className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-zinc-100 p-3 rounded-lg transition-colors"
                  title="Search iTunes"
                >
                  {isSearchingSong ? <Loader2 className="animate-spin" size={20} /> : <Music size={20} />}
                </button>
              </div>

              {/* Song Results Dropdown */}
              {songResults.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center p-2 border-b border-neutral-700 bg-neutral-900/50 sticky top-0">
                    <span className="text-xs text-zinc-400 px-2">Select a song</span>
                    <button onClick={() => setSongResults([])}><X size={14} className="text-zinc-500 hover:text-zinc-300"/></button>
                  </div>
                  {songResults.map((song, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSong(song)}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-700 border-b border-neutral-700 last:border-0 transition-colors group"
                    >
                      <p className="font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors">{song.trackName}</p>
                      <p className="text-xs text-zinc-400 truncate">{song.artistName}</p>
                      <p className="text-[10px] text-zinc-600 truncate">{song.collectionName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Tip: Leave empty and click <Music size={10} className="inline"/> to see all songs from the movie.
            </p>
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
            <label className="block text-xs text-zinc-500 mb-1">Music Director</label>
            <input
              type="text"
              value={musicDirector}
              onChange={(e) => setMusicDirector(e.target.value)}
              placeholder="e.g. A.R. Rahman"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Movie Director</label>
            <input
              type="text"
              value={movieDirector}
              onChange={(e) => setMovieDirector(e.target.value)}
              placeholder="e.g. Mari Selvaraj"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-2">Tags (Select all that apply)</label>
            <div className="space-y-4 bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
              {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
                <div key={category}>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2 tracking-wider">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-emerald-500 border-emerald-500 text-neutral-900 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-transparent border-neutral-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
