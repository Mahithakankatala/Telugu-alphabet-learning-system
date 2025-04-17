"use client";

import { useState, useRef, useEffect } from "react";
import Tools from "./Tools";
import { useAudio } from "@/app/context/AudioContext";
import { Star } from "lucide-react";

interface WritingPracticeProps {
  onBack: () => void;
  onNextLetter: () => void;
  userId: string | null;
  currentLetter: string;
}

const WritingPractice: React.FC<WritingPracticeProps> = ({
  onBack,
  onNextLetter,
  userId,
  currentLetter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [showMenu, setShowMenu] = useState(false);
  const { duckBackground, restoreBackground } = useAudio();

  const fillCanvasWhite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    fillCanvasWhite();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      draw(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    const handleTouchEnd = () => {
      stopDrawing();
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [submitted, drawing]);

  const startDrawing = (x: number, y: number) => {
    if (submitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = isErasing ? 20 : 3;
    ctx.strokeStyle = isErasing ? "#ffffff" : penColor;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (x: number, y: number) => {
    if (!drawing || submitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawing(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const clearCanvas = () => {
    if (submitted) return;
    fillCanvasWhite();
    setAccuracy(null);
    setSubmitted(false);
  };

  const submitDrawing = async () => {
    setShowMenu((prev) => false)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    console.log(canvas.width);
    console.log(canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let drawnPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] < 100 || pixels[i + 1] < 100 || pixels[i + 2] < 100) {
        drawnPixels++;
      }
    }
    console.log(drawnPixels);
    let accuracy;
    if (drawnPixels < 100) {
      accuracy =0;
    } else if (drawnPixels < 1500) {
      accuracy = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    } else if (drawnPixels > 5000) {
      accuracy = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    } else {
      accuracy = Math.floor(Math.random() * (90 - 75 + 1)) + 75;
    }

    setAccuracy(accuracy);
    setSubmitted(true);

    if (userId && currentLetter) {
      try {
        await fetch("http://127.0.0.1:3000/submit-accuracy/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            letter: currentLetter,
            accuracy: accuracy,
          }),
        });
        console.log("Accuracy submitted");
      } catch (err) {
        console.error("Failed to submit accuracy", err);
      }
    } else {
      console.warn("Missing userId or currentLetter, not submitting accuracy");
    }
  };

  const getStarCount = (rawAccuracy: number) => {
    const accuracy = Number(rawAccuracy);
    if (accuracy >= 85) return 3;
    if (accuracy >= 65) return 2;
    if (accuracy >= 35) return 1;
    return 0;
  };

  return (
    <div className="flex flex-col items-center relative">
      {accuracy !== null && accuracy > 85}

      <div className="relative w-full flex justify-center items-center" id="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="border-2 border-gray-400 bg-white touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="absolute top-4 left-4 z-50 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 transition"
        >
          🧰
        </button>

        <div
          className={`absolute top-4 left-[-80px] z-50 transition-all duration-300 ${
            showMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Tools
            penColor={penColor}
            setPenColor={setPenColor}
            setIsErasing={setIsErasing}
            resetCanvas={clearCanvas}
          />
        </div>
      </div>

      {submitted && accuracy !== null && (
        <div className="mt-4 w-64">
          <div className="relative w-full h-4 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${accuracy}%` }}
            ></div>
          </div>
          <p className="text-center mt-2">Accuracy: {accuracy}%</p>
          <div className="flex justify-center mt-2 space-x-1 text-yellow-500">
            {[...Array(3)].map((_, index) => (
              <Star
              key={index}
              size={24}
              fill={index < getStarCount(accuracy) ? "currentColor" : "none"} // This fills the star when needed
              className={index < getStarCount(accuracy) ? "text-yellow-500" : "text-gray-400 opacity-30"}
            />
            ))}
          </div>
        </div>
      )}

      {!submitted && (
        <>
          <div className="mt-4 flex space-x-4">
            <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={onBack}>
              ⬅️ Back
            </button>
          </div>
          <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded" onClick={submitDrawing}>
            ✅ Submit
          </button>
        </>
      )}

      {/* {submitted && accuracy !== null && (
        <>
          {accuracy < 60 ? (
            <button
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
              onClick={() => {
                fillCanvasWhite();
                setAccuracy(null);
                setSubmitted(false);
              }}
            >
              🔁 Practice Again
            </button>
          ) : (
            
            <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded" onClick={onNextLetter}>
              ➡️ Next letter
            </button>
          )}
        </>
      )} */}

{submitted && accuracy !== null && (
  <>
    <button
      className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
      onClick={() => {
        fillCanvasWhite();
        setAccuracy(null);
        setSubmitted(false);
      }}
    >
      🔁 Practice Again
    </button>
    {accuracy >= 60 && (
      <button
        className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded ml-4"
        onClick={onNextLetter}
      >
        ➡️ Next letter
      </button>
    )}
  </>
)}

    </div>
  );
};

export default WritingPractice;
