import React, { useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";

const AssessmentsTable = ({ assessmentsWithScores = [] }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const calculateScores = (assessment) => {
    const weight = assessment.weight || 0;
    const raw = assessment.scoreEntry?.score;
    const max = assessment.maxScore;
    const isGraded = raw != null && raw !== undefined;

    let scaledScore = 37.5;
    if (isGraded && max) {
      scaledScore = (raw / max) * 62.5 + 37.5;
    }

    return {
      isGraded,
      scaled: scaledScore,
      weighted: scaledScore * (weight / 100),
    };
  };

  if (assessmentsWithScores.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          No Assessments Found
        </h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          We couldn't find any assessments for your enrolled classes.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto text-left">
          <p className="font-medium text-gray-900 mb-2">Possible Issues:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• No class enrollments found</li>
            <li>• Class codes don't match</li>
            <li>• Assessments not created yet</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-red-800 text-white">
          <tr>
            <th className="border border-red-300 border-l-4 border-l-red-900 px-3 py-2 text-left font-medium w-8"></th>
            <th className="border border-red-300 px-3 py-2 text-left font-medium">
              Assessment
            </th>
            <th className="border border-red-300 px-3 py-2 text-center font-medium w-20">
              Score
            </th>
            <th className="border border-red-300 px-3 py-2 text-center font-medium w-20">
              Max
            </th>
            <th className="border border-red-300 px-3 py-2 text-center font-medium w-20">
              Weight
            </th>
            <th className="border border-red-300 px-3 py-2 text-center font-medium w-20">
              Scaled
            </th>
            <th className="border border-red-300 px-3 py-2 text-center font-medium w-24">
              Weighted
            </th>
          </tr>
        </thead>
        <tbody>
          {assessmentsWithScores.map((assessment, i) => {
            const scores = calculateScores(assessment);
            const isExpanded = expandedRows.has(assessment.$id);
            const bgClass = i % 2 === 0 ? "bg-white" : "bg-gray-50";

            return (
              <React.Fragment key={assessment.$id}>
                <tr
                  className={`${bgClass} hover:bg-green-50 transition cursor-pointer`}
                  onClick={() => toggleRow(assessment.$id)}
                >
                  <td className="border border-gray-200 px-3 py-2 text-center">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 font-medium text-gray-900">
                    {assessment.name}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center">
                    {scores.isGraded ? (
                      <span className="font-medium">
                        {assessment.scoreEntry.score}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center">
                    {assessment.maxScore}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center">
                    {assessment.weight || 0}%
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center font-medium">
                    {scores.scaled.toFixed(2)}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center font-bold text-red-600">
                    {scores.weighted.toFixed(2)}%
                  </td>
                </tr>

                {isExpanded && (
                  <tr className={bgClass}>
                    <td
                      colSpan="7"
                      className="border border-gray-200 px-6 py-4 bg-gray-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Assessment Details
                          </h4>
                          <div className="space-y-1">
                            <p>
                              <span className="font-medium">ID:</span>{" "}
                              {assessment.$id}
                            </p>
                            <p>
                              <span className="font-medium">Type:</span>{" "}
                              {assessment.type || "Not specified"}
                            </p>
                            <p>
                              <span className="font-medium">Due Date:</span>{" "}
                              {assessment.dueDate || "Not set"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Score Information
                          </h4>
                          <div className="space-y-1">
                            <p>
                              <span className="font-medium">Status:</span>{" "}
                              {scores.isGraded ? "Graded" : "Not graded"}
                            </p>
                            {assessment.scoreEntry?.comment && (
                              <div>
                                <span className="font-medium">Comment:</span>
                                <p className="mt-1 p-2 bg-white rounded border text-gray-700">
                                  {assessment.scoreEntry.comment}
                                </p>
                              </div>
                            )}
                            {assessment.scoreEntry?.gradedAt && (
                              <p>
                                <span className="font-medium">Graded:</span>{" "}
                                {new Date(
                                  assessment.scoreEntry.gradedAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AssessmentsTable;
