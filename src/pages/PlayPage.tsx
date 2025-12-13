import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import SheetMusic, { type NoteInfo } from "../components/SheetMusic";

export default function PlayPage() {
  const navigate = useNavigate();
  const [filename, setFilename] = useState<string | null>(null);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<NoteInfo[]>([]);

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
    console.log("Current notes:", notes);
  }, []);

  const handleNext = () => {
    (window as any).osmdControls?.next();
  };

  const handlePrevious = () => {
    (window as any).osmdControls?.previous();
  };

  const handleReset = () => {
    (window as any).osmdControls?.reset();
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

        <div className="text-right min-w-[120px]">
          {filename && (
            <p className="text-xs text-zinc-500 truncate">{filename}</p>
          )}
        </div>
      </header>

      {/* Sheet Music Area */}
      <div className="flex-1 p-4 overflow-hidden">
        <SheetMusic xmlContent={xmlContent} onNotesChange={handleNotesChange} />
      </div>

      {/* Piano Area */}
      <div className="h-48 bg-zinc-900 border-t border-zinc-800 flex flex-col items-center justify-center">
        <p className="text-zinc-500 mb-2">
          88-key piano will render here (Phase 4)
        </p>
        {currentNotes.length > 0 && (
          <div className="flex gap-2">
            {currentNotes.map((note, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded text-sm ${
                  note.hand === "left"
                    ? "bg-teal-600/20 text-teal-400"
                    : "bg-orange-600/20 text-orange-400"
                }`}
              >
                MIDI {note.midiNumber} ({note.hand})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
