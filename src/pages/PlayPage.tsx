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
import Metronome from "@/components/metronome";
import { PlaybackTimeline } from "@/components/PlaybackTimeline";
import { usePlaybackProgress } from "@/hooks/use-playback-progress";
import { Play, Pause } from "lucide-react";
import { KEYBOARD_MAP } from "@/lib/contants";

type HandMode = "left" | "right" | "both";

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
  const [playingMeasure, setPlayingMeasure] = useState<number | null>(null);

  // Use the playback progress hook for unified state
  const { isPlaying: isListening } = usePlaybackProgress();

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

  // Listen mode - play the entire piece
  const handleListen = useCallback(async () => {
    if (!sheetMusicRef.current) return;

    if (audioEngine.playing) {
      // Stop playback
      audioEngine.stopPlayback();
      setPlayingMeasure(null);
      return;
    }

    // Get all notes and BPM from sheet music
    const notes = sheetMusicRef.current.getAllNotesWithTiming();
    const bpm = sheetMusicRef.current.getBPM();

    if (notes.length === 0) {
      toast.error("No notes found in the score");
      return;
    }

    // Set up cursor sync callback
    audioEngine.onPlaybackNote = (measureIndex) => {
      // Move cursor to the measure being played
      setPlayingMeasure(measureIndex);
    };

    // Set up end callback
    audioEngine.onPlaybackEnd = () => {
      setPlayingMeasure(null);
      sheetMusicRef.current?.reset();
    };

    // Start playback
    await audioEngine.schedulePlayback(notes, bpm);
  }, []);

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
    <div className="h-dvh grid grid-rows-[auto_auto_1fr_auto] bg-background">
      {/* Header - Clean toolbar */}
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border/40">
        <div className="px-4 py-2 flex items-center justify-between">
          {/* Left: Back button */}
          <Button
            onClick={() => navigate({ to: "/" })}
            variant="ghost"
            size="icon"
            className="shrink-0"
            title="Back to library"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Right: Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Hand Mode Toggle */}
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setHandMode("left")}
                className={cn(
                  "p-2",
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
                  "p-2 border-x border-border",
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
                  "p-2",
                  handMode === "right"
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
                title="Right hand only"
              >
                <Hand className="h-4 w-4" />
              </button>
            </div>

            {/* MIDI Status */}
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

            <Metronome />

            {/* Listen Mode Button - with transitions and visual feedback */}
            <Button
              variant="default"
              size="icon"
              onClick={handleListen}
              disabled={!audioLoaded}
              title={isListening ? "Stop" : "Listen"}
              className={cn(
                "h-9 w-9 transition-all duration-200 cursor-pointer",
                isListening &&
                  "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30",
                !audioLoaded && "opacity-50 cursor-wait"
              )}
            >
              {!audioLoaded ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <div className="relative">
                  <Play
                    className={cn(
                      "h-4 w-4 absolute transition-all duration-200",
                      isListening
                        ? "opacity-0 scale-75 rotate-90"
                        : "opacity-100 scale-100 rotate-0"
                    )}
                  />
                  <Pause
                    className={cn(
                      "h-4 w-4 transition-all duration-200",
                      isListening
                        ? "opacity-100 scale-100 rotate-0"
                        : "opacity-0 scale-75 -rotate-90"
                    )}
                  />
                </div>
              )}
            </Button>

            <Button
              onClick={handleToggleMute}
              variant="outline"
              size="icon-sm"
              title={isMuted ? "Unmute" : "Mute"}
              className="cursor-pointer"
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              size="icon-sm"
              title="Reset to beginning"
              className="cursor-pointer"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </header>

      {/* Playback Timeline */}
      <PlaybackTimeline />

      {/* Sheet Music Area */}
      <div className="p-2 md:p-4 overflow-hidden min-h-0">
        <SheetMusic
          ref={sheetMusicRef}
          xmlContent={songContent}
          onNotesChange={handleNotesChange}
          playingMeasure={playingMeasure}
        />
      </div>

      {/* Piano Area */}
      <div className="bg-muted/30 border-t border-border/40">
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
