"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Assume a login state (Replace with real auth check)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }

    // Simulated login check (Replace with actual logic)
    const userToken = localStorage.getItem("userToken");
    setIsLoggedIn(!!userToken);
  }, []);

  const handleStartLearning = () => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push("/learn");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen pt-10 overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        src="/assets/video/firstpage.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top Right Corner: Login & Sign Up */}
      <div className="absolute top-5 right-5 flex gap-4 z-10">
        <Link href="/login">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-6xl text-black mb-20 tracking-[0.05em] italic font-[fantasy]">
          Telugu Alphabet Learning
        </h1>

        {/* Start Learning Button */}
        <div className="relative mt-10">
          <button
            onClick={handleStartLearning}
            className="px-8 py-4 bg-yellow-400 text-black rounded-2xl text-xl font-semibold shadow-lg hover:bg-yellow-500 transition"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
