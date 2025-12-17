export interface Song {
  id: string;
  title: string;
  composer: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  file_path: string;
  cover_url: string | null;
  created_at: string;
}
export interface UploadSongData {
  title: string;
  composer: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  file: File;
  userId: string;
}
