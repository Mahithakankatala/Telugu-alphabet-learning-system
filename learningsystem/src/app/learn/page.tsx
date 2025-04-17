"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { UserCircle, Star,Lock } from "lucide-react";

const vowels = ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః'];
const consonants = ['క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ఞ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ', 'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ', 'క్ష', 'ఱ'];

const LetterSelection: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completedLetters, setCompletedLetters] = useState<string[]>([]);
  const [accuracyMap, setAccuracyMap] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string }>({ email: "" });
  const [isDashboardOpen, setDashboardOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
  
    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.email) return;
  
      setUser(parsedUser);
      const encodedEmail = encodeURIComponent(parsedUser.email);
  
      axios.get(`http://127.0.0.1:3000/get-user-id/${encodedEmail}`)
        .then((res) => {
          const userId = res.data.user_id;
          setUserId(userId);
          return axios.get(`http://127.0.0.1:3000/get-letter-accuracies/${userId}`);
        })
        .then((accuracyRes) => {
          const accuracyData: { letter: string; accuracy: number }[] = accuracyRes.data || [];
  
          const map: Record<string, number> = {};
          accuracyData.forEach(entry => {
            map[entry.letter] = entry.accuracy;
          });
          setAccuracyMap(map);
        })
        .catch((err) => console.error("Error fetching accuracy data:", err));
    } catch (error) {
      console.error("Error parsing stored user data:", error);
    }
  },[]);
  

  const handleLetterClick = (letter: string) => {
    router.push(`/tracing?letter=${letter}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser({ email: "" });
    router.push("/login");
  };


  const getStarsForAccuracy = (accuracy: number) => {
    const getStarCount = (accuracy: number) => {
      if (accuracy >= 85) return 3;
      if (accuracy >= 65) return 2;
      if (accuracy >= 35) return 1;
      return 0;
    };
  
    const starCount = getStarCount(accuracy);
  
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < starCount ? "text-yellow-400" : "text-gray-300"}`}
        fill={i < starCount ? "#facc15" : "none"}
      />
    ));
  };
  

  const renderLetterButton = (letter: string, index: number, allLetters: string[]) => {
    const prevLetter = allLetters[index - 1];
    const prevAccuracy = accuracyMap[prevLetter] ?? 0;
    const isUnlocked = index === 0 || prevAccuracy >= 60;
    const accuracy = accuracyMap[letter];
  
    return (
      <div key={letter} className="flex flex-col items-center w-18 h-18 relative">
        {!isUnlocked && (
          <Lock className="absolute top-0 right-0 text-gray-500 w-4 h-4" />
        )}
        <button
          onClick={() => isUnlocked && handleLetterClick(letter)}
          disabled={!isUnlocked}
          className={`w-full h-full flex flex-col justify-center items-center px-2 py-2 text-lg font-semibold border rounded transition 
            ${accuracy ? "bg-white text-black" : "bg-white text-black"} 
            ${!isUnlocked ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500 hover:text-white"}`}
        >
          <div>{letter}</div>
          <div className="flex mt-1">
            {accuracy ? getStarsForAccuracy(accuracy) : null}
          </div>
        </button>
      </div>
    );
  };



  return (
    <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden">
      <video
        ref={videoRef}
        src="/assets/video/achulu.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* User Icon */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setDashboardOpen(!isDashboardOpen)} 
          className="rounded-full bg-gray-200 p-2 shadow-lg hover:bg-gray-300 transition flex items-center justify-center w-12 h-12">
          <UserCircle className="w-10 h-10 text-gray-700" />
        </button>
      </div>

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

      <div className="relative z-10 flex flex-col items-center p-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-black mb-2">అచ్చులు</h2>
          <div className="grid grid-cols-6 gap-4 max-h-64 rounded">
  {vowels.map(renderLetterButton)}
</div>

        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-2">హల్లులు</h2>
          <div className="grid grid-cols-6 gap-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-2 rounded">
  {consonants.map(renderLetterButton)}
</div>

        </div>
      </div>
    </div>
  );
};

export default LetterSelection;
