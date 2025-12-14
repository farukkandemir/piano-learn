import { useState, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Upload, Clock, Music, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const VALID_EXTENSIONS = [".xml", ".musicxml", ".mxl"];

interface FeaturedSong {
  id: string;
  title: string;
  composer: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  image?: string;
}

const FEATURED_SONGS: FeaturedSong[] = [
  {
    id: "1",
    title: "Für Elise",
    composer: "Beethoven",
    difficulty: "Intermediate",
    duration: "3:00",
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Moonlight Sonata",
    composer: "Beethoven",
    difficulty: "Advanced",
    duration: "5:30",
    image:
      "https://images.unsplash.com/photo-1552422535-c45813c61732?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Clair de Lune",
    composer: "Debussy",
    difficulty: "Advanced",
    duration: "4:45",
    image:
      "https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    title: "Prelude in C Major",
    composer: "Bach",
    difficulty: "Beginner",
    duration: "2:15",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    title: "Gymnopédie No. 1",
    composer: "Satie",
    difficulty: "Beginner",
    duration: "3:20",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    title: "Nocturne Op. 9 No. 2",
    composer: "Chopin",
    difficulty: "Intermediate",
    duration: "4:30",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop",
  },
  {
    id: "7",
    title: "Nocturne Op. 9 No. 2",
    composer: "Chopin",
    difficulty: "Intermediate",
    duration: "4:30",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
  },
  {
    id: "8",
    title: "Nocturne Op. 9 No. 2",
    composer: "Chopin",
    difficulty: "Intermediate",
    duration: "4:30",
    image:
      "https://images.unsplash.com/photo-1571974599782-87624638275e?w=400&h=300&fit=crop",
  },
];

const Navigation = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-lg font-bold">piano.learn</h1>
        <div className="relative max-w-xs flex-1 mx-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search songs..."
            className="h-9 w-full rounded-lg border-0 bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:bg-muted focus:outline-none"
          />
        </div>
        <ModeToggle />
      </div>
    </header>
  );
};

const SongCard = ({ song }: { song: FeaturedSong }) => {
  return (
    <Card className="group overflow-hidden border-0 bg-transparent shadow-none">
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        {song.image ? (
          <img
            src={song.image}
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
          <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
            <Clock className="h-3 w-3" />
            {song.duration}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!VALID_EXTENSIONS.includes(extension)) {
      setError(
        `Invalid file type. Please upload ${VALID_EXTENSIONS.join(", ")} files.`
      );
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      const content = await file.text();
      sessionStorage.setItem("musicxml-content", content);
      sessionStorage.setItem("musicxml-filename", file.name);
      navigate("/play");
    } catch {
      setError("Failed to read file. Please try again.");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-6xl px-6 py-12 mt-[10%]">
        {/* Community Header */}
        <section className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-semibold tracking-tight">
            Learn piano, your way
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Discover a new way to master piano: personalized, enjoyable, and at
            your rhythm.
          </p>
        </section>

        {/* Upload Section */}
        <section className="mb-8 flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,.musicxml,.mxl"
            onChange={handleInputChange}
            className="hidden"
          />
          <button
            onClick={handleClick}
            className="group flex items-center gap-3 rounded-lg bg-foreground px-5 py-3 text-background hover:bg-foreground/90"
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm font-medium">Upload your sheet</span>
            <ArrowRight className="h-4 w-4 opacity-60" />
          </button>
          {error && (
            <p className="mt-3 text-center text-sm text-destructive">{error}</p>
          )}
        </section>

        {/* Or section with divider and text*/}
        <section className="pb-12">
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">
                or explore community favorites
              </span>
            </div>
          </div>
        </section>
        {/* Community Section */}
        <section className="mt-[5%]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Community Favorites</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Explore more
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_SONGS.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
