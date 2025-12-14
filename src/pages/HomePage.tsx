import { useState, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Upload, Clock, Music, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const VALID_EXTENSIONS = [".xml", ".musicxml", ".mxl"];

interface FeaturedSong {
  id: string;
  title: string;
  composer: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
}

const FEATURED_SONGS: FeaturedSong[] = [
  {
    id: "1",
    title: "Für Elise",
    composer: "Beethoven",
    difficulty: "Intermediate",
    duration: "3:00",
  },
  {
    id: "2",
    title: "Moonlight Sonata",
    composer: "Beethoven",
    difficulty: "Advanced",
    duration: "5:30",
  },
  {
    id: "3",
    title: "Clair de Lune",
    composer: "Debussy",
    difficulty: "Advanced",
    duration: "4:45",
  },
  {
    id: "4",
    title: "Prelude in C Major",
    composer: "Bach",
    difficulty: "Beginner",
    duration: "2:15",
  },
  {
    id: "5",
    title: "Gymnopédie No. 1",
    composer: "Satie",
    difficulty: "Beginner",
    duration: "3:20",
  },
  {
    id: "6",
    title: "Nocturne Op. 9 No. 2",
    composer: "Chopin",
    difficulty: "Intermediate",
    duration: "4:30",
  },

  {
    id: "7",
    title: "Nocturne Op. 9 No. 2",
    composer: "Chopin",
    difficulty: "Intermediate",
    duration: "4:30",
  },
  {
    id: "8",
    title: "Nocturne Op. 9 No. 2",
    composer: "Chopin",
    difficulty: "Intermediate",
    duration: "4:30",
  },
];

const Navigation = () => {
  return (
    <header>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-lg font-bold">piano.learn</h1>
        <Input placeholder="Search" className="max-w-xs" />
        <ModeToggle />
      </div>
    </header>
  );
};

const SongCard = ({ song }: { song: FeaturedSong }) => {
  return (
    <Card className="p-4 rounded-lg">
      <div className="space-y-2">
        <h3 className="font-medium text-sm">{song.title}</h3>
        <p className="text-xs text-muted-foreground">by {song.composer}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {song.difficulty}
          </span>
          <span className="text-xs text-muted-foreground">{song.duration}</span>
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

        {/* Quick Start */}
        <section className="mb-8 text-center">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,.musicxml,.mxl"
              onChange={handleInputChange}
              className="hidden"
            />
            <Button onClick={handleClick} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Sheet Music
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
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
