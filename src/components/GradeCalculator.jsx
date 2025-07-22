import React, { useState } from "react";
import { Calculator } from "lucide-react";
import GradeCircle from "./GradeCircle"; // Adjust the import path as needed

const GradeCalculator = ({ assessmentsWithScores = [] }) => {
  const [sampleScores, setSampleScores] = useState({});
  const [errors, setErrors] = useState({});

  const validateScore = (score, maxScore) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return "Must be a valid number";
    if (numScore < 0) return "Cannot be negative";
    if (numScore > maxScore) return `Cannot exceed ${maxScore}`;
    return null;
  };

  const handleSampleScoreChange = (assessmentId, value) => {
    const assessment = assessmentsWithScores.find(
      (a) => a.$id === assessmentId
    );
    if (!assessment) return;

    setSampleScores((prev) => ({
      ...prev,
      [assessmentId]: value,
    }));

    // Validate input
    const error =
      value.trim() !== "" ? validateScore(value, assessment.maxScore) : null;
    setErrors((prev) => ({
      ...prev,
      [assessmentId]: error,
    }));
  };

  const calculateSampleGrade = () => {
    let totalWeighted = 0;
    let totalWeight = 0;

    assessmentsWithScores.forEach((assessment) => {
      const weight = assessment.weight || 0;
      const sampleScore = sampleScores[assessment.$id];
      const max = assessment.maxScore || 1;

      totalWeight += weight;

      let scaledScore = 37.5; // Default failing grade
      if (
        sampleScore !== "" &&
        sampleScore !== undefined &&
        !isNaN(sampleScore) &&
        !errors[assessment.$id]
      ) {
        scaledScore = (parseFloat(sampleScore) / max) * 62.5 + 37.5;
      }

      totalWeighted += scaledScore * (weight / 100);
    });

    return totalWeight > 0 ? totalWeighted : 0;
  };

  const calculateScores = (assessment) => {
    const sampleScore = sampleScores[assessment.$id];
    const weight = assessment.weight || 0;
    const max = assessment.maxScore || 1;

    let scaledScore = 37.5;
    if (
      sampleScore !== "" &&
      sampleScore !== undefined &&
      !isNaN(sampleScore) &&
      !errors[assessment.$id]
    ) {
      scaledScore = (parseFloat(sampleScore) / max) * 62.5 + 37.5;
    }

    return {
      scaled: scaledScore,
      weighted: scaledScore * (weight / 100),
    };
  };

  if (assessmentsWithScores.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="text-center py-12">
          <Calculator className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            No Assessments Available
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            No assessments found to calculate grades. Please check your enrolled
            classes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Grade Calculator
          </h2>
          <p className="text-gray-600">
            Input sample scores to see your potential final grade.
          </p>
        </div>
        <GradeCircle
          grade={calculateSampleGrade()}
          label="Potential Final Grade"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-green-300 text-black">
            <tr>
              <th className="border border-green-300 border-l-4 border-l-green-700 px-3 py-2 text-left font-medium">
                Assessment
              </th>
              <th className="border border-green-300 px-3 py-2 text-center font-medium w-32">
                Sample Score
              </th>
              <th className="border border-green-300 px-3 py-2 text-center font-medium w-20">
                Max
              </th>
              <th className="border border-green-300 px-3 py-2 text-center font-medium w-20">
                Weight
              </th>
              <th className="border border-green-300 px-3 py-2 text-center font-medium w-20">
                Scaled
              </th>
              <th className="border border-green-300 px-3 py-2 text-center font-medium w-24">
                Weighted
              </th>
            </tr>
          </thead>
          <tbody>
            {assessmentsWithScores.map((assessment, i) => {
              const scores = calculateScores(assessment);
              const bgClass = i % 2 === 0 ? "bg-white" : "bg-gray-50";
              const hasError = errors[assessment.$id];
              const sampleScore = sampleScores[assessment.$id] ?? "";

              return (
                <tr
                  key={assessment.$id}
                  className={`${bgClass} hover:bg-green-50 transition`}
                >
                  <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">
                    {assessment.name}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={assessment.maxScore}
                        className={`w-24 text-center border rounded-lg py-1 px-2 focus:outline-none transition ${
                          hasError
                            ? "border-red-500 focus:border-red-600 bg-red-50"
                            : "border-gray-300 focus:border-green-600"
                        }`}
                        value={sampleScore}
                        onChange={(e) =>
                          handleSampleScoreChange(
                            assessment.$id,
                            e.target.value
                          )
                        }
                        placeholder={
                          assessment.scoreEntry?.score?.toString() || "0"
                        }
                      />
                      {hasError && (
                        <span className="text-xs text-red-600 mt-1 text-center">
                          {hasError}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center text-gray-900">
                    {assessment.maxScore}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center text-gray-900">
                    {assessment.weight || 0}%
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center font-medium text-gray-900">
                    <span className={hasError ? "text-red-500" : ""}>
                      {scores.scaled.toFixed(2)}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center font-bold text-red-600">
                    <span
                      className={hasError ? "text-red-500" : "text-red-600"}
                    >
                      {scores.weighted.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeCalculator;
