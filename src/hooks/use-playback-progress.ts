import { useState, useEffect, useCallback, useRef } from "react";
import { audioEngine } from "@/utils/audioEngine";

interface PlaybackProgressState {
  currentTime: number;
  totalDuration: number;
  progress: number; // 0-100
  isPlaying: boolean;
  isPaused: boolean;
}

interface UsePlaybackProgressReturn extends PlaybackProgressState {
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
}

export function usePlaybackProgress(): UsePlaybackProgressReturn {
  const [state, setState] = useState<PlaybackProgressState>({
    currentTime: 0,
    totalDuration: 0,
    progress: 0,
    isPlaying: false,
    isPaused: false,
  });

  const animationFrameRef = useRef<number | null>(null);

  // RAF loop for smooth progress updates during playback
  const updateProgress = useCallback(() => {
    const currentTime = audioEngine.currentTime;
    const totalDuration = audioEngine.totalDuration;
    const progress =
      totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

    setState((prev) => ({
      ...prev,
      currentTime,
      totalDuration,
      progress: Math.min(progress, 100),
    }));

    // Continue loop only if still playing and not paused
    if (audioEngine.playing && !audioEngine.paused) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      animationFrameRef.current = null;
    }
  }, []);

  // Start/stop RAF loop based on playback state
  const startProgressLoop = useCallback(() => {
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [updateProgress]);

  const stopProgressLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Subscribe to audioEngine state changes (event-driven, no polling)
  useEffect(() => {
    const handleStateChange = (newState: {
      isPlaying: boolean;
      isPaused: boolean;
    }) => {
      setState((prev) => ({
        ...prev,
        isPlaying: newState.isPlaying,
        isPaused: newState.isPaused,
        // Reset progress when playback stops
        ...(newState.isPlaying
          ? {}
          : { currentTime: 0, totalDuration: 0, progress: 0 }),
      }));

      // Start RAF loop when playing and not paused
      if (newState.isPlaying && !newState.isPaused) {
        startProgressLoop();
      } else {
        stopProgressLoop();
      }
    };

    // Set up the callback
    audioEngine.onPlaybackStateChange = handleStateChange;

    // Sync initial state in case playback is already active
    if (audioEngine.playing) {
      handleStateChange({
        isPlaying: audioEngine.playing,
        isPaused: audioEngine.paused,
      });
    }

    return () => {
      audioEngine.onPlaybackStateChange = null;
      stopProgressLoop();
    };
  }, [startProgressLoop, stopProgressLoop]);

  const pause = useCallback(() => {
    audioEngine.pausePlayback();
  }, []);

  const resume = useCallback(() => {
    audioEngine.resumePlayback();
  }, []);

  const togglePause = useCallback(() => {
    if (audioEngine.paused) {
      resume();
    } else {
      pause();
    }
  }, [pause, resume]);

  return {
    ...state,
    pause,
    resume,
    togglePause,
  };
}
