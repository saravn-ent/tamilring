'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Music, Check, Loader2, X, RefreshCw, AlertCircle, Film, ChevronDown, Wand2, Scissors, ArrowRight } from 'lucide-react';
import AudioTrimmer from './AudioTrimmer';
import { searchMovies, MovieResult, getImageUrl, getMovieCredits, TMDB_GENRE_TO_TAG } from '@/lib/tmdb';
import { getSongsByMovie, iTunesRing } from '@/lib/itunes';
import { createBrowserClient } from '@supabase/ssr';
import { notifyAdminOnUpload } from '@/app/actions';
import Image from 'next/image';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
// import { fetchFile, toBlobURL } from '@ffmpeg/util'; // Imported dynamically

export default function UploadForm() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);

  // Trimming State
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setIsAuthChecking(false);
    };
    getUser();
  }, []);

  // Form Data
  const [songName, setSongName] = useState('');
  const [segmentName, setSegmentName] = useState(''); // e.g., "Pallavi", "BGM"

  // Movie Data (Source of Truth)
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [manualMovieName, setManualMovieName] = useState(''); // Fallback or override

  // iTunes Data
  const [movieSongs, setMovieSongs] = useState<iTunesRing[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [showSongDropdown, setShowSongDropdown] = useState(false);

  const [singers, setSingers] = useState('');
  const [musicDirector, setMusicDirector] = useState('');
  const [movieDirector, setMovieDirector] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [slug, setSlug] = useState('');

  // Duplication Check
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Search State
  const [movieQuery, setMovieQuery] = useState('');
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [isSearchingMovie, setIsSearchingMovie] = useState(false);

  const TAG_CATEGORIES = {
    "Moods": ["Love", "Sad", "Mass", "BGM", "Motivational", "Devotional", "Funny"],
    "Types": ["Vocal", "Instrumental", "Interlude", "Humming", "Dialogue", "Remix", "8D Audio"],
    "Vocals": ["Male", "Female", "Duet"],
    "Instruments": ["Flute", "Violin", "Guitar", "Piano", "Keyboard", "Veena", "Drums", "Nadaswaram"]
  };

  const SEGMENT_SUGGESTIONS = ["Pallavi", "Charanam", "BGM", "Whistle", "Flute Version", "Violin Version", "Climax BGM", "Intro", "Interlude"];

  // Smart Tagging Logic
  useEffect(() => {
    let newTags = new Set<string>(selectedTags);

    // 1. Tag by Movie Genre
    if (selectedMovie?.genre_ids) {
      selectedMovie.genre_ids.forEach(id => {
        const mappedTag = TMDB_GENRE_TO_TAG[id];
        if (mappedTag) newTags.add(mappedTag);
      });
    }

    // 2. Tag by Text Analysis (Song, Segment)
    const combinedText = `${songName} ${segmentName}`.toLowerCase();

    // Moods
    if (combinedText.includes('sad') || combinedText.includes('sogam') || combinedText.includes('pathos')) newTags.add('Sad');
    if (combinedText.includes('love') || combinedText.includes('kadhal') || combinedText.includes('romantic')) newTags.add('Love');
    if (combinedText.includes('mass') || combinedText.includes('kuthu') || combinedText.includes('hero')) newTags.add('Mass');

    // Types
    if (combinedText.includes('bgm') || combinedText.includes('theme') || combinedText.includes('background')) {
      newTags.add('BGM');
      newTags.add('Instrumental');
    }
    if (combinedText.includes('remix') || combinedText.includes('mix')) newTags.add('Remix');
    if (combinedText.includes('dialogue') || combinedText.includes('pedchur')) newTags.add('Dialogue');
    if (combinedText.includes('8d')) newTags.add('8D Audio');
    if (combinedText.includes('humming')) newTags.add('Humming');
    if (combinedText.includes('interlude')) newTags.add('Interlude');

    // Instruments
    if (combinedText.includes('flute')) { newTags.add('Flute'); newTags.add('Instrumental'); }
    if (combinedText.includes('violin')) { newTags.add('Violin'); newTags.add('Instrumental'); }
    if (combinedText.includes('guitar')) { newTags.add('Guitar'); newTags.add('Instrumental'); }
    if (combinedText.includes('piano')) { newTags.add('Piano'); newTags.add('Instrumental'); }
    if (combinedText.includes('keyboard')) { newTags.add('Keyboard'); newTags.add('Instrumental'); }
    if (combinedText.includes('veena')) { newTags.add('Veena'); newTags.add('Instrumental'); }
    if (combinedText.includes('drums')) { newTags.add('Drums'); newTags.add('Instrumental'); }
    if (combinedText.includes('nadaswaram')) { newTags.add('Nadaswaram'); newTags.add('Instrumental'); }
    if (combinedText.includes('whistle')) { newTags.add('Humming'); } // Close enough

    // Only update if changes found to avoid loops
    if (newTags.size > selectedTags.length) {
      setSelectedTags(Array.from(newTags));
    }
  }, [segmentName, songName, selectedMovie]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) return;

    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { toBlobURL } = await import('@ffmpeg/util');

    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }

    const ffmpeg = ffmpegRef.current;

    // Use local FFmpeg files to avoid CSP/Network issues
    const baseURL = `${window.location.origin}/ffmpeg`;
    try {
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        // workerURL: `${baseURL}/ffmpeg-core.worker.js` // Not needed for single-threaded or if integrated
      });
      setFfmpegLoaded(true);
    } catch (e) {
      console.error("FFmpeg load failed:", e);
      // Fallback or alert to user - actually just let it fail later or retry
    }
  };

  // Step 1: File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // If audio file, go to Step 1.5 (Trim) instead of Step 2
      setTrimStart(0);
      setTrimEnd(30);
      setStep(1.5);
      loadFFmpeg().catch(console.error);
    }
  };

  const handleTrimChange = (start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
  };

  const confirmTrim = () => {
    setStep(2);
  };

  // Step 2: TMDB Movie Search
  const handleMovieSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setMovieQuery(query);

    if (query.length > 2) {
      setIsSearchingMovie(true);
      try {
        const results = await searchMovies(query);
        setMovies(results);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearchingMovie(false);
      }
    } else {
      setMovies([]);
    }
  };

  const selectMovie = async (movie: MovieResult) => {
    setSelectedMovie(movie);
    setManualMovieName(movie.title);
    setMovieQuery(movie.title);
    setMovies([]);

    // Reset song details
    setSongName('');
    setSingers('');
    setMovieSongs([]);

    // Fetch Credits
    const credits = await getMovieCredits(movie.id);
    if (credits) {
      const directors = credits.crew.filter(c => c.job === 'Director').map(c => c.name).join(', ');
      const musicDirectors = credits.crew.filter(c => c.job === 'Original Music Composer' || c.job === 'Music').map(c => c.name).join(', ');
      setMovieDirector(directors);
      setMusicDirector(musicDirectors);
    }

    setStep(3);
  };

  // Step 3 Effect: Fetch Songs when entering Step 3
  useEffect(() => {
    if (step === 3 && selectedMovie) {
      const fetchSongs = async () => {
        setIsLoadingSongs(true);
        try {
          const songs = await getSongsByMovie(selectedMovie.title);
          setMovieSongs(songs);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingSongs(false);
        }
      }
      fetchSongs();
    }
  }, [step, selectedMovie]);

  const cleanName = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\(From.*?\)/gi, '')
      .replace(/\(Original.*?\)/gi, '')
      .replace(/\[From.*?\]/gi, '')
      .replace(/- From.*/gi, '')
      .trim();
  };

  const selectSong = (ring: iTunesRing) => {
    setSongName(cleanName(ring.trackName));
    setSingers(ring.artistName);
    setShowSongDropdown(false);
  }

  // Generate Slug & Check Duplicates SAME LOGIC
  useEffect(() => {
    const generateAndCheckSlug = async () => {
      if (songName && manualMovieName && segmentName) {
        const text = `${manualMovieName} ${songName} ${segmentName}`;
        const newSlug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setSlug(newSlug);

        // Check Duplication
        setIsCheckingDuplicate(true);
        setDuplicateError(null);
        try {
          const { data, error } = await supabase
            .from('ringtones')
            .select('id')
            .eq('slug', newSlug)
            .single();

          if (data) {
            setDuplicateError('A ringtone with this name already exists!');
          }
        } catch (err) {
          // Good
        } finally {
          setIsCheckingDuplicate(false);
        }
      }
    };

    const timer = setTimeout(generateAndCheckSlug, 500); // Debounce
    return () => clearTimeout(timer);
  }, [songName, manualMovieName, segmentName]);


  const convertAudio = async (inputFile: File, targetFormat: 'mp3' | 'm4r'): Promise<Blob> => {
    await loadFFmpeg();
    const ffmpeg = ffmpegRef.current!;
    const { fetchFile } = await import('@ffmpeg/util');

    // Logging Capture
    const logs: string[] = [];
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg:', message);
      logs.push(message);
      if (logs.length > 20) logs.shift(); // Keep last 20 lines
    });

    const fileExt = inputFile.name.split('.').pop()?.toLowerCase() || 'dat';
    const inputName = `input_${Date.now()}.${fileExt}`;
    const outputName = `output_${Date.now()}.${targetFormat}`;

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

      // Duration Calculation
      const duration = trimEnd - trimStart;

      // Command args with Trim Support
      let args: string[] = [];
      const ss = trimStart.toFixed(2);
      const t = duration.toFixed(2);

      // Using -ss before -i for faster seeking (input seeking)
      // Note: Re-encoding is required for accurate cut after seeking
      const commonArgs = ['-ss', ss, '-i', inputName, '-t', t];

      if (targetFormat === 'm4r') {
        // Force mp4 container for m4r
        args = [...commonArgs, '-c:a', 'aac', '-b:a', '192k', '-vn', '-f', 'mp4', outputName];
      } else {
        // Force mp3 container
        args = [...commonArgs, '-c:a', 'libmp3lame', '-b:a', '320k', '-vn', '-f', 'mp3', outputName];
      }

      const ret = await ffmpeg.exec(args);
      if (ret !== 0) {
        console.error('FFmpeg logs:', logs.join('\n'));
        throw new Error(`FFmpeg error (code ${ret}): ${logs.slice(-3).join(', ')}`);
      }

      const data = await ffmpeg.readFile(outputName);
      return new Blob([data as any], { type: targetFormat === 'm4r' ? 'audio/x-m4r' : 'audio/mpeg' });
    } finally {
      // Cleanup
      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch (e) { /* ignore cleanup errors */ }
    }
  };

  const handleSubmit = async () => {
    if (!file || !songName || !manualMovieName || !segmentName || duplicateError) return;
    setLoading(true);
    setLoadingMessage('Initializing...');

    const finalTitle = `${songName} - ${segmentName}`;

    try {
      let mp3Blob: Blob | File = file;
      let m4rBlob: Blob | File | null = null;
      let iphoneUrl: string | null = null;

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const baseName = `${slug}-${Date.now()}`;

      // Conversion Logic
      // Always convert/trim now since we support trimming
      setLoadingMessage('Optimizing & Trimming audio...');
      console.log('Starting conversion...');
      try {
        mp3Blob = await convertAudio(file, 'mp3');
        console.log('MP3 conversion done');
        m4rBlob = await convertAudio(file, 'm4r');
        console.log('M4R conversion done');
      } catch (convErr) {
        console.error('Conversion Error:', convErr);
        throw new Error('Audio processing failed. Please try a different file.');
      }

      // 1. Upload MP3
      setLoadingMessage('Uploading MP3...');
      console.log('Starting MP3 upload...');
      const mp3Name = `${baseName}.mp3`;
      const { error: mp3Error } = await supabase.storage
        .from('ringtone-files')
        .upload(mp3Name, mp3Blob);

      if (mp3Error) {
        console.error('MP3 Upload Error:', mp3Error);
        throw new Error(`MP3 Upload failed: ${mp3Error.message}`);
      }
      console.log('MP3 upload done');
      const { data: { publicUrl: mp3Url } } = supabase.storage.from('ringtone-files').getPublicUrl(mp3Name);

      // 2. Upload M4R
      if (m4rBlob) {
        setLoadingMessage('Uploading iPhone version...');
        const m4rName = `${baseName}.m4r`;
        const { error: m4rError } = await supabase.storage
          .from('ringtone-files')
          .upload(m4rName, m4rBlob);

        if (!m4rError) {
          const { data: { publicUrl } } = supabase.storage.from('ringtone-files').getPublicUrl(m4rName);
          iphoneUrl = publicUrl;
        }
      }

      setLoadingMessage('Finalizing...');

      // 3. Insert into Database
      const { error: dbError } = await supabase
        .from('ringtones')
        .insert({
          user_id: userId,
          title: finalTitle,
          slug,
          movie_name: manualMovieName,
          movie_year: selectedMovie?.release_date ? parseInt(selectedMovie.release_date.split('-')[0]) : null,
          singers,
          music_director: musicDirector,
          movie_director: movieDirector,
          poster_url: selectedMovie?.poster_path ? getImageUrl(selectedMovie.poster_path) : null,
          audio_url: mp3Url,
          audio_url_iphone: iphoneUrl || undefined,
          tags: selectedTags,
          status: 'pending' // Just to be explicit
        });

      if (dbError) throw dbError;

      // Notify Admin (Fire & Forget)
      try {
        await notifyAdminOnUpload({
          title: finalTitle,
          movie_name: manualMovieName,
          user_id: userId!,
          tags: selectedTags,
          slug: slug
        });
      } catch (notifyErr) {
        console.warn("Notification failed silently", notifyErr);
      }

      alert('Ringtone uploaded successfully! It is now pending review.');
      // Reset form
      setStep(1);
      setFile(null);
      setSongName('');
      setSegmentName('');
      setManualMovieName('');
      setMovieQuery('');
      setMovieSongs([]);
      setSelectedMovie(null);
      setSingers('');
      setMusicDirector('');
      setMovieDirector('');
      setSelectedTags([]);
      setTrimStart(0);
      setTrimEnd(30);

    } catch (error: any) {
      console.error('Upload failed:', error);
      const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      alert(`Upload failed: ${msg}`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Auth Check Block
  if (isAuthChecking) {
    return (
      <div className="max-w-md mx-auto p-12 text-center text-zinc-500">
        <Loader2 className="animate-spin mx-auto mb-4" />
        <p>Verifying account...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 text-center space-y-6">
        <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-4">
          <Upload size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-zinc-400 text-sm">You must be logged in to upload ringtones to TamilRing.</p>
        </div>
        <a
          href="/profile" // Profile page usually handles login if not logged in
          className="block w-full bg-emerald-500 text-neutral-900 font-bold py-3.5 rounded-xl hover:bg-emerald-400 transition-colors"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-neutral-900 p-6 rounded-2xl border border-neutral-800 pb-32">
      {/* Progress */}
      <div className="flex justify-between mb-8 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
        <span className={step >= 1 ? 'text-emerald-500' : ''}>1. File</span>
        <span className={step === 1.5 ? 'text-emerald-500 font-bold' : (step > 1.5 ? 'text-emerald-500' : '')}>Trim</span>
        <span className={step >= 2 ? 'text-emerald-500' : ''}>2. Movie</span>
        <span className={step >= 3 ? 'text-emerald-500' : ''}>3. Details</span>
      </div>

      {/* Step 1: File */}
      {step === 1 && (
        <div className="border-2 border-dashed border-neutral-700 rounded-xl p-10 text-center hover:border-emerald-500 transition-colors">
          <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r" onChange={handleFileChange} className="hidden" id="audio-upload" />
          <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center text-emerald-500">
              <Upload size={32} />
            </div>
            <p className="text-zinc-300">Drag & Drop or Click to Upload</p>
            <p className="text-zinc-500 text-xs text-center px-4">
              MP3, M4R, WAV accepted.<br />
              <span className="text-emerald-500/70">You can trim the song next</span>
            </p>
          </label>
        </div>
      )}

      {/* Step 1.5: Trimmer */}
      {step === 1.5 && file && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-white">Trim Ringtone</h2>
          </div>

          <AudioTrimmer file={file} onTrimChange={handleTrimChange} />

          <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-zinc-400">
            <div>
              <p>Start: <span className="text-white font-mono">{trimStart.toFixed(1)}s</span></p>
              <p>End: <span className="text-white font-mono">{trimEnd.toFixed(1)}s</span></p>
            </div>
            <div className="text-right">
              <p>Duration</p>
              <p className={`font-mono font-bold ${trimEnd - trimStart > 30 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                {(trimEnd - trimStart).toFixed(1)}s
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={() => { setStep(1); setFile(null); }} className="px-6 py-3 rounded-xl bg-neutral-800 text-zinc-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={confirmTrim} className="flex-1 bg-emerald-500 text-neutral-900 font-bold rounded-xl py-3 hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Movie Search */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Select Movie (TMDB)
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={movieQuery}
                  onChange={handleMovieSearch}
                  placeholder="e.g. Thegidi"
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                  autoFocus
                />
                <div className="bg-emerald-500 text-neutral-900 p-3 rounded-lg font-bold flex items-center justify-center">
                  {isSearchingMovie ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </div>
              </div>

              {/* Movie Results */}
              {movies.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  <div className="flex justify-between items-center p-2 border-b border-neutral-700 bg-neutral-900/50 sticky top-0">
                    <span className="text-xs text-zinc-400 px-2">Select the correct movie</span>
                    <button onClick={() => setMovies([])}><X size={14} className="text-zinc-500 hover:text-zinc-300" /></button>
                  </div>
                  {movies.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => selectMovie(movie)}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-700 border-b border-neutral-700 last:border-0 transition-colors group flex items-center gap-3"
                    >
                      {movie.poster_path ? (
                        <div className="relative w-8 h-12 shrink-0 rounded overflow-hidden">
                          <Image src={getImageUrl(movie.poster_path, 'w92')} alt={movie.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-12 bg-neutral-700 rounded flex items-center justify-center shrink-0"><Film size={16} /></div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-100 group-hover:text-emerald-400">{movie.title}</p>
                        <p className="text-xs text-zinc-400">{movie.release_date?.split('-')[0] || 'Unknown'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              This ensures we get the correct movie details and poster.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setStep(1)}
              className="text-zinc-400 hover:text-zinc-100 text-sm"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details (Movie -> Song) */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Selected Movie Header */}
          <div className="flex bg-neutral-800 p-3 rounded-lg gap-3 shadow-lg border border-neutral-700/50">
            {selectedMovie?.poster_path ? (
              <div className="relative w-12 h-16 bg-neutral-700 rounded overflow-hidden shrink-0">
                <Image src={getImageUrl(selectedMovie.poster_path)} alt={manualMovieName} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-16 bg-neutral-700 rounded flex items-center justify-center text-zinc-500"><Film size={20} /></div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">Selected Movie</p>
              <p className="text-base font-bold text-zinc-100 truncate">{manualMovieName}</p>
              <p className="text-xs text-zinc-400">{selectedMovie?.release_date?.split('-')[0]} • {musicDirector.split(',')[0]}</p>
            </div>
            <button onClick={() => setStep(2)} className="text-xs text-emerald-500 hover:underline self-center shrink-0">Change</button>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Song Name</label>
            <div className="relative">
              <div
                onClick={() => setShowSongDropdown(!showSongDropdown)}
                className="flex w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 cursor-pointer hover:border-emerald-500 transition-colors items-center justify-between"
              >
                <span className={songName ? "text-zinc-100" : "text-zinc-500"}>
                  {songName || `Select song from "${manualMovieName}"...`}
                </span>
                {isLoadingSongs ? <Loader2 size={16} className="animate-spin text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
              </div>

              {/* Song Dropdown */}
              {showSongDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl max-h-60 overflow-y-auto pb-1">
                  <div className="px-3 py-2 text-[10px] text-zinc-500 uppercase tracking-wider bg-neutral-900/50 sticky top-0 border-b border-neutral-700 backdrop-blur-sm">
                    Album Tracks
                  </div>
                  {movieSongs.length > 0 ? (
                    <>
                      {movieSongs.map((ring, i) => (
                        <button
                          key={i}
                          onClick={() => selectSong(ring)}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-700 border-b border-neutral-700/50 last:border-0 transition-colors group"
                        >
                          <p className="font-medium text-zinc-200 group-hover:text-emerald-400 text-sm">{cleanName(ring.trackName)}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{ring.artistName}</p>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-4 text-center text-zinc-500 text-xs">
                      {isLoadingSongs ? 'Loading songs...' : 'No songs found for this movie on iTunes.'}
                    </div>
                  )}
                  {/* Fallback Manual Input Trigger if needed, or just let them type in a separate input below if simplified */}
                </div>
              )}
            </div>
            {/* Manual Song Fallback */}
            <div className="mt-2 text-right">
              <button
                className="text-[10px] text-zinc-500 hover:text-emerald-500 underline"
                onClick={() => {
                  const manual = prompt("Enter song name manually:");
                  if (manual) setSongName(manual);
                }}
              >
                Song not listed? Enter manually
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Ringtone Name</label>
            <input
              type="text"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="Type lyrics name..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!singers && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Singers</label>
                <input
                  type="text"
                  value={singers}
                  onChange={(e) => setSingers(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
            {!movieDirector && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Director</label>
                <input
                  type="text"
                  value={movieDirector}
                  onChange={(e) => setMovieDirector(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {!musicDirector && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Music Director</label>
              <input
                type="text"
                value={musicDirector}
                onChange={(e) => setMusicDirector(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-500 mb-2">Tags</label>
            <div className="space-y-4 bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
              {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
                <div key={category}>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2 tracking-wider">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.filter(t => !['BGM', 'Interlude'].includes(t)).map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedTags.includes(tag)
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

          {/* Slug Preview & Duplicate Error */}
          <div className="space-y-2">
            <label className="block text-xs text-zinc-500">SEO Slug Preview</label>
            <input
              type="text"
              value={slug}
              readOnly
              className={`w-full bg-neutral-900 border ${duplicateError ? 'border-red-500 text-red-400' : 'border-neutral-800 text-zinc-500'} rounded-lg px-4 py-2 text-sm font-mono transition-colors`}
            />
            {duplicateError && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle size={14} />
                <span>{duplicateError}</span>
              </div>
            )}
            {isCheckingDuplicate && (
              <span className="text-xs text-zinc-600 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Checking availability...</span>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="text-zinc-400 hover:text-zinc-100 text-sm"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !!duplicateError || !segmentName}
              className="flex-1 ml-4 bg-emerald-500 text-neutral-900 font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>{loadingMessage || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Check />
                  <span>Upload Ringtone</span>
                  <span className="text-[10px] text-emerald-900 bg-emerald-400/50 px-2 py-0.5 rounded-full ml-1">+50 Rep</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
