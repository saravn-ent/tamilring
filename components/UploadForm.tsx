'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Upload, Search, Music, Check, Loader2, X, RefreshCw, CircleAlert, Film, ChevronDown, Wand2, ArrowRight, Sparkles, Heart, Pencil, Scissors } from 'lucide-react';
import ArtistAutocomplete from './ArtistAutocomplete';

import { searchMovies, MovieResult, getImageUrl, getMovieCredits, TMDB_GENRE_TO_TAG } from '@/lib/tmdb';
import { getSongsByMovie, iTunesRing, searchRings } from '@/lib/itunes';
import { createBrowserClient } from '@supabase/ssr';
import { notifyAdminOnUpload, processAutoApproval } from '@/app/actions/ringtones';
import { handleUploadReward } from '@/app/actions/user';
import { MOODS, DEITY_CATEGORIES } from '@/lib/constants';
import { generateAcousticFingerprint } from '@/lib/audio-utils';
import Image from 'next/image';
import ImageWithFallback from './ImageWithFallback';
import Script from 'next/script';
import { Turnstile } from '@marsidev/react-turnstile';
import { validateCaptcha } from '@/app/actions/security';

const TAG_CATEGORIES = {
  "Moods": ["Love", "Sad", "Mass", "BGM", "Motivational", "Devotional", "Funny"],
  "Types": ["Vocal", "Instrumental", "Interlude", "Humming", "Dialogue", "Remix", "8D Audio", "Intro", "Chorus", "Slowed + Reverb", "Cover", "Lo-fi"],
  "Vocals": ["Male", "Female", "Duet"],
  "Instruments": ["Flute", "Violin", "Guitar", "Piano", "Keyboard", "Whistle", "Saxophone", "Veena", "Drums", "Trumpet", "Nadaswaram", "Sitar", "Tabla", "Mridangam", "Harmonica", "Cello"]
};

