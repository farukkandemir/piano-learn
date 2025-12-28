import type { MeasureBounds } from "@/hooks/use-measure-bounds";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";

interface MeasureOverlayProps {
  allMeasureBounds: MeasureBounds[];
  loopRange: { start: number; end: number } | null;
  overlayRef: RefObject<HTMLDivElement | null>;
  onMeasureClick?: (measureNumber: number) => void;
  pendingStart?: number | null;
  playingMeasure?: number | null;
}

export function MeasureOverlay({
  allMeasureBounds,
  loopRange,
  overlayRef,
  onMeasureClick,
  pendingStart,
  playingMeasure,
}: MeasureOverlayProps) {
  // Calculate height needed to cover all measures (for click detection after scroll)
  const overlayHeight =
    allMeasureBounds.length > 0
      ? Math.max(...allMeasureBounds.map((b) => b.y + b.height)) + 20
      : "100%";

  return (
    <div
      ref={overlayRef}
      className="absolute left-0 top-0 right-0 pointer-events-none"
      style={{ height: overlayHeight, willChange: "transform" }}
    >
      {allMeasureBounds.map((bounds) => {
        const isInRange =
          loopRange &&
          bounds.measureNumber >= loopRange.start &&
          bounds.measureNumber <= loopRange.end;
        const isPendingStart = pendingStart === bounds.measureNumber;
        const isPlaying = playingMeasure === bounds.measureNumber;

        return (
          <div
            key={bounds.measureNumber}
            className={cn(
              "absolute cursor-pointer pointer-events-auto transition-colors",
              playingMeasure !== null && "pointer-events-none" // Disable during playback
            )}
            style={{
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
              backgroundColor: isPlaying
                ? "rgba(249, 115, 22, 0.2)"
                : isPendingStart
                  ? "rgba(251, 191, 36, 0.2)"
                  : isInRange
                    ? "rgba(59, 130, 246, 0.1)"
                    : "transparent",
              border: isPlaying
                ? "2px solid rgba(249, 115, 22, 0.6)" // Orange border
                : isPendingStart
                  ? "2px solid rgba(251, 191, 36, 0.5)"
                  : isInRange
                    ? "2px solid rgba(59, 130, 246, 0.3)"
                    : "2px solid transparent",
              borderRadius: "4px",
              zIndex: 5,
              transition: "all 0.15s ease-in-out",
            }}
            onClick={() => onMeasureClick?.(bounds.measureNumber)}
            onMouseEnter={(e) => {
              if (!isInRange && !isPendingStart) {
                e.currentTarget.style.backgroundColor =
                  "rgba(59, 130, 246, 0.05)";
                e.currentTarget.style.border =
                  "2px solid rgba(59, 130, 246, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isInRange && !isPendingStart) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.border = "2px solid transparent";
              }
            }}
          >
            {bounds.measureNumber === loopRange?.start && (
              <span className="absolute -top-5 left-1 text-xs font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                Loop: {loopRange.start}-{loopRange.end}
              </span>
            )}
            {isPendingStart && (
              <span className="absolute -top-5 left-1 text-xs font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                Start: {pendingStart}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
