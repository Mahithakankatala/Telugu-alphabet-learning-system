// import React, { useState } from "react";
// import { FaPen, FaEraser, FaRecycle } from "react-icons/fa";

// interface ToolsProps {
//   penColor: string;
//   setPenColor: (color: string) => void;
//   setIsErasing: (isErasing: boolean) => void;
//   resetCanvas: () => void;
// }

// const colorOptions = ["#000000", "#ff0000", "#0000ff", "#00CED1"]; // Just 4 colors

// const Tools: React.FC<ToolsProps> = ({
//   penColor,
//   setPenColor,
//   setIsErasing,
//   resetCanvas,
// }) => {
//   const [showColorPicker, setShowColorPicker] = useState(false);

//   return (
//     <div className="relative flex flex-col items-center bg-white p-3 rounded-xl shadow-md space-y-4 w-16">
//       {/* Current Pen Color Button */}
//       <button
//         onClick={() => setShowColorPicker(!showColorPicker)}
//         className="w-8 h-8 rounded-full border-2 shadow-inner"
//         style={{ backgroundColor: penColor }}
//         title="Choose Color"
//       />

//       {/* Floating Color Palette (4 colors in a row) */}
//       {showColorPicker && (
//         <div className="absolute left-16 top-0 bg-white border rounded-xl shadow-lg p-2 flex gap-2 z-50">
//           {colorOptions.map((color) => (
//             <button
//               key={color}
//               className={`w-6 h-6 rounded-full border-2 ${
//                 penColor === color ? "ring-2 ring-purple-500" : ""
//               }`}
//               style={{ backgroundColor: color }}
//               onClick={() => {
//                 setPenColor(color);
//                 setIsErasing(false);
//                 setShowColorPicker(false);
//               }}
//             />
//           ))}
//         </div>
//       )}

//       {/* Tools */}
//       <button
//         onClick={() => setIsErasing(false)}
//         title="Pen"
//         className="text-xl text-blue-500 hover:text-blue-700"
//       >
//         <FaPen />
//       </button>
//       <button
//         onClick={() => setIsErasing(true)}
//         title="Eraser"
//         className="text-xl text-gray-600 hover:text-gray-800"
//       >
//         <FaEraser />
//       </button>
//       <button
//         onClick={resetCanvas}
//         title="Reset"
//         className="text-xl text-purple-600 hover:text-purple-800"
//       >
//         <FaRecycle />
//       </button>
//     </div>
//   );
// };

// export default Tools;




import React, { useState } from "react";
import { FaPen, FaEraser } from "react-icons/fa";

interface ToolsProps {
  penColor: string;
  setPenColor: (color: string) => void;
  setIsErasing: (isErasing: boolean) => void;
  resetCanvas: () => void;
}

const colorOptions = ["#000000", "#ff0000", "#0000ff", "#00CED1"]; // Just 4 colors

const Tools: React.FC<ToolsProps> = ({
  penColor,
  setPenColor,
  setIsErasing,
  resetCanvas,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="relative flex flex-col items-center bg-white p-3 rounded-xl shadow-md space-y-4 w-16">
      {/* Current Pen Color Button */}
      <button
        onClick={() => setShowColorPicker(!showColorPicker)}
        className="w-8 h-8 rounded-full border-2 shadow-inner"
        style={{ backgroundColor: penColor }}
        title="Choose Color"
      />

      {/* Floating Color Palette (4 colors in a row) */}
      {showColorPicker && (
        <div className="absolute left-16 top-0 bg-white border rounded-xl shadow-lg p-2 flex gap-2 z-50">
          {colorOptions.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${
                penColor === color ? "ring-2 ring-purple-500" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                setPenColor(color);
                setIsErasing(false);
                setShowColorPicker(false);
              }}
            />
          ))}
        </div>
      )}

      {/* Tools */}
      <button
        onClick={() => setIsErasing(false)}
        title="Pen"
        className="text-xl text-blue-500 hover:text-blue-700"
      >
        <FaPen />
      </button>
      <button
        onClick={() => setIsErasing(true)}
        title="Eraser"
        className="text-xl text-gray-600 hover:text-gray-800"
      >
        <FaEraser />
      </button>
      <button
        onClick={resetCanvas}
        title="Reset"
        className="text-2xl text-white bg-blue-500 hover:bg-blue-700 rounded-full px-4 py-2"
      >
        ↻
      </button>
    </div>
  );
};

export default Tools;