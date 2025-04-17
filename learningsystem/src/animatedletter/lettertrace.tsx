import { useState, useEffect, useRef } from "react";

interface LetterTracingProps {
  letterPaths: string[];  
  strokeColor?: string;  // New optional prop
  outlineColor?: string; // New optional prop
}


const TeluguLetterTracing: React.FC<LetterTracingProps> = ({ letterPaths }) => {
  const [animateIndex, setAnimateIndex] = useState(-1); // Controls which path is animating
  const [key, setKey] = useState(0); // Key to force re-render on Redraw
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [viewBox, setViewBox] = useState("0 0 130 130");

  useEffect(() => {
    setAnimateIndex(-1);

    let timeouts: NodeJS.Timeout[] = [];

    const resetTimeout = setTimeout(() => {
      letterPaths.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setAnimateIndex((prev) => prev + 1);
        }, index * 1000);
        timeouts.push(timeout);
      });
    }, 100);

    timeouts.push(resetTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [key, letterPaths]);

  useEffect(() => {
    if (svgRef.current) {
      const bbox = svgRef.current.getBBox();
      const padding = 10; // Add padding to ensure visibility
      const x = bbox.x - padding;
      const y = bbox.y - padding;
      const width = bbox.width + 2 * padding;
      const height = bbox.height + 2 * padding;
      setViewBox(`${x} ${y} ${width} ${height}`);
    }
  }, [key, letterPaths]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-black font-bold text-2xl mb-4">Telugu Letter</h1>
      <div className="bg-white rounded-lg shadow-md flex items-center justify-center" style={{ width: '350px',height:'350px'}}>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          width="450px"
          height="450px"
          preserveAspectRatio="xMidYMid meet"
          className="path-cnt"
        >
          {letterPaths.map((path, index) => (
            <g key={index}>
              {/* Yellow guide path (always visible) */}
              <path fill="none" stroke="yellow" strokeWidth="6" d={path} />

              {/* Red animated tracing path */}
              <path
                fill="none"
                stroke="red"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="800"
                strokeDashoffset={animateIndex >= index ? "0" : "800"}
                d={path}
                style={{
                  transition: animateIndex >= index ? "stroke-dashoffset 3s linear" : "none",
                }}
              />
            </g>
          ))}
        </svg>
      </div>
      {/* Redraw Button */}
      <button
        onClick={() => {
          setAnimateIndex(-1);
          setKey((prev) => prev + 1);
        }}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Redraw
      </button>
    </div>
  );
};

export default TeluguLetterTracing;