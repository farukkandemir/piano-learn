import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import SheetMusic, {
  type NoteInfo,
  type ProgressInfo,
} from "../components/SheetMusic";
import Piano from "../components/Piano";
import MidiStatus from "../components/MidiStatus";
import { audioEngine } from "../utils/audioEngine";
import { useMidi } from "../hooks/useMidi";
import {
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  VolumeX,
  Volume2,
  Hand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSong, useSongContent } from "@/queries/songs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type HandMode = "left" | "right" | "both";

// ============================================================
// ERGONOMIC KEYBOARD TO PIANO MAPPING
// ============================================================
//
// This layout mimics real piano hand positions:
// - LEFT HAND (Q-U row): Bass notes C3-B3 (MIDI 48-59)
// - RIGHT HAND (I-' row): Treble notes C4-B4 (MIDI 60-71)
// - Black keys are on the NUMBER ROW, directly above their white keys
//
// Visual Layout:
//
//   LEFT HAND (C3-B3)                RIGHT HAND (C4-B4)
//   ┌─────────────────────┐          ┌─────────────────────┐
//   │ [2][3]   [5][6][7]  │          │ [9][0]   [-][=][⌫]  │  ← Black keys
//   │ [Q][W][E][R][T][Y][U]│          │ [I][O][P][ [ ][ ] ][;][']│  ← White keys
//   └─────────────────────┘          └─────────────────────┘
//     C  D  E  F  G  A  B              C  D  E  F  G  A  B
//
// ============================================================

const KEYBOARD_MAP: Record<string, number> = {
  // ═══════════════════════════════════════════════════════════
  // LEFT HAND - C3 to B3 (MIDI 48-59) - Bass/accompaniment
  // ═══════════════════════════════════════════════════════════

  // White keys (QWERTY row - left side)
  q: 48, // C3
  w: 50, // D3
  e: 52, // E3
  r: 53, // F3
  t: 55, // G3
  y: 57, // A3
  u: 59, // B3

  // Black keys (Number row - above white keys)
  "2": 49, // C#3 (above Q-W)
  "3": 51, // D#3 (above W-E)
  "5": 54, // F#3 (above R-T)
  "6": 56, // G#3 (above T-Y)
  "7": 58, // A#3 (above Y-U)

  // ═══════════════════════════════════════════════════════════
  // RIGHT HAND - C4 to B4 (MIDI 60-71) - Melody (includes Middle C)
  // ═══════════════════════════════════════════════════════════

  // White keys (right side of keyboard)
  i: 60, // C4 (Middle C!)
  o: 62, // D4
  p: 64, // E4
  "[": 65, // F4
  "]": 67, // G4
  ";": 69, // A4 (semicolon)
  "'": 71, // B4 (apostrophe)

  // Black keys (Number row - right side, above white keys)
  "9": 61, // C#4 (above I-O)
  "0": 63, // D#4 (above O-P)
  "-": 66, // F#4 (above [-])
  "=": 68, // G#4 (above ]-;)
  Backspace: 70, // A#4 (above ;-')

  // ═══════════════════════════════════════════════════════════
  // EXTENDED RANGE - Lower octave (for advanced users)
  // Using bottom row (Z-M) for C2-B2
  // ═══════════════════════════════════════════════════════════

  z: 36, // C2
  x: 38, // D2
  c: 40, // E2
  v: 41, // F2
  b: 43, // G2
  n: 45, // A2
  m: 47, // B2

  // Black keys for C2 octave (A-S-D row)
  s: 37, // C#2
  d: 39, // D#2
  g: 42, // F#2
  h: 44, // G#2
  j: 46, // A#2

  // ═══════════════════════════════════════════════════════════
  // EXTENDED RANGE - Higher octave (for advanced users)
  // Using remaining keys for C5-E5
  // ═══════════════════════════════════════════════════════════

  "1": 72, // C5
  "4": 74, // D5
  "8": 76, // E5
};

