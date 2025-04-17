// components/AudioToggle.tsx
"use client";

import React from "react";
import { useAudio } from "@/app/context/AudioContext";

const AudioToggle: React.FC = () => {
  const { isMuted, setIsMuted } = useAudio();

  return (
    <button
      onClick={() => setIsMuted(!isMuted)}
      className="fixed z-50 p-2 bg-white shadow rounded-full"
      style={{ top: "4rem", right: "1rem" }} // Adjust these values as needed
    >
      {isMuted ? "🔇" : "🔊"}
    </button>
  );
};

export default AudioToggle;
