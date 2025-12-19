import { useMemo } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

import { Upload, Music, ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunitySongs } from "@/queries/songs";
import type { Song } from "@/types/song";
import { useAuth } from "@/context/auth";
import { Skeleton } from "@/components/ui/skeleton";

import { useUploadFlow } from "@/hooks/use-upload-flow";
import { UploadModal } from "@/components/upload-modal";

function HeroSection() {
  return (
    <section className="mb-8 text-center">
      <h1 className="mb-3 text-4xl font-semibold tracking-tight">
        Learn, play, share
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        A community-driven piano practice space. Discover sheets and start
        playing.
      </p>
    </section>
  );
}

function UploadButton({
  onClick,
  isAuthenticated,
}: {
  onClick: () => void;
  isAuthenticated: boolean;
}) {
  if (!isAuthenticated) {
    return (
      <section className="mb-8 flex justify-center">
        <Link
          to="/login"
          className="group flex items-center gap-3 rounded-lg bg-foreground px-5 py-3 text-background hover:bg-foreground/90"
        >
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">Sign in to upload</span>
          <ArrowRight className="h-4 w-4 opacity-60" />
        </Link>
      </section>
    );
  }
  return (
    <section className="mb-8 flex justify-center">
      <button
        onClick={onClick}
        className="group flex items-center gap-3 rounded-lg bg-foreground px-5 py-3 text-background hover:bg-foreground/90"
      >
        <Upload className="h-4 w-4" />
        <span className="text-sm font-medium">Upload your sheet</span>
        <ArrowRight className="h-4 w-4 opacity-60" />
      </button>
    </section>
  );
}

function Divider() {
  return (
    <section className="pb-12">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground">
            or explore community favorites
          </span>
        </div>
      </div>
    </section>
  );
}

function SongCard({ song }: { song: Song }) {
  return (
    <Link to="/play/$songId" params={{ songId: song.id }}>
      <Card className="group overflow-hidden border-0 bg-transparent shadow-none">
        <div className="aspect-4/3 overflow-hidden rounded-lg bg-muted">
          {song.cover_url ? (
            <img
              src={song.cover_url}
              alt={song.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="pt-3 space-y-1">
          <h3 className="font-medium text-sm leading-tight">{song.title}</h3>
          <p className="text-xs text-muted-foreground">{song.composer}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground/70">
              {song.difficulty}
            </span>
            <span className="text-muted-foreground/30">·</span>
            {/* {song.duration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
            <Clock className="h-3 w-3" />
            {song.duration}
            </span>
            )} */}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SongCardSkeleton() {
  return (
    <Card className="group overflow-hidden border-0 bg-transparent shadow-none">
      <Skeleton className="aspect-4/3 rounded-lg" />
      <div className="pt-3 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-3 w-16" />
          <span className="text-muted-foreground/30">·</span>
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </Card>
  );
}

function CommunitySection({
  songs,
  isLoading,
}: {
  songs: Song[] | undefined;
  isLoading: boolean;
}) {
  return (
    <section className="mt-[5%]">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Community Favorites</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Explore more
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SongCardSkeleton key={index} />
            ))
          : songs?.map((song) => <SongCard key={song.id} song={song} />)}
      </div>
    </section>
  );
}

function SearchView({
  query,
  songs,
  onClearSearch,
}: {
  query: string;
  songs: Song[];
  onClearSearch: () => void;
}) {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Search className="h-4 w-4 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground mb-1">No results for</p>
        <p className="text-sm font-medium mb-4">"{query}"</p>
        <Button variant="ghost" size="sm" onClick={onClearSearch}>
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">
          {songs.length} result{songs.length !== 1 ? "s" : ""} for "{query}"
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onClearSearch}
        >
          Clear search
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const { data: communitySongs, isLoading } = useCommunitySongs();

  const { q: searchQuery = "" } = useSearch({ from: "/" });

  const uploadFlow = useUploadFlow();

  const setSearchQuery = (value: string) => {
    navigate({ to: "/", search: { q: value || undefined } });
  };

  const isSearching = searchQuery.trim().length > 0;

  const filteredSongs = useMemo(() => {
    if (!communitySongs) return [];

    if (!isSearching) return communitySongs;

    const searchQueryLower = searchQuery.toLowerCase();
    return communitySongs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQueryLower) ||
        song.composer.toLowerCase().includes(searchQueryLower)
    );
  }, [searchQuery, communitySongs, isSearching]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <Layout
      showSearch
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
    >
      <div
        className={cn(
          "mx-auto max-w-6xl px-6 py-12",
          isSearching ? "mt-0" : "mt-[10%]"
        )}
      >
        {!isSearching ? (
          <>
            <HeroSection />

            <input
              ref={uploadFlow.fileInputRef}
              type="file"
              accept=".xml,.musicxml,.mxl"
              onChange={uploadFlow.handleInputChange}
              className="hidden"
            />
            <UploadButton
              onClick={uploadFlow.handleUploadClick}
              isAuthenticated={isAuthenticated}
            />
            <Divider />

            <CommunitySection songs={communitySongs} isLoading={isLoading} />
          </>
        ) : (
          <SearchView
            query={searchQuery}
            songs={filteredSongs}
            onClearSearch={handleClearSearch}
          />
        )}
      </div>

      <UploadModal
        key={uploadFlow.selectedFile?.name ?? "closed"}
        isOpen={uploadFlow.isModalOpen}
        onClose={uploadFlow.closeModal}
        file={uploadFlow.selectedFile}
        initialTitle={uploadFlow.initialTitle}
      />
    </Layout>
  );
}
