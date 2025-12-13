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
  private synth: Tone.PolySynth | null = null;
  private isStarted = false;

  constructor() {
    // Create synth immediately - no loading needed
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "fmtriangle", // FM synthesis for richer sound
        modulationType: "sine",
        modulationIndex: 2,
        harmonicity: 1,
      },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.2,
        release: 1.2,
      },
      volume: -6,
    }).toDestination();

    // Add some reverb for a nicer sound
    const reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.2,
    }).toDestination();

    this.synth.connect(reverb);
  }

  async ensureStarted(): Promise<void> {
    if (this.isStarted) return;

    // Tone.js requires user interaction to start audio context
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    this.isStarted = true;
    console.log("Audio engine started!");
  }

  playNote(midiNumber: number, velocity: number = 0.7): void {
    if (!this.synth) return;

    const noteName = midiToNoteName(midiNumber);
    this.synth.triggerAttack(noteName, Tone.now(), velocity);
  }

  stopNote(midiNumber: number): void {
    if (!this.synth) return;

    const noteName = midiToNoteName(midiNumber);
    this.synth.triggerRelease(noteName, Tone.now());
  }

  stopAllNotes(): void {
    if (!this.synth) return;
    this.synth.releaseAll();
  }

  get loaded(): boolean {
    return true; // Always loaded since we use synthesis
  }

  get loading(): boolean {
    return false;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
