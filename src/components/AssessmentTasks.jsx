import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

const AssessmentTasks = ({ assessments, setAssessmentModal, handleDeleteAssessment }) => {
  return (
    <div className="bg-white shadow rounded-2xl p-2 w-full lg:w-1/7">
      <div className="flex flex-col mb-2 gap-1">
        <h2 className="text-sm font-semibold text-gray-900">Assessment Tasks</h2>
        <button
          onClick={() => setAssessmentModal({ isOpen: true, assessment: null })}
          className="bg-blue-600 text-white p-1 rounded-lg hover:bg-blue-700 transition-colors self-start text-xs"
          title="Add Assessment"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {assessments.map((assessment) => (
          <div
            key={assessment.$id || assessment.name}
            className="border border-gray-200 rounded-lg p-2 mb-1"
          >
            <h3 className="font-medium text-gray-900 text-xs">{assessment.name}</h3>
            <p className="text-xs text-gray-600 mb-1">Max Score: {assessment.maxScore}</p>
            <p className="text-xs text-gray-600 mb-1">Weight: {assessment.weight}%</p>
            <p className="text-xs text-gray-600 mb-1">Class Code: {assessment.classCode}</p>
            <div className="flex space-x-1 mt-1">
              <button
                onClick={() => setAssessmentModal({ isOpen: true, assessment })}
                className="text-blue-600 hover:text-blue-800 transition-colors text-xs"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => handleDeleteAssessment(assessment.name)}
                className="text-red-600 hover:text-red-800 transition-colors text-xs"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentTasks;
