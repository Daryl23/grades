import React, { useMemo, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const STROKE_CIRCUMFERENCE = 264; // 2π * r where r = 42

const defaultGetGradeColor = (grade) => {
  if (grade < 70) return "#000000";
  if (grade < 75) return "#EF4444";
  if (grade < 83) return "#F59E0B";
  if (grade < 90) return "#FACC15";
  return "#10B981";
};

const defaultMapGradeDescriptor = (percent) => {
  if (percent >= 98) return "1.00";
  if (percent >= 94) return "1.25";
  if (percent >= 90) return "1.50";
  if (percent >= 88) return "1.75";
  if (percent >= 85) return "2.00";
  if (percent >= 83) return "2.25";
  if (percent >= 80) return "2.50";
  if (percent >= 78) return "2.75";
  if (percent >= 75) return "3.00";
  if (percent < 70) return "5.00";
  return "INC";
};

const GradeCircle = ({
  grade = 0,
  label = "Final Grade",
  getGradeColor = defaultGetGradeColor,
  mapGradeDescriptor = defaultMapGradeDescriptor,
}) => {
  const [hovered, setHovered] = useState(false);

  // Ensure grade is a valid number
  const parsedGrade = useMemo(() => {
    const n = Number(grade);
    return isNaN(n) ? 0 : n;
  }, [grade]);

  const descriptor = useMemo(
    () => mapGradeDescriptor(parsedGrade),
    [parsedGrade]
  );
  const color = useMemo(() => getGradeColor(parsedGrade), [parsedGrade]);

  const strokeDashoffset =
    STROKE_CIRCUMFERENCE - (STROKE_CIRCUMFERENCE * parsedGrade) / 100;

  const animationControls = useAnimation();

  useEffect(() => {
    animationControls.start({
      strokeDashoffset,
      transition: { duration: 1.2, ease: "easeOut" },
    });
  }, [strokeDashoffset, animationControls]);

  return (
    <div
      className="flex flex-col items-center w-24 relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={STROKE_CIRCUMFERENCE}
            strokeDashoffset={STROKE_CIRCUMFERENCE}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            animate={animationControls}
          />
        </svg>

        {/* Dual Grade Label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center leading-tight">
          <div className="text-sm font-bold text-gray-900">
            {parsedGrade.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">{descriptor}</div>
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-full mt-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
          Grade: {parsedGrade.toFixed(2)}% ({descriptor})
        </div>
      )}
    </div>
  );
};

export default GradeCircle;
