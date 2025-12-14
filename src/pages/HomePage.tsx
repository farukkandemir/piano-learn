import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
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
];

const Navigation = () => {
  return (
    <header className="border-b">
      <div className=" flex  items-center justify-between px-6 py-4">
        <h1 className="font-bold">piano.learn</h1>
        <div>
          <Input placeholder="Search" />
        </div>
        <ModeToggle />
      </div>
    </header>
  );
};

const DifficultyBadge = ({
  difficulty,
}: {
  difficulty: FeaturedSong["difficulty"];
}) => {
  const variants = {
    Beginner: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    Intermediate: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    Advanced: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  };

  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${variants[difficulty]}`}
    >
      {difficulty}
    </span>
  );
};

const SongCard = ({ song }: { song: FeaturedSong }) => {
  return (
    <Card className="group cursor-pointer transition-colors hover:bg-accent">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Music className="h-4 w-4 text-muted-foreground" />
          </div>
          <DifficultyBadge difficulty={song.difficulty} />
        </div>

        <h3 className="mb-0.5 font-medium leading-tight">{song.title}</h3>
        <p className="mb-3 text-sm text-muted-foreground">{song.composer}</p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {song.duration}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
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

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Learn piano, your way
          </h1>
          <p className="text-muted-foreground">
            Upload sheet music and practice with real-time guidance
          </p>
        </section>

        {/* Upload Section */}
        <section className="mb-14">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,.musicxml,.mxl"
            onChange={handleInputChange}
            className="hidden"
          />

          <Card
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              mx-auto max-w-xl cursor-pointer border-2 border-dashed transition-all
              ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50 hover:bg-accent"
              }
            `}
          >
            <CardContent className="flex flex-col items-center py-10">
              <div
                className={`
                  mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-colors
                  ${
                    isDragging
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }
                `}
              >
                <Upload
                  className={`h-6 w-6 ${
                    isDragging ? "" : "text-muted-foreground"
                  }`}
                />
              </div>

              <h2 className="mb-1 text-lg font-semibold">
                {isDragging ? "Drop your file" : "Upload MusicXML"}
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Drag and drop or click to browse
              </p>

              <Button variant="outline" className="pointer-events-none">
                Select File
              </Button>

              <p className="mt-5 text-xs text-muted-foreground">
                Supports .xml, .musicxml, .mxl
              </p>
            </CardContent>
          </Card>

          {error && (
            <p className="mt-4 text-center text-sm text-destructive">{error}</p>
          )}
        </section>

        {/* Featured Section */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured Pieces</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_SONGS.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
