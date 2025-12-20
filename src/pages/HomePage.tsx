import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

import { Upload, ArrowRight, Library } from "lucide-react";
import { useCommunitySongs } from "@/queries/songs";
import type { Song } from "@/types/song";
import { useAuth } from "@/context/auth";

import { SongCard, SongCardSkeleton } from "@/components/song-card";

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

function HeroCta({
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
        <Library className="h-4 w-4" />
        <span className="text-sm font-medium">My Library</span>
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
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground cursor-pointer"
        >
          Explore more
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SongCardSkeleton key={index} />
            ))
          : songs?.map((song) => <SongCard key={song.id} song={song} />)}
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const { data: communitySongs, isLoading } = useCommunitySongs();

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-6 py-12 mt-[10%]">
        <HeroSection />

        <HeroCta
          onClick={() => navigate({ to: "/library" })}
          isAuthenticated={isAuthenticated}
        />
        <Divider />

        <CommunitySection songs={communitySongs} isLoading={isLoading} />
      </div>
    </Layout>
  );
}