export default function PlayPage() {
  const navigate = useNavigate();
  const { songId } = useParams({ from: "/play/$songId" });

  const [handMode, setHandMode] = useState<HandMode>("both");

  const {
    data: song,
    isLoading: songLoading,
    error: songError,
  } = useSong(songId!);

  const {
    data: songContent,
    isLoading: songContentLoading,
    error: songContentError,
  } = useSongContent(song?.file_path ?? "");

  const [currentNotes, setCurrentNotes] = useState<NoteInfo[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo>({
    currentMeasure: 1,
    totalMeasures: 1,
  });
  const hasAdvancedRef = useRef(false);
  const checkAndAdvanceRef = useRef<(keys: Set<number>) => void>(() => {});

  const filteredNotes = useMemo(() => {
    if (handMode === "both") return currentNotes;
    return currentNotes.filter((note) => note.hand === handMode);
  }, [currentNotes, handMode]);

  // MIDI integration
  const midi = useMidi({
    onNoteOn: (midiNumber, _velocity) => {
      // Play sound from MIDI input
      audioEngine.playNote(midiNumber);

      setPressedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.add(midiNumber);
        // Use ref to access latest checkAndAdvance
        checkAndAdvanceRef.current(newSet);
        return newSet;
      });
    },
    onNoteOff: (midiNumber) => {
      audioEngine.stopNote(midiNumber);

      setPressedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(midiNumber);
        return newSet;
      });
    },
  });

  // Initialize audio engine on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.ensureStarted();
        setAudioLoaded(true);
      } catch (err) {
        console.error("Failed to init audio:", err);
      }
    };

    // Try to init on mount, but it may need user interaction
    initAudio();

    // Also init on first click (for browsers that require user gesture)
    const handleClick = () => {
      if (!audioLoaded) {
        initAudio();
      }
    };
    document.addEventListener("click", handleClick, { once: true });

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [audioLoaded]);

  const handleNotesChange = useCallback((notes: NoteInfo[]) => {
    setCurrentNotes(notes);
    hasAdvancedRef.current = false;
  }, []);

  const handleProgressChange = useCallback((newProgress: ProgressInfo) => {
    setProgress(newProgress);
  }, []);

  // Check if all required notes are currently pressed
  const checkAndAdvance = useCallback(
    (currentPressed: Set<number>) => {
      if (filteredNotes.length === 0 || hasAdvancedRef.current) return;

      const requiredNotes = new Set(filteredNotes.map((n) => n.midiNumber));
      const allPressed = [...requiredNotes].every((note) =>
        currentPressed.has(note)
      );

      if (allPressed) {
        hasAdvancedRef.current = true;
        setTimeout(() => {
          (window as any).osmdControls?.next();
        }, 100);
      }
    },
    [filteredNotes]
  );

  // Auto-skip when no notes for selected hand mode
  useEffect(() => {
    if (handMode === "both") return; // No auto-skip in "both" mode

    // If we have notes from the sheet but none for our selected hand, auto-skip
    if (currentNotes.length > 0 && filteredNotes.length === 0) {
      const timer = setTimeout(() => {
        (window as any).osmdControls?.next();
      }, 50); // Small delay for smooth transition
      return () => clearTimeout(timer);
    }
  }, [currentNotes, filteredNotes, handMode]);

  // Keep ref in sync for MIDI callbacks
  useEffect(() => {
    checkAndAdvanceRef.current = checkAndAdvance;
  }, [checkAndAdvance]);

  // Keyboard event handlers with audio
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.repeat) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const midiNumber = KEYBOARD_MAP[key];

      if (midiNumber !== undefined) {
        e.preventDefault();

        // Play sound
        audioEngine.playNote(midiNumber);

        setPressedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.add(midiNumber);
          checkAndAdvance(newSet);
          return newSet;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const midiNumber = KEYBOARD_MAP[key];

      if (midiNumber !== undefined) {
        // Stop sound
        audioEngine.stopNote(midiNumber);

        setPressedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(midiNumber);
          return newSet;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      audioEngine.stopAllNotes();
    };
  }, [checkAndAdvance]);

  const handleNext = () => {
    (window as any).osmdControls?.next();
  };

  const handlePrevious = () => {
    (window as any).osmdControls?.previous();
  };

  const handleReset = () => {
    (window as any).osmdControls?.reset();
    setPressedKeys(new Set());
    audioEngine.stopAllNotes();
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioEngine.setMuted(newMuted);
  };

  if (songError || songContentError) {
    toast("Something went wrong");
    navigate({ to: "/" });
    return null;
  }

  if (songLoading || songContentLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  if (!song || !songContent) {
    toast("Song not found");
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header - Option B style: Clean toolbar */}
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border/40">
        <div className="px-4 py-2 flex items-center justify-between">
          {/* Left: Back button (isolated escape hatch) */}
          <Button
            onClick={() => navigate({ to: "/" })}
            variant="ghost"
            size="icon"
            className="shrink-0"
            title="Back to library"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Center: Song info */}
          <div className="flex-1 min-w-0 text-center px-4">
            <p className="text-sm font-medium truncate">{song.title}</p>
            {song.composer && (
              <p className="text-xs text-muted-foreground truncate">
                {song.composer}
              </p>
            )}
          </div>

          {/* Right: Status indicators + Reset */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Hand Mode Toggle */}
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setHandMode("left")}
                className={cn(
                  "p-1.5 transition-colors",
                  handMode === "left"
                    ? "bg-teal-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title="Left hand only"
              >
                <Hand className="h-4 w-4 -scale-x-100" />
              </button>
              <button
                onClick={() => setHandMode("both")}
                className={cn(
                  "p-1.5 transition-colors border-x border-border",
                  handMode === "both"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title="Both hands"
              >
                <div className="flex items-center gap-0.5">
                  <Hand className="h-3 w-3 -scale-x-100" />
                  <Hand className="h-3 w-3" />
                </div>
              </button>
              <button
                onClick={() => setHandMode("right")}
                className={cn(
                  "p-1.5 transition-colors",
                  handMode === "right"
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title="Right hand only"
              >
                <Hand className="h-4 w-4" />
              </button>
            </div>

            {/* MIDI Status - compact dot with dropdown */}
            <MidiStatus
              isSupported={midi.isSupported}
              isConnected={midi.isConnected}
              isRequesting={midi.isRequesting}
              currentDevice={midi.currentDevice}
              availableDevices={midi.availableDevices}
              error={midi.error}
              onDeviceSelect={midi.connectToDevice}
              onDisconnect={midi.disconnect}
              onRetry={midi.requestAccess}
            />

            <Button onClick={handleToggleMute} variant="ghost" size="icon">
              {isMuted ? <VolumeX /> : <Volume2 />}
            </Button>

            {/* Reset button */}
            <Button
              onClick={handleReset}
              variant="ghost"
              size="icon"
              title="Reset to beginning"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sheet Music Area */}
      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <SheetMusic
          xmlContent={songContent}
          onNotesChange={handleNotesChange}
          onProgressChange={handleProgressChange}
        />
      </div>

      {/* Bottom Controls - Option A style: Controls near the piano */}
      <div className="px-4 py-2 bg-muted/50 border-t border-border/40">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          {/* Measure indicator */}
          <div className="flex items-center gap-2 min-w-[120px] justify-center">
            <span className="text-sm text-muted-foreground">Measure</span>
            <span className="text-sm font-medium tabular-nums">
              {progress.currentMeasure}
            </span>
            <span className="text-sm text-muted-foreground">
              of {progress.totalMeasures}
            </span>
          </div>

          <Button
            onClick={handleNext}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Piano Area */}
      <div className="h-44 bg-muted/30 border-t border-border/40">
        <Piano highlightedNotes={filteredNotes} pressedKeys={pressedKeys} />
      </div>

      {/* Audio loading indicator - subtle toast-like */}
      {!audioLoaded && (
        <div className="fixed bottom-48 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-background/90 border border-border rounded-full text-xs text-muted-foreground shadow-lg">
          Loading audio...
        </div>
      )}
    </div>
  );
}
