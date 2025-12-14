import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import SheetMusic, { type NoteInfo } from "../components/SheetMusic";
import Piano from "../components/Piano";
import MidiStatus from "../components/MidiStatus";
import { audioEngine } from "../utils/audioEngine";
import { useMidi } from "../hooks/useMidi";

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
  const [filename, setFilename] = useState<string | null>(null);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<NoteInfo[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const [waitMode, setWaitMode] = useState(true);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const hasAdvancedRef = useRef(false);
  const checkAndAdvanceRef = useRef<(keys: Set<number>) => void>(() => {});

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

  useEffect(() => {
    const content = sessionStorage.getItem("musicxml-content");
    const name = sessionStorage.getItem("musicxml-filename");

    if (!content) {
      navigate("/");
      return;
    }

    setFilename(name);
    setXmlContent(content);
  }, [navigate]);

  const handleNotesChange = useCallback((notes: NoteInfo[]) => {
    setCurrentNotes(notes);
    hasAdvancedRef.current = false;
  }, []);

  // Check if all required notes are currently pressed
  const checkAndAdvance = useCallback(
    (currentPressed: Set<number>) => {
      if (!waitMode || currentNotes.length === 0 || hasAdvancedRef.current)
        return;

      const requiredNotes = new Set(currentNotes.map((n) => n.midiNumber));
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
    [waitMode, currentNotes]
  );

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

  if (!xmlContent) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="px-6 py-3 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
        <button
          onClick={() => navigate("/")}
          className="text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Controls */}
        <div className="flex items-center gap-4">
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

          {/* Audio Status */}
          {!audioLoaded && (
            <span className="text-xs text-zinc-500">Loading audio...</span>
          )}

          {/* Wait Mode Toggle */}
          <button
            onClick={() => setWaitMode(!waitMode)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              waitMode ? "bg-teal-600 text-white" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            Wait Mode {waitMode ? "ON" : "OFF"}
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handlePrevious}
              className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="text-right min-w-[120px]">
          {filename && (
            <p className="text-xs text-zinc-500 truncate">{filename}</p>
          )}
        </div>
      </header>

      {/* Sheet Music Area */}
      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <SheetMusic xmlContent={xmlContent} onNotesChange={handleNotesChange} />
      </div>

      {/* Piano Area */}
      <div className="h-44 bg-zinc-900 border-t border-zinc-800">
        <Piano highlightedNotes={currentNotes} pressedKeys={pressedKeys} />
      </div>
    </div>
  );
}
