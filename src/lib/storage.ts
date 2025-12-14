/**
 * Local Storage utilities for managing songs
 * Structured like a database for easy migration later
 */

export interface Song {
  id: string;
  title: string;
  composer: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  content: string; // MusicXML content
  filename: string;
  createdAt: number;
  updatedAt: number;
  image?: string;
}

export type NewSong = Omit<Song, "id" | "createdAt" | "updatedAt">;

const STORAGE_KEY = "keyvana-songs";

/**
 * Generate a unique ID for a new song
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get all songs from localStorage
 */
export function getAllSongs(): Song[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to parse songs from localStorage:", err);
    return [];
  }
}

/**
 * Get a single song by ID
 */
export function getSongById(id: string): Song | null {
  const songs = getAllSongs();
  return songs.find((song) => song.id === id) ?? null;
}

/**
 * Create a new song
 */
export function createSong(data: NewSong): Song {
  const songs = getAllSongs();
  const now = Date.now();

  const newSong: Song = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  songs.push(newSong);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));

  return newSong;
}

/**
 * Update an existing song
 */
export function updateSong(id: string, data: Partial<NewSong>): Song | null {
  const songs = getAllSongs();
  const index = songs.findIndex((song) => song.id === id);

  if (index === -1) return null;

  const updatedSong: Song = {
    ...songs[index],
    ...data,
    updatedAt: Date.now(),
  };

  songs[index] = updatedSong;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));

  return updatedSong;
}

/**
 * Delete a song by ID
 */
export function deleteSong(id: string): boolean {
  const songs = getAllSongs();
  const filtered = songs.filter((song) => song.id !== id);

  if (filtered.length === songs.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Delete all songs (useful for testing/reset)
 */
export function deleteAllSongs(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get songs sorted by most recently updated
 */
export function getRecentSongs(limit?: number): Song[] {
  const songs = getAllSongs();
  const sorted = songs.sort((a, b) => b.updatedAt - a.updatedAt);
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Search songs by title or composer
 */
export function searchSongs(query: string): Song[] {
  const songs = getAllSongs();
  const lowerQuery = query.toLowerCase();

  return songs.filter(
    (song) =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.composer.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Check if a song with the same filename already exists
 */
export function songExistsByFilename(filename: string): boolean {
  const songs = getAllSongs();
  return songs.some((song) => song.filename === filename);
}
