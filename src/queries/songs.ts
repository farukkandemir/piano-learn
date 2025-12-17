import { api } from "@/lib/api";
import { MUSICXML_BUCKET, supabase } from "@/lib/supabase";
import type { Song, UploadSongData } from "@/types/song";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCommunitySongs = () => {
  const curatorId = import.meta.env.VITE_CURATOR_USER_ID;

  return useQuery({
    queryKey: ["songs", "community"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", curatorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
    enabled: !!curatorId,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useUserSongs = (userId: string) => {
  return useQuery({
    queryKey: ["songs", "user", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useSong = (id: string) => {
  return useQuery({
    queryKey: ["songs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Song;
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useSongs = () => {
  return useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });
};

export const useSongContent = (filePath: string) => {
  return useQuery({
    queryKey: ["songContent", filePath],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(MUSICXML_BUCKET)
        .download(filePath);
      if (error) throw error;
      return await data.text();
    },
    enabled: !!filePath, // Only run if filePath exists

    staleTime: Infinity, // This query will never be stale means it will never be refetched
    gcTime: Infinity, // This query will never be garbage collected means it will never be removed from the cache
  });
};

export const useUploadSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadSongData) => {
      const { title, composer, difficulty, file, userId } = data;

      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(MUSICXML_BUCKET)
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      // Insert metadata into database
      const { data: insertedSong, error: insertError } = await supabase
        .from("songs")
        .insert({
          title,
          composer: composer || null,
          difficulty,
          file_path: fileName,
          user_id: userId,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      api.imageCovers
        .generate({ title, composer, songId: insertedSong.id })
        .then(async ({ imageUrl }) => {
          // Update song with cover URL
          await supabase
            .from("songs")
            .update({ cover_url: imageUrl })
            .eq("id", insertedSong.id);
          // Refresh the cache so UI updates
          queryClient.invalidateQueries({ queryKey: ["songs"] });
          queryClient.invalidateQueries({
            queryKey: ["songs", insertedSong.id],
          });
        })
        .catch((error) => {
          console.warn("Background cover generation failed:", error);
        });

      return insertedSong as Song;
    },
    onSuccess: () => {
      // This automatically refreshes the songs list!
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
};
