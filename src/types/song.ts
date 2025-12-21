export type SongCategory =
  | "classical"
  | "modern"
  | "pop"
  | "jazz"
  | "film_tv"
  | "video_game"
  | "traditional"
  | "other";

export const SONG_CATEGORIES: SongCategory[] = [
  "classical",
  "modern",
  "pop",
  "jazz",
  "film_tv",
  "video_game",
  "traditional",
  "other",
];

export const CATEGORY_LABELS: Record<SongCategory, string> = {
  classical: "Classical",
  modern: "Modern",
  pop: "Pop",
  jazz: "Jazz",
  film_tv: "Film & TV",
  video_game: "Video Game",
  traditional: "Traditional",
  other: "Other",
};

export type SongDifficulty = "beginner" | "intermediate" | "advanced";

export const SONG_DIFFICULTIES: SongDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export const DIFFICULTY_LABELS: Record<SongDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export interface Song {
  id: string;
  title: string;
  composer: string;
  difficulty: SongDifficulty;
  category: SongCategory;
  file_path: string;
  cover_url: string | null;
  created_at: string;
}

export interface UploadSongData {
  title: string;
  composer: string;
  difficulty: SongDifficulty;
  category: SongCategory;
  file: File;
  userId: string;
}
