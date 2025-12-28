import type { ScheduledNote } from "@/components/SheetMusic";
import * as Tone from "tone";
import { Draw } from "tone";

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

  private metronomeScheduleId: number | null = null;
  private clickSynth: Tone.Synth | null = null;

  // Callback for visual beat indicator - synced with audio clock
  public onBeat: (() => void) | null = null;

  private playbackScheduleIds: number[] = [];
  private isPlaying = false;
  // Callback for cursor sync during playback
  public onPlaybackNote: ((measureIndex: number) => void) | null = null;
  public onPlaybackEnd: (() => void) | null = null;

  constructor() {
    // Create compressor to tame bass chord dynamics
    const compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
    }).toDestination();

    // Create limiter to prevent clipping with many simultaneous notes
    const limiter = new Tone.Limiter(-3).connect(compressor);
    // Create a high, thin doorbell-like "ding" for metronome
    this.clickSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();
    this.clickSynth.volume.value = -8;

    // Use Sampler with Salamander Grand Piano samples
    // These are high-quality, free piano samples hosted by Tone.js
    this.instrument = new Tone.Sampler({
      urls: {
        // Octave 1
        A1: "A1.mp3",
        "A#1": "As1.mp3",
        B1: "B1.mp3",
        C1: "C1.mp3",
        "C#1": "Cs1.mp3",
        D1: "D1.mp3",
        "D#1": "Ds1.mp3",
        E1: "E1.mp3",
        F1: "F1.mp3",
        "F#1": "Fs1.mp3",
        G1: "G1.mp3",
        "G#1": "Gs1.mp3",
        // Octave 2
        A2: "A2.mp3",
        "A#2": "As2.mp3",
        B2: "B2.mp3",
        C2: "C2.mp3",
        "C#2": "Cs2.mp3",
        D2: "D2.mp3",
        "D#2": "Ds2.mp3",
        E2: "E2.mp3",
        F2: "F2.mp3",
        "F#2": "Fs2.mp3",
        G2: "G2.mp3",
        "G#2": "Gs2.mp3",
        // Octave 3
        A3: "A3.mp3",
        "A#3": "As3.mp3",
        B3: "B3.mp3",
        C3: "C3.mp3",
        "C#3": "Cs3.mp3",
        D3: "D3.mp3",
        "D#3": "Ds3.mp3",
        E3: "E3.mp3",
        F3: "F3.mp3",
        "F#3": "Fs3.mp3",
        G3: "G3.mp3",
        "G#3": "Gs3.mp3",
        // Octave 4 (Middle C octave)
        A4: "A4.mp3",
        "A#4": "As4.mp3",
        B4: "B4.mp3",
        C4: "C4.mp3",
        "C#4": "Cs4.mp3",
        D4: "D4.mp3",
        "D#4": "Ds4.mp3",
        E4: "E4.mp3",
        F4: "F4.mp3",
        "F#4": "Fs4.mp3",
        G4: "G4.mp3",
        "G#4": "Gs4.mp3",
        // Octave 5
        A5: "A5.mp3",
        "A#5": "As5.mp3",
        B5: "B5.mp3",
        C5: "C5.mp3",
        "C#5": "Cs5.mp3",
        D5: "D5.mp3",
        "D#5": "Ds5.mp3",
        E5: "E5.mp3",
        F5: "F5.mp3",
        "F#5": "Fs5.mp3",
        G5: "G5.mp3",
        "G#5": "Gs5.mp3",
        // Octave 6
        A6: "A6.mp3",
        "A#6": "As6.mp3",
        B6: "B6.mp3",
        C6: "C6.mp3",
        "C#6": "Cs6.mp3",
        D6: "D6.mp3",
        "D#6": "Ds6.mp3",
        E6: "E6.mp3",
        F6: "F6.mp3",
        "F#6": "Fs6.mp3",
        G6: "G6.mp3",
        "G#6": "Gs6.mp3",
        // Octave 7
        A7: "A7.mp3",
        "A#7": "As7.mp3",
        B7: "B7.mp3",
        C7: "C7.mp3",
        "C#7": "Cs7.mp3",
        D7: "D7.mp3",
        "D#7": "Ds7.mp3",
        E7: "E7.mp3",
        F7: "F7.mp3",
        "F#7": "Fs7.mp3",
        G7: "G7.mp3",
        "G#7": "Gs7.mp3",
        // Octave 8 (just C8)
        C8: "C8.mp3",
      },
      // Free high-quality piano samples hosted by Tone.js
      // baseUrl: "https://tonejs.github.io/audio/salamander/",
      baseUrl: "https://pub-402870d67d4b4b558251094b482eebdc.r2.dev/",
      onload: () => {
        this._loaded = true;
      },
    }).connect(limiter);

    // Reduce overall piano volume
    this.instrument.volume.value = -6;
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
    this.instrument.triggerRelease(noteName, "+0.3");
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

  async startMetronome(bpm: number): Promise<void> {
    // Ensure audio context is running (required after user gesture)
    await this.ensureStarted();

    this.stopMetronome();

    // Set the BPM on Tone.js Transport
    Tone.getTransport().bpm.value = bpm;

    // Schedule a repeating click using Transport's precise scheduling
    // Transport uses Web Audio API's clock for sample-accurate timing
    this.metronomeScheduleId = Tone.getTransport().scheduleRepeat(
      (time) => {
        // 'time' is the precise audio context time when this should play
        // Using the time parameter ensures sample-accurate playback
        this.clickSynth?.triggerAttackRelease("G6", "32n", time);

        // Schedule visual update synced with audio clock
        // Draw.schedule runs on main thread but at the correct time
        if (this.onBeat) {
          Draw.schedule(() => {
            this.onBeat?.();
          }, time);
        }
      },
      "4n", // Quarter note interval
      0 // Start immediately
    );

    // Start the Transport
    Tone.getTransport().start();
  }

  stopMetronome(): void {
    if (this.metronomeScheduleId !== null) {
      Tone.getTransport().clear(this.metronomeScheduleId);
      this.metronomeScheduleId = null;
    }
    Tone.getTransport().stop();
    Tone.getTransport().position = 0; // Reset position
  }

  get isMetronomeRunning(): boolean {
    return this.metronomeScheduleId !== null;
  }

  async schedulePlayback(notes: ScheduledNote[], bpm: number): Promise<void> {
    await this.ensureStarted();

    // Stop any existing playback
    this.stopPlayback();

    // Small delay to ensure transport is fully reset
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (!this.instrument || !this._loaded) {
      console.warn("Audio engine not ready");
      return;
    }

    // Set tempo
    Tone.getTransport().bpm.value = bpm;

    // Calculate whole note duration in seconds at this BPM
    const wholeNoteDuration = (60 / bpm) * 4;

    // Group notes by start time for chord handling
    const notesByTime = new Map<number, ScheduledNote[]>();
    notes.forEach((note) => {
      const key = note.startTime;
      if (!notesByTime.has(key)) {
        notesByTime.set(key, []);
      }
      notesByTime.get(key)!.push(note);
    });

    // Schedule each note group
    notesByTime.forEach((noteGroup, startTime) => {
      const startTimeSeconds = startTime * wholeNoteDuration + 0.1; // Add a small delay to avoid clicks

      // Schedule NOTE ON (attack)
      const attackId = Tone.getTransport().schedule((time) => {
        noteGroup.forEach((note) => {
          const noteName = this.midiToNoteName(note.midiNumber);
          // Lower velocity for left hand to reduce bass muddiness
          const velocity = note.hand === "left" ? 0.35 : 0.5;
          this.instrument?.triggerAttack(noteName, time, velocity);
        });

        // Sync cursor on main thread using Draw
        if (this.onPlaybackNote && noteGroup.length > 0) {
          Draw.schedule(() => {
            this.onPlaybackNote?.(noteGroup[0].measureIndex);
          }, time);
        }
      }, startTimeSeconds);
      this.playbackScheduleIds.push(attackId);

      // Schedule NOTE OFF (release) - with natural decay offset like manual play
      noteGroup.forEach((note) => {
        const noteName = this.midiToNoteName(note.midiNumber);
        const durationSeconds = note.duration * wholeNoteDuration;

        // Release slightly before the mathematical end, with +0.3 decay offset
        // This mimics the manual stopNote behavior
        const releaseTime = startTimeSeconds + durationSeconds;

        const releaseId = Tone.getTransport().schedule((time) => {
          this.instrument?.triggerRelease(noteName, time + 0.3);
        }, releaseTime);
        this.playbackScheduleIds.push(releaseId);
      });
    });

    // Schedule end callback
    const lastNote = notes.reduce(
      (latest, note) =>
        note.startTime + note.duration > latest.startTime + latest.duration
          ? note
          : latest,
      notes[0]
    );

    if (lastNote) {
      const endTime =
        (lastNote.startTime + lastNote.duration) * wholeNoteDuration + 0.5; // Extra buffer for final release
      const endId = Tone.getTransport().schedule((time) => {
        Draw.schedule(() => {
          this.stopPlayback();
          this.onPlaybackEnd?.();
        }, time);
      }, endTime);
      this.playbackScheduleIds.push(endId);
    }

    // Start transport
    this.isPlaying = true;
    Tone.getTransport().start();
  }
  // Helper: Convert MIDI to note name (move from top-level function to method)
  private midiToNoteName(midi: number): string {
    const note = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    return `${NOTE_NAMES[note]}${octave}`;
  }

  stopPlayback(): void {
    // Cancel ALL scheduled events first
    Tone.getTransport().cancel();
    // Clear all scheduled notes
    this.playbackScheduleIds.forEach((id) => {
      Tone.getTransport().clear(id);
    });
    this.playbackScheduleIds = [];
    // Stop transport and reset
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    // Immediately release ALL playing notes (no decay)
    if (this.instrument) {
      this.instrument.releaseAll(Tone.now());
    }
    this.isPlaying = false;
  }

  get playing(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
