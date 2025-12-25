import { useCallback, useState } from "react";

export function useLoopSelection() {
  const [loopRange, setLoopRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [pendingStart, setPendingStart] = useState<number | null>(null);

  const handleMeasureClick = useCallback(
    (measureNumber: number) => {
      if (
        loopRange &&
        measureNumber >= loopRange.start &&
        measureNumber <= loopRange.end
      ) {
        setLoopRange(null);
        setPendingStart(null);
        return;
      }

      if (pendingStart === null) {
        // First click - set the start
        setPendingStart(measureNumber);
      } else {
        // Second click - set the range
        const start = Math.min(pendingStart, measureNumber);
        const end = Math.max(pendingStart, measureNumber);
        setLoopRange({ start, end });
        setPendingStart(null);
      }
    },
    [pendingStart, loopRange]
  );
  const clearLoop = useCallback(() => {
    setLoopRange(null);
    setPendingStart(null);
  }, []);

  return { loopRange, pendingStart, handleMeasureClick, clearLoop };
}
