import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  OpenSheetMusicDisplay as OSMD,
  GraphicalNote,
} from "opensheetmusicdisplay";
import { useMeasureBounds } from "@/hooks/use-measure-bounds";
import { MeasureOverlay } from "./measure-overlay";
import { useLoopSelection } from "@/hooks/use-loop-selection";

// Note info extracted from OSMD
export interface NoteInfo {
  midiNumber: number;
  hand: "left" | "right";
  duration: number;
}

// Progress info for cursor position
export interface ProgressInfo {
  currentMeasure: number;
  totalMeasures: number;
}

interface SheetMusicProps {
  xmlContent: string;
  onNotesChange?: (notes: NoteInfo[]) => void;
  onProgressChange?: (progress: ProgressInfo) => void;
  onReady?: () => void;
}

// Handle interface for imperative methods exposed via ref
export interface SheetMusicHandle {
  next: () => void;
  previous: () => void;
  reset: () => void;
  nextForHand: (hand: "left" | "right") => void;
  nextToPlayableNote: () => boolean; // Returns false if end reached
}

// Colors for highlighting
const COLORS = {
  left: "#14b8a6", // Teal
  right: "#f97316", // Orange
  default: "#000000", // Black
};

const SheetMusic = forwardRef<SheetMusicHandle, SheetMusicProps>(
  ({ xmlContent, onNotesChange, onProgressChange, onReady }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OSMD | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const previousNotesRef = useRef<GraphicalNote[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { loopRange, pendingStart, handleMeasureClick } = useLoopSelection();

    const { recalculateBounds, allMeasureBounds } = useMeasureBounds({
      osmdRef,
      containerRef,
      highlightedRange: loopRange,
    });

    // Helper: Jump cursor to loop start
    const jumpToLoopStart = useCallback(() => {
      if (!osmdRef.current?.cursor || !loopRange) return;
      const cursor = osmdRef.current.cursor;
      cursor.reset();
      while (cursor.Iterator.CurrentMeasureIndex + 1 < loopRange.start) {
        cursor.next();
      }
    }, [loopRange]);
    // Helper: Check if cursor is outside loop
    const isOutsideLoop = useCallback((): boolean => {
      if (!osmdRef.current?.cursor || !loopRange) return false;
      const currentMeasure =
        osmdRef.current.cursor.Iterator.CurrentMeasureIndex + 1;
      return currentMeasure > loopRange.end;
    }, [loopRange]);

    // Reset colors of previously highlighted notes
    const resetPreviousNoteColors = useCallback(() => {
      previousNotesRef.current.forEach((gNote) => {
        const sourceNote = gNote.sourceNote;
        if (sourceNote) {
          sourceNote.NoteheadColor = COLORS.default;
          sourceNote.StemColorXml = COLORS.default;
        }
      });
      previousNotesRef.current = [];
    }, []);

    // Color notes based on hand and extract note info
    const highlightAndExtractNotes = useCallback(() => {
      if (!osmdRef.current?.cursor) return;

      // Reset previous note colors
      resetPreviousNoteColors();

      const cursor = osmdRef.current.cursor;
      const gNotesUnderCursor = cursor.GNotesUnderCursor();

      const notes: NoteInfo[] = [];

      gNotesUnderCursor.forEach((gNote) => {
        const sourceNote = gNote.sourceNote;
        if (!sourceNote || sourceNote.isRest()) return;

        // Determine hand based on staff
        const staffIndex =
          sourceNote.ParentStaffEntry?.ParentStaff?.idInMusicSheet ?? 0;
        const hand: "left" | "right" = staffIndex === 0 ? "right" : "left";

        // Color the entire note (head + stem)
        const color = hand === "left" ? COLORS.left : COLORS.right;
        sourceNote.NoteheadColor = color;
        sourceNote.StemColorXml = color;

        // Store for later reset
        previousNotesRef.current.push(gNote);

        // Get MIDI number
        const midiNumber = sourceNote.halfTone + 12;

        // Get duration
        const duration = sourceNote.Length?.RealValue ?? 1;

        notes.push({ midiNumber, hand, duration });
      });

      // Re-render to show color changes
      osmdRef.current.render();

      // Show cursor again after render
      osmdRef.current.cursor.show();

      // Report progress (measure info)
      if (onProgressChange && osmdRef.current) {
        const iterator = cursor.Iterator;
        const currentMeasure = iterator?.CurrentMeasureIndex ?? 0;
        const totalMeasures =
          osmdRef.current.Sheet?.SourceMeasures?.length ?? 0;
        onProgressChange({
          currentMeasure: currentMeasure + 1,
          totalMeasures,
        });
      }

      onNotesChange?.(notes);
    }, [onNotesChange, onProgressChange, resetPreviousNoteColors]);

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
            coloringEnabled: true,
            colorStemsLikeNoteheads: true,
          });

          osmdRef.current = osmd;

          // Load MusicXML
          await osmd.load(xmlContent);

          // Render
          osmd.render();

          // Setup cursor with better visibility
          osmd.cursor.show();
          osmd.cursor.CursorOptions = {
            ...osmd.cursor.CursorOptions,
            color: "#8b5cf6", // Purple for cursor
            alpha: 0.4,
          };

          // Initial highlight
          highlightAndExtractNotes();

          // Calculate measure bounds for overlay
          // Use setTimeout to ensure SVG is rendered
          setTimeout(() => {
            recalculateBounds();
          }, 100);

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
        previousNotesRef.current = [];
      };
    }, [xmlContent, highlightAndExtractNotes, onReady]);

    ///// handles the note navigation when loop range is set
    useEffect(() => {
      if (loopRange) {
        jumpToLoopStart();
        highlightAndExtractNotes();
      }
    }, [loopRange]);

    // Navigation methods
    const next = useCallback(() => {
      if (!osmdRef.current?.cursor) return;
      osmdRef.current.cursor.next();

      if (isOutsideLoop()) {
        jumpToLoopStart();
      }
      highlightAndExtractNotes();
    }, [highlightAndExtractNotes, isOutsideLoop, jumpToLoopStart]);

    const previous = useCallback(() => {
      if (!osmdRef.current?.cursor) return;
      osmdRef.current.cursor.previous();
      highlightAndExtractNotes();
    }, [highlightAndExtractNotes]);

    const reset = useCallback(() => {
      if (!osmdRef.current?.cursor) return;
      osmdRef.current.cursor.reset();
      highlightAndExtractNotes();
    }, [highlightAndExtractNotes]);

    // Jump directly to the next note for a specific hand (no intermediate renders)
    const nextForHand = useCallback(
      (targetHand: "left" | "right") => {
        if (!osmdRef.current?.cursor) return;

        const cursor = osmdRef.current.cursor;

        // Keep advancing until we find notes for our hand (or reach the end)
        while (!cursor.Iterator.EndReached) {
          cursor.next();

          if (isOutsideLoop()) {
            jumpToLoopStart();
          }

          const notes = cursor.GNotesUnderCursor();
          const hasNotesForHand = notes.some((gNote) => {
            const sourceNote = gNote.sourceNote;
            if (!sourceNote || sourceNote.isRest()) return false;
            const staffIndex =
              sourceNote.ParentStaffEntry?.ParentStaff?.idInMusicSheet ?? 0;
            const hand = staffIndex === 0 ? "right" : "left";
            return hand === targetHand;
          });

          if (hasNotesForHand) break;
        }

        highlightAndExtractNotes(); // Only render ONCE at the final position
      },
      [highlightAndExtractNotes, isOutsideLoop, jumpToLoopStart]
    );

    // Skip empty positions (bar lines, repeats, etc.) to find next playable note
    const nextToPlayableNote = useCallback((): boolean => {
      if (!osmdRef.current?.cursor) return false;

      const cursor = osmdRef.current.cursor;

      // Keep advancing until we find any playable notes (or reach the end)
      while (!cursor.Iterator.EndReached) {
        cursor.next();

        if (isOutsideLoop()) {
          jumpToLoopStart();
        }

        const notes = cursor.GNotesUnderCursor();
        const hasPlayableNotes = notes.some((gNote) => {
          return gNote.sourceNote && !gNote.sourceNote.isRest();
        });

        if (hasPlayableNotes) {
          highlightAndExtractNotes();
          return true;
        }
      }

      // Reached end of piece
      highlightAndExtractNotes();
      return false;
    }, [highlightAndExtractNotes, isOutsideLoop, jumpToLoopStart]);

    // Expose navigation methods via ref (type-safe, React-idiomatic)
    useImperativeHandle(
      ref,
      () => ({
        next,
        previous,
        reset,
        nextForHand,
        nextToPlayableNote,
      }),
      [next, previous, reset, nextForHand, nextToPlayableNote]
    );

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
          className="h-full overflow-auto bg-[#f2f4f6] rounded-lg relative"
          onScroll={(e) => {
            if (overlayRef.current) {
              overlayRef.current.style.transform = `translate3d(0, -${e.currentTarget.scrollTop}px, 0)`;
            }
          }}
        />

        <MeasureOverlay
          loopRange={loopRange}
          overlayRef={overlayRef}
          allMeasureBounds={allMeasureBounds}
          onMeasureClick={handleMeasureClick}
          pendingStart={pendingStart}
        />
      </div>
    );
  }
);

export default SheetMusic;
