import { useState, useRef, type ChangeEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Clock, Music, ArrowRight, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { useUploadSong } from "@/queries/songs";
import type { Song } from "@/types/song";

// =============================================================================
// Constants
// =============================================================================

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

// =============================================================================
// Types
// =============================================================================

interface UploadFormData {
  title: string;
  composer: string;
  difficulty: Song["difficulty"];
  filename: string;
  file: File | null;
}

// =============================================================================
// Components
// =============================================================================

// Navigation is now handled by Layout component

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

function UploadButton({ onClick }: { onClick: () => void }) {
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

function SongCard({ song }: { song: FeaturedSong }) {
  return (
    <Card className="group overflow-hidden border-0 bg-transparent shadow-none">
      <div className="aspect-4/3 overflow-hidden rounded-lg bg-muted">
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
}

function CommunitySection() {
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
        {FEATURED_SONGS.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
}

interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UploadFormData;
  onFormChange: (data: UploadFormData) => void;
  onSave: () => void;
}

function UploadModal({
  isOpen,
  onOpenChange,
  formData,
  onFormChange,
  onSave,
}: UploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to your library</DialogTitle>
          <DialogDescription>
            Enter details about your sheet music before practicing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Für Elise"
              value={formData.title}
              onChange={(e) =>
                onFormChange({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="composer">
              Composer <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="composer"
              placeholder="e.g., Beethoven"
              value={formData.composer}
              onChange={(e) =>
                onFormChange({ ...formData, composer: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value: Song["difficulty"]) =>
                onFormChange({ ...formData, difficulty: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save & Play
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Main Component
// =============================================================================

function SearchView({
  query,
  songs,
  onClearSearch,
}: {
  query: string;
  songs: FeaturedSong[];
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
  const uploadSong = useUploadSong();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
  });
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    composer: "",
    difficulty: "Beginner",
    filename: "",
    file: null,
  });

  const isSearching = searchQuery.trim().length > 0;

  const filteredSongs = useMemo(() => {
    if (!isSearching) return FEATURED_SONGS;

    const searchQueryLower = searchQuery.toLowerCase();
    return FEATURED_SONGS.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQueryLower) ||
        song.composer.toLowerCase().includes(searchQueryLower)
    );
  }, [searchQuery]);

  const validateFile = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    return VALID_EXTENSIONS.includes(extension);
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) {
      toast.error(
        `Invalid file type. Please upload ${VALID_EXTENSIONS.join(", ")} files.`
      );
      return;
    }

    try {
      const filenameWithoutExt = file.name.replace(
        /\.(xml|musicxml|mxl)$/i,
        ""
      );

      setFormData({
        title: filenameWithoutExt,
        composer: "",
        difficulty: "Beginner",
        file,
        filename: file.name,
      });
      setIsModalOpen(true);
    } catch {
      toast.error("Failed to read file. Please try again.");
    }
  };

  const handleSaveAndPlay = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    // You need the original File object, not just content
    uploadSong.mutate(
      {
        title: formData.title.trim(),
        composer: formData.composer.trim(),
        difficulty: formData.difficulty,
        file: formData.file!,
      },
      {
        onSuccess: (song) => {
          setIsModalOpen(false);
          toast.success("Song added to your library");
          navigate(`/play/${song.id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

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
              ref={fileInputRef}
              type="file"
              accept=".xml,.musicxml,.mxl"
              onChange={handleInputChange}
              className="hidden"
            />
            <UploadButton onClick={handleUploadClick} />

            <Divider />

            <CommunitySection />
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
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        formData={formData}
        onFormChange={setFormData}
        onSave={handleSaveAndPlay}
      />
    </Layout>
  );
}
