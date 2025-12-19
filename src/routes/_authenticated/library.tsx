import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";

import { useAuth } from "@/context/auth";
import { useUserSongs } from "@/queries/songs";
import { useUploadFlow } from "@/hooks/use-upload-flow";
import { UploadModal } from "@/components/upload-modal";
import { SongCard, SongCardSkeleton } from "@/components/song-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const { user } = useAuth();
  const { data: songs, isLoading } = useUserSongs(user?.id ?? "");
  const uploadFlow = useUploadFlow();

  const hasSongs = songs && songs.length > 0;

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={uploadFlow.fileInputRef}
        type="file"
        accept=".xml,.musicxml,.mxl"
        onChange={uploadFlow.handleInputChange}
        className="hidden"
      />

      {isLoading ? (
        // Loading state
        <div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : hasSongs ? (
        // Has songs
        <div>
          <div className="flex justify-between mb-6">
            <span className="text-sm text-muted-foreground">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={uploadFlow.handleUploadClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>
      ) : (
        // Empty state - ghost grid
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Upload card */}
          <button
            onClick={uploadFlow.handleUploadClick}
            className="aspect-4/3 rounded-lg border-2 border-dashed border-border hover:border-foreground/30 hover:bg-muted/30 flex flex-col items-center justify-center gap-3 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              Upload a sheet
            </span>
          </button>

          {/* Ghost placeholder cards */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="aspect-4/3 rounded-lg border border-dashed border-border/40"
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <UploadModal
        key={uploadFlow.selectedFile?.name ?? "closed"}
        isOpen={uploadFlow.isModalOpen}
        onClose={uploadFlow.closeModal}
        file={uploadFlow.selectedFile}
        initialTitle={uploadFlow.initialTitle}
      />
    </div>
  );
}
