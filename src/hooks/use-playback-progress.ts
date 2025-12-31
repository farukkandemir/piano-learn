import { useState, useEffect, useCallback, useRef } from "react";
import { audioEngine } from "@/utils/audioEngine";

interface PlaybackProgressState {
  currentTime: number;
  totalDuration: number;
  progress: number; // 0-100
}

interface UsePlaybackProgressReturn extends PlaybackProgressState {
  isPlaying: boolean;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
}

export function usePlaybackProgress(): UsePlaybackProgressReturn {
  const [state, setState] = useState<PlaybackProgressState>({
    currentTime: 0,
    totalDuration: 0,
    progress: 0,
  });

  const animationFrameRef = useRef<number | null>(null);

  // Update loop - runs at ~60fps while playing
  const updateProgress = useCallback(() => {
    const currentTime = audioEngine.currentTime;
    const totalDuration = audioEngine.totalDuration;
    const progress =
      totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

    setState({
      currentTime,
      totalDuration,
      progress: Math.min(progress, 100),
    });

    // Continue loop if playing (even when paused, Transport.seconds still readable)
    if (audioEngine.playing) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      animationFrameRef.current = null;
    }
  }, []);

  // Detect playback start/stop
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const isPlaying = audioEngine.playing;

      // Start RAF loop when playback begins
      if (isPlaying && !animationFrameRef.current) {
        updateProgress();
      }

      // Reset state when playback stops
      if (!isPlaying && animationFrameRef.current === null) {
        setState({ currentTime: 0, totalDuration: 0, progress: 0 });
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateProgress]);

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
    // Read directly from audioEngine - single source of truth
    isPlaying: audioEngine.playing,
    isPaused: audioEngine.paused,
    pause,
    resume,
    togglePause,
  };
}
