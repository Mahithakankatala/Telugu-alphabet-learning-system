"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TeluguTracing from "@/hook/telugutracing";
import LetterTracing from "@/animatedletter/lettertrace";
import WritingPractice from "@/components/Writingpractice";
import { letterPaths, letterWords } from "@/components/letterinfo";
import { HomeIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { UserCircleIcon } from '@heroicons/react/24/solid';

const TeluguLetterTracing: React.FC = () => {
  const searchParams = useSearchParams();
  const selectedLetter = searchParams.get("letter") || "అ";
  const router = useRouter();
  const [showTracing, setShowTracing] = useState(false);
  const [showWritingPage, setShowWritingPage] = useState(false);
  const [isDashboardOpen, setDashboardOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const teluguLetters = [
    "అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఋ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ",
    "అం", "అః", "క", "ఖ", "గ", "ఘ", "ఙ", "చ", "ఛ", "జ", "ఝ", "ఞ", "ట", "ఠ",
    "డ", "ఢ", "ణ", "త", "థ", "ద", "ధ", "న", "ప", "ఫ", "బ", "భ", "మ", "య",
    "ర", "ల", "వ", "శ", "ష", "స", "హ", "ళ", "క్ష", "ఱ",
  ];

  const word = letterWords[selectedLetter] || "";
  const cIndex = teluguLetters.indexOf(selectedLetter);
  const prevLetter = cIndex > 0 ? teluguLetters[cIndex - 1] : "null";
  const nextLetter =
    cIndex < teluguLetters.length - 1 ? teluguLetters[cIndex + 1] : "null";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // const selectedLetter = useMemo(() => searchParams.get("letter") || "అ", [searchParams]);
  const handleLetterChange = (newLetter: string | null) => {
    if (newLetter) {
      router.push(`?letter=${encodeURIComponent(newLetter)}`);
    }
  };

  const handleNextLetter = () => {
    if (cIndex < teluguLetters.length - 1) {
      handleLetterChange(teluguLetters[cIndex + 1]);
    }
  };

  const [completedLetters, setCompletedLetters] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string }>({ email: "" });
  const [accuracyMap, setAccuracyMap] = useState<Record<string, number>>({});
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
  
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      const encodedEmail = encodeURIComponent(parsedUser.email);
  
      axios.get(`http://127.0.0.1:3000/get-user-id/${encodedEmail}`)
        .then(res => {
          const uid = res.data.user_id;
          setUserId(uid);
  
          return axios.get(`http://127.0.0.1:3000/get-letter-accuracies/${uid}`);
        })
        .then(accRes => {
          const map: Record<string, number> = {};
          (accRes.data || []).forEach(entry => {
            map[entry.letter] = entry.accuracy;
          });
          setAccuracyMap(map);
        })
        .catch(err => console.error("Error fetching accuracy data", err));
    } catch (err) {
      console.error("Error parsing localStorage user", err);
    }
  }, []);
  
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserEmail("");
    router.push("/login");
  };
  const goToHome = () => {
    // Pause and reset audio (if you don't want it to keep playing)
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    router.push("/learn");
  };

  useEffect(() => {
    setShowTracing(false);
    setShowWritingPage(false);
  }, [selectedLetter]);

  useEffect(() => {
    const playAudioOnLoad = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          console.warn("Audio playback failed. User interaction required.");
        });
      }
    };

    playAudioOnLoad();
    document.addEventListener("click", playAudioOnLoad, { once: true });

    return () => document.removeEventListener("click", playAudioOnLoad);
  }, [selectedLetter]);

  return (
    <div
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/video/tracing.jpg')" }}
    >
      {/* Home Button */}
      <button
        className="absolute top-4 left-4 bg-yellow-500 text-white p-2 rounded-full shadow flex items-center justify-center w-12 h-12 hover:bg-gray-700"
        onClick={goToHome}
      >
        <HomeIcon className="w-8 h-8" />
      </button>
{/* User Icon & Dashboard */}
<div className="absolute top-4 right-4">
        <button
          onClick={() => setDashboardOpen(!isDashboardOpen)}
          className="rounded-full bg-gray-200 p-2 shadow-lg hover:bg-gray-300 transition flex items-center justify-center w-12 h-12"
        >
          <UserCircleIcon className="w-10 h-10 text-gray-700" />
        </button>
      </div>
 {/* Dashboard */}
 {isDashboardOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-lg p-4 rounded-lg z-20">
          <p className="text-gray-600">{user.email || "No email found"}</p>
          <button
            onClick={handleLogout}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
      {/* Reduced-Size Container */}
      <div className="mx-auto my-auto w-4/5 h-4/5 bg-white/30 rounded-2xl border border-gray-300 p-6 flex gap-10 relative top-1/2 -translate-y-1/2">
        {/* Left Section */}
        <div className="w-1/3 flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <p className="text-6xl font-bold text-red-500 drop-shadow-lg">
              {selectedLetter}
            </p>
            <button
              onClick={() => audioRef.current?.play()}
              className="bg-blue-500 text-white p-2 rounded-full shadow-md"
            >
              🔊
            </button>
            <audio
              ref={audioRef}
              src={`/assets/audio/audio/${selectedLetter}.mp3`}
              preload="auto"
            />
          </div>

          <img
            src={`/assets/images/images/${selectedLetter}.jpg`}
            alt="Example"
            className="w-40 h-40 rounded-md shadow-md border border-gray-200"
          />

          {word && (
            <div className="bg-white/10  rounded-xl p-4 shadow-lg inline-block"
            style={{ backdropFilter: 'blur(8px)' }}>
            <p className="text-4xl font-bold text-red-600 drop-shadow-lg">
              {word}
            </p>
          </div>
          
            // <p className="text-4xl font-bold text-white mt-4 drop-shadow-lg">
            //   {word}
            // </p>
          )}

          <div className="mt-4 space-x-2">
            <button
              // className="bg-yellow-500 px-4 py-2 rounded shadow"
              className="bg-yellow-500 px-4 py-2 rounded shadow text-white font-bold text-2xl"
              onClick={() => handleLetterChange(prevLetter)}
              disabled={prevLetter === "null"}
            >
              {/* Previous */}
              {prevLetter || ""}
            </button>

            <button
  className={`px-4 py-2 rounded shadow text-white font-bold text-2xl ${
    accuracyMap[selectedLetter] >= 60 ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 cursor-not-allowed"
  }`}
  onClick={() => accuracyMap[selectedLetter] >= 60 && handleLetterChange(nextLetter)}
  disabled={nextLetter === "null" || accuracyMap[selectedLetter] < 60}
>
  {nextLetter || ""}
</button>

            {/* <button
              // className="bg-yellow-500 px-4 py-2 rounded shadow"
              className="bg-yellow-500 px-4 py-2 rounded shadow text-white font-bold text-2xl"
              onClick={() => handleLetterChange(nextLetter)}
              disabled={nextLetter === "null"}
            >
               {nextLetter || ""}
            </button> */}
          </div>
        </div>

        {/* Right Section (Tracing + Writing) */}
        <div className="w-2/3 flex flex-col items-center justify-center">
          {showWritingPage ? (
            <>
              <h2 className="text-xl font-bold mb-4">Practice Writing</h2>
              <WritingPractice
  onBack={() => setShowWritingPage(false)} 
  onNextLetter={handleNextLetter}
  userId={userId} // comes from your `useEffect` logic
  currentLetter={selectedLetter} // track this in state per screen
/>
              {/* <WritingPractice 
  onBack={() => setShowWritingPage(false)} 
  onNextLetter={handleNextLetter} 
/> */}
            </>
          ) : showTracing ? (
            <>
              <TeluguTracing
                letterPaths={letterPaths[selectedLetter]}
                strokeColor="yellow"
                outlineColor="#cc8800"
              />
              <button
                className="mt-4 bg-blue-500 px-6 py-3 text-white rounded shadow"
                onClick={() => setShowWritingPage(true)}
              >
                Practice Writing
              </button>
            </>
          ) : (
            <>
              <LetterTracing
                letterPaths={letterPaths[selectedLetter]}
                strokeColor="yellow"
                outlineColor="#cc8800"
              />
              <button
                className="mt-4 bg-green-500 px-6 py-3 text-white rounded shadow"
                onClick={() => setShowTracing(true)}
              >
                Start Tracing
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeluguLetterTracing;
