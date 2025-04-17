

"use client";
import { useState, useRef, useEffect } from "react";
import { useTeluguTracing } from "@/components/TeluguTracing";
interface TeluguTracingProps {
  letterPaths: string[];
  strokeColor?: string;
  outlineColor?: string; 
}


export default function TeluguTracing({ letterPaths }: TeluguTracingProps) {
  
  const { svgRef, lines, startDrawing, draw, stopDrawing, resetDrawing ,guidePoints} = useTeluguTracing(letterPaths);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]); // Ensure pathRefs is an array
  const groupRef = useRef<SVGGElement | null>(null); // Reference for the whole letter group

  useEffect(() => {
    if (groupRef.current) {
      const bbox = groupRef.current.getBBox(); // Get bounding box of full letter group
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;

      const svgCenterX = 130 / 2; // SVG viewBox center
      const svgCenterY = 130 / 2;

      const translateX = svgCenterX - centerX;
      const translateY = svgCenterY - centerY;

      // Apply translation to the entire letter (all paths together)
      groupRef.current.setAttribute("transform", `translate(${translateX}, ${translateY})`);
    }
  }, [letterPaths]);
  useEffect(() => {
    if (lines.length === 0) return;

    const lastLine = lines[lines.length - 1];
    if (lastLine.length === 0) return;

    const lastPoint = lastLine[lastLine.length - 1];
    const targetPoint = guidePoints[currentPointIndex];
    
    const distance = Math.sqrt(
      Math.pow(lastPoint.x - targetPoint.x, 2) + Math.pow(lastPoint.y - targetPoint.y, 2)
    );
    
    if (distance < 5 && currentPointIndex < guidePoints.length - 1) {
      setCurrentPointIndex((prev) => prev + 1);
    }
  }, [lines, currentPointIndex, guidePoints]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-black font-bold text-2xl mb-4">Trace the Telugu Letter</h1>

      <svg
        ref={svgRef}
        viewBox="0 0 130 130"
        width="350"
        height="350"
        className="cursor-pointer bg-white border-2 border-gray-700 rounded-lg shadow-lg"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      >
        {/* Guide Paths */}
        <g ref={groupRef}>
          {letterPaths.map((path, index) => (
            <path
              key={index}
              ref={(el) => {
                pathRefs.current[index] = el;
              }}
              
              d={path}
              fill="none"
              stroke="gray"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          ))}
        </g>

        {/* Guide Points */}
        {currentPointIndex < guidePoints.length && (
          <circle
            cx={guidePoints[currentPointIndex].x}
            cy={guidePoints[currentPointIndex].y}
            r="5"
            fill="blue"
          />
        )}

        {/* User Drawing */}
        {lines.map((line, index) => (
          <polyline
            key={index}
            points={line.map((p) => `${p.x},${p.y}`).join(" ")}
            stroke="red"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <button
        onClick={() => {
          resetDrawing();
          setCurrentPointIndex(0);
        }}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        Reset
      </button>
    </div>
  );
}
