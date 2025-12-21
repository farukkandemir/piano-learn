import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

import { uploadSchema, type UploadFormValues } from "@/lib/validations";
import { useUploadSong } from "@/queries/songs";
import { useAuth } from "@/context/auth";
import { SONG_CATEGORIES, CATEGORY_LABELS } from "@/types/song";
import type { Song } from "@/types/song";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  initialTitle: string;
  onSuccess?: (song: Song) => void;
}

export function UploadModal({
  isOpen,
  onClose,
  file,
  initialTitle,
  onSuccess,
}: UploadModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const uploadSong = useUploadSong();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: initialTitle,
      composer: "",
      difficulty: "Beginner",
      category: "classical",
    },
  });

  const onSubmit = (data: UploadFormValues) => {
    if (!file || !user) {
      toast.error("Missing file or user");
      return;
    }

    uploadSong.mutate(
      { ...data, file, userId: user.id },
      {
        onSuccess: (song) => {
          toast.success("Song added to your library");
          onClose();

          if (onSuccess) {
            onSuccess(song);
          } else {
            navigate({ to: "/play/$songId", params: { songId: song.id } });
          }
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SONG_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={uploadSong.isPending}
          >
            {uploadSong.isPending ? "Uploading..." : "Save & Play"}
            {uploadSong.isPending ? (
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
