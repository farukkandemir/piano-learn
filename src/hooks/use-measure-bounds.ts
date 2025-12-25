// src/hooks/use-measure-bounds.ts
import { useState, useCallback, useMemo, type RefObject } from "react";
import {
  OpenSheetMusicDisplay as OSMD,
  GraphicalMeasure,
} from "opensheetmusicdisplay";

export interface MeasureBounds {
  measureNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseMeasureBoundsProps {
  osmdRef: RefObject<OSMD | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  highlightedRange: { start: number; end: number } | null;
}

export function useMeasureBounds({
  osmdRef,
  containerRef,
  highlightedRange,
}: UseMeasureBoundsProps) {
  // Cache ALL measure bounds (not just highlighted ones)
  const [allMeasureBounds, setAllMeasureBounds] = useState<MeasureBounds[]>([]);

  // Calculate bounds for ALL measures (called once after load)
  const calculateAllBounds = useCallback(() => {
    if (!osmdRef.current?.GraphicSheet || !containerRef.current) {
      setAllMeasureBounds([]);
      return;
    }

    const graphicSheet = osmdRef.current.GraphicSheet;
    const measureList = graphicSheet.MeasureList;
    const bounds: MeasureBounds[] = [];

    // Loop through ALL measures, not just highlighted range
    for (let i = 0; i < measureList.length; i++) {
      const staffMeasures = measureList[i];
      if (!staffMeasures || staffMeasures.length === 0) continue;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      staffMeasures.forEach((graphicalMeasure: GraphicalMeasure) => {
        if (!graphicalMeasure) return;

        const bbox = graphicalMeasure.PositionAndShape;
        if (!bbox) return;

        const svgElement = containerRef.current?.querySelector("svg");
        if (!svgElement) return;

        const svgRect = svgElement.getBoundingClientRect();
        const viewBox = svgElement.viewBox.baseVal;
        const scaleX = svgRect.width / viewBox.width;
        const scaleY = svgRect.height / viewBox.height;

        const absPos = bbox.AbsolutePosition;
        const size = bbox.Size;

        const x = absPos.x * scaleX * 10;
        const y = absPos.y * scaleY * 10;
        const width = size.width * scaleX * 10;
        const height = size.height * scaleY * 10;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      });

      if (minX !== Infinity) {
        bounds.push({
          measureNumber: i + 1,
          x: minX,
          y: minY,
          width: maxX - minX,
          height: 150,
        });
      }
    }

    setAllMeasureBounds(bounds);
  }, [osmdRef, containerRef]);

  // Filter cached bounds based on highlighted range (cheap operation)
  const measureBounds = useMemo(() => {
    if (!highlightedRange) return [];
    return allMeasureBounds.filter(
      (b) =>
        b.measureNumber >= highlightedRange.start &&
        b.measureNumber <= highlightedRange.end
    );
  }, [allMeasureBounds, highlightedRange]);

  return {
    measureBounds, // Filtered bounds for rendering
    recalculateBounds: calculateAllBounds, // Call after initial load or resize
    totalMeasures: allMeasureBounds.length, // Bonus: useful for UI
    allMeasureBounds, // all bounds for measure overlay
  };
}
