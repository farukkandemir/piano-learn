import { useState, useRef, type ChangeEvent, useMemo } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
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
import { Upload, Music, ArrowRight, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCommunitySongs, useUploadSong } from "@/queries/songs";
import type { Song } from "@/types/song";
import { useAuth } from "@/context/auth";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadSchema, type UploadFormValues } from "@/lib/validations";

const VALID_EXTENSIONS = [".xml", ".musicxml", ".mxl"];

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

interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  isUploading: boolean;
  errors: FieldErrors<UploadFormValues>;
  register: UseFormRegister<UploadFormValues>;
  control: Control<UploadFormValues>;
}

function UploadModal({
  isOpen,
  onOpenChange,
  register,
  errors,
  onSave,
  isUploading,
  control,
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
            <Label
              htmlFor="title"
              className={errors.title ? "text-destructive" : ""}
            >
              Title
            </Label>
            <Input
              id="title"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="composer"
              className={errors.composer ? "text-destructive" : ""}
            >
              Composer
            </Label>
            <Input
              id="composer"
              placeholder="(e.g. Beethoven, Mozart, Bach)"
              {...register("composer")}
              className={errors.composer ? "border-destructive" : ""}
            />
            {errors.composer && (
              <p className="text-xs text-destructive">
                {errors.composer.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Save & Play"}
            {isUploading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
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

  const { isAuthenticated, user } = useAuth();

  const uploadSong = useUploadSong();

  const { data: communitySongs, isLoading } = useCommunitySongs();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", composer: "", difficulty: "Beginner" },
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { q: searchQuery = "" } = useSearch({ from: "/" });

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

      setValue("title", filenameWithoutExt);
      setSelectedFile(file);
      setIsModalOpen(true);
    } catch {
      toast.error("Failed to read file. Please try again.");
    }
  };

  const onSubmit = async (data: UploadFormValues) => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    // You need the original File object, not just content
    uploadSong.mutate(
      { ...data, file: selectedFile, userId: user?.id! },
      {
        onSuccess: (song) => {
          toast.success("Song added to your library");
          reset(); // Clear form
          setIsModalOpen(false);
          navigate({ to: "/play/$songId", params: { songId: song.id } });
        },
        onError: (error) => toast.error(error.message),
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
            <UploadButton
              onClick={handleUploadClick}
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
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        register={register}
        errors={errors}
        onSave={handleSubmit(onSubmit)}
        isUploading={uploadSong.isPending}
        control={control}
      />
    </Layout>
  );
}
