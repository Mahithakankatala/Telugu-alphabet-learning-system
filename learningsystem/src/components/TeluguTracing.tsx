//// working code without guidepoints
// "use client";
// import { useState, useRef, useEffect } from "react";


// export function useTeluguTracing() {
//   const [lines, setLines] = useState<{ x: number; y: number }[][]>([]);
//   const svgRef = useRef<SVGSVGElement | null>(null);
//   const isDrawing = useRef(false);

//   useEffect(() => {
//     const handleTouchMove = (e: TouchEvent) => e.preventDefault();
//     document.addEventListener("touchmove", handleTouchMove, { passive: false });
//     return () => document.removeEventListener("touchmove", handleTouchMove);
//   }, []);

//   const getCoordinates = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
//     const svg = svgRef.current;
    
//     if (!svg) return { offsetX: 0, offsetY: 0 };

//     const rect = svg.getBoundingClientRect();
//     const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
//     const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
   
//     const viewBoxWidth = svg.viewBox.baseVal.width;
//     const viewBoxHeight = svg.viewBox.baseVal.height;

//     return {
//       offsetX: ((clientX - rect.left) / rect.width) * viewBoxWidth,
//       offsetY: ((clientY - rect.top) / rect.height) * viewBoxHeight,
//     };
//   };

//   const startDrawing = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
//     isDrawing.current = true;
//     const { offsetX, offsetY } = getCoordinates(e);
//     setLines((prev) => [...prev, [{ x: offsetX, y: offsetY }]]);
//   };

//   const draw = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
//     if (!isDrawing.current) return;
//     const { offsetX, offsetY } = getCoordinates(e);
//     setLines((prev) => {
//       if (prev.length === 0) return prev;
//       const updatedLines = [...prev];
//       updatedLines[updatedLines.length - 1] = [...updatedLines[updatedLines.length - 1], { x: offsetX, y: offsetY }];
//       return updatedLines;
//     });
//   };

//   const stopDrawing = () => {
//     isDrawing.current = false;
//   };

//   const resetDrawing = () => {
//     setLines([]);
//   };

//   return {
//     svgRef,
//     lines,
//     startDrawing,
//     draw,
//     stopDrawing,
//     resetDrawing,
//   };
// }






"use client";
import { useState, useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

export function useTeluguTracing(letterPaths: string[]) {
  const [lines, setLines] = useState<Point[][]>([]);
  const [guidePoints, setGuidePoints] = useState<Point[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDrawing = useRef(false);
  const viewBoxSize = 130; // SVG viewBox size

  useEffect(() => {
    extractGuidePoints();
  }, [letterPaths]);

  const getCoordinates = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { offsetX: 0, offsetY: 0 };

    const rect = svg.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const viewBoxWidth = svg.viewBox.baseVal.width;
    const viewBoxHeight = svg.viewBox.baseVal.height;

    return {
      offsetX: ((clientX - rect.left) / rect.width) * viewBoxWidth,
      offsetY: ((clientY - rect.top) / rect.height) * viewBoxHeight,
    };
  };

  const startDrawing = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    isDrawing.current = true;
    const { offsetX, offsetY } = getCoordinates(e);
    setLines((prev) => [...prev, [{ x: offsetX, y: offsetY }]]);
  };

  // const draw = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
  //   if (!isDrawing.current) return;
  //   const { offsetX, offsetY } = getCoordinates(e);
  //   setLines((prev) => {
  //     if (prev.length === 0) return prev;
  //     const updatedLines = [...prev];
  //     updatedLines[updatedLines.length - 1] = [...updatedLines[updatedLines.length - 1], { x: offsetX, y: offsetY }];
  //     return updatedLines;
  //   });

  //   if (currentPointIndex < guidePoints.length) {
  //     const nextPoint = guidePoints[currentPointIndex];
  //     const distance = Math.sqrt((nextPoint.x - offsetX) ** 2 + (nextPoint.y - offsetY) ** 2);
  //     if (distance < 5) {
  //       setCurrentPointIndex((prev) => prev + 1);
  //     }
  //   }
  // };

  const draw = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = getCoordinates(e);
  
    // Only allow drawing if within threshold distance from guide path
    const threshold = 5;
    const isNearPath = guidePoints.some(point => {
      const dx = point.x - offsetX;
      const dy = point.y - offsetY;
      return Math.sqrt(dx * dx + dy * dy) <= threshold;
    });
  
    if (!isNearPath) return; // Ignore points too far from the guide
  
    setLines((prev) => {
      if (prev.length === 0) return prev;
      const updatedLines = [...prev];
      updatedLines[updatedLines.length - 1] = [...updatedLines[updatedLines.length - 1], { x: offsetX, y: offsetY }];
      return updatedLines;
    });
  
    if (currentPointIndex < guidePoints.length) {
      const nextPoint = guidePoints[currentPointIndex];
      const distance = Math.sqrt((nextPoint.x - offsetX) ** 2 + (nextPoint.y - offsetY) ** 2);
      if (distance < 5) {
        setCurrentPointIndex((prev) => prev + 1);
      }
    }
  };
  
  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const resetDrawing = () => {
    setLines([]);
    setCurrentPointIndex(0);
  };

  const extractGuidePoints = () => {
    const newGuidePoints: Point[] = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
    console.log("Extracting guide points from paths...");
  
    // Extract all points from letter paths
    letterPaths.forEach((path, index) => {
      const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      tempPath.setAttribute("d", path);
      const pathLength = tempPath.getTotalLength();
  
      console.log(`Path ${index}: length = ${pathLength}`);
  
      const numPoints = 20; // More points for better accuracy
      for (let i = 0; i <= numPoints; i++) {
        const point = tempPath.getPointAtLength((i / numPoints) * pathLength);
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
        newGuidePoints.push({ x: point.x, y: point.y });
      }
    });
  
    console.log("Bounding Box:", { minX, minY, maxX, maxY });
  
    // Compute width and height of bounding box
    const width = maxX - minX;
    const height = maxY - minY;
  
    console.log("Width:", width, "Height:", height);
  
    // Avoid division by zero
    if (width === 0 || height === 0) {
      console.error("Error: Zero width or height detected. Paths may be incorrect.");
      return;
    }
  
    // Compute scale factor to fit within the viewBox
    // const scale = viewBoxSize / Math.max(width, height);
    const scale = 1;
  
    console.log("Scale factor:", scale);
  
    // Compute offsets to center the points in the viewBox
    const offsetX = (viewBoxSize - (width * scale)) / 2 - (minX * scale);
    const offsetY = (viewBoxSize - (height * scale)) / 2 - (minY * scale);
  
    console.log("OffsetX:", offsetX, "OffsetY:", offsetY);
  
    // Normalize guide points using the same transformation
    const transformedGuidePoints = newGuidePoints.map(p => ({
      x: p.x * scale + offsetX,
      y: p.y * scale + offsetY
    }));
  
    console.log("Transformed Guide Points:", transformedGuidePoints);
  
    setGuidePoints(transformedGuidePoints);
  };
  
  
  return {
    svgRef,
    lines,
    startDrawing,
    draw,
    stopDrawing,
    resetDrawing,
    guidePoints: guidePoints.slice(0, currentPointIndex + 1), // Show only reached points
  };
}