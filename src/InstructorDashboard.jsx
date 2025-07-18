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
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [studentModal, setStudentModal] = useState({ isOpen: false });
  const [newStudent, setNewStudent] = useState({ id: "", name: "" });
  const [editingScore, setEditingScore] = useState({ studentId: null, assessmentName: null });
  const [scoreInput, setScoreInput] = useState("");
  const [savedScore, setSavedScore] = useState({ studentId: null, assessmentName: null });

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

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedStudents = [...data.students].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aValue, bValue;

    if (key === "name") {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (key === "final") {
      aValue = calculateFinalGrade(a, data.assessments);
      bValue = calculateFinalGrade(b, data.assessments);
    } else {
      // key is assessment name
      aValue = Number(a.scores[key] || 0);
      bValue = Number(b.scores[key] || 0);
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Add new student
  const handleAddStudent = () => {
    if (!newStudent.id.trim() || !newStudent.name.trim()) return;
    setData((prev) => ({
      ...prev,
      students: [
        ...prev.students,
        { ...newStudent, scores: {}, comment: "" },
      ],
    }));
    setStudentModal({ isOpen: false });
    setNewStudent({ id: "", name: "" });
  };

  // Helper: get all score cell positions
  const scoreCellPositions = [];
  data.students.forEach((student) => {
    data.assessments.forEach((assessment) => {
      scoreCellPositions.push({ studentId: student.id, assessmentName: assessment.name });
    });
  });

  const findScoreCellIndex = (studentId, assessmentName) =>
    scoreCellPositions.findIndex(
      (cell) => cell.studentId === studentId && cell.assessmentName === assessmentName
    );

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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Student Grades Table - left */}
          <div className="bg-white shadow rounded-2xl p-4 w-full lg:w-5/6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Student Grades
              </h2>
              <button
                className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => setStudentModal({ isOpen: true })}
              >
                + Add Student
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">#</th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Student
                      {sortConfig.key === "name" && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                    </th>
                    {data.assessments.map((assessment) => (
                      <th
                        key={assessment.name}
                        className="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort(assessment.name)}
                      >
                        {assessment.name}
                        <div className="text-xs text-gray-500">
                          /{assessment.maxScore}
                        </div>
                        {sortConfig.key === assessment.name &&
                          (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                      </th>
                    ))}
                    <th
                      className="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer"
                      onClick={() => handleSort("final")}
                    >
                      Final Grade
                      {sortConfig.key === "final" && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Comment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-center text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {student.name}
                      </td>
                      {data.assessments.map((assessment) => (
                        <td
                          key={assessment.name}
                          className="px-4 py-4 text-center"
                        >
                          {editingScore.studentId === student.id && editingScore.assessmentName === assessment.name ? (
                            <input
                              type="number"
                              className="px-2 py-1 text-sm border border-blue-400 rounded w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                              value={scoreInput}
                              autoFocus
                              min="0"
                              max={assessment.maxScore}
                              onChange={e => setScoreInput(e.target.value)}
                              onBlur={() => {
                                handleScoreSave(student.id, assessment.name, scoreInput);
                                setEditingScore({ studentId: null, assessmentName: null });
                                setSavedScore({ studentId: student.id, assessmentName: assessment.name });
                                setTimeout(() => setSavedScore({ studentId: null, assessmentName: null }), 2000);
                              }}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  handleScoreSave(student.id, assessment.name, scoreInput);
                                  setEditingScore({ studentId: null, assessmentName: null });
                                  setSavedScore({ studentId: student.id, assessmentName: assessment.name });
                                  setTimeout(() => setSavedScore({ studentId: null, assessmentName: null }), 2000);
                                } else if (e.key === "Escape") {
                                  setEditingScore({ studentId: null, assessmentName: null });
                                } else if (e.key === "Tab") {
                                  e.preventDefault();
                                  handleScoreSave(student.id, assessment.name, scoreInput);
                                  const currentIdx = findScoreCellIndex(student.id, assessment.name);
                                  let nextIdx;
                                  if (e.shiftKey) {
                                    nextIdx = currentIdx > 0 ? currentIdx - 1 : scoreCellPositions.length - 1;
                                  } else {
                                    nextIdx = currentIdx < scoreCellPositions.length - 1 ? currentIdx + 1 : 0;
                                  }
                                  const nextCell = scoreCellPositions[nextIdx];
                                  setTimeout(() => {
                                    setEditingScore(nextCell);
                                    setScoreInput(
                                      data.students.find((s) => s.id === nextCell.studentId).scores[nextCell.assessmentName] || ""
                                    );
                                  }, 0);
                                }
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center">
                              <button
                                onClick={() => {
                                  setEditingScore({ studentId: student.id, assessmentName: assessment.name });
                                  setScoreInput(student.scores[assessment.name] || "");
                                }}
                                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors w-20"
                              >
                                {student.scores[assessment.name] || "-"}
                              </button>
                              {savedScore.studentId === student.id && savedScore.assessmentName === assessment.name && (
                                <span className="text-green-600 text-xs mt-1">Changes have been saved</span>
                              )}
                            </div>
                          )}
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
          {/* Assessment Tasks - right */}
          <div className="bg-white shadow rounded-2xl p-4 w-full lg:w-1/7">
            <div className="flex flex-col mb-4 gap-1">
              <h2 className="text-xl font-semibold text-gray-900">Assessment Tasks</h2>
              <button
                onClick={() => setAssessmentModal({ isOpen: true, assessment: null })}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors self-start"
                title="Add Assessment"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {data.assessments.map((assessment) => (
                <div
                  key={assessment.name}
                  className="border border-gray-200 rounded-lg p-2"
                >
                  <h3 className="font-medium text-gray-900">{assessment.name}</h3>
                  <p className="text-sm text-gray-600">
                    Max Score: {assessment.maxScore}
                  </p>
                  <p className="text-sm text-gray-600">
                    Weight: {assessment.weight}%
                  </p>
                  <div className="flex space-x-2 mt-2">
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

      {/* Add Student Modal */}
      {studentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Add Student</h3>
            <div className="mb-3">
              <label className="block text-sm mb-1">Student ID</label>
              <input
                type="text"
                className="w-full border px-2 py-1 rounded"
                value={newStudent.id}
                onChange={(e) => setNewStudent((s) => ({ ...s, id: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Name</label>
              <input
                type="text"
                className="w-full border px-2 py-1 rounded"
                value={newStudent.name}
                onChange={(e) => setNewStudent((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                onClick={() => setStudentModal({ isOpen: false })}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={handleAddStudent}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
