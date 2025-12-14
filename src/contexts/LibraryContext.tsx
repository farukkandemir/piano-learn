import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase, MUSICXML_BUCKET } from "@/lib/supabase";

// Types
export interface Song {
  id: string;
  title: string;
  composer: string | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  file_path: string;
  cover_url: string | null;
  created_at: string;
}

interface UploadSongData {
  title: string;
  composer?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  file: File;
}

interface LibraryContextValue {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  uploadSong: (data: UploadSongData) => Promise<Song | null>;
  fetchSongs: () => Promise<void>;
  getSongContent: (filePath: string) => Promise<string | null>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all songs from database
  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setSongs([]);
    } else {
      setSongs(data || []);
    }

    setIsLoading(false);
  }, []);

  // Load songs on mount
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Upload a song (file to storage, metadata to database)
  const uploadSong = useCallback(
    async (data: UploadSongData): Promise<Song | null> => {
      const { title, composer, difficulty, file } = data;

      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(MUSICXML_BUCKET)
        .upload(fileName, file);

      if (uploadError) {
        setError(uploadError.message);
        return null;
      }

      // Insert metadata into database
      const { data: insertedSong, error: insertError } = await supabase
        .from("songs")
        .insert({
          title,
          composer: composer || null,
          difficulty,
          file_path: fileName,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      // Refresh the list
      await fetchSongs();
      return insertedSong;
    },
    [fetchSongs]
  );

  // Get MusicXML content from storage
  const getSongContent = useCallback(
    async (filePath: string): Promise<string | null> => {
      const { data, error: downloadError } = await supabase.storage
        .from(MUSICXML_BUCKET)
        .download(filePath);

      if (downloadError) {
        setError(downloadError.message);
        return null;
      }

      return await data.text();
    },
    []
  );

  return (
    <LibraryContext.Provider
      value={{
        songs,
        isLoading,
        error,
        uploadSong,
        fetchSongs,
        getSongContent,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}