const SEGMENT_SUGGESTIONS = ["Pallavi", "Charanam", "BGM", "Whistle", "Flute Version", "Violin Version", "Climax BGM", "Intro", "Interlude"];

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
  const [contentType, setContentType] = useState<'movie' | 'album' | 'devotional' | null>(null);
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

  const [songName, setSongName] = useState('');
  const [segmentName, setSegmentName] = useState(''); // e.g., "Pallavi", "BGM"

  // Movie Data (Source of Truth)
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [manualMovieName, setManualMovieName] = useState(''); // Fallback or override
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);

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
  const [lyricist, setLyricist] = useState('');
  const [movieYear, setMovieYear] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [language, setLanguage] = useState<'tamil' | 'english' | 'telugu' | 'malayalam' | 'hindi' | 'kannada'>('tamil');
  const [slug, setSlug] = useState('');

  // Duplication Check
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [acousticFingerprint, setAcousticFingerprint] = useState<string | null>(null);

  // Search State
  const [movieQuery, setMovieQuery] = useState('');
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [isSearchingMovie, setIsSearchingMovie] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Dynamic Deities State
  const [knownDeities, setKnownDeities] = useState<string[]>([]);
  useEffect(() => {
    if (step === 3 && contentType === 'devotional') {
      const fetchDeities = async () => {
        // Fetch all ringtones with 'Devotional' tag
        const { data } = await supabase
          .from('ringtones')
          .select('movie_name')
          .contains('tags', ['Devotional'])
          .eq('status', 'approved');

        if (data) {
          const names = Array.from(new Set(data.map((d: any) => d.movie_name).filter(Boolean)));
          setKnownDeities(names.sort() as string[]);
        }
      };
      fetchDeities();
    }
  }, [step, contentType]);

  // STEP 3 EFFECT: Fetch Songs
  useEffect(() => {
    if (step === 3 && selectedMovie) {
      const fetchSongs = async () => {
        setIsLoadingSongs(true);
        try {
          const itunesSongs = await getSongsByMovie(selectedMovie.title);
          const { data: communityData } = await supabase
            .from('ringtones')
            .select('song_name, singers, music_director')
            .eq('movie_name', selectedMovie.title)
            .not('song_name', 'is', null);

          const communitySongs: iTunesRing[] = (communityData || []).map(item => ({
            trackName: item.song_name,
            artistName: item.singers || 'Community Upload',
            collectionName: selectedMovie.title,
            previewUrl: '',
            musicDirector: item.music_director
          } as any));

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

  // DEVOTIONAL EFFECT
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

  // SLUG & DUPLICATE EFFECT
  useEffect(() => {
    const generateAndCheckSlug = async () => {
      const SEO_TAG_WHITELIST = ["BGM", "Vocal", "Instrumental", "Interlude", "Humming", "Dialogue", "Remix", "8D Audio"];
      const activeSeoTags = selectedTags.filter(tag => SEO_TAG_WHITELIST.includes(tag));
      const movieOrContextName = contentType === 'devotional' ? deityCategory : manualMovieName;

      if (movieOrContextName && segmentName) {
        const textParts = [segmentName];
        if (songName) textParts.push(songName);
        textParts.push(movieOrContextName);
        activeSeoTags.forEach(tag => {
          if (!segmentName.toLowerCase().includes(tag.toLowerCase())) {
            textParts.push(tag);
          }
        });

        const text = textParts.join(' ');
        const newSlug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setSlug(newSlug);

        setIsCheckingDuplicate(true);
        setDuplicateError(null);
        setDuplicateWarning(null);
        try {
          // 1. Check for Identical Slug
          const { data: slugData } = await supabase.from('ringtones').select('id').eq('slug', newSlug).single();
          if (slugData) {
            setDuplicateError('A ringtone with this exact identity already exists!');
            return;
          }

          // 2. Perform Advanced Duplicate Search (RPC)
          const { data: matches, error: rpcError } = await supabase.rpc('check_for_duplicates', {
            p_title: segmentName,
            p_movie_name: movieOrContextName,
            p_duration: Math.round(trimEnd - trimStart),
            p_audio_hash: fileHash,
            p_acoustic_fingerprint: acousticFingerprint
          });

          if (matches && matches.length > 0) {
            const match = matches[0];

            if (match.match_type === 'exact_hash' || match.match_type === 'metadata_duration') {
              // High confidence duplicate - BLOCK
              setDuplicateError(`This audio is already uploaded as "${match.title}" from "${match.movie_name}". Please don't upload duplicates.`);
            } else {
              // Medium confidence (Acoustic or Fuzzy) - FLAG FOR MODERATION
              setDuplicateWarning(`Note: This sounds very similar to an existing ringtone ("${match.title}"). It will be sent for manual moderation instead of being auto-approved.`);
            }
          }
        } catch (err) {
          console.error("Duplicate check failed:", err);
        } finally {
          setIsCheckingDuplicate(false);
        }
      }
    };
    const timer = setTimeout(generateAndCheckSlug, 500);
    return () => clearTimeout(timer);
  }, [songName, manualMovieName, segmentName, contentType, deityCategory, selectedTags, fileHash, acousticFingerprint]);

  const isVocalSelected = selectedTags.includes('Vocal');
  const isInstrumentalSelected = selectedTags.includes('Instrumental');

  const toggleTag = (tag: string, category: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      const categoryTags = TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES] || [];

      // Multi-select for Instruments (up to 4)
      if (category === "Instruments") {
        const currentInstruments = prev.filter(t => categoryTags.includes(t));
        if (currentInstruments.length >= 4) {
          alert('You can select up to 4 instruments.');
          return prev;
        }
        return [...prev, tag];
      }

      // Single-select for other categories
      const othersRemoved = prev.filter(t => !categoryTags.includes(t));
      return [...othersRemoved, tag];
    });
  };

  // Auto-fill tags based on Ringtone Name
  useEffect(() => {
    if (!segmentName) return;

    const lowerName = segmentName.toLowerCase();
    const newTags = [...selectedTags];
    let changed = false;

    // 1. Detect Instruments
    TAG_CATEGORIES.Instruments.forEach(inst => {
      if (lowerName.includes(inst.toLowerCase()) && !newTags.includes(inst)) {
        const currentInstruments = newTags.filter(t => TAG_CATEGORIES.Instruments.includes(t));
        if (currentInstruments.length < 4) {
          newTags.push(inst);
          changed = true;
          // If an instrument is detected, also ensure "Instrumental" is selected in Types
          if (!newTags.includes('Instrumental')) {
            const typeTags = TAG_CATEGORIES["Types"];
            const othersRemoved = newTags.filter(t => !typeTags.includes(t));
            othersRemoved.push('Instrumental');
            newTags.length = 0;
            newTags.push(...othersRemoved);
          }
        }
      }
    });

    // 2. Intelligent Detection of Moods & Types (BGM, Dialogue, Love, etc.)
    const autoCategories = ["Moods", "Types"];
    autoCategories.forEach(cat => {
      TAG_CATEGORIES[cat as "Moods" | "Types"].forEach(tag => {
        // Avoid redundant "Instrumental" check if already handled above
        if (tag === 'Instrumental' && changed) return;

        if (lowerName.includes(tag.toLowerCase()) && !newTags.includes(tag)) {
          if (cat === "Types") {
            const typeTags = TAG_CATEGORIES["Types"];
            const filtered = newTags.filter(t => !typeTags.includes(t));
            filtered.push(tag);
            newTags.length = 0;
            newTags.push(...filtered);
          } else {
            newTags.push(tag);
          }
          changed = true;
        }
      });
    });

    if (changed) {
      setSelectedTags(Array.from(new Set(newTags)));
    }
  }, [segmentName]);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current && ffmpegRef.current.isLoaded()) return ffmpegRef.current;
    const FFmpeg = (window as any).FFmpeg;
    if (!FFmpeg) throw new Error('Audio processor component not loaded. Please refresh the page.');
    try {
      const { createFFmpeg } = FFmpeg;
      if (!ffmpegRef.current) {
        ffmpegRef.current = createFFmpeg({
          log: true,
          corePath: `${window.location.origin}/ffmpeg-st/ffmpeg-core.js`,
          mainName: 'main'
        });
      }
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.isLoaded()) await ffmpeg.load();
      setFfmpegLoaded(true);
      return ffmpeg;
    } catch (e: any) {
      console.error("FFmpeg load failed:", e);
      const isIsolated = typeof window !== 'undefined' && (window as any).crossOriginIsolated;
      const hasSAB = typeof SharedArrayBuffer !== 'undefined';
      console.log("[FFmpeg] Load Failure Diagnostic:", { isIsolated, hasSAB });

      if (!isIsolated) {
        throw new Error('Audio processor requires Cross-Origin Isolation. Please ensure COOP/COEP headers are set.');
      }
      throw new Error(`Failed to start audio processing engine: ${e.message}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // 1. Calculate File Hash (SHA-256) - Fast
      try {
        const buffer = await selectedFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setFileHash(hashHex);
      } catch (e) {
        console.error('Hash calculation failed:', e);
      }

      // 2. Calculate Acoustic Fingerprint - Intensive (Async)
      generateAcousticFingerprint(selectedFile)
        .then(setAcousticFingerprint)
        .catch(err => console.error("Acoustic fingerprinting failed", err));

      const audio = new Audio();
      const objectUrl = URL.createObjectURL(selectedFile);
      audio.src = objectUrl;
      audio.onloadedmetadata = () => {
        if (audio.duration > 45) {
          alert('This file is longer than 45 seconds. Ringtones must be 45 seconds or less. Please use our Ringtone Cutter tool or upload a shorter file.');
        }
        setTrimEnd(audio.duration);
        URL.revokeObjectURL(objectUrl);
      };
      setStep(1.8);
      loadFFmpeg().catch(console.error);
    }
  };

  const handleMovieSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setMovieQuery(query);
    if (query.length > 0) {
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
    setSongName('');
    setSingers('');
    setMovieSongs([]);
    const credits = await getMovieCredits(movie.id);
    if (credits) {
      setMovieDirector(credits.crew.filter(c => c.job === 'Director').map(c => c.name).join(', '));
      setMusicDirector(credits.crew.filter(c => c.job === 'Original Music Composer' || c.job === 'Music').map(c => c.name).join(', '));
      setLyricist(credits.crew.filter(c => c.job === 'Lyricist' || c.job === 'Writer' || c.department === 'Writing').map(c => c.name).join(', '));
    }
    setMovieYear(movie.release_date?.split('-')[0] || '');

    // Auto-detect language from TMDB
    const langMap: Record<string, typeof language> = {
      'ta': 'tamil',
      'hi': 'hindi',
      'te': 'telugu',
      'ml': 'malayalam',
      'kn': 'kannada',
      'en': 'english'
    };
    if (movie.original_language && langMap[movie.original_language]) {
      setLanguage(langMap[movie.original_language]);
    }

    setSelectedTags([]);
    setStep(3);
  };

  const cleanName = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\(From.*?\)/gi, '')
      .replace(/\(Original.*?\)/gi, '')
      .replace(/\[From.*?\]/gi, '')
      .replace(/- From.*/gi, '')
      .replace(/[()]/g, '') // USER REQUEST: Remove all brackets
      .replace(/\s+/g, ' ')
      .trim();
  };

  const selectSong = (ring: iTunesRing & { musicDirector?: string }) => {
    setSongName(cleanName(ring.trackName));
    setSingers(ring.artistName !== 'Community Upload' ? ring.artistName : '');
    if (ring.musicDirector) {
      setMusicDirector(ring.musicDirector);
    }
    setSelectedArtwork(ring.artworkUrl100 || null);
    setShowSongDropdown(false);
  }



  const convertAudio = async (inputFile: File, targetFormat: 'mp3' | 'm4r', startTime: number = 0, duration: number = 0, applyFade: boolean = false): Promise<Blob> => {
    const ffmpeg = await loadFFmpeg();
    const { fetchFile } = (window as any).FFmpeg;

    const inputName = `input_${Date.now()}.audio`;
    const outputName = `output_${Date.now()}.${targetFormat}`;

    try {
      ffmpeg.FS('writeFile', inputName, await fetchFile(inputFile));

      // Build filter chain for fading
      // We apply 2s fade in and 2s fade out by default
      const actualDuration = duration > 0 ? duration : (trimEnd - startTime);
      const filters = [];
      if (applyFade && actualDuration > 4) {
        filters.push(`afade=t=in:ss=0:d=2`);
        filters.push(`afade=t=out:st=${(actualDuration - 2).toFixed(2)}:d=2`);
      }

      // Command args
      const args: string[] = ['-i', inputName];

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

    // Validation: Max duration 45s
    const finalDuration = (trimEnd > trimStart) ? (trimEnd - trimStart) : 0;
    if (finalDuration > 45) {
      alert('The ringtone duration cannot exceed 45 seconds. Please use our Ringtone Cutter tool or upload a shorter file.');
      return;
    }

    // Validation: Minimum 2 tags (USER REQUEST)
    const minTagsRequired = 2;

    if (selectedTags.length < minTagsRequired) {
      alert(`Please select at least ${minTagsRequired} tags to help users find your ringtone.`);
      return;
    }

    // Validation: Mandatory Sub-tags for Vocal and Instrumental
    if (selectedTags.includes('Vocal')) {
      const hasVocalType = selectedTags.some(t => TAG_CATEGORIES["Vocals"].includes(t));
      if (!hasVocalType) {
        alert('Since you selected "Vocal", please specify if it is Male, Female, or Duet.');
        return;
      }
    }

    if (selectedTags.includes('Instrumental')) {
      const hasInstrument = selectedTags.some(t => TAG_CATEGORIES["Instruments"].includes(t));
      if (!hasInstrument) {
        alert('Since you selected "Instrumental", please specify which Instrument it is (e.g. Flute, Piano).');
        return;
      }
    }

    // ... rest of validation logic ...
    setLoading(true);
    setLoadingMessage('Initializing...');

    const movieOrContextName = contentType === 'devotional' ? deityCategory : manualMovieName;

    // Build SEO dynamic title including whitelist tags
    const SEO_TAG_WHITELIST = ["BGM", "Vocal", "Instrumental", "Interlude", "Humming", "Dialogue", "Remix", "8D Audio"];
    const activeSeoTags = selectedTags.filter(tag => SEO_TAG_WHITELIST.includes(tag));

    // Use the user-entered Ringtone Name as the main title for the Ringtone Card
    // Logic: Segment Name - Song Name (Correct naming convention)
    let finalTitle = segmentName;
    const cleanSegment = segmentName.toLowerCase().trim();
    const cleanSong = songName ? songName.toLowerCase().trim() : '';

    // Only append song name if it's NOT already in the segment name
    if (cleanSong && !cleanSegment.includes(cleanSong)) {
      finalTitle = `${segmentName} - ${songName}`;
    }

    // Turnstile Validation
    if (!turnstileToken) {
      alert('Please complete the security challenge.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Verifying safety...');

    const captchaRes = await validateCaptcha(turnstileToken);
    if (!captchaRes.success) {
      setLoading(false);
      alert(captchaRes.error);
      return;
    }

    let mp3Blob: Blob | File = file;
    let m4rBlob: Blob | File | null = null;
    let iphoneUrl: string | null = null;

    try {
      const baseName = `${slug}-${Date.now()}`;

      // Conversion Logic
      setLoadingMessage('Processing audio...');

      try {
        // We ALWAYS try to process now to apply the auto-fade
        try {
          const duration = (trimEnd > trimStart) ? (trimEnd - trimStart) : 0;
          mp3Blob = await convertAudio(file, 'mp3', trimStart, duration, false);
          console.log('MP3 processing successful');
        } catch (mp3Err) {
          console.error('MP3 Processing Error:', mp3Err);
          console.log('Falling back to original file (no fade)');
          mp3Blob = file;
        }

        // M4R (iPhone)
        try {
          const duration = (trimEnd > trimStart) ? (trimEnd - trimStart) : 0;
          m4rBlob = await convertAudio(file, 'm4r', trimStart, duration, false);
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
      const mp3Path = `${userId}/${baseName}.mp3`;
      const { error: mp3Error } = await supabase.storage
        .from('ringtone-files')
        .upload(mp3Path, mp3Blob, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (mp3Error) {
        console.error('MP3 Upload Error:', mp3Error);
        throw new Error(`MP3 Upload failed: ${mp3Error.message}`);
      }
      console.log('MP3 upload done');
      const { data: { publicUrl: mp3Url } } = supabase.storage.from('ringtone-files').getPublicUrl(mp3Path);

      // 2. Upload M4R
      if (m4rBlob) {
        setLoadingMessage('Uploading iPhone version...');
        const m4rPath = `${userId}/${baseName}.m4r`;
        const { error: m4rError } = await supabase.storage
          .from('ringtone-files')
          .upload(m4rPath, m4rBlob, {
            contentType: 'audio/x-m4r',
            cacheControl: '3600',
            upsert: false
          });

        if (!m4rError) {
          const { data: { publicUrl } } = supabase.storage.from('ringtone-files').getPublicUrl(m4rPath);
          iphoneUrl = publicUrl;
        }
      }

      setLoadingMessage('Finalizing...');

      // Auto-fix: If song_name is empty but the entered Ringtone Name contains a dash
      // Move the first part to song_name if it looks like one (not a tag)
      const derivedSongName = songName;
      const titleToSave = finalTitle;

      if (!derivedSongName && titleToSave.includes(' - ')) {
        // Since we now auto-combine, we might need to be careful here or remove this legacy logic.
        // For new uploads, titleToSave is ALREADY "Segment - Song". 
        // We can trust the state variables 'songName' and 'segmentName' more than parsing the title.
      }

      // Calculate final duration for DB
      const currentDuration = (trimEnd > trimStart) ? (trimEnd - trimStart) : 0;

      // 3. Insert into Database - Different data based on content type
      const baseData = {
        user_id: userId,
        title: titleToSave,
        song_name: derivedSongName, // Use the corrected song name
        slug,
        singers,
        language, // New localized field
        music_director: musicDirector,
        lyricist,
        audio_url: mp3Url,
        audio_url_iphone: iphoneUrl || undefined,
        audio_hash: fileHash,
        acoustic_fingerprint: acousticFingerprint,
        tags: selectedTags,
        duration: Math.round(currentDuration), // Store in seconds
        status: duplicateWarning ? 'pending' : 'approved', // Moderation Queue if flagged
        is_suspected_duplicate: !!duplicateWarning,
        duplicate_reason: duplicateWarning || undefined
      };

      let insertData: any = baseData;

      // Deity to image mapping (fallback for devotional content)
      const DEITY_IMAGES: Record<string, string> = {
        'Murugan': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'Siva': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
        'Shiva': 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600',
        'Ganesha': 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?w=600',
        'Vinayagar': 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62?w=600',
        'Krishna': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
        'Vishnu': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
        'Lakshmi': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'Saraswati': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'Durga': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'Kali': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'Hanuman': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'Rama': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600',
        'Sai': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'Ayyappan': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'Perumal': 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600'
      };

      // Generic category placeholders
      const CATEGORY_PLACEHOLDERS: Record<string, string> = {
        'devotional': 'https://images.unsplash.com/photo-1604608672516-f1b1f1c0b4e1?w=600',
        'movie': 'https://images.unsplash.com/photo-1574267432644-f610a5e0d4c5?w=600',
        'album': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
        'default': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600'
      };

      // Helper to get deity image from movie name
      const getDeityImage = (movieName: string): string | null => {
        const lowerMovieName = movieName.toLowerCase();
        for (const [deity, imageUrl] of Object.entries(DEITY_IMAGES)) {
          if (lowerMovieName.includes(deity.toLowerCase())) {
            return imageUrl;
          }
        }
        return null;
      };

      // Helper to get category placeholder
      const getCategoryPlaceholder = (): string => {
        if (selectedTags.includes('Devotional')) {
          return CATEGORY_PLACEHOLDERS.devotional;
        }
        if (contentType === 'album') {
          return CATEGORY_PLACEHOLDERS.album;
        }
        return CATEGORY_PLACEHOLDERS.movie;
      };

      // Helper to determine poster URL
      const getPosterUrl = async (): Promise<string> => {
        // 1. Prefer Movie Poster (high quality)
        if (contentType === 'movie' && selectedMovie?.poster_path) {
          return getImageUrl(selectedMovie.poster_path, 'w342');
        }
        
        // 2. Use iTunes Artwork (upscaled)
        if (selectedArtwork) {
          return selectedArtwork.replace(/\/\d+x\d+bb/, '/600x600bb');
        }

        // 3. DEITY IMAGE FALLBACK: For devotional ringtones (check early)
        if (contentType === 'devotional' && deityCategory) {
          // Try database first
          try {
            const { data } = await supabase
              .from('deity_images')
              .select('image_url')
              .eq('deity_name', deityCategory)
              .single();
            if (data?.image_url) return data.image_url;
          } catch (e) {
            // Deity image not found in database, continue to hardcoded mapping
          }
          
          // Try hardcoded deity mapping
          const deityImage = getDeityImage(deityCategory);
          if (deityImage) return deityImage;
        }

        // 4. AUTO-FETCH FALLBACK: If we have a name but no selection, try a quick search
        if (manualMovieName) {
          try {
            if (contentType === 'album') {
              const results = await searchRings(manualMovieName);
              if (results && results.length > 0 && results[0].artworkUrl100) {
                return results[0].artworkUrl100.replace(/\/\d+x\d+bb/, '/600x600bb');
              }
            } else if (contentType === 'movie') {
              const results = await searchMovies(manualMovieName);
              // Check top 3 results for one with a poster
              const bestMatch = results?.slice(0, 3).find(m => m.poster_path);
              if (bestMatch?.poster_path) {
                return getImageUrl(bestMatch.poster_path, 'w342');
              }

              // Fallback to iTunes search for the movie if TMDB failed or has no posters
              const itunesResults = await searchRings(manualMovieName);
              if (itunesResults && itunesResults.length > 0 && itunesResults[0].artworkUrl100) {
                return itunesResults[0].artworkUrl100.replace(/\/\d+x\d+bb/, '/600x600bb');
              }
            }
          } catch (e) {
            console.warn('Auto-poster fetch failed:', e);
          }
        }

        // 5. FINAL FALLBACK: Use category-based placeholder (NEVER return undefined)
        console.warn('No poster found, using category placeholder');
        return getCategoryPlaceholder();
      };

      const finalPosterUrl = await getPosterUrl();

      if (contentType === 'movie') {
        insertData = {
          ...baseData,
          movie_name: manualMovieName,
          movie_year: movieYear || undefined,
          movie_director: movieDirector,
          poster_url: finalPosterUrl,
          backdrop_url: selectedMovie?.backdrop_path ? getImageUrl(selectedMovie.backdrop_path, 'w780') : undefined,
        };
      } else if (contentType === 'album') {
        insertData = {
          ...baseData,
          movie_name: manualMovieName,
          poster_url: finalPosterUrl,
        };
      } else if (contentType === 'devotional') {
        insertData = {
          ...baseData,
          movie_name: deityCategory,
          poster_url: finalPosterUrl,
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
            // ONLY if NOT flagged for duplicate (duplicateWarning is null)
            if (!duplicateWarning) {
              await processAutoApproval(userId);
            }

            // 2. Check First Upload Reward
            const rewardRes = await handleUploadReward(userId);
            
            if (duplicateWarning) {
              alert('Ringtone submitted for review! It was flagged as a potential duplicate and will be live once approved by a moderator.');
            } else if (rewardRes.success && rewardRes.bonusGiven) {
              alert('🎉 BINGO! You earned 15 Reputation Points (₹15) for your first upload! Go to your Profile to withdraw it instantly to your UPI.');
            } else {
              alert('Ringtone uploaded successfully! It is now live on the site.');
            }
          } catch (rewardErr) {
            console.warn("Reward processing failed", rewardErr);
            alert(duplicateWarning 
              ? 'Ringtone submitted for review!' 
              : 'Ringtone uploaded successfully! It is now live on the site.');
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
      setLyricist('');
      setMovieYear('');
      setSelectedTags([]);

      setContentType(null);
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
    // For movie, album or initial null state, return all categories
    return TAG_CATEGORIES;
  };

  if (!userId) {
    return (
      <div className="w-full bg-white p-8 rounded-3xl border border-brand-border text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-brand-wash rounded-full flex items-center justify-center mx-auto text-brand-accent mb-4">
          <Upload size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-brand-dark mb-2 tracking-tight">Login Required</h2>
          <p className="text-zinc-500 text-sm font-medium">You must be logged in to upload ringtones to TamilRing.</p>
        </div>
        <Link
          href="/profile"
          className="block w-full bg-brand-dark text-white font-bold py-4 rounded-xl hover:bg-neutral-800 transition-all shadow-lg shadow-brand-dark/20"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-3xl border border-brand-border pb-12 transition-all shadow-sm">

      {/* Progress */}
      <div className="flex justify-between mb-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        <span className={step >= 1 ? 'text-brand-accent' : ''}>1. File Type</span>
        <span className={step >= 2 ? 'text-brand-accent' : ''}>2. Source</span>
        <span className={step >= 3 ? 'text-brand-accent' : ''}>3. Details</span>
      </div>

      {/* Step 1: File */}
      {step === 1 && (
        <div className="border-2 border-dashed border-brand-border/50 bg-brand-wash/30 rounded-3xl p-10 text-center hover:border-brand-accent transition-all group cursor-pointer relative overflow-hidden">
          <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.m4r" onChange={handleFileChange} className="hidden" id="audio-upload" />
          <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center gap-4 relative z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-brand-accent shadow-sm border border-brand-border group-hover:scale-110 transition-transform duration-300">
              <Upload size={32} />
            </div>
            <p className="text-brand-dark font-black tracking-tight text-lg">Drag & Drop or Click to Upload</p>
            <p className="text-zinc-400 text-xs text-center px-4 font-medium">
              MP3, M4R, WAV accepted.<br />
              <span className="text-brand-accent font-bold">Max duration: 45 seconds</span>
            </p>
          </label>
        </div>
      )}





      {/* Step 1.8: Content Type Selection */}
      {step === 1.8 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-brand-dark mb-2 flex items-center gap-2 tracking-tight">
              <Sparkles className="text-brand-accent" size={22} />
              What type of content is this?
            </h2>
            <p className="text-xs text-zinc-500 font-medium mb-6">This helps us show the right form for your upload</p>
          </div>

          <div className="space-y-3">
            {/* Movie Option */}
            <button
              onClick={() => { setContentType('movie'); setStep(2); setSelectedTags([]); }}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${contentType === 'movie'
                ? 'border-brand-accent bg-brand-wash shadow-sm'
                : 'border-brand-border bg-white hover:border-brand-accent/50'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${contentType === 'movie' ? 'bg-brand-accent text-white' : 'bg-brand-wash text-zinc-400'
                  }`}>
                  <Film size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-brand-dark tracking-tight">Movie Song</p>
                  <p className="text-xs text-zinc-500 font-medium">From Tamil/Telugu/Malayalam movies</p>
                </div>
                {contentType === 'movie' && <Check className="text-brand-accent" size={20} />}
              </div>
            </button>

            {/* Album Option */}
            <button
              onClick={() => { setContentType('album'); setStep(3); setSelectedTags([]); }}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${contentType === 'album'
                ? 'border-brand-accent bg-brand-wash shadow-sm'
                : 'border-brand-border bg-white hover:border-brand-accent/50'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${contentType === 'album' ? 'bg-brand-accent text-white' : 'bg-brand-wash text-zinc-400'
                  }`}>
                  <Music size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-brand-dark tracking-tight">Album / Independent Artist</p>
                  <p className="text-xs text-zinc-500 font-medium">Non-movie songs, albums, singles</p>
                </div>
                {contentType === 'album' && <Check className="text-brand-accent" size={20} />}
              </div>
            </button>

            {/* Devotional Option */}
            <button
              onClick={() => { setContentType('devotional'); setStep(3); setSelectedTags([]); }}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${contentType === 'devotional'
                ? 'border-brand-accent bg-brand-wash shadow-sm'
                : 'border-brand-border bg-white hover:border-brand-accent/50'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${contentType === 'devotional' ? 'bg-brand-accent text-white' : 'bg-brand-wash text-zinc-400'
                  }`}>
                  <Heart size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-brand-dark tracking-tight">Devotional Song</p>
                  <p className="text-xs text-zinc-500 font-medium">Hindu, Christian, Muslim devotional songs</p>
                </div>
                {contentType === 'devotional' && <Check className="text-brand-accent" size={20} />}
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
                  className="flex-1 bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark font-medium focus:outline-none focus:border-brand-accent transition-colors placeholder:text-zinc-400"
                  autoFocus
                />
                <div className="bg-brand-dark text-white p-3 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-brand-dark/20">
                  {isSearchingMovie ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </div>
              </div>

              {/* Movie Results */}
              {movies.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-brand-border rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                  <div className="flex justify-between items-center p-3 border-b border-brand-border bg-white sticky top-0 backdrop-blur-md">
                    <span className="text-xs text-zinc-400 px-2 font-black uppercase tracking-wider">Select the correct movie</span>
                    <button onClick={() => setMovies([])}><X size={14} className="text-zinc-400 hover:text-brand-dark" /></button>
                  </div>
                  {movies.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => selectMovie(movie)}
                      className="w-full text-left px-4 py-3 hover:bg-brand-wash border-b border-brand-border/50 last:border-0 transition-colors group flex items-center gap-4"
                    >
                      {movie.poster_path ? (
                        <div className="relative w-10 h-14 shrink-0 rounded-lg overflow-hidden shadow-sm border border-brand-border/20">
                          <ImageWithFallback src={getImageUrl(movie.poster_path, 'w92')} alt={movie.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-14 bg-brand-wash rounded-lg flex items-center justify-center shrink-0 text-zinc-400"><Film size={16} /></div>
                      )}
                      <div>
                        <p className="font-bold text-brand-dark group-hover:text-brand-accent transition-colors">{movie.title}</p>
                        <p className="text-xs text-zinc-500 font-medium">{movie.release_date?.split('-')[0] || 'Unknown'}</p>
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
          <div className="flex bg-white p-4 rounded-2xl gap-4 shadow-sm border border-brand-border items-center">
            {selectedMovie?.poster_path ? (
              <div className="relative w-12 h-16 bg-brand-wash rounded-lg overflow-hidden shrink-0 shadow-sm border border-brand-border/20">
                <ImageWithFallback src={getImageUrl(selectedMovie.poster_path)} alt={manualMovieName} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-16 bg-brand-wash rounded-lg flex items-center justify-center text-zinc-400"><Film size={20} /></div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[10px] text-brand-accent uppercase tracking-wider font-black mb-0.5">Verified Movie</p>
              <p className="text-base font-black text-brand-dark truncate leading-tight">{manualMovieName}</p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">{selectedMovie?.release_date?.split('-')[0]} • {musicDirector.split(',')[0]}</p>
            </div>
            <button onClick={() => setStep(2)} className="text-xs font-bold text-brand-accent hover:text-brand-dark transition-colors self-center shrink-0 px-3 py-1.5 bg-brand-wash rounded-lg">Change</button>
          </div>

          {/* Language Selection - NEW for Localization */}
          <div className="bg-brand-wash/50 p-4 rounded-2xl border border-brand-border">
            <label className="block text-[10px] text-zinc-400 uppercase font-black mb-3 tracking-wider">Song Language</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'tamil', label: 'Tamil', flag: '🇮🇳' },
                { id: 'english', label: 'English', flag: '🇺🇸' },
                { id: 'telugu', label: 'Telugu', flag: '🇮🇳' },
                { id: 'hindi', label: 'Hindi', flag: '🇮🇳' },
                { id: 'malayalam', label: 'Malayalam', flag: '🇮🇳' },
                { id: 'kannada', label: 'Kannada', flag: '🇮🇳' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${language === lang.id
                    ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                    : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                    }`}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-2 italic px-1">This helps show your ringtone to the right audience.</p>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Official Song Selection <span className="text-brand-accent">*</span></label>
            <div className="relative">
              <div
                onClick={() => setShowSongDropdown(!showSongDropdown)}
                className={`flex w-full bg-brand-wash border rounded-xl px-4 py-3 text-brand-dark cursor-pointer transition-colors items-center justify-between font-medium ${songName ? 'border-brand-border' : 'border-brand-accent border-dashed bg-brand-accent/5'}`}
              >
                <div className="flex items-center gap-2">
                  <Music size={16} className={songName ? "text-brand-accent" : "text-zinc-400"} />
                  <span className={songName ? "text-brand-dark font-black" : "text-brand-accent/70"}>
                    {songName || `Click to find a song in "${manualMovieName}"...`}
                  </span>
                </div>
                {isLoadingSongs ? <Loader2 size={16} className="animate-spin text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
              </div>

              {/* Song Dropdown */}
              {showSongDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-brand-border rounded-xl shadow-2xl max-h-60 overflow-y-auto pb-1">
                  <div className="px-3 py-2 text-[10px] text-zinc-400 uppercase tracking-wider bg-white sticky top-0 border-b border-brand-border backdrop-blur-sm font-black">
                    Official Track List
                  </div>
                  {movieSongs.length > 0 ? (
                    <>
                      {movieSongs.map((ring, i) => (
                        <button
                          key={i}
                          onClick={() => selectSong(ring)}
                          className="w-full text-left px-4 py-3 hover:bg-brand-wash border-b border-brand-border/50 last:border-0 transition-colors group"
                        >
                          <p className="font-bold text-brand-dark group-hover:text-brand-accent text-sm">{cleanName(ring.trackName)}</p>
                          <p className="text-[10px] text-zinc-500 truncate font-medium">{ring.artistName}</p>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center text-zinc-500 text-xs">
                      {isLoadingSongs ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Searching iTunes Catalog...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p>We couldn't find any official songs for this title.</p>
                          <div className="p-3 bg-brand-wash rounded-xl border border-brand-border text-left">
                            <p className="text-[10px] text-zinc-400 uppercase font-black mb-1">Manual Entry (Only if missing)</p>
                            <input
                              type="text"
                              autoFocus
                              placeholder="Type Song Name..."
                              className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setSongName((e.target as HTMLInputElement).value);
                                  setShowSongDropdown(false);
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Ringtone Name</label>
            <input
              type="text"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value.replace(/[()]/g, ''))}
              placeholder="e.g., BGM, Whistle, Lyrics..."
              className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:border-brand-accent transition-colors font-medium placeholder:text-zinc-400"
            />
          </div>


          {!movieDirector && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Director</label>
              <input
                type="text"
                value={movieDirector}
                onChange={(e) => setMovieDirector(e.target.value.replace(/[()]/g, ''))}
                placeholder="e.g., Mani Ratnam"
                className="w-full bg-brand-wash border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-dark focus:outline-none focus:border-brand-accent transition-colors font-medium"
              />
            </div>
          )}

          {!musicDirector && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Music Director</label>
              <input
                type="text"
                value={musicDirector}
                onChange={(e) => setMusicDirector(e.target.value.replace(/[()]/g, ''))}
                className="w-full bg-brand-wash border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-dark focus:outline-none focus:border-brand-accent transition-colors font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Artists</label>
            <input
              type="text"
              value={singers}
              onChange={(e) => setSingers(e.target.value.replace(/[()]/g, ''))}
              placeholder="e.g., Sid Sriram, Shreya Ghoshal"
              className="w-full bg-brand-wash border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-dark focus:outline-none focus:border-brand-accent transition-colors font-medium"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-2 ml-1 font-bold uppercase tracking-wider">Tags</label>
            <div className="space-y-4 bg-brand-wash p-4 rounded-2xl border border-brand-border">
              {/* 1. Moods (Always Visible) */}
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Moods & Emotions</p>
                <div className="flex flex-wrap gap-2">
                  {TAG_CATEGORIES["Moods"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, "Moods")}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                        ? 'bg-brand-dark border-brand-dark text-white shadow-lg shadow-brand-dark/20'
                        : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Types (Always Visible - Triggers other sections) */}
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Type (Select to reveal options)</p>
                <div className="flex flex-wrap gap-2">
                  {TAG_CATEGORIES["Types"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, "Types")}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                        ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                        : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Vocals (Only if Vocal type is selected) */}
              {isVocalSelected && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Vocal Type</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_CATEGORIES["Vocals"].map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, "Vocals")}
                        className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                          ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                          : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Instruments (Only if Instrumental type is selected) */}
              {isInstrumentalSelected && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Instruments</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_CATEGORIES["Instruments"].map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, "Instruments")}
                        className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                          ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                          : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Slug Preview & Duplicate Error */}
          <div className="space-y-2">
            {duplicateError && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                <CircleAlert size={14} />
                <span>{duplicateError}</span>
              </div>
            )}
            {duplicateWarning && (
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">
                <Sparkles size={14} />
                <span>{duplicateWarning}</span>
              </div>
            )}
            {isCheckingDuplicate && (
              <span className="text-xs text-brand-accent flex items-center gap-1 font-bold animate-pulse"><Loader2 size={10} className="animate-spin" /> Checking availability...</span>
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
              className="flex-1 ml-4 bg-brand-dark text-white font-black py-4 rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-dark/20 uppercase tracking-wide text-sm"
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
            <Music className="text-brand-accent" size={24} />
            <h2 className="text-xl font-black text-brand-dark tracking-tight">Album Details</h2>
          </div>

          {/* Streamlined Album Form */}

          {/* 1. Search Section or Selected Track Card */}
          {!isAlbumSongSelected ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Search Song or Artist</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={albumSearchQuery}
                    onChange={async (e) => {
                      const query = e.target.value;
                      setAlbumSearchQuery(query);

                      if (query.length > 0) {
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
                    className="w-full bg-brand-wash border border-brand-border rounded-xl pl-10 pr-4 py-4 text-brand-dark focus:outline-none focus:border-brand-accent text-sm font-medium transition-colors placeholder:text-zinc-400"
                  />
                  {isLoadingAlbumSongs && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="animate-spin text-zinc-400" />
                    </div>
                  )}

                  {/* Song Dropdown */}
                  {showAlbumSongDropdown && albumSongs.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-brand-border rounded-xl shadow-2xl max-h-60 overflow-y-auto pb-1">
                      <div className="px-3 py-2 text-[10px] text-zinc-400 uppercase tracking-wider bg-white sticky top-0 border-b border-brand-border backdrop-blur-sm font-black">
                        Search Results
                      </div>
                      {albumSongs.map((song, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSongName(song.trackName.replace(/[()]/g, ''));
                            setSingers(song.artistName.replace(/[()]/g, ''));
                            setMusicDirector(song.artistName.replace(/[()]/g, '')); // Default MD to Artist
                            setManualMovieName(song.collectionName.replace(/ - Single$/i, '').replace(/ - EP$/i, '').replace(/[()]/g, ''));
                            setAlbumSearchQuery('');
                            setSelectedArtwork(song.artworkUrl100 || null);
                            setAlbumSongs([]); // Clear results
                            setShowAlbumSongDropdown(false);
                            setIsAlbumSongSelected(true);
                            setManualEntryMode(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-brand-wash border-b border-brand-border/50 last:border-0 transition-colors group"
                        >
                          <p className="font-bold text-brand-dark group-hover:text-brand-accent text-sm">{song.trackName}</p>
                          <p className="text-[10px] text-zinc-500 truncate font-medium">{song.artistName}</p>
                          <p className="text-[9px] text-zinc-400 truncate">{song.collectionName}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs text-zinc-500 font-medium">or</span>
                <button
                  onClick={() => {
                    setIsAlbumSongSelected(true);
                    setManualEntryMode(true);
                  }}
                  className="block w-full mt-2 text-xs text-brand-accent hover:text-brand-dark font-bold underline decoration-dotted underline-offset-4"
                >
                  Enter details manually
                </button>
              </div>
            </div>
          ) : (
            // Selected Track Info Card (Visible ONLY when NOT in manual mode)
            !manualEntryMode && (
              <div className="bg-white border border-brand-border rounded-xl p-4 relative group shadow-sm">
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setManualEntryMode(true)}
                    className="p-1.5 bg-brand-wash hover:bg-brand-border/50 text-zinc-400 hover:text-brand-accent rounded-lg transition-colors border border-brand-border/50"
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
                      setSelectedArtwork(null);
                      setManualEntryMode(false);
                    }}
                    className="p-1.5 bg-brand-wash hover:bg-brand-border/50 text-zinc-400 hover:text-red-500 rounded-lg transition-colors border border-brand-border/50"
                    title="Change Selection"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="flex items-start gap-4 pr-16">
                  <div className="w-12 h-12 bg-brand-wash rounded-lg flex items-center justify-center text-brand-accent shrink-0 border border-brand-border/20 overflow-hidden relative">
                    {selectedArtwork ? (
                      <ImageWithFallback src={selectedArtwork} alt={songName} fill className="object-cover" />
                    ) : (
                      <Music size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-brand-dark font-black text-sm leading-tight mb-1">{songName}</h3>
                    <p className="text-xs text-zinc-500 font-medium">{singers}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{manualMovieName}</p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* 2. Manual Inputs (Visible in Manual Mode) */}
          {(isAlbumSongSelected && manualEntryMode) && (
            <div className="space-y-4 p-6 bg-brand-wash/50 rounded-2xl border border-brand-border animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  {songName ? 'Edit Details' : 'Manual Details'}
                </h3>
                {/* Allow canceling manual mode if we came from a song selection */}
                {songName && (
                  <button
                    onClick={() => setManualEntryMode(false)}
                    className="text-[10px] text-brand-accent hover:underline font-bold"
                  >
                    Done Editing
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Album / Single Name</label>
                <input
                  type="text"
                  value={manualMovieName}
                  onChange={(e) => setManualMovieName(e.target.value.replace(/[()]/g, ''))}
                  placeholder="e.g., Kadhal Kavithai"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-brand-dark text-sm focus:outline-none focus:border-brand-accent transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Song Name <span className="text-zinc-400 font-normal normal-case">(Optional)</span></label>
                <input
                  type="text"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value.replace(/[()]/g, ''))}
                  placeholder="e.g., Unnai Ninaithu"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-brand-dark text-sm focus:outline-none focus:border-brand-accent transition-colors font-medium"
                />
              </div>




              <div>
                <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Artists</label>
                <input
                  type="text"
                  value={singers}
                  onChange={(e) => setSingers(e.target.value.replace(/[()]/g, ''))}
                  placeholder="e.g., Sid Sriram, Shreya Ghoshal"
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-brand-dark text-sm focus:outline-none focus:border-brand-accent transition-colors font-medium"
                />
              </div>

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
                    setSelectedArtwork(null);
                  }}
                  className="text-xs text-red-400 hover:underline mt-2 text-right block w-full font-medium"
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
                <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Ringtone Name</label>
                <input
                  type="text"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value.replace(/[()]/g, ''))}
                  placeholder="e.g., Pallavi, Charanam, BGM..."
                  className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:border-brand-accent transition-colors font-medium placeholder:text-zinc-400"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-500 mb-2 ml-1 font-bold uppercase tracking-wider">Tags</label>
            <div className="space-y-4 bg-brand-wash p-4 rounded-2xl border border-brand-border">

              {/* 1. Moods (Always Visible) */}
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Moods & Emotions</p>
                <div className="flex flex-wrap gap-2">
                  {TAG_CATEGORIES["Moods"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, "Moods")}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                        ? 'bg-brand-dark border-brand-dark text-white shadow-lg shadow-brand-dark/20'
                        : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Types (Always Visible - Triggers other sections) */}
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Type (Select to reveal options)</p>
                <div className="flex flex-wrap gap-2">
                  {TAG_CATEGORIES["Types"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, "Types")}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                        ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                        : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Vocals (Only if Vocal type is selected) */}
              {isVocalSelected && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Vocal Type</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_CATEGORIES["Vocals"].map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, "Vocals")}
                        className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                          ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                          : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Instruments (Only if Instrumental type is selected) */}
              {isInstrumentalSelected && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Instruments (Select up to 4)</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_CATEGORIES["Instruments"].map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, "Instruments")}
                        className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                          ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                          : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Slug Preview & Duplicate Error */}
          <div className="space-y-2">
            {duplicateError && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                <CircleAlert size={14} />
                <span>{duplicateError}</span>
              </div>
            )}
            {isCheckingDuplicate && (
              <span className="text-xs text-brand-accent flex items-center gap-1 font-bold animate-pulse"><Loader2 size={10} className="animate-spin" /> Checking availability...</span>
            )}
          </div>

          <div className="flex justify-center py-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{
                theme: 'light',
              }}
            />
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
              disabled={loading || !!duplicateError || !segmentName || !manualMovieName || !turnstileToken}
              className="flex-1 ml-4 bg-brand-dark text-white font-black py-4 rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-dark/20 uppercase tracking-wide text-sm"
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
            <Heart className="text-brand-accent" size={24} />
            <h2 className="text-xl font-black text-brand-dark tracking-tight">Devotional Song Details</h2>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Deity / God</label>
            <input
              type="text"
              list="deity-list"
              value={deityCategory}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[()]/g, '');
                setDeityCategory(sanitized);
                // Auto-add Devotional tag
                if (!selectedTags.includes('Devotional')) {
                  setSelectedTags([...selectedTags, 'Devotional']);
                }
              }}
              onFocus={() => {
                if (deityCategory === '') {
                  // Optional: fetch checks if not already done, but we'll do it in useEffect
                }
              }}
              placeholder="Select or type deity name..."
              className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:border-brand-accent transition-colors font-medium"
            />
            <datalist id="deity-list">
              {/* Dynamic DB Deities */}
              {knownDeities.map(deity => (
                <option key={`dyn-${deity}`} value={deity} />
              ))}
              {/* Static Categories Fallback */}
              {Object.entries(DEITY_CATEGORIES).flatMap(([religion, deities]) =>
                deities.map(d => (
                  !knownDeities.includes(d) ? <option key={`stat-${d}`} value={d} /> : null
                ))
              )}
            </datalist>
          </div>

          {/* Preview Card */}
          {(deityCategory || songName) && (
            <div className="bg-white border border-brand-border rounded-xl p-4 relative group shadow-sm flex items-start gap-4">
              <div className="w-12 h-16 bg-brand-wash rounded-lg flex items-center justify-center text-brand-accent shrink-0 border border-brand-border/20 overflow-hidden relative">
                {selectedArtwork ? (
                  <Image src={selectedArtwork} alt={songName || deityCategory} fill className="object-cover" />
                ) : (
                  <Heart size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-brand-accent uppercase tracking-wider font-black mb-0.5">Devotional Preview</p>
                <h3 className="text-brand-dark font-black text-sm leading-tight mb-1 truncate">{songName || 'Select a song...'}</h3>
                <p className="text-xs text-zinc-500 font-medium truncate">{deityCategory}</p>
                {singers && <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{singers}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Song Name <span className="text-zinc-400 font-normal normal-case">(Optional)</span></label>
            <div className="relative">
              <div
                onClick={() => setShowDevotionalSongDropdown(!showDevotionalSongDropdown)}
                className="flex w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark cursor-pointer hover:border-brand-accent transition-colors items-center justify-between font-medium"
              >
                <span className={songName ? "text-brand-dark" : "text-zinc-500"}>
                  {songName || (deityCategory ? `Select ${deityCategory} song...` : "Select deity first...")}
                </span>
                {isLoadingDevotionalSongs ? <Loader2 size={16} className="animate-spin text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
              </div>

              {/* Song Dropdown */}
              {showDevotionalSongDropdown && deityCategory && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-brand-border rounded-xl shadow-2xl max-h-60 overflow-y-auto pb-1">
                  <div className="px-3 py-2 text-[10px] text-zinc-400 uppercase tracking-wider bg-white sticky top-0 border-b border-brand-border backdrop-blur-sm font-black">
                    {deityCategory} Songs
                  </div>
                  {devotionalSongs.length > 0 ? (
                    <>
                      {devotionalSongs.map((song, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSongName(song.trackName.replace(/[()]/g, ''));
                            setSingers(song.artistName.replace(/[()]/g, ''));
                            setSelectedArtwork(song.artworkUrl100 || null);
                            setShowDevotionalSongDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-brand-wash border-b border-brand-border/50 last:border-0 transition-colors group"
                        >
                          <p className="font-bold text-brand-dark group-hover:text-brand-accent text-sm">{song.trackName}</p>
                          <p className="text-[10px] text-zinc-500 truncate font-medium">{song.artistName}</p>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-4 text-center text-zinc-500 text-xs font-medium">
                      {isLoadingDevotionalSongs ? 'Loading songs...' : `No ${deityCategory} songs found.`}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Entry Fallback */}
            <div className="mt-2 text-right">
              <button
                className="text-[10px] text-brand-accent hover:text-brand-dark font-bold underline"
                onClick={() => {
                  const manual = prompt("Enter song name manually:");
                  if (manual) setSongName(manual.replace(/[()]/g, ''));
                }}
              >
                Song not listed? Enter manually
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Ringtone Name</label>
            <input
              type="text"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value.replace(/[()]/g, ''))}
              placeholder="e.g., Pallavi, Charanam, BGM..."
              className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:border-brand-accent transition-colors font-medium placeholder:text-zinc-400"
            />
          </div>




          <div>
            <label className="block text-xs text-zinc-500 mb-1 ml-1 font-bold uppercase tracking-wider">Artists</label>
            <input
              type="text"
              value={singers}
              onChange={(e) => setSingers(e.target.value.replace(/[()]/g, ''))}
              placeholder="e.g., Sid Sriram, Shreya Ghoshal"
              className="w-full bg-brand-wash border border-brand-border rounded-xl px-4 py-3 text-brand-dark focus:outline-none focus:border-brand-accent transition-colors font-medium"
            />
          </div>

          {contentType !== 'devotional' && (
            <ArtistAutocomplete
              value={musicDirector}
              onChange={setMusicDirector}
              placeholder="Search or enter music director..."
              label="Music Director"
            />
          )}

          <div>
            <label className="block text-xs text-zinc-500 mb-2 ml-1 font-bold uppercase tracking-wider">Tags</label>
            <div className="space-y-4 bg-brand-wash p-4 rounded-2xl border border-brand-border">
              {/* 1. Moods (Always Visible) */}
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Moods & Emotions</p>
                <div className="flex flex-wrap gap-2">
                  {TAG_CATEGORIES["Moods"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, "Moods")}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                        ? 'bg-brand-dark border-brand-dark text-white shadow-lg shadow-brand-dark/20'
                        : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Types (Always Visible - Triggers other sections) */}
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Type (Select to reveal options)</p>
                <div className="flex flex-wrap gap-2">
                  {TAG_CATEGORIES["Types"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag, "Types")}
                      className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                        ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                        : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Vocals (Only if Vocal type is selected) */}
              {isVocalSelected && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Vocal Type</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_CATEGORIES["Vocals"].map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, "Vocals")}
                        className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                          ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                          : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Instruments (Only if Instrumental type is selected) */}
              {isInstrumentalSelected && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-zinc-400 uppercase font-black mb-2 tracking-wider">Instruments (Select up to 4)</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_CATEGORIES["Instruments"].map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, "Instruments")}
                        className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all ${selectedTags.includes(tag)
                          ? 'bg-brand-dark border-brand-dark text-white shadow-lg'
                          : 'bg-white border-brand-border text-zinc-500 hover:border-brand-dark hover:text-brand-dark'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Slug Preview & Duplicate Error */}
          <div className="space-y-2">
            {duplicateError && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                <CircleAlert size={14} />
                <span>{duplicateError}</span>
              </div>
            )}
            {isCheckingDuplicate && (
              <span className="text-xs text-brand-accent flex items-center gap-1 font-bold animate-pulse"><Loader2 size={10} className="animate-spin" /> Checking availability...</span>
            )}
          </div>

          <div className="flex justify-center py-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{
                theme: 'light',
              }}
            />
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
              disabled={loading || !!duplicateError || !segmentName || !deityCategory || !turnstileToken}
              className="flex-1 ml-4 bg-brand-dark text-white font-black py-4 rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-dark/20 uppercase tracking-wide text-sm"
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

                </>
              )}
            </button>
          </div>
        </div>
      )}



      <Script
        src="/ffmpeg/ffmpeg.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if ((window as any).FFmpeg) loadFFmpeg();
        }}
      />
    </div>
  );
}
