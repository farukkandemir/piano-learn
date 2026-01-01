import { usePlaybackProgress } from "@/hooks/use-playback-progress";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { audioEngine } from "@/utils/audioEngine";

interface PlaybackTimelineProps {
  className?: string;
  onPlay?: () => void;
  audioLoaded?: boolean;
}

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PlaybackTimeline({
  className,
  onPlay,
  audioLoaded = true,
}: PlaybackTimelineProps) {
  const {
    currentTime,
    totalDuration,
    progress,
    isPlaying,
    isPaused,
    togglePause,
  } = usePlaybackProgress();

  const isActive = isPlaying;

  const handlePlayPause = () => {
    if (!isActive && onPlay) {
      // Start playback
      onPlay();
    } else {
      // Toggle pause/resume
      togglePause();
    }
  };

  const handleStop = () => {
    audioEngine.stopPlayback();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 h-10 border-b border-border/40 transition-colors",
        isActive ? "bg-background" : "bg-muted/30",
        className
      )}
    >
      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Play/Pause Toggle */}
        <button
          onClick={handlePlayPause}
          disabled={!audioLoaded && !isActive}
          className={cn(
            "h-7 w-7 rounded-md flex items-center justify-center",
            !audioLoaded && !isActive
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : !isActive
                ? "bg-primary text-primary-foreground cursor-pointer"
                : "bg-emerald-500 text-white cursor-pointer"
          )}
          title={
            !audioLoaded && !isActive
              ? "Loading piano sounds..."
              : isActive
                ? isPaused
                  ? "Resume"
                  : "Pause"
                : "Play"
          }
        >
          {!audioLoaded && !isActive ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPaused || !isActive ? (
            <Play className="h-3.5 w-3.5" />
          ) : (
            <Pause className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Stop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStop}
          disabled={!isActive}
          className={cn(
            "h-7 w-7 transition-opacity",
            !isActive && "opacity-40"
          )}
          title="Stop playback"
        >
          <Square className="h-3 w-3" />
        </Button>
      </div>

      {/* Elapsed Time */}
      <span
        className={cn(
          "text-xs font-mono tabular-nums w-10 text-right transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground/50"
        )}
      >
        {formatTime(currentTime)}
      </span>

      {/* Progress Bar */}
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            isActive ? "bg-emerald-500" : "bg-muted-foreground/20"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Total Duration */}
      <span
        className={cn(
          "text-xs font-mono tabular-nums w-10 transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground/50"
        )}
      >
        {formatTime(totalDuration)}
      </span>
    </div>
  );
}
