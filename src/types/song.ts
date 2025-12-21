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

export interface Song {
  id: string;
  title: string;
  composer: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: SongCategory;
  file_path: string;
  cover_url: string | null;
  created_at: string;
}

export interface UploadSongData {
  title: string;
  composer: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: SongCategory;
  file: File;
  userId: string;
}
