import { useEffect, useRef, useState, useCallback } from "react";
import { OpenSheetMusicDisplay as OSMD } from "opensheetmusicdisplay";

// Note info extracted from OSMD
export interface NoteInfo {
  midiNumber: number;
  hand: "left" | "right";
  duration: number;
}

interface SheetMusicProps {
  xmlContent: string;
  onNotesChange?: (notes: NoteInfo[]) => void;
  onReady?: () => void;
}

export default function SheetMusic({
  xmlContent,
  onNotesChange,
  onReady,
}: SheetMusicProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OSMD | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract notes under cursor
  const extractNotesUnderCursor = useCallback(() => {
    if (!osmdRef.current?.cursor) return;

    const cursor = osmdRef.current.cursor;
    const notesUnderCursor = cursor.NotesUnderCursor();

    const notes: NoteInfo[] = notesUnderCursor.map((note) => {
      // Staff 1 = right hand (treble), Staff 2 = left hand (bass)
      // In OSMD, staffIndex is 0-based
      const staffIndex =
        note.ParentStaffEntry?.ParentStaff?.idInMusicSheet ?? 0;
      const hand: "left" | "right" = staffIndex === 0 ? "right" : "left";

      // Get MIDI number (OSMD uses halfTone property)
      const midiNumber = note.halfTone + 12; // Adjust for OSMD's convention

      // Get duration in beats
      const duration = note.Length?.RealValue ?? 1;

      return {
        midiNumber,
        hand,
        duration,
      };
    });

    onNotesChange?.(notes);
  }, [onNotesChange]);

  // Initialize OSMD
  useEffect(() => {
    if (!containerRef.current || !xmlContent) return;

    const initOSMD = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create OSMD instance
        const osmd = new OSMD(containerRef.current!, {
          autoResize: true,
          drawTitle: true,
          drawSubtitle: false,
          drawComposer: false,
          drawCredits: false,
          drawPartNames: false,
          drawPartAbbreviations: false,
          drawingParameters: "compact",
        });

        osmdRef.current = osmd;

        // Load MusicXML
        await osmd.load(xmlContent);

        // Render
        osmd.render();

        // Setup cursor
        osmd.cursor.show();
        osmd.cursor.CursorOptions = {
          ...osmd.cursor.CursorOptions,
          color: "#14b8a6", // Teal color
          alpha: 0.5,
        };

        // Extract initial notes
        extractNotesUnderCursor();

        setIsLoading(false);
        onReady?.();
      } catch (err) {
        console.error("OSMD Error:", err);
        setError("Failed to load sheet music. Please check the file format.");
        setIsLoading(false);
      }
    };

    initOSMD();

    return () => {
      osmdRef.current = null;
    };
  }, [xmlContent, extractNotesUnderCursor, onReady]);

  // Navigation methods
  const next = useCallback(() => {
    if (!osmdRef.current?.cursor) return;
    osmdRef.current.cursor.next();
    extractNotesUnderCursor();
  }, [extractNotesUnderCursor]);

  const previous = useCallback(() => {
    if (!osmdRef.current?.cursor) return;
    osmdRef.current.cursor.previous();
    extractNotesUnderCursor();
  }, [extractNotesUnderCursor]);

  const reset = useCallback(() => {
    if (!osmdRef.current?.cursor) return;
    osmdRef.current.cursor.reset();
    extractNotesUnderCursor();
  }, [extractNotesUnderCursor]);

  // Expose navigation methods via window for testing (will use proper state management later)
  useEffect(() => {
    (window as any).osmdControls = { next, previous, reset };
    return () => {
      delete (window as any).osmdControls;
    };
  }, [next, previous, reset]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
          <p className="text-zinc-400">Loading sheet music...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full overflow-auto bg-white rounded-lg"
      />
    </div>
  );
}
