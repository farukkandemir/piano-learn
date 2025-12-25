import type { MeasureBounds } from "@/hooks/use-measure-bounds";
import type { RefObject } from "react";

interface MeasureOverlayProps {
  allMeasureBounds: MeasureBounds[];
  loopRange: { start: number; end: number } | null;
  overlayRef: RefObject<HTMLDivElement | null>;
  onMeasureClick?: (measureNumber: number) => void;
  pendingStart?: number | null;
}

export function MeasureOverlay({
  allMeasureBounds,
  loopRange,
  overlayRef,
  onMeasureClick,
  pendingStart,
}: MeasureOverlayProps) {
  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ willChange: "transform" }}
    >
      {allMeasureBounds.map((bounds) => {
        const isInRange =
          loopRange &&
          bounds.measureNumber >= loopRange.start &&
          bounds.measureNumber <= loopRange.end;
        const isPendingStart = pendingStart === bounds.measureNumber;

        return (
          <div
            key={bounds.measureNumber}
            className="absolute cursor-pointer pointer-events-auto transition-colors"
            style={{
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
              backgroundColor: isPendingStart
                ? "rgba(251, 191, 36, 0.2)"
                : isInRange
                  ? "rgba(59, 130, 246, 0.1)"
                  : "transparent",
              border: isPendingStart
                ? "2px solid rgba(251, 191, 36, 0.5)"
                : isInRange
                  ? "2px solid rgba(59, 130, 246, 0.3)"
                  : "2px solid transparent",
              borderRadius: "4px",
              zIndex: 5,
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
