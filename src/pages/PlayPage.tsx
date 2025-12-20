import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import SheetMusic, {
  type NoteInfo,
  type SheetMusicHandle,
} from "../components/SheetMusic";
import Piano from "../components/Piano";
import MidiStatus from "../components/MidiStatus";
import { audioEngine } from "../utils/audioEngine";
import { useMidi } from "../hooks/useMidi";
import { ArrowLeft, RotateCcw, VolumeX, Volume2, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSong, useSongContent } from "@/queries/songs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type HandMode = "left" | "right" | "both";

// ============================================================
// SIMPLE CHROMATIC KEYBOARD MAPPING
// ============================================================
//
// Each row = one chromatic octave, left to right = low to high
//
// Visual Layout:
//
//   Number row: C3  → B3  (MIDI 48-59)  - Lower octave
//   Q row:      C4  → B4  (MIDI 60-71)  - Middle octave (includes Middle C)
//   A row:      C5  → A#5 (MIDI 72-82)  - Higher octave
//   Z row:      C2  → A2  (MIDI 36-45)  - Bass octave
//
// ============================================================

const KEYBOARD_MAP: Record<string, number> = {
  // Number row: C3 to B3 (one full chromatic octave)
  "1": 48, // C3
  "2": 49, // C#3
  "3": 50, // D3
  "4": 51, // D#3
  "5": 52, // E3
  "6": 53, // F3
  "7": 54, // F#3
  "8": 55, // G3
  "9": 56, // G#3
  "0": 57, // A3
  "-": 58, // A#3
  "=": 59, // B3

  // Q row: C4 to B4 (Middle C octave)
  q: 60, // C4 (Middle C!)
  w: 61, // C#4
  e: 62, // D4
  r: 63, // D#4
  t: 64, // E4
  y: 65, // F4
  u: 66, // F#4
  i: 67, // G4
  o: 68, // G#4
  p: 69, // A4
  "[": 70, // A#4
  "]": 71, // B4

  // A row: C5 to A#5 (higher octave)
  a: 72, // C5
  s: 73, // C#5
  d: 74, // D5
  f: 75, // D#5
  g: 76, // E5
  h: 77, // F5
  j: 78, // F#5
  k: 79, // G5
  l: 80, // G#5
  ";": 81, // A5
  "'": 82, // A#5

  // Z row: C2 to A2 (bass octave)
  z: 36, // C2
  x: 37, // C#2
  c: 38, // D2
  v: 39, // D#2
  b: 40, // E2
  n: 41, // F2
  m: 42, // F#2
  ",": 43, // G2
  ".": 44, // G#2
  "/": 45, // A2
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
  const hasAdvancedRef = useRef(false);
  const checkAndAdvanceRef = useRef<(keys: Set<number>) => void>(() => {});
  const sheetMusicRef = useRef<SheetMusicHandle>(null);

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

        // Calculate wait time based on note duration and tempo
        const bpm = 120;
        const noteDuration = filteredNotes[0]?.duration ?? 0.25; // Default to quarter note
        const waitMs = noteDuration * (60 / bpm) * 1000;

        setTimeout(() => {
          sheetMusicRef.current?.next();
        }, waitMs);
      }
    },
    [filteredNotes]
  );

  // Auto-skip positions with no relevant notes
  // Handles: empty positions (bar lines, repeats) AND single-hand mode
  useEffect(() => {
    // No notes at all = empty position (bar line, repeat sign, etc.)
    if (currentNotes.length === 0) {
      sheetMusicRef.current?.nextToPlayableNote();
      return;
    }

    // In single-hand mode, skip positions with only other-hand notes
    if (handMode !== "both" && filteredNotes.length === 0) {
      sheetMusicRef.current?.nextForHand(handMode);
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
    };
  }, [checkAndAdvance]);

  // Stop all notes on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopAllNotes(); // ✅ Only on component unmount
    };
  }, []);

  const handleReset = () => {
    sheetMusicRef.current?.reset();
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
                  "p-1.5 ",
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
                  "p-1.5 border-x border-border",
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
                  "p-1.5 ",
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

            <Button
              onClick={handleToggleMute}
              variant="outline"
              size="icon-sm"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </Button>
            {/* Reset button */}
            <Button
              onClick={handleReset}
              variant="outline"
              size="icon-sm"
              title="Reset to beginning"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </header>

      {/* Sheet Music Area */}
      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <SheetMusic
          ref={sheetMusicRef}
          xmlContent={songContent}
          onNotesChange={handleNotesChange}
        />
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
