import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music } from "lucide-react";
import type { Song } from "@/types/song";

export function SongCard({ song }: { song: Song }) {
  return (
    <Link to="/play/$songId" params={{ songId: song.id }}>
      <Card className="group overflow-hidden border-0 bg-transparent shadow-none pt-0">
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
        <div className="space-y-1">
          <h3 className="font-medium text-sm leading-tight">{song.title}</h3>
          <p className="text-xs text-muted-foreground">{song.composer}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground/70">
              {song.difficulty}
            </span>
            <span className="text-muted-foreground/30">·</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function SongCardSkeleton() {
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
