import React, { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { calculateFinalGrade } from "./utils/calculateFinalGrade";
import AssessmentModal from "./components/AssessmentModal";
import { databases, account } from "./lib/appwrite"; // adjust path as needed
import { DATABASE_ID, COLLECTIONS } from "./lib/constants";
import StudentGradesTable from "./components/StudentGradesTable";
import Header from "./components/Header";
import AssessmentTasks from "./components/AssessmentTasks";

const InstructorDashboard = ({ user, onLogout }) => {
  const { data, setData } = useApp();

  const [assessmentModal, setAssessmentModal] = useState({
    isOpen: false,
    assessment: null,
  });

  const [editingComment, setEditingComment] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [studentModal, setStudentModal] = useState({ isOpen: false });
  const [newStudent, setNewStudent] = useState({ id: "", name: "" });
  const [editingScore, setEditingScore] = useState({
    studentId: null,
    assessmentName: null,
  });
  const [scoreInput, setScoreInput] = useState("");
  const [savedScore, setSavedScore] = useState({
    studentId: null,
    assessmentName: null,
  });
  const [scores, setScores] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    error: false,
  });
  const [selectedClassCode, setSelectedClassCode] = useState(null);

  // Move ALL useEffect hooks to the top, before any conditional returns
  useEffect(() => {
    async function checkSessionAndFetch() {
      try {
        const user = await account.get();
        console.log("✅ Logged in user:", user);
      } catch (err) {
        console.warn("⚠️ No user logged in:", err);
      }

      try {
        console.log("📡 Fetching assessments...");
        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ASSESSMENTS
        );
        console.log("📄 Assessments fetched:", res.documents);

        setData((prev) => ({
          ...prev,
          assessments: res.documents || [],
        }));
        setAssessmentsLoading(false);
      } catch (error) {
        setAssessmentsLoading(false);
        console.error("❌ Failed to fetch assessments from Appwrite:", error);
      }

      try {
        console.log("📡 Fetching students...");
        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.STUDENTS
        );
        console.log("👨‍🎓 Students fetched:", res.documents);
        setData((prev) => ({
          ...prev,
          students: res.documents || [],
        }));
        setStudentsLoading(false);
      } catch (error) {
        setStudentsLoading(false);
        console.error("❌ Failed to fetch students from Appwrite:", error);
      }

      try {
        console.log("📡 Fetching scores...");
        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SCORES
        );
        console.log("🏅 Scores fetched:", res.documents);
        setScores(res.documents || []);
      } catch (error) {
        console.error("❌ Failed to fetch scores from Appwrite:", error);
      }
    }

    checkSessionAndFetch();
  }, [setData]);

  // Snackbar auto-hide
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(
        () => setSnackbar({ open: false, message: "", error: false }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Debugging: Log relationships and data
  useEffect(() => {
    // Always call the effect, but only run the logic when conditions are met
    if (selectedClassCode && data && data.classes && data.classEnrollments) {
      const selectedClass = data.classes.find(
        (cls) => cls.classCode === selectedClassCode
      );
      console.log("=== INSTRUCTOR DASHBOARD DEBUG ===");
      console.log("Selected Class Code:", selectedClassCode);
      console.log("Selected Class:", selectedClass);
      const enrollments = data.classEnrollments.filter(
        (e) => e.classId === (selectedClass ? selectedClass.$id : undefined)
      );
      console.log("Enrollments for class:", enrollments);
      const enrolledStudentIds = enrollments.map((e) => e.studentId);
      console.log("Enrolled Student IDs:", enrolledStudentIds);
      const enrolledStudents = data.students.filter((s) =>
        enrolledStudentIds.includes(s.$id)
      );
      console.log("Enrolled Students:", enrolledStudents);
      const classAssessments = data.assessments.filter(
        (a) => a.classId === (selectedClass ? selectedClass.$id : undefined)
      );
      console.log("Assessments for class:", classAssessments);
      const classAssessmentIds = classAssessments.map((a) => a.$id);
      const classScores = scores.filter((score) =>
        classAssessmentIds.includes(score.assessmentId)
      );
      console.log("Scores for class assessments:", classScores);
      console.log("=== END DEBUG ===");
    }
  }, [selectedClassCode, data, scores]);

  // Add new assessment
  const handleAddAssessment = async (assessmentData) => {
    try {
      const res = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ASSESSMENTS,
        "unique()",
        assessmentData
      );
      setData((prev) => ({
        ...prev,
        assessments: [...prev.assessments, res],
      }));
      setSnackbar({
        open: true,
        message: "Assessment added successfully!",
        error: false,
      });
    } catch (error) {
      console.error("Failed to add assessment:", error);
      setSnackbar({
        open: true,
        message: "Failed to add assessment!",
        error: true,
      });
    }
  };

  // Edit assessment
  const handleEditAssessment = async (assessmentData) => {
    try {
      const { $id } = assessmentModal.assessment;
      const res = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ASSESSMENTS,
        $id,
        assessmentData
      );
      setData((prev) => ({
        ...prev,
        assessments: prev.assessments.map((a) => (a.$id === $id ? res : a)),
      }));
      setSnackbar({
        open: true,
        message: "Assessment updated successfully!",
        error: false,
      });
    } catch (error) {
      console.error("Failed to edit assessment:", error);
      setSnackbar({
        open: true,
        message: "Failed to update assessment!",
        error: true,
      });
    }
  };

  // Delete assessment
  const handleDeleteAssessment = async (assessmentId) => {
    const assessment = data.assessments.find((a) => a.$id === assessmentId);
    if (!assessment) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.ASSESSMENTS,
        assessment.$id
      );

      // Delete associated scores
      const assessmentScores = scores.filter(
        (s) => s.assessmentId === assessmentId
      );
      for (const score of assessmentScores) {
        try {
          await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.SCORES,
            score.$id
          );
        } catch (error) {
          console.error("Failed to delete score:", error);
        }
      }

      setData((prev) => ({
        ...prev,
        assessments: prev.assessments.filter((a) => a.$id !== assessment.$id),
      }));

      setScores((prev) => prev.filter((s) => s.assessmentId !== assessmentId));

      setSnackbar({
        open: true,
        message: "Assessment deleted successfully!",
        error: false,
      });
    } catch (error) {
      console.error("Failed to delete assessment:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete assessment!",
        error: true,
      });
    }
  };

  // Save student score
  const handleScoreSave = async (studentId, assessmentId, score) => {
    if (studentsLoading || assessmentsLoading) return;
    try {
      const intScore = parseInt(score, 10);
      if (isNaN(intScore)) return;

      const existing = scores.find((s) => {
        const sStudentId =
          typeof s.studentId === "object" && s.studentId !== null
            ? s.studentId.$id
            : s.studentId;

        const sAssessmentId =
          typeof s.assessmentId === "object" && s.assessmentId !== null
            ? s.assessmentId.$id
            : s.assessmentId;

        return sStudentId === studentId && sAssessmentId === assessmentId;
      });

      let res;
      if (existing) {
        // Update existing score
        res = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.SCORES,
          existing.$id,
          {
            studentId: studentId,
            assessmentId: assessmentId,
            score: intScore,
          }
        );
        setScores((prev) =>
          prev.map((s) => (s.$id === existing.$id ? res : s))
        );
      } else {
        // Create new score
        res = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.SCORES,
          "unique()",
          {
            studentId: studentId,
            assessmentId: assessmentId,
            score: intScore,
          }
        );
        setScores((prev) => [...prev, res]);
      }

      setEditingScore({ studentId: null, assessmentId: null });
      setSavedScore({ studentId, assessmentId });
      setTimeout(
        () => setSavedScore({ studentId: null, assessmentId: null }),
        2000
      );
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  // Save student comment
  const handleCommentSave = async (studentId, comment) => {
    try {
      const student = data.students.find((s) => s.$id === studentId);
      if (!student) return;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.STUDENTS,
        student.$id,
        { comment }
      );

      setData((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s.$id === studentId ? { ...s, comment } : s
        ),
      }));

      setEditingComment(null);
      setCommentText("");
    } catch (error) {
      console.error("Failed to save comment:", error);
    }
  };

  const startEditComment = (student) => {
    setEditingComment(student.$id);
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

  // Helper to get student score for a specific assessment
  const getStudentScore = (studentId, assessmentId) => {
    const score = scores.find((s) => {
      const sStudentId =
        typeof s.studentId === "object" ? s.studentId?.$id : s.studentId;
      const sAssessmentId =
        typeof s.assessmentId === "object"
          ? s.assessmentId?.$id
          : s.assessmentId;
      const match = sStudentId === studentId && sAssessmentId === assessmentId;
      if (match) {
        console.log("✅ Score Match:", {
          sStudentId,
          sAssessmentId,
          score: s.score,
        });
      }
      return match;
    });
    return score ? score.score : 0;
  };

  // Add new student
  const handleAddStudent = async () => {
    if (!newStudent.id.trim() || !newStudent.name.trim()) return;

    try {
      const res = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.STUDENTS,
        newStudent.id,
        { name: newStudent.name, comment: "" }
      );
      setData((prev) => ({
        ...prev,
        students: [...prev.students, res],
      }));
      setStudentModal({ isOpen: false });
      setNewStudent({ id: "", name: "" });
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  // Safety check for data - moved after all hooks
  if (!data || !data.students || !data.assessments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    );
  }

  if (studentsLoading || assessmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-sm">
          Loading students and assessments...
        </span>
      </div>
    );
  }

  // Sort students
  const sortedStudents = [...data.students].filter(Boolean).sort((a, b) => {
    const { key, direction } = sortConfig;
    let aValue, bValue;

    if (key === "name") {
      aValue = `${a.lastName || ""}, ${a.firstName || ""}`.toLowerCase();
      bValue = `${b.lastName || ""}, ${b.firstName || ""}`.toLowerCase();
    } else if (key === "final") {
      // Calculate final grade based on scores and assessments
      aValue = calculateFinalGrade(a, data.assessments, scores);
      bValue = calculateFinalGrade(b, data.assessments, scores);
    } else {
      // key is assessment ID
      aValue = Number(getStudentScore(a.$id, key) || 0);
      bValue = Number(getStudentScore(b.$id, key) || 0);
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Helper: get all score cell positions
  const scoreCellPositions = [];
  data.students.forEach((student) => {
    data.assessments.forEach((assessment) => {
      scoreCellPositions.push({
        studentId: student.$id,
        assessmentId: assessment.$id,
      });
    });
  });

  const findScoreCellIndex = (studentId, assessmentId) =>
    scoreCellPositions.findIndex(
      (cell) =>
        cell.studentId === studentId && cell.assessmentId === assessmentId
    );

  // Determine enrolled students for the selected class
  const selectedClass = data.classes?.find(
    (cls) => cls.classCode === selectedClassCode
  );
  const enrollments =
    data.classEnrollments?.filter(
      (e) => e.classId === (selectedClass ? selectedClass.$id : undefined)
    ) || [];
  const enrolledStudentIds = enrollments.map((e) => e.studentId);
  const enrolledStudents = data.students.filter((s) =>
    enrolledStudentIds.includes(s.$id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header user={`${user.firstName} ${user.lastName}`} onLogout={onLogout} />

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-2 sm:px-2 lg:px-4 py-2">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Student Grades Table - left */}
          <StudentGradesTable
            data={data}
            sortedStudents={sortedStudents}
            sortConfig={sortConfig}
            handleSort={handleSort}
            editingScore={editingScore}
            setEditingScore={setEditingScore}
            scoreInput={scoreInput}
            setScoreInput={setScoreInput}
            savedScore={savedScore}
            setSavedScore={setSavedScore}
            handleScoreSave={handleScoreSave}
            findScoreCellIndex={findScoreCellIndex}
            scoreCellPositions={scoreCellPositions}
            studentsLoading={studentsLoading}
            assessmentsLoading={assessmentsLoading}
            editingComment={editingComment}
            setEditingComment={setEditingComment}
            commentText={commentText}
            setCommentText={setCommentText}
            handleCommentSave={handleCommentSave}
            startEditComment={startEditComment}
            calculateFinalGrade={calculateFinalGrade}
            getStudentScore={getStudentScore}
            setStudentModal={setStudentModal}
          />

          {/* Assessment Tasks - right */}
          <AssessmentTasks
            assessments={data.assessments}
            setAssessmentModal={setAssessmentModal}
            handleDeleteAssessment={handleDeleteAssessment}
          />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  value={newStudent.id}
                  onChange={(e) =>
                    setNewStudent((prev) => ({ ...prev, id: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student name"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Student
              </button>
              <button
                onClick={() => setStudentModal({ isOpen: false })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 transition-all ${
            snackbar.error ? "bg-red-600" : "bg-green-600"
          } text-white`}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
