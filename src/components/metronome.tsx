import { useState, useEffect, useCallback } from "react";
import { Play, Pause, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { audioEngine } from "@/utils/audioEngine";
import { cn } from "@/lib/utils";

export default function Metronome() {
  const [bpm, setBpm] = useState(() => {
    const saved = localStorage.getItem("metronome-bpm");
    return saved ? parseInt(saved, 10) : 80;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatPulse, setBeatPulse] = useState(false);

  // Sync visual pulse with audio clock via audioEngine.onBeat callback
  useEffect(() => {
    if (!isPlaying) {
      setBeatPulse(false);
      audioEngine.onBeat = null;
      return;
    }

    // Set up callback that fires in sync with audio clock
    audioEngine.onBeat = () => {
      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), 100);
    };

    return () => {
      audioEngine.onBeat = null;
    };
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopMetronome();
      audioEngine.onBeat = null;
    };
  }, []);

  const updateBpm = useCallback((newBpm: number) => {
    const clampedBpm = Math.max(40, Math.min(200, newBpm));
    setBpm(clampedBpm);
    localStorage.setItem("metronome-bpm", String(clampedBpm));
    if (audioEngine.isMetronomeRunning) {
      audioEngine.startMetronome(clampedBpm);
    }
  }, []);

  const handleToggle = async () => {
    if (isPlaying) {
      audioEngine.stopMetronome();
      setIsPlaying(false);
    } else {
      await audioEngine.startMetronome(bpm);
      setIsPlaying(true);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={isPlaying ? "default" : "outline"}
          size="icon-sm"
          className="relative"
          title="Metronome"
        >
          {/* Beat indicator dot */}
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 size-1.5 rounded-full transition-all duration-100",
              isPlaying && "bg-primary",
              beatPulse &&
                "scale-150 bg-primary shadow-[0_0_6px_var(--primary)]"
            )}
          />
          {/* Metronome icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M12 2v4" />
            <path d="M6 22h12" />
            <path d="M7 22l3-16h4l3 16" />
            <circle cx="12" cy="8" r="2" />
          </svg>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-44 p-0 overflow-hidden" align="end">
        {/* Play/Pause button - prominent at top */}
        <button
          onClick={handleToggle}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 transition-colors",
            isPlaying
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 hover:bg-muted text-foreground"
          )}
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
          <span className="text-xs font-medium">
            {isPlaying ? "Stop" : "Start"}
          </span>
        </button>

        <div className="p-3 space-y-3">
          {/* BPM Display with +/- */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => updateBpm(bpm - 5)}
              className="size-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <Minus className="size-3" />
            </button>

            <div className="text-center">
              <span className="text-2xl font-mono font-semibold tabular-nums">
                {bpm}
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">
                BPM
              </span>
            </div>

            <button
              onClick={() => updateBpm(bpm + 5)}
              className="size-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <Plus className="size-3" />
            </button>
          </div>

          {/* Slider */}
          <Slider
            value={[bpm]}
            min={40}
            max={200}
            step={1}
            onValueChange={([value]) => updateBpm(value)}
            className="w-full"
          />

          {/* Range labels */}
          <div className="flex justify-between text-[9px] text-muted-foreground -mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
