import React from "react";
import { Save, X } from "lucide-react";

const StudentGradesTable = ({
  data,
  sortedStudents,
  sortConfig,
  handleSort,
  editingScore,
  setEditingScore,
  scoreInput,
  setScoreInput,
  savedScore,
  setSavedScore,
  handleScoreSave,
  findScoreCellIndex,
  scoreCellPositions,
  studentsLoading,
  assessmentsLoading,
  editingComment,
  setEditingComment,
  commentText,
  setCommentText,
  handleCommentSave,
  startEditComment,
  calculateFinalGrade,
  getStudentScore, // ✅ Injected
  setStudentModal,
}) => {
  return (
    <div className="bg-white shadow rounded-2xl p-2 w-full lg:w-5/6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-gray-900">Student Grades</h2>
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors text-xs"
          onClick={() => setStudentModal({ isOpen: true })}
        >
          + Add Student
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-center">#</th>
              <th className="px-2 py-2 text-center">SR-Code</th>
              <th className="px-2 py-2 text-center">Last Name</th>
              <th className="px-2 py-2 text-center">First Name</th>
              {data.assessments.map((assessment) => (
                <th
                  key={assessment.$id}
                  className="px-1 py-1 text-center cursor-pointer"
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
                className="px-2 py-2 text-center cursor-pointer"
                onClick={() => handleSort("final")}
              >
                Final Grade
                {sortConfig.key === "final" &&
                  (sortConfig.direction === "asc" ? " ▲" : " ▼")}
              </th>
              <th className="px-2 py-2 text-left">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStudents.map((student, idx) => (
              <tr key={student.$id}>
                <td className="text-center text-gray-500">{idx + 1}</td>
                <td className="text-center">{student.srCode}</td>
                <td className="text-center">{student.lastName}</td>
                <td className="text-center">{student.firstName}</td>

                {data.assessments.map((assessment) => {
                  const isEditing =
                    editingScore.studentId === student.$id &&
                    editingScore.assessmentId === assessment.$id;

                  const currentScore = getStudentScore(
                    student.$id,
                    assessment.$id
                  ); // ✅ Use helper

                  return (
                    <td key={assessment.$id} className="text-center">
                      {isEditing ? (
                        <div className="w-full flex justify-center">
                          <input
                            type="number"
                            value={scoreInput}
                            autoFocus
                            min="0"
                            max={assessment.maxScore}
                            onChange={(e) => setScoreInput(e.target.value)}
                            onBlur={() => {
                              handleScoreSave(
                                student.$id,
                                assessment.$id,
                                scoreInput
                              );
                              setEditingScore({
                                studentId: null,
                                assessmentId: null,
                              });
                              setSavedScore({
                                studentId: student.$id,
                                assessmentId: assessment.$id,
                              });
                              setTimeout(() => {
                                setSavedScore({
                                  studentId: null,
                                  assessmentId: null,
                                });
                              }, 2000);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Tab") {
                                e.preventDefault();
                                handleScoreSave(
                                  student.$id,
                                  assessment.$id,
                                  scoreInput
                                );
                                const currentIdx = findScoreCellIndex(
                                  student.$id,
                                  assessment.$id
                                ); // 🛠️ fixed from `assessment.name`
                                const nextIdx = e.shiftKey
                                  ? currentIdx > 0
                                    ? currentIdx - 1
                                    : scoreCellPositions.length - 1
                                  : currentIdx < scoreCellPositions.length - 1
                                  ? currentIdx + 1
                                  : 0;
                                const nextCell = scoreCellPositions[nextIdx];
                                setTimeout(() => {
                                  setEditingScore(nextCell);
                                  setScoreInput(
                                    getStudentScore(
                                      nextCell.studentId,
                                      nextCell.assessmentId
                                    ) || ""
                                  );
                                }, 0);
                              } else if (e.key === "Escape") {
                                setEditingScore({
                                  studentId: null,
                                  assessmentId: null,
                                });
                              }
                            }}
                            className="w-4/5 px-2 py-1 text-sm border-gray-200 rounded text-center mx-auto"
                            disabled={studentsLoading || assessmentsLoading}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => {
                              setEditingScore({
                                studentId: student.$id,
                                assessmentId: assessment.$id,
                              });
                              setScoreInput(currentScore || "");
                            }}
                            className="px-2 py-1 border rounded hover:bg-gray-50 transition w-20"
                            disabled={studentsLoading || assessmentsLoading}
                          >
                            {currentScore ?? "-"}
                          </button>
                          {savedScore.studentId === student.$id &&
                            savedScore.assessmentId === assessment.$id && (
                              <span className="text-green-600 text-xs mt-1">
                                Changes saved
                              </span>
                            )}
                        </div>
                      )}
                    </td>
                  );
                })}

                <td className="text-center font-medium">
                  {(() => {
                    const grade = calculateFinalGrade(
                      student,
                      data.assessments
                    );
                    return `${grade.toFixed(1)}%`;
                  })()}
                </td>

                <td className="text-left">
                  {editingComment === student.userId ? (
                    <div className="flex space-x-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded resize-none text-sm"
                        rows="2"
                      />
                      <button
                        onClick={() =>
                          handleCommentSave(student.userId, commentText)
                        }
                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => setEditingComment(null)}
                        className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditComment(student)}
                      className="text-sm text-gray-600 hover:text-gray-800"
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
  );
};

export default StudentGradesTable;
