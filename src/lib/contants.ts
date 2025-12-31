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

export const KEYBOARD_MAP: Record<string, number> = {
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
