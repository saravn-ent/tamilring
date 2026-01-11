'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Music, Check, Loader2, X, RefreshCw, AlertCircle, Film, ChevronDown, Wand2, ArrowRight, Sparkles, Heart, Pencil, Scissors } from 'lucide-react';
import ArtistAutocomplete from './ArtistAutocomplete';
import AudioTrimmer from './AudioTrimmer';
import { searchMovies, MovieResult, getImageUrl, getMovieCredits, TMDB_GENRE_TO_TAG } from '@/lib/tmdb';
import { getSongsByMovie, iTunesRing } from '@/lib/itunes';
import { createBrowserClient } from '@supabase/ssr';
import { notifyAdminOnUpload, processAutoApproval } from '@/app/actions/ringtones';
import { handleUploadReward } from '@/app/actions/user';
import Image from 'next/image';
import Script from 'next/script';

interface UploadFormProps {
  userId?: string;
  onComplete?: () => void;
}

export default function UploadForm({ userId: propUserId, onComplete }: UploadFormProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // DEV MODE: Set to true to bypass auth for UI testing
  const DEV_MODE = false;
  const DEMO_USER_ID = 'demo-user-123';

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Content Type Selection
  const [contentType, setContentType] = useState<'movie' | 'album' | 'devotional'>('movie');
  const [deityCategory, setDeityCategory] = useState('');



  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(propUserId || null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ffmpegRef = useRef<any>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(!propUserId);

  useEffect(() => {
    const getUser = async () => {
      if (propUserId) {
        setUserId(propUserId);
        setIsAuthChecking(false);
        return;
      }

      if (DEV_MODE) {
        // Development mode: Use demo user ID
        setUserId(DEMO_USER_ID);
        setIsAuthChecking(false);
        console.log('🔧 DEV MODE: Using demo user ID for testing');
      } else {
        // Production mode: Check real auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
        setIsAuthChecking(false);
      }
    };
    getUser();
  }, [propUserId]);

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

  // Devotional iTunes Data
  const [devotionalSongs, setDevotionalSongs] = useState<iTunesRing[]>([]);
  const [isLoadingDevotionalSongs, setIsLoadingDevotionalSongs] = useState(false);
  const [showDevotionalSongDropdown, setShowDevotionalSongDropdown] = useState(false);

  // Album/Independent Artist iTunes Data
  const [albumSongs, setAlbumSongs] = useState<iTunesRing[]>([]);
  const [isLoadingAlbumSongs, setIsLoadingAlbumSongs] = useState(false);
  const [showAlbumSongDropdown, setShowAlbumSongDropdown] = useState(false);
  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [isAlbumSongSelected, setIsAlbumSongSelected] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);

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

  const DEITY_CATEGORIES = {
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

  const SEGMENT_SUGGESTIONS = ["Pallavi", "Charanam", "BGM", "Whistle", "Flute Version", "Violin Version", "Climax BGM", "Intro", "Interlude"];

  // Smart Tagging Logic
  useEffect(() => {
    const newTags = new Set<string>(selectedTags);

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
    if (ffmpegRef.current && ffmpegRef.current.isLoaded()) {
      return ffmpegRef.current;
    }

    const FFmpeg = (window as any).FFmpeg;
    if (!FFmpeg) {
      throw new Error('Audio processor component not loaded. Please check your internet or refresh the page.');
    }

    try {
      const { createFFmpeg } = FFmpeg;

      if (!ffmpegRef.current) {
        ffmpegRef.current = createFFmpeg({
          log: true,
          corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
        });
      }

      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }
      setFfmpegLoaded(true);
      return ffmpeg;
    } catch (e) {
      console.error("FFmpeg load failed:", e);
      throw new Error('Failed to start audio processing engine. Try disabling ad-blockers or using a different browser.');
    }
  };

  // Step 1: File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Detect Duration
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(selectedFile);
      audio.src = objectUrl;
      audio.onloadedmetadata = () => {
        setTrimEnd(audio.duration);
        URL.revokeObjectURL(objectUrl);
      };

      // Go directly to Content Type selection
      setStep(1.8);
      loadFFmpeg().catch(console.error);
    }
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
          // 1. Fetch from iTunes (External)
          const itunesSongs = await getSongsByMovie(selectedMovie.title);

          // 2. Fetch from Community (Internal database)
          // We look for approved ringtones in this movie to see what names others used
          const { data: communityData } = await supabase
            .from('ringtones')
            .select('song_name, singers')
            .eq('movie_name', selectedMovie.title)
            .not('song_name', 'is', null);

          // 3. Merge & Deduplicate
          // Convert community records to iTunes-like format for the dropdown
          const communitySongs: iTunesRing[] = (communityData || []).map(item => ({
            trackName: item.song_name,
            artistName: item.singers || 'Community Upload',
            collectionName: selectedMovie.title,
            previewUrl: ''
          }));

          // Deduplicate by track name (case insensitive)
          const seen = new Set();
          const merged = [...itunesSongs, ...communitySongs].filter(song => {
            const lowerName = song.trackName.toLowerCase().trim();
            if (seen.has(lowerName)) return false;
            seen.add(lowerName);
            return true;
          });

          setMovieSongs(merged);
        } catch (e) {
          console.error('Failed to fetch songs:', e);
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

  // Fetch devotional songs when deity selected
  useEffect(() => {
    if (contentType === 'devotional' && deityCategory && step === 3) {
      const fetchDevotionalSongs = async () => {
        setIsLoadingDevotionalSongs(true);
        try {
          const res = await fetch(`/api/devotional/search?deity=${encodeURIComponent(deityCategory)}`);
          const songs = await res.json();
          setDevotionalSongs(songs);
        } catch (e) {
          console.error('Failed to fetch devotional songs:', e);
        } finally {
          setIsLoadingDevotionalSongs(false);
        }
      };
      fetchDevotionalSongs();
    }
  }, [deityCategory, contentType, step]);

  useEffect(() => {
    const generateAndCheckSlug = async () => {
      // Whitelist of tags that are high-value for SEO
      const SEO_TAG_WHITELIST = ["BGM", "Vocal", "Instrumental", "Interlude", "Humming", "Dialogue", "Remix", "8D Audio"];
      const activeSeoTags = selectedTags.filter(tag => SEO_TAG_WHITELIST.includes(tag));

      const movieOrContextName = contentType === 'devotional' ? deityCategory : manualMovieName;

      if (movieOrContextName && segmentName) {
        let textParts = [movieOrContextName];
        if (songName) textParts.push(songName);
        textParts.push(segmentName);

        // Append important tags if they are not already in the segment name
        activeSeoTags.forEach(tag => {
          if (!segmentName.toLowerCase().includes(tag.toLowerCase())) {
            textParts.push(tag);
          }
        });

        const text = textParts.join(' ');
        const newSlug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setSlug(newSlug);

        // Check Duplication
        setIsCheckingDuplicate(true);
        setDuplicateError(null);
        try {
          const { data } = await supabase
            .from('ringtones')
            .select('id')
            .eq('slug', newSlug)
            .single();

          if (data) {
            setDuplicateError('A ringtone with this exact identity already exists!');
          }
        } catch (err) {
          // No duplicate found
        } finally {
          setIsCheckingDuplicate(false);
        }
      }
    };

    const timer = setTimeout(generateAndCheckSlug, 500);
    return () => clearTimeout(timer);
  }, [songName, manualMovieName, segmentName, contentType, deityCategory, selectedTags]);


  const convertAudio = async (inputFile: File, targetFormat: 'mp3' | 'm4r', startTime: number = 0, duration: number = 0, applyFade: boolean = true): Promise<Blob> => {
    const ffmpeg = await loadFFmpeg();
    const { fetchFile } = (window as any).FFmpeg;

    const inputName = `input_${Date.now()}.audio`;
    const outputName = `output_${Date.now()}.${targetFormat}`;

    try {
      ffmpeg.FS('writeFile', inputName, await fetchFile(inputFile));

      // Build filter chain for fading
      // We apply 2s fade in and 2s fade out by default
      const actualDuration = duration > 0 ? duration : (trimEnd - startTime);
      let filters = [];
      if (applyFade && actualDuration > 4) {
        filters.push(`afade=t=in:ss=0:d=2`);
        filters.push(`afade=t=out:st=${(actualDuration - 2).toFixed(2)}:d=2`);
      }

      // Command args
      let args: string[] = ['-i', inputName];

      // Trimming
      if (duration > 0 || startTime > 0) {
        args.unshift('-ss', startTime.toString());
        if (duration > 0) args.unshift('-t', duration.toString());
      }

      if (filters.length > 0) {
        args.push('-af', filters.join(','));
      }

      if (targetFormat === 'm4r') {
        args.push('-c:a', 'aac', '-b:a', '192k', '-vn', '-f', 'mp4', outputName);
      } else {
        args.push('-c:a', 'libmp3lame', '-b:a', '320k', '-vn', '-f', 'mp3', outputName);
      }

      await ffmpeg.run(...args);

      const data = ffmpeg.FS('readFile', outputName);
      return new Blob([data.buffer], { type: targetFormat === 'm4r' ? 'audio/x-m4r' : 'audio/mpeg' });
    } finally {
      try {
        ffmpeg.FS('unlink', inputName);
        ffmpeg.FS('unlink', outputName);
      } catch (e) { /* ignore */ }
    }
  };

  const handleSubmit = async () => {
    // Validation: Song Name is now OPTIONAL for better flexibility
    if (!file) {
      alert('Please select an audio file first.');
      return;
    }
    if (!segmentName) {
      alert('Please enter a Ringtone Name (e.g. BGM, Whistle).');
      return;
    }
    if (duplicateError) {
      alert(duplicateError);
      return;
    }

    if (contentType === 'movie' && !manualMovieName) {
      alert('Please select a movie.');
      return;
    }

    // ... rest of validation logic ...
    setLoading(true);
    setLoadingMessage('Initializing...');

    const movieOrContextName = contentType === 'devotional' ? deityCategory : manualMovieName;

    // Build SEO dynamic title including whitelist tags
    const SEO_TAG_WHITELIST = ["BGM", "Vocal", "Instrumental", "Interlude", "Humming", "Dialogue", "Remix", "8D Audio"];
    const activeSeoTags = selectedTags.filter(tag => SEO_TAG_WHITELIST.includes(tag));

    let titleParts = [movieOrContextName];
    if (songName) titleParts.push(songName);
    titleParts.push(segmentName);

    // Only append tag to title if it's not already in the segment name
    activeSeoTags.forEach(tag => {
      if (!segmentName.toLowerCase().includes(tag.toLowerCase())) {
        titleParts.push(tag);
      }
    });

    const finalTitle = titleParts.join(' - ');

    try {
      let mp3Blob: Blob | File = file;
      let m4rBlob: Blob | File | null = null;
      let iphoneUrl: string | null = null;

      const baseName = `${slug}-${Date.now()}`;

      // Conversion Logic
      setLoadingMessage('Processing audio & auto-fading...');

      const needsTrimming = (trimEnd > 0 && trimStart > 0);

      try {
        // We ALWAYS try to process now to apply the auto-fade
        try {
          const duration = (trimEnd > trimStart) ? (trimEnd - trimStart) : 0;
          mp3Blob = await convertAudio(file, 'mp3', trimStart, duration, true);
          console.log('MP3 processing (with fade) successful');
        } catch (mp3Err) {
          console.error('MP3 Processing Error:', mp3Err);
          console.log('Falling back to original file (no fade)');
          mp3Blob = file;
        }

        // M4R (iPhone)
        try {
          const duration = (trimEnd > trimStart) ? (trimEnd - trimStart) : 0;
          m4rBlob = await convertAudio(file, 'm4r', trimStart, duration, true);
        } catch (m4rErr) {
          console.warn('M4R processing failed', m4rErr);
        }

      } catch (convErr: any) {
        console.error('General Audio Processing Error:', convErr);
        throw new Error(`Audio processing failed: ${convErr?.message || 'The file might be unsupported or too large.'}`);
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

      // 3. Insert into Database - Different data based on content type
      const baseData = {
        user_id: userId,
        title: finalTitle,
        slug,
        singers,
        music_director: musicDirector,
        audio_url: mp3Url,
        audio_url_iphone: iphoneUrl || undefined,
        tags: selectedTags,
        status: 'approved' // Auto-approval enabled
      };

      let insertData: any = baseData;

      if (contentType === 'movie') {
        insertData = {
          ...baseData,
          movie_name: manualMovieName,
          movie_year: selectedMovie?.release_date?.split('-')[0] || undefined,
          movie_director: movieDirector,
          poster_url: selectedMovie?.poster_path ? getImageUrl(selectedMovie.poster_path, 'w342') : undefined,
          backdrop_url: selectedMovie?.backdrop_path ? getImageUrl(selectedMovie.backdrop_path, 'w780') : undefined,
        };
      } else if (contentType === 'album') {
        insertData = {
          ...baseData,
          movie_name: manualMovieName,
        };
      } else if (contentType === 'devotional') {
        insertData = {
          ...baseData,
          movie_name: deityCategory,
        };
      }

      if (DEV_MODE) {
        // ...
      } else {
        // Production mode: Actually insert into database
        const { error: dbError } = await supabase
          .from('ringtones')
          .insert(insertData);

        if (dbError) throw dbError;

        // Notify Admin (Fire & Forget)
        try {
          await notifyAdminOnUpload({
            title: finalTitle,
            movie_name: contentType === 'devotional' ? deityCategory : manualMovieName,
            user_id: userId!,
            tags: selectedTags,
            slug: slug
          });
        } catch (notifyErr) {
          console.warn("Notification failed silently", notifyErr);
        }

        if (userId) {
          try {
            // 1. Process Auto-Approval Rewards (Points + Badges)
            await processAutoApproval(userId);

            // 2. Check First Upload Reward
            const rewardRes = await handleUploadReward(userId);
            if (rewardRes.success && rewardRes.bonusGiven) {
              alert('🎉 BINGO! You earned 15 Reputation Points (₹15) for your first upload! Go to your Profile to withdraw it instantly to your UPI.');
            } else {
              alert('Ringtone uploaded successfully! It is now live on the site.');
            }
          } catch (rewardErr) {
            console.warn("Reward processing failed", rewardErr);
            alert('Ringtone uploaded successfully! It is now live on the site.');
          }
        } else {
          alert('Ringtone uploaded successfully! It is now live on the site.');
        }
      }
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

      setContentType('movie');
      setDeityCategory('');

      if (onComplete) {
        onComplete();
      }
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

  // Helper function for tag filtering
  const getFilteredTagCategories = () => {
    if (contentType === 'devotional') {
      return {
        "Moods": ["Devotional"], // Only Devotional tag
        "Types": TAG_CATEGORIES["Types"], // Keep all Types
        // Vocals and Instruments categories removed
      };
    }
    // For movie and album, return all categories
    return TAG_CATEGORIES;
  };

  if (!userId) {
    return (
      <div className="max-w-md mx-auto bg-zinc-50 dark:bg-neutral-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-neutral-800 text-center space-y-6">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-4">
          <Upload size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">You must be logged in to upload ringtones to TamilRing.</p>
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
    <div className="max-w-md mx-auto bg-background p-6 rounded-2xl border border-zinc-200 dark:border-neutral-800 pb-32 transition-colors duration-300">

      {/* Progress */}
      <div className="flex justify-between mb-8 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
        <span className={step >= 1 ? 'text-emerald-500' : ''}>1. File Type</span>
        <span className={step >= 2 ? 'text-emerald-500' : ''}>2. Source</span>
        <span className={step >= 3 ? 'text-emerald-500' : ''}>3. Details</span>
      </div>

      {/* Step 1: File */}
      {step === 1 && (
        <div className="border-2 border-dashed border-zinc-200 dark:border-neutral-700 rounded-xl p-10 text-center hover:border-emerald-500 transition-colors">
          <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r" onChange={handleFileChange} className="hidden" id="audio-upload" />
          <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-emerald-500">
              <Upload size={32} />
            </div>
            <p className="text-zinc-600 dark:text-zinc-300">Drag & Drop or Click to Upload</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center px-4">
              MP3, M4R, WAV accepted.<br />
              <span className="text-emerald-500/70">Max duration 40s recommended for iPhone</span>
            </p>
          </label>
        </div>
      )}





      {/* Step 1.8: Content Type Selection */}
      {step === 1.8 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="text-emerald-500" size={20} />
              What type of content is this?
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-4">This helps us show the right form for your upload</p>
          </div>

          <div className="space-y-3">
            {/* Movie Option */}
            <button
              onClick={() => { setContentType('movie'); setStep(2); }}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${contentType === 'movie'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-zinc-200 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800/50 hover:border-emerald-500/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contentType === 'movie' ? 'bg-emerald-500 text-white dark:text-neutral-900' : 'bg-zinc-200 dark:bg-neutral-700 text-zinc-500 dark:text-zinc-400'
                  }`}>
                  <Film size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">Movie Song</p>
                  <p className="text-xs text-zinc-500">From Tamil/Telugu/Malayalam movies</p>
                </div>
                {contentType === 'movie' && <Check className="text-emerald-500" size={20} />}
              </div>
            </button>

            {/* Album Option */}
            <button
              onClick={() => { setContentType('album'); setStep(3); }}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${contentType === 'album'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-zinc-200 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800/50 hover:border-emerald-500/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contentType === 'album' ? 'bg-emerald-500 text-white dark:text-neutral-900' : 'bg-zinc-200 dark:bg-neutral-700 text-zinc-500 dark:text-zinc-400'
                  }`}>
                  <Music size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">Album / Independent Artist</p>
                  <p className="text-xs text-zinc-500">Non-movie songs, albums, singles</p>
                </div>
                {contentType === 'album' && <Check className="text-emerald-500" size={20} />}
              </div>
            </button>

            {/* Devotional Option */}
            <button
              onClick={() => { setContentType('devotional'); setStep(3); }}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${contentType === 'devotional'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-zinc-200 dark:border-neutral-700 bg-zinc-50 dark:bg-neutral-800/50 hover:border-emerald-500/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contentType === 'devotional' ? 'bg-emerald-500 text-white dark:text-neutral-900' : 'bg-zinc-200 dark:bg-neutral-700 text-zinc-500 dark:text-zinc-400'
                  }`}>
                  <Heart size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">Devotional Song</p>
                  <p className="text-xs text-zinc-500">Hindu, Christian, Muslim devotional songs</p>
                </div>
                {contentType === 'devotional' && <Check className="text-emerald-500" size={20} />}
              </div>
            </button>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => { setStep(1); setFile(null); }}
              className="text-zinc-400 hover:text-zinc-100 text-sm"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Movie Search (Only for Movie content type) */}
      {step === 2 && contentType === 'movie' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Select Movie
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
              onClick={() => setStep(1.8)}
              className="text-zinc-400 hover:text-zinc-100 text-sm"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details - Conditional based on Content Type */}
      {step === 3 && contentType === 'movie' && (
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
                    <div className="px-4 py-6 text-center text-zinc-500 text-xs">
                      {isLoadingSongs ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Searching iTunes...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p>No songs found for this movie.</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const manual = prompt("Enter song name manually:");
                              if (manual) setSongName(manual);
                              setShowSongDropdown(false);
                            }}
                            className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                          >
                            Enter Name Manually
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
              {Object.entries(getFilteredTagCategories()).map(([category, tags]) => (
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
              disabled={loading || !!duplicateError || !segmentName || (contentType === 'movie' && !manualMovieName)}
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
                  <span className="text-[10px] text-emerald-900 bg-emerald-400/50 px-2 py-0.5 rounded-full ml-1">+15 Rep</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Album Form */}
      {step === 3 && contentType === 'album' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Music className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-white">Album Details</h2>
          </div>

          {/* Streamlined Album Form */}

          {/* 1. Search Section or Selected Track Card */}
          {!isAlbumSongSelected ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Search Song or Artist</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={albumSearchQuery}
                    onChange={async (e) => {
                      const query = e.target.value;
                      setAlbumSearchQuery(query);

                      if (query.length > 2) {
                        setIsLoadingAlbumSongs(true);
                        try {
                          const res = await fetch(`/api/album/search?artist=${encodeURIComponent(query)}`);
                          const songs = await res.json();
                          setAlbumSongs(songs);
                          setShowAlbumSongDropdown(true);
                        } catch (e) {
                          console.error('Failed to fetch album songs:', e);
                        } finally {
                          setIsLoadingAlbumSongs(false);
                        }
                      } else {
                        setAlbumSongs([]);
                        setShowAlbumSongDropdown(false);
                      }
                    }}
                    onFocus={() => albumSongs.length > 0 && setShowAlbumSongDropdown(true)}
                    placeholder="Search for artist or song name..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-4 text-zinc-100 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  {isLoadingAlbumSongs && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="animate-spin text-zinc-500" />
                    </div>
                  )}

                  {/* Song Dropdown */}
                  {showAlbumSongDropdown && albumSongs.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl max-h-60 overflow-y-auto pb-1">
                      <div className="px-3 py-2 text-[10px] text-zinc-500 uppercase tracking-wider bg-neutral-900/50 sticky top-0 border-b border-neutral-700 backdrop-blur-sm">
                        Search Results
                      </div>
                      {albumSongs.map((song, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSongName(song.trackName);
                            setSingers(song.artistName);
                            setMusicDirector(song.artistName); // Default MD to Artist
                            setManualMovieName(song.collectionName.replace(/ - Single$/i, '').replace(/ - EP$/i, ''));
                            setAlbumSearchQuery('');
                            setAlbumSongs([]); // Clear results
                            setShowAlbumSongDropdown(false);
                            setIsAlbumSongSelected(true);
                            setManualEntryMode(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-700 border-b border-neutral-700/50 last:border-0 transition-colors group"
                        >
                          <p className="font-medium text-zinc-200 group-hover:text-emerald-400 text-sm">{song.trackName}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{song.artistName}</p>
                          <p className="text-[9px] text-zinc-600 truncate">{song.collectionName}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs text-zinc-600">or</span>
                <button
                  onClick={() => {
                    setIsAlbumSongSelected(true);
                    setManualEntryMode(true);
                  }}
                  className="block w-full mt-2 text-xs text-zinc-500 hover:text-emerald-500 underline decoration-dotted underline-offset-4"
                >
                  Enter details manually
                </button>
              </div>
            </div>
          ) : (
            // Selected Track Info Card (Visible ONLY when NOT in manual mode)
            !manualEntryMode && (
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 relative group">
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setManualEntryMode(true)}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-zinc-400 hover:text-emerald-400 rounded-lg transition-colors border border-neutral-700"
                    title="Edit Details"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setIsAlbumSongSelected(false);
                      setSongName('');
                      setSingers('');
                      setMusicDirector('');
                      setManualMovieName('');
                      setManualEntryMode(false);
                    }}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-zinc-400 hover:text-red-400 rounded-lg transition-colors border border-neutral-700"
                    title="Change Selection"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="flex items-start gap-4 pr-16">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
                    <Music size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm leading-tight mb-1">{songName}</h3>
                    <p className="text-xs text-zinc-400">{singers}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{manualMovieName}</p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* 2. Manual Inputs (Visible in Manual Mode) */}
          {(isAlbumSongSelected && manualEntryMode) && (
            <div className="space-y-4 p-4 bg-neutral-800/30 rounded-xl border border-neutral-800/50 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  {songName ? 'Edit Details' : 'Manual Details'}
                </h3>
                {/* Allow canceling manual mode if we came from a song selection */}
                {songName && (
                  <button
                    onClick={() => setManualEntryMode(false)}
                    className="text-[10px] text-emerald-500 hover:underline"
                  >
                    Done Editing
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Album / Single Name</label>
                <input
                  type="text"
                  value={manualMovieName}
                  onChange={(e) => setManualMovieName(e.target.value)}
                  placeholder="e.g., Kadhal Kavithai"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Song Name</label>
                <input
                  type="text"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  placeholder="e.g., Unnai Ninaithu"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <ArtistAutocomplete
                value={singers}
                onChange={setSingers}
                placeholder="Search artist..."
                label="Artist / Singer"
              />

              <ArtistAutocomplete
                value={musicDirector}
                onChange={setMusicDirector}
                placeholder="Search music director..."
                label="Music Director"
              />

              {!songName && (
                <button
                  onClick={() => {
                    setIsAlbumSongSelected(false);
                    setManualEntryMode(false);
                  }}
                  className="text-xs text-red-400 hover:underline mt-2 text-right block w-full"
                >
                  Cancel Manual Entry
                </button>
              )}
            </div>
          )}

          {/* 3. Ringtone Name (Always Visible if Selected/Manual) */}
          {isAlbumSongSelected && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 mb-1">Ringtone Name</label>
                <input
                  type="text"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="e.g., Pallavi, Charanam, BGM..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-500 mb-2">Tags</label>
            <div className="space-y-4 bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
              {Object.entries(getFilteredTagCategories()).map(([category, tags]) => (
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
              onClick={() => setStep(1.8)}
              className="text-zinc-400 hover:text-zinc-100 text-sm"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !!duplicateError || !segmentName || !manualMovieName}
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
                  <span className="text-[10px] text-emerald-900 bg-emerald-400/50 px-2 py-0.5 rounded-full ml-1">+15 Rep</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Devotional Form */}
      {step === 3 && contentType === 'devotional' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-white">Devotional Song Details</h2>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Deity / God</label>
            <select
              value={deityCategory}
              onChange={(e) => {
                setDeityCategory(e.target.value);
                // Auto-add Devotional tag
                if (!selectedTags.includes('Devotional')) {
                  setSelectedTags([...selectedTags, 'Devotional']);
                }
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select deity...</option>
              {Object.entries(DEITY_CATEGORIES).map(([religion, deities]) => (
                <optgroup key={religion} label={religion}>
                  {deities.map(deity => (
                    <option key={deity} value={deity}>{deity}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Song Name</label>
            <div className="relative">
              <div
                onClick={() => setShowDevotionalSongDropdown(!showDevotionalSongDropdown)}
                className="flex w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 cursor-pointer hover:border-emerald-500 transition-colors items-center justify-between"
              >
                <span className={songName ? "text-zinc-100" : "text-zinc-500"}>
                  {songName || (deityCategory ? `Select ${deityCategory} song...` : "Select deity first...")}
                </span>
                {isLoadingDevotionalSongs ? <Loader2 size={16} className="animate-spin text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
              </div>

              {/* Song Dropdown */}
              {showDevotionalSongDropdown && deityCategory && (
                <div className="absolute z-50 w-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl max-h-60 overflow-y-auto pb-1">
                  <div className="px-3 py-2 text-[10px] text-zinc-500 uppercase tracking-wider bg-neutral-900/50 sticky top-0 border-b border-neutral-700 backdrop-blur-sm">
                    {deityCategory} Songs
                  </div>
                  {devotionalSongs.length > 0 ? (
                    <>
                      {devotionalSongs.map((song, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSongName(song.trackName);
                            setSingers(song.artistName);
                            setShowDevotionalSongDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-700 border-b border-neutral-700/50 last:border-0 transition-colors group"
                        >
                          <p className="font-medium text-zinc-200 group-hover:text-emerald-400 text-sm">{song.trackName}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{song.artistName}</p>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-4 text-center text-zinc-500 text-xs">
                      {isLoadingDevotionalSongs ? 'Loading songs...' : `No ${deityCategory} songs found.`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Entry Fallback */}
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
              placeholder="e.g., Pallavi, Charanam, BGM..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <ArtistAutocomplete
            value={singers}
            onChange={setSingers}
            placeholder="Search or enter artist name..."
            label="Artist / Singer"
          />

          <ArtistAutocomplete
            value={musicDirector}
            onChange={setMusicDirector}
            placeholder="Search or enter music director..."
            label="Music Director"
          />

          <div>
            <label className="block text-xs text-zinc-500 mb-2">Tags</label>
            <div className="space-y-4 bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
              {Object.entries(getFilteredTagCategories()).map(([category, tags]) => (
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
              onClick={() => setStep(1.8)}
              className="text-zinc-400 hover:text-zinc-100 text-sm"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !!duplicateError || !segmentName || !deityCategory}
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
                  <span className="text-[10px] text-emerald-900 bg-emerald-400/50 px-2 py-0.5 rounded-full ml-1">+15 Rep</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <script
        dangerouslySetInnerHTML={{
          __html: `if (typeof SharedArrayBuffer === 'undefined') { window.SharedArrayBuffer = function() { throw new Error('Not supported'); }; }`
        }}
      />

      <Script
        src="https://unpkg.com/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if ((window as any).FFmpeg) loadFFmpeg();
        }}
      />
    </div>
  );
}
