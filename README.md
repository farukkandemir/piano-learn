# piano.learn

**Live: [pianolearn.app](https://pianolearn.app)**

An interactive piano-learning web app. Load a piece of sheet music, hear it played with real-time audio synthesis, slow it down, and practice along with a built-in metronome.

## Features

- **Real-time audio synthesis.** Notes are synthesized in the browser with Tone.js. No audio files needed.
- **Sheet-music rendering.** MusicXML scores rendered with OpenSheetMusicDisplay.
- **Adjustable tempo.** Slow difficult passages down without changing pitch.
- **Built-in metronome.** Keep time while practicing.
- **Guided practice flow.** Follow the piece measure by measure.

## Tech stack

React, TypeScript, Tone.js, OpenSheetMusicDisplay

## Running locally

```bash
git clone https://github.com/farukkandemir/pianolearn.git
cd pianolearn
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Why I built it

I wanted to learn piano and found that switching between sheet music, a metronome app, and reference recordings broke the practice flow. piano.learn puts all three in one place, in the browser.
