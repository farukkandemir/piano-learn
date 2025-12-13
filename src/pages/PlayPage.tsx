import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import SheetMusic, { type NoteInfo } from "../components/SheetMusic";
import Piano from "../components/Piano";
import { audioEngine } from "../utils/audioEngine";

// Computer keyboard to MIDI mapping
// Extended range: C2 to G5
const KEYBOARD_MAP: Record<string, number> = {
  // Number row - C2 to B2 (MIDI 36-47) white keys
  "1": 36, // C2
  "2": 38, // D2
  "3": 40, // E2
  "4": 41, // F2
  "5": 43, // G2
  "6": 45, // A2
  "7": 47, // B2

  // Lower row - C3 to B3 (MIDI 48-59)
  z: 48, // C3
  x: 50, // D3
  c: 52, // E3
  v: 53, // F3
  b: 55, // G3
  n: 57, // A3
  m: 59, // B3
  // Black keys C3 octave
  s: 49, // C#3
  d: 51, // D#3
  g: 54, // F#3
  h: 56, // G#3
  j: 58, // A#3

  // QWERTY row - C4 to B4 (MIDI 60-71)
  q: 60, // C4 (middle C)
  w: 62, // D4
  e: 64, // E4
  r: 65, // F4
  t: 67, // G4
  y: 69, // A4
  u: 71, // B4
  // Black keys C4 octave (use number row)
  "8": 61, // C#4
  "9": 63, // D#4
  "-": 66, // F#4
  "=": 68, // G#4
  Backspace: 70, // A#4

  // Upper range - C5 to G5 (MIDI 72-79)
  i: 72, // C5
  o: 74, // D5
  p: 76, // E5
  "[": 77, // F5
  "]": 79, // G5
  // Black keys C5 octave
  "0": 73, // C#5
  a: 75, // D#5
  f: 78, // F#5
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
