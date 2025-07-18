import React, { useState, useContext } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { AppContext } from "./App";
import { calculateFinalGrade } from "./utils/calculateFinalGrade";
import AssessmentModal from "./components/AssessmentModal";
import ScoreModal from "./components/ScoreModal";

const InstructorDashboard = ({ user, onLogout }) => {
  const { data, setData } = useContext(AppContext);

  const [assessmentModal, setAssessmentModal] = useState({
    isOpen: false,
    assessment: null,
  });

  const [scoreModal, setScoreModal] = useState({
    isOpen: false,
    student: null,
    assessment: null,
    currentScore: "",
  });

  const [editingComment, setEditingComment] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Add new assessment
  const handleAddAssessment = (assessmentData) => {
    setData((prev) => ({
      ...prev,
      assessments: [...prev.assessments, assessmentData],
    }));
  };

  // Edit assessment
  const handleEditAssessment = (assessmentData) => {
    setData((prev) => ({
      ...prev,
      assessments: prev.assessments.map((a) =>
        a.name === assessmentModal.assessment.name ? assessmentData : a
      ),
    }));
  };

  // Delete assessment
  const handleDeleteAssessment = (assessmentName) => {
    setData((prev) => ({
      ...prev,
      assessments: prev.assessments.filter((a) => a.name !== assessmentName),
      students: prev.students.map((s) => ({
        ...s,
        scores: Object.fromEntries(
          Object.entries(s.scores).filter(([key]) => key !== assessmentName)
        ),
      })),
    }));
  };

  // Save student score
  const handleScoreSave = (studentId, assessmentName, score) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? { ...s, scores: { ...s.scores, [assessmentName]: score } }
          : s
      ),
    }));
  };

  // Save student comment
  const handleCommentSave = (studentId, comment) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, comment } : s
      ),
    }));
    setEditingComment(null);
  };

  const startEditComment = (student) => {
    setEditingComment(student.id);
    setCommentText(student.comment || "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Instructor Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name}
              </span>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assessments Section */}
        <div className="bg-white shadow rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Assessment Tasks
            </h2>
            <button
              onClick={() =>
                setAssessmentModal({ isOpen: true, assessment: null })
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="inline mr-2" />
              Add Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.assessments.map((assessment) => (
              <div
                key={assessment.name}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-medium text-gray-900">{assessment.name}</h3>
                <p className="text-sm text-gray-600">
                  Max Score: {assessment.maxScore}
                </p>
                <p className="text-sm text-gray-600">
                  Weight: {assessment.weight}%
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() =>
                      setAssessmentModal({ isOpen: true, assessment })
                    }
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAssessment(assessment.name)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Grades Table */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Student Grades
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Student
                  </th>
                  {data.assessments.map((assessment) => (
                    <th
                      key={assessment.name}
                      className="px-4 py-3 text-center text-sm font-medium text-gray-700"
                    >
                      {assessment.name}
                      <div className="text-xs text-gray-500">
                        /{assessment.maxScore}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Final Grade
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {student.name}
                    </td>
                    {data.assessments.map((assessment) => (
                      <td
                        key={assessment.name}
                        className="px-4 py-4 text-center"
                      >
                        <button
                          onClick={() =>
                            setScoreModal({
                              isOpen: true,
                              student,
                              assessment,
                              currentScore:
                                student.scores[assessment.name] || "",
                            })
                          }
                          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          {student.scores[assessment.name] || "-"}
                        </button>
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center font-medium">
                      {calculateFinalGrade(student, data.assessments).toFixed(
                        1
                      )}
                      %
                    </td>
                    <td className="px-4 py-4">
                      {editingComment === student.id ? (
                        <div className="flex space-x-2">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                            rows="2"
                          />
                          <button
                            onClick={() =>
                              handleCommentSave(student.id, commentText)
                            }
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => setEditingComment(null)}
                            className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditComment(student)}
                          className="text-left text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          {student.comment || "Click to add comment..."}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssessmentModal
        isOpen={assessmentModal.isOpen}
        onClose={() => setAssessmentModal({ isOpen: false, assessment: null })}
        onSave={
          assessmentModal.assessment
            ? handleEditAssessment
            : handleAddAssessment
        }
        assessment={assessmentModal.assessment}
      />

      <ScoreModal
        isOpen={scoreModal.isOpen}
        onClose={() =>
          setScoreModal({
            isOpen: false,
            student: null,
            assessment: null,
            currentScore: "",
          })
        }
        onSave={handleScoreSave}
        student={scoreModal.student}
        assessment={scoreModal.assessment}
        currentScore={scoreModal.currentScore}
      />
    </div>
  );
};

export default InstructorDashboard;
