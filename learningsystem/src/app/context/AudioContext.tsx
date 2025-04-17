"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

interface AudioContextType {
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  duckBackground: () => void;
  restoreBackground: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Create the background audio element
    const audio = new Audio("/assets/audio/audio/bg-music.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    bgAudioRef.current = audio;

    // Play background music if not muted
    if (!isMuted) {
      audio.play().catch((err) => console.log("Autoplay blocked", err));
    }

    // Pause on cleanup
    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.muted = isMuted;
      // If unmuting, resume playback (if not already playing)
      if (!isMuted && bgAudioRef.current.paused) {
        bgAudioRef.current
          .play()
          .catch((err) => console.log("Resume play failed", err));
      }
    }
  }, [isMuted]);

  const duckBackground = () => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = 0.05;
    }
  };

  const restoreBackground = () => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = 0.3;
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, setIsMuted, duckBackground, restoreBackground }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};
