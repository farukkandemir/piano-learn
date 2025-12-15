import { useMemo } from "react";
import type { NoteInfo } from "./SheetMusic";

interface PianoProps {
  highlightedNotes: NoteInfo[];
  pressedKeys?: Set<number>;
}

// Piano range: A0 (21) to C8 (108) = 88 keys
const FIRST_NOTE = 21; // A0
const LAST_NOTE = 108; // C8

// Note names for reference
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Check if a MIDI note is a black key
const isBlackKey = (midi: number): boolean => {
  const note = midi % 12;
  return [1, 3, 6, 8, 10].includes(note); // C#, D#, F#, G#, A#
};

// Get note name from MIDI number
const getNoteName = (midi: number): string => {
  const note = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[note]}${octave}`;
};

export default function Piano({
  highlightedNotes,
  pressedKeys = new Set(),
}: PianoProps) {
  // Create array of all 88 keys
  const keys = useMemo(() => {
    const keyArray = [];
    for (let midi = FIRST_NOTE; midi <= LAST_NOTE; midi++) {
      keyArray.push({
        midi,
        isBlack: isBlackKey(midi),
        name: getNoteName(midi),
      });
    }
    return keyArray;
  }, []);

  // Create a map for quick highlight lookup
  const highlightMap = useMemo(() => {
    const map = new Map<number, "left" | "right">();
    highlightedNotes.forEach((note) => {
      map.set(note.midiNumber, note.hand);
    });
    return map;
  }, [highlightedNotes]);

  // Get key styling based on highlight and pressed state
  const getKeyStyle = (midi: number, isBlack: boolean) => {
    const highlight = highlightMap.get(midi);
    const isPressed = pressedKeys.has(midi);
    const isCorrectPress = highlight && isPressed;

    if (isBlack) {
      if (isCorrectPress) {
        return "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]";
      } else if (highlight === "left") {
        return "bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.6)]";
      } else if (highlight === "right") {
        return "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]";
      } else if (isPressed) {
        return "bg-zinc-600";
      }
      return "bg-zinc-900 hover:bg-zinc-800";
    } else {
      if (isCorrectPress) {
        return "bg-green-400 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
      } else if (highlight === "left") {
        return "bg-teal-400 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]";
      } else if (highlight === "right") {
        return "bg-orange-400 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]";
      } else if (isPressed) {
        return "bg-zinc-300 border-zinc-400";
      }
      return "bg-white hover:bg-zinc-100";
    }
  };

  // Separate white and black keys for rendering
  const whiteKeys = keys.filter((k) => !k.isBlack);

  const keyStyles = {
    whiteKey: {
      width: "clamp(0.75rem, 1.8vw, 2rem)", // 12px min → 32px max
      height: "clamp(5rem, 12vh, 9rem)", // 80px min → 144px max
    },
    blackKey: {
      width: "clamp(0.5rem, 1.1vw, 1.5rem)", // 8px min → 24px max
      height: "clamp(3.5rem, 8vh, 6rem)", // 56px min → 96px max
    },
  };

  return (
    <div className="h-full flex items-end justify-center pb-2">
      <div className="relative inline-flex max-w-[1700px]">
        {/* White keys */}
        <div className="flex">
          {whiteKeys.map((key) => {
            const highlight = highlightMap.get(key.midi);
            const isPressed = pressedKeys.has(key.midi);

            return (
              <div
                key={key.midi}
                style={keyStyles.whiteKey}
                className={`
                  relative border border-zinc-300 rounded-b-md
                  transition-all duration-75
                  ${getKeyStyle(key.midi, false)}
                `}
                title={key.name}
              >
                {/* Show note name on C keys */}
                {key.name.startsWith("C") && !key.name.includes("#") && (
                  <span
                    className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium
                    ${highlight || isPressed ? "text-white" : "text-zinc-400"}`}
                  >
                    {key.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Black keys - positioned absolutely */}
        <div className="absolute top-0 left-0 flex pointer-events-none">
          {whiteKeys.map((whiteKey) => {
            // Check if there's a black key after this white key
            const blackMidi = whiteKey.midi + 1;
            if (blackMidi > LAST_NOTE || !isBlackKey(blackMidi)) {
              return (
                <div
                  key={whiteKey.midi}
                  style={{ width: keyStyles.whiteKey.width }}
                />
              );
            }

            const blackKey = keys.find((k) => k.midi === blackMidi);
            if (!blackKey)
              return (
                <div
                  key={whiteKey.midi}
                  style={{ width: keyStyles.whiteKey.width }}
                />
              );

            return (
              <div
                key={whiteKey.midi}
                className="relative"
                style={{ width: keyStyles.whiteKey.width }}
              >
                <div
                  style={{
                    width: keyStyles.blackKey.width,
                    height: keyStyles.blackKey.height,
                    right: `calc(-1 * ${keyStyles.blackKey.width} / 2)`,
                  }}
                  className={`
                    absolute  top-0 z-10 rounded-b-md
                    transition-all duration-75
                    ${getKeyStyle(blackKey.midi, true)}
                  `}
                  title={blackKey.name}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
