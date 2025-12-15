import * as Tone from "tone";

// Note names for MIDI conversion
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

// Convert MIDI number to note name with octave (e.g., 60 -> "C4")
function midiToNoteName(midi: number): string {
  const note = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[note]}${octave}`;
}

class AudioEngine {
  // Using Sampler for realistic piano sounds
  private instrument: Tone.Sampler | null = null;
  private isStarted = false;
  private _loaded = false;
  private _muted = false;

  constructor() {
    // Create reverb effect for concert hall feel
    const reverb = new Tone.Reverb({
      decay: 3, // Longer decay for a concert hall feel
      wet: 0.3,
    }).toDestination();

    // Use Sampler with Salamander Grand Piano samples
    // These are high-quality, free piano samples hosted by Tone.js
    this.instrument = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3",
      },
      // Free high-quality piano samples hosted by Tone.js
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        this._loaded = true;
      },
    }).connect(reverb);
  }

  async ensureStarted(): Promise<void> {
    if (this.isStarted) return;

    // Tone.js requires user interaction to start audio context
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    this.isStarted = true;
  }

  get muted(): boolean {
    return this._muted;
  }

  setMuted(muted: boolean): void {
    this._muted = muted;

    if (muted) {
      this.stopAllNotes();
    }
  }

  playNote(midiNumber: number, velocity: number = 0.7): void {
    if (!this.instrument || !this._loaded || this._muted) return;

    const noteName = midiToNoteName(midiNumber);
    this.instrument.triggerAttack(noteName, Tone.now(), velocity);
  }

  stopNote(midiNumber: number): void {
    if (!this.instrument || !this._loaded) return;

    const noteName = midiToNoteName(midiNumber);
    this.instrument.triggerRelease(noteName, Tone.now());
  }

  stopAllNotes(): void {
    if (!this.instrument) return;
    this.instrument.releaseAll();
  }

  get loaded(): boolean {
    return this._loaded;
  }

  get loading(): boolean {
    return !this._loaded;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
