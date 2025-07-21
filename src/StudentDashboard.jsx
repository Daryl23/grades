import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { databases } from "./lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "./lib/constants";
import InstructorHeader from "./components/InstructorHeader";

const StudentDashboard = ({ onLogout }) => {
  const { data, user, getStudentAssessmentsWithScores } =
    useContext(AppContext);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sampleScores, setSampleScores] = useState({});

  const handleSampleScoreChange = (assessmentId, value) => {
    setSampleScores(prev => ({
      ...prev,
      [assessmentId]: value === '' ? null : Number(value),
    }));
  };

  const calculateSampleGrade = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    assessmentsWithScores.forEach(assessment => {
      const score = sampleScores[assessment.$id] ?? (assessment.score ? assessment.score.score : null);
      if (score !== null) {
        const percentage = (score / assessment.maxScore) * 100;
        totalWeightedScore += percentage * (assessment.weight / 100);
        totalWeight += assessment.weight / 100;
      }
    });

    return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : "N/A";
  };

  useEffect(() => {
    const fetchStudentScores = async () => {
      if (!user || user.role !== "student") {
        setLoading(false);
        return;
      }

      try {
        const scoreRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SCORES,
          [`equal("studentId", "${user.$id}")`]
        );
        setScores(scoreRes.documents);
      } catch (err) {
        console.error("Error fetching scores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentScores();
  }, [user]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  if (!user)
    return <div className="text-center mt-10">Student data not found.</div>;

  // DETAILED DEBUGGING - Let's see what's happening step by step
  console.log("=== DETAILED STUDENT DASHBOARD DEBUG ===");
  console.log("1. User:", {
    id: user.$id,
    role: user.role,
    name: `${user.firstName} ${user.lastName}`,
  });

  console.log("2. Raw Data Counts:");
  console.log("   - Students:", data.students?.length || 0);
  console.log("   - Classes:", data.classes?.length || 0);
  console.log("   - Assessments:", data.assessments?.length || 0);
  console.log("   - ClassEnrollments:", data.classEnrollments?.length || 0);
  console.log("   - Scores:", scores.length);

  // Step 1: Find student's enrollments
  const studentEnrollments =
    data.classEnrollments?.filter(
      (enroll) => enroll.studentId?.$id === user.$id
    ) || [];
  console.log("3. Student's Enrollments:", studentEnrollments);

  // Step 2: Find enrolled class IDs (extract $id from classId object)
  const enrolledClassIds = studentEnrollments.map((enroll) =>
    typeof enroll.classId === "object" ? enroll.classId?.$id : enroll.classId
  );
  console.log("Enrolled Class IDs (normalized):", enrolledClassIds);

  // Step 3: Match classes using those IDs
  const enrolledClasses =
    data.classes?.filter((cls) => enrolledClassIds.includes(cls.$id)) || [];

  console.log(
    "5. Enrolled Classes:",
    enrolledClasses.map((cls) => ({
      id: cls.$id,
      classCode: cls.classCode,
      title: cls.title || cls.name,
    }))
  );

  // Step 4: Find assessments by classId (not classCode)
  const studentAssessments = [];

  enrolledClasses.forEach((cls) => {
    console.log(`6. Looking for assessments for classId: "${cls.$id}"`);

    const classAssessments =
      data.assessments?.filter(
        (assessment) => assessment.classId?.$id === cls.$id
      ) || [];

    console.log(
      `   - Found ${classAssessments.length} assessments:`,
      classAssessments.map((a) => ({ name: a.name, classId: a.classId }))
    );

    classAssessments.forEach((assessment) => {
      const scoreEntry = scores.find(
        (s) => s.assessmentId === assessment.$id && s.studentId === user.$id
      );

      studentAssessments.push({
        ...assessment,
        className: cls.title || cls.name || cls.classCode,
        classCode: cls.classCode, // Add classCode from the class
        scoreEntry,
        hasScore: !!scoreEntry,
        percentage:
          scoreEntry &&
          scoreEntry.score !== null &&
          scoreEntry.score !== undefined
            ? ((scoreEntry.score / assessment.maxScore) * 100).toFixed(1)
            : null,
      });
    });
  });

  console.log("7. Final Student Assessments:", studentAssessments.length);
  console.log(
    "8. Assessment Details:",
    studentAssessments.map((a) => ({
      name: a.name,
      classCode: a.classCode,
      hasScore: a.hasScore,
      score: a.scoreEntry?.score,
    }))
  );

  // Let's also check if there's a mismatch in classCodes
  const allClassCodes = data.classes?.map((c) => c.classCode) || [];
  const allAssessmentClassCodes =
    data.assessments?.map((a) => a.classCode) || [];
  console.log("9. All Class Codes:", allClassCodes);
  console.log("10. All Assessment Class Codes:", allAssessmentClassCodes);
  console.log(
    "11. Matching Class Codes:",
    allClassCodes.filter((code) => allAssessmentClassCodes.includes(code))
  );

  console.log("=== END DEBUG ===");

  // Use the calculated studentAssessments or helper function from AppContext
  const assessmentsWithScores = getStudentAssessmentsWithScores
    ? getStudentAssessmentsWithScores(user.$id)
    : studentAssessments;

  // Calculate overall grade
  const calculateOverallGrade = () => {
    const gradedAssessments = assessmentsWithScores.filter(
      (a) =>
        a.hasScore &&
        a.scoreEntry?.score !== null &&
        a.scoreEntry?.score !== undefined
    );

    if (gradedAssessments.length === 0) return "N/A";

    let totalWeightedScore = 0;
    let totalWeight = 0;

    gradedAssessments.forEach((assessment) => {
      const percentage =
        (assessment.scoreEntry.score / assessment.maxScore) * 100;
      const weight = assessment.weight || 0;
      totalWeightedScore += percentage * (weight / 100);
      totalWeight += weight / 100;
    });

    return totalWeight > 0
      ? (totalWeightedScore / totalWeight).toFixed(2)
      : "N/A";
  };

  // Get enrolled class codes for display
  const enrolledClassCodes = enrolledClasses.map((cls) => cls.classCode);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <InstructorHeader
        user={`${user.firstName} ${user.lastName}`}
        onLogout={onLogout}
      />

      {/* Debug Information */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <h4 className="font-medium text-yellow-800">Debug Information:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>User ID: {user.$id}</p>
          <p>Classes in DB: {data.classes?.length || 0}</p>
          <p>Assessments in DB: {data.assessments?.length || 0}</p>
          <p>
            Student's Enrollments: {studentEnrollments.length}{" "}
            {enrolledClassIds.join(", ")}
          </p>
          <p>Enrolled Classes: {enrolledClasses.length}</p>
          <p>Found Assessments: {assessmentsWithScores.length}</p>
          <p>Enrolled Class Codes: {enrolledClassCodes.join(", ") || "None"}</p>
          <p>All Class Codes: {allClassCodes.join(", ") || "None"}</p>
          <p>
            Assessment Class Codes:{" "}
            {[...new Set(allAssessmentClassCodes)].join(", ") || "None"}
          </p>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-white shadow-md rounded p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">Student Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Student ID:</strong> {user.srCode}
            </p>
          </div>
          <div>
            <p>
              <strong>Enrolled Classes:</strong>{" "}
              {enrolledClassCodes.join(", ") || "None"}
            </p>
            <p>
              <strong>Final Grade:</strong> {calculateOverallGrade()}%
            </p>
          </div>
        </div>
      </div>

      {/* Show Raw Data for Debugging */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <h4 className="font-medium text-red-800">Raw Data Check:</h4>
        <div className="text-xs text-red-700 space-y-2">
          <details>
            <summary className="cursor-pointer">
              Student Enrollments ({studentEnrollments.length})
            </summary>
            <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(studentEnrollments, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer">
              Enrolled Classes ({enrolledClasses.length})
            </summary>
            <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(enrolledClasses, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer">
              All Assessments ({data.assessments?.length || 0})
            </summary>
            <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(data.assessments?.slice(0, 3), null, 2)}
              {data.assessments?.length > 3 && "... (showing first 3)"}
            </pre>
          </details>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-white shadow-md rounded p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">
          Your Assessments & Grades
        </h3>

        {assessmentsWithScores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-left">Assessment</th>
                  <th className="border px-4 py-2 text-center">Score</th>
                  <th className="border px-4 py-2 text-center">Max Score</th>
                  <th className="border px-4 py-2 text-center">Weight (%)</th>
                  <th className="border px-4 py-2 text-center">Scaled</th>
                  <th className="border px-4 py-2 text-center bg-blue-100">
                    Weighted
                  </th>
                </tr>
              </thead>
              <tbody>
                {assessmentsWithScores.map((assessment) => {
                  const isGraded =
                    assessment.hasScore &&
                    assessment.scoreEntry &&
                    assessment.scoreEntry.score !== null &&
                    assessment.scoreEntry.score !== undefined;

                  return (
                    <tr key={assessment.$id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{assessment.name}</td>
                      <td className="border px-4 py-2 text-center">
                        {isGraded ? assessment.scoreEntry.score : "—"}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {assessment.maxScore}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {assessment.weight || 0}
                      </td>

                      {(() => {
                        const weight = assessment.weight || 0;
                        const raw = assessment.scoreEntry?.score;
                        const max = assessment.maxScore;

                        let scaledScore = 37.5;
                        if (isGraded && raw != null && max) {
                          scaledScore = (raw / max) * 62.5 + 37.5;
                        }

                        const weighted = scaledScore * (weight / 100);

                        return (
                          <>
                            <td className="border px-4 py-2 text-center font-medium">
                              {scaledScore.toFixed(2)}
                            </td>
                            <td className="border px-4 py-2 text-center font-medium text-blue-600">
                              {weighted.toFixed(2)}%
                            </td>
                          </>
                        );
                      })()}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Assessments Found
            </h4>
            <p className="text-gray-500 mb-4">
              We couldn't find any assessments for your enrolled classes.
            </p>
            <div className="text-sm text-gray-400">
              <p>Possible issues:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>No class enrollments found</li>
                <li>Class codes don't match between classes and assessments</li>
                <li>Assessments haven't been created yet</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Grade Calculator Table */}
<div className="bg-white shadow-md rounded p-4 mb-4">
  <h3 className="text-xl font-semibold mb-2">Grade Calculator</h3>
  <p className="text-sm text-gray-600 mb-4">
    Input sample scores to see your potential final grade.
  </p>
  {/* Optional total final grade display */}
  <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
    <h4 className="font-medium text-blue-800">
      Potential Final Grade: {calculateSampleGrade()}%
    </h4>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto border">
      <thead className="bg-gray-50">
        <tr>
          <th className="border px-4 py-2 text-left">Assessment</th>
          <th className="border px-4 py-2 text-center">Sample Score</th>
          <th className="border px-4 py-2 text-center">Max Score</th>
          <th className="border px-4 py-2 text-center">Weight (%)</th>
          <th className="border px-4 py-2 text-center">Scaled</th>
          <th className="border px-4 py-2 text-center">Weighted</th>
        </tr>
      </thead>
      <tbody>
        {assessmentsWithScores.map((assessment) => {
          const sampleScore = sampleScores[assessment.$id];
          const weight = assessment.weight || 0;
          const max = assessment.maxScore || 1;

          // Default to 37.5 if no valid sampleScore
          let scaledScore = 37.5;
          if (sampleScore !== '' && !isNaN(sampleScore)) {
            scaledScore = (sampleScore / max) * 62.5 + 37.5;
          }

          const weightedScore = scaledScore * (weight / 100);

          return (
            <tr key={assessment.$id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{assessment.name}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  className="w-20 text-center border-gray-300 rounded"
                  value={sampleScore ?? ''}
                  onChange={(e) =>
                    handleSampleScoreChange(assessment.$id, e.target.value)
                  }
                  placeholder={assessment.score?.score ?? "N/A"}
                />
              </td>
              <td className="border px-4 py-2 text-center">{assessment.maxScore}</td>
              <td className="border px-4 py-2 text-center">{assessment.weight}</td>
              <td className="border px-4 py-2 text-center">{scaledScore.toFixed(2)}%</td>
              <td className="border px-4 py-2 text-center">{weightedScore.toFixed(2)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>


      {/* Instructor Comments */}
      <div className="bg-white shadow-md rounded p-4">
        <h3 className="text-xl font-semibold mb-2">Instructor Comments</h3>
        {studentEnrollments.filter((enroll) => enroll.comment).length > 0 ? (
          <div className="space-y-3">
            {studentEnrollments
              .filter((enroll) => enroll.comment)
              .map((enroll, index) => {
                const relatedClass = enrolledClasses.find(
                  (cls) =>
                    cls.$id ===
                    (typeof enroll.classId === "object"
                      ? enroll.classId.$id
                      : enroll.classId)
                );
                const classCode = relatedClass?.classCode || "Unknown";

                return (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium text-sm text-gray-600">
                      Class: {classCode}
                    </p>
                    <p className="text-gray-700">{enroll.comment}</p>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
