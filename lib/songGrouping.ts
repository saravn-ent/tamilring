import { Ringtone } from '@/types';

export interface GroupedCut {
  ringtone: Ringtone;
  cleanCutTitle: string;
}

export interface SongGroup {
  songName: string;
  cuts: GroupedCut[];
  totalDownloads: number;
  totalLikes: number;
  topCut: Ringtone;
}

/**
 * Extracts a normalized song name and clean cut description from a ringtone
 */
export function extractSongAndCut(ringtone: Ringtone, movieName: string): { songName: string; cleanCutTitle: string } {
  const rawTitle = ringtone.title?.trim() || '';
  const explicitSong = ringtone.song_name?.trim();

  // If explicit song_name is provided and is not identical to movie_name
  if (explicitSong && explicitSong.toLowerCase() !== movieName.toLowerCase()) {
    let cleanCut = rawTitle;
    // Strip movie name from cut title
    cleanCut = cleanCut.replace(new RegExp(escapeRegExp(movieName), 'gi'), '').trim();
    // Strip song name if it's repeated in the cut title
    cleanCut = cleanCut.replace(new RegExp(escapeRegExp(explicitSong), 'gi'), '').trim();
    cleanCut = cleanCut.replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g, '').trim();

    return {
      songName: explicitSong,
      cleanCutTitle: cleanCut || explicitSong,
    };
  }

  // Check if this is a theme, score, or BGM cut
  const isBgm = /(\bbgm\b|\btheme\b|\bscore\b|\binstrumental\b|first roar|teaser|trailer)/i.test(rawTitle);
  if (isBgm) {
    let cleanCut = rawTitle.replace(new RegExp(escapeRegExp(movieName), 'gi'), '').trim();
    cleanCut = cleanCut.replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g, '').trim();
    return {
      songName: 'Theme & BGM',
      cleanCutTitle: cleanCut || 'Main Theme Score',
    };
  }

  // Split title by common delimiters (e.g., "Movie - Song - Cut")
  let clean = rawTitle.replace(new RegExp(escapeRegExp(movieName), 'gi'), '').trim();
  clean = clean.replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g, '').trim();

  const parts = clean.split(/[\-–—:]+/).map(p => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const candidateSong = parts[0];
    const candidateCut = parts.slice(1).join(' - ').trim();
    return {
      songName: candidateSong,
      cleanCutTitle: candidateCut || candidateSong,
    };
  } else if (parts.length === 1) {
    return {
      songName: parts[0],
      cleanCutTitle: parts[0],
    };
  }

  return {
    songName: 'Soundtrack Cuts',
    cleanCutTitle: rawTitle || 'Ringtone Cut',
  };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Groups an array of ringtones by their song name.
 * Ringtones inside each group are sorted by downloads descending (top cut first).
 * Song groups themselves are sorted by total downloads descending.
 */
export function groupRingtonesBySong(ringtones: Ringtone[], movieName: string): SongGroup[] {
  const map = new Map<string, GroupedCut[]>();

  for (const ringtone of ringtones) {
    const { songName, cleanCutTitle } = extractSongAndCut(ringtone, movieName);
    
    // Normalize group key (case-insensitive deduplication)
    const normalizedKey = songName.toLowerCase();
    let existingKey = songName;
    for (const key of map.keys()) {
      if (key.toLowerCase() === normalizedKey) {
        existingKey = key;
        break;
      }
    }

    const group = map.get(existingKey) || [];
    group.push({ ringtone, cleanCutTitle });
    map.set(existingKey, group);
  }

  const groups: SongGroup[] = [];

  for (const [songName, cuts] of map.entries()) {
    // Sort cuts within each group: highest downloads first
    cuts.sort((a, b) => (b.ringtone.downloads || 0) - (a.ringtone.downloads || 0));

    const totalDownloads = cuts.reduce((sum, c) => sum + (c.ringtone.downloads || 0), 0);
    const totalLikes = cuts.reduce((sum, c) => sum + (c.ringtone.likes || 0), 0);

    groups.push({
      songName,
      cuts,
      totalDownloads,
      totalLikes,
      topCut: cuts[0].ringtone,
    });
  }

  // Sort groups by total downloads descending
  // Put 'Theme & BGM' at the end unless it has high downloads
  groups.sort((a, b) => {
    if (a.songName === 'Theme & BGM' && b.songName !== 'Theme & BGM') return 1;
    if (b.songName === 'Theme & BGM' && a.songName !== 'Theme & BGM') return -1;
    return b.totalDownloads - a.totalDownloads;
  });

  return groups;
}
