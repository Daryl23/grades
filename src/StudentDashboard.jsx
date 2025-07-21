import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { databases } from "./lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "./lib/constants";
import Header from "./components/Header";
import MainLayout from "./components/MainLayout"; // adjust path as needed
// import { calculateSampleGrade } from "./utils/calculateFinalGrade";

const StudentDashboard = ({ onLogout }) => {
  const { data, user, getStudentAssessmentsWithScores } =
    useContext(AppContext);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sampleScores, setSampleScores] = useState({});

  // Calculate potential grade based on sample scores
  const calculateSampleGrade = () => {
    const assessments = data.assessments || [];
    if (
      !scores ||
      !assessments ||
      scores.length === 0 ||
      assessments.length === 0
    ) {
      return "0.00";
    }

    let totalWeight = 0;
    let weightedScoreSum = 0;

    for (const score of scores) {
      const assessment = assessments.find(
        (a) => a.$id === score.assessmentId?.$id || score.assessmentId
      );

      if (assessment && assessment.weight) {
        const numericScore = parseFloat(score.value); // Ensure it's numeric
        if (!isNaN(numericScore)) {
          weightedScoreSum += numericScore * (assessment.weight / 100);
          totalWeight += assessment.weight;
        }
      }
    }

    if (totalWeight === 0) return "0.00";

    const grade = (weightedScoreSum / totalWeight) * 100;
    return grade.toFixed(2);
  };

  const handleSampleScoreChange = (assessmentId, value) => {
    setSampleScores((prev) => ({
      ...prev,
      [assessmentId]: value === "" ? null : Number(value),
    }));
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

  if (loading)
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded mb-4 mx-auto"></div>
          <p className="text-textMain">Loading your dashboard...</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-red-100 text-red-700 border-red-400 border p-6 rounded-xl text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>Student data not found.</p>
        </div>
      </div>
    );

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
    <MainLayout user={user} onLogout={onLogout}>
      {/* Debug Information - Collapsible */}
      <div className="bg-yellow-100 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
        <details>
          <summary className="font-medium text-yellow-800 cursor-pointer hover:text-yellow-900 transition">
            🐛 Debug Information (Click to expand)
          </summary>
          <div className="text-sm text-yellow-700 space-y-2 mt-4 bg-white p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>User ID:</strong> {user.$id}
                </p>
                <p>
                  <strong>Classes in DB:</strong> {data.classes?.length || 0}
                </p>
                <p>
                  <strong>Assessments in DB:</strong>{" "}
                  {data.assessments?.length || 0}
                </p>
                <p>
                  <strong>Student's Enrollments:</strong>{" "}
                  {studentEnrollments.length}
                </p>
              </div>
              <div>
                <p>
                  <strong>Enrolled Classes:</strong> {enrolledClasses.length}
                </p>
                <p>
                  <strong>Found Assessments:</strong>{" "}
                  {assessmentsWithScores.length}
                </p>
                <p>
                  <strong>Enrolled Class Codes:</strong>{" "}
                  {enrolledClassCodes.join(", ") || "None"}
                </p>
                <p>
                  <strong>Assessment Class Codes:</strong>{" "}
                  {[...new Set(allAssessmentClassCodes)].join(", ") || "None"}
                </p>
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Student Info Card */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-textMain mb-6">
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-textMain font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Student ID
                  </label>
                  <p className="text-textMain font-medium">{user.srCode}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Active Classes
                  </label>
                  <p className="text-textMain font-medium">
                    {enrolledClassCodes.length > 0 ? (
                      <span className="inline-flex flex-wrap gap-2">
                        {enrolledClassCodes.map((code, index) => (
                          <span
                            key={index}
                            className="bg-greenAccent px-3 py-1 rounded-full text-sm"
                          >
                            {code}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Current Grade
                  </label>
                  <p className="text-2xl font-bold text-redAccent">
                    {calculateOverallGrade()}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assessments Table */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-textMain mb-6">
              Your Assessments & Grades
            </h2>

            {assessmentsWithScores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-red-800 text-white">
                    <tr>
                      <th className="border border-red-300 px-4 py-3 text-left font-medium">
                        Assessment
                      </th>
                      <th className="border border-red-300 px-4 py-3 text-center font-medium">
                        Score
                      </th>
                      <th className="border border-red-300 px-4 py-3 text-center font-medium">
                        Max Score
                      </th>
                      <th className="border border-red-300 px-4 py-3 text-center font-medium">
                        Weight (%)
                      </th>
                      <th className="border border-red-300 px-4 py-3 text-center font-medium">
                        Scaled
                      </th>
                      <th className="border border-red-300 px-4 py-3 text-center font-medium">
                        Weighted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentsWithScores.map((assessment, index) => {
                      const isGraded =
                        assessment.hasScore &&
                        assessment.scoreEntry &&
                        assessment.scoreEntry.score !== null &&
                        assessment.scoreEntry.score !== undefined;

                      const bgClass = index % 2 === 0 ? "bg-white" : "bg-cream";

                      return (
                        <tr
                          key={assessment.$id}
                          className={`${bgClass} hover:bg-greenAccent/20 transition`}
                        >
                          <td className="border border-gray-200 px-4 py-3 font-medium text-textMain">
                            {assessment.name}
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-center">
                            {isGraded ? (
                              <span className="font-medium text-textMain">
                                {assessment.scoreEntry.score}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-center text-textMain">
                            {assessment.maxScore}
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-center text-textMain">
                            {assessment.weight || 0}%
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
                                <td className="border border-gray-200 px-4 py-3 text-center font-medium text-textMain">
                                  {scaledScore.toFixed(2)}
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-center font-bold text-redAccent">
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
              <div className="text-center py-12">
                <div className="text-gray-400 mb-6">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-textMain mb-3">
                  No Assessments Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any assessments for your enrolled classes.
                  This could be due to several reasons.
                </p>
                <div className="bg-cream rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm font-medium text-textMain mb-2">
                    Possible Issues:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• No class enrollments found</li>
                    <li>
                      • Class codes don't match between classes and assessments
                    </li>
                    <li>• Assessments haven't been created yet</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Grade Calculator */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-textMain mb-2">
              Grade Calculator
            </h2>
            <p className="text-gray-600 mb-6">
              Input sample scores to see your potential final grade.
            </p>

            {/* Potential Grade Display */}
            <div className="bg-greenAccent/30 border-l-4 border-greenAccent rounded-lg p-4 mb-6">
              <h3 className="text-xl font-bold text-textMain">
                Potential Final Grade:{" "}
                <span className="text-redAccent">
                  {calculateSampleGrade()}%
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-green-300 text-black">
                  <tr>
                    <th className="border border-green-300 px-4 py-3 text-left font-medium">
                      Assessment
                    </th>
                    <th className="border border-green-300 px-4 py-3 text-center font-medium">
                      Sample Score
                    </th>
                    <th className="border border-green-300 px-4 py-3 text-center font-medium">
                      Max Score
                    </th>
                    <th className="border border-green-300 px-4 py-3 text-center font-medium">
                      Weight (%)
                    </th>
                    <th className="border border-green-300 px-4 py-3 text-center font-medium">
                      Scaled
                    </th>
                    <th className="border border-green-300 px-4 py-3 text-center font-medium">
                      Weighted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentsWithScores.map((assessment, index) => {
                    const sampleScore = sampleScores[assessment.$id];
                    const weight = assessment.weight || 0;
                    const max = assessment.maxScore || 1;

                    // Default to 37.5 if no valid sampleScore
                    let scaledScore = 37.5;
                    if (sampleScore !== "" && !isNaN(sampleScore)) {
                      scaledScore = (sampleScore / max) * 62.5 + 37.5;
                    }

                    const weightedScore = scaledScore * (weight / 100);
                    const bgClass = index % 2 === 0 ? "bg-white" : "bg-cream";

                    return (
                      <tr
                        key={assessment.$id}
                        className={`${bgClass} hover:bg-greenAccent/10 transition`}
                      >
                        <td className="border border-gray-200 px-4 py-3 font-medium text-textMain">
                          {assessment.name}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <input
                            type="number"
                            className="w-20 text-center border border-gray-300 rounded-lg py-1 px-2 focus:border-redAccent focus:outline-none transition"
                            value={sampleScore ?? ""}
                            onChange={(e) =>
                              handleSampleScoreChange(
                                assessment.$id,
                                e.target.value
                              )
                            }
                            placeholder={assessment.score?.score ?? "0"}
                          />
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center text-textMain">
                          {assessment.maxScore}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center text-textMain">
                          {assessment.weight}%
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center font-medium text-textMain">
                          {scaledScore.toFixed(2)}%
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center font-bold text-redAccent">
                          {weightedScore.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Instructor Comments */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-bold text-textMain mb-4">
              Instructor Comments
            </h3>
            {studentEnrollments.filter((enroll) => enroll.comment).length >
            0 ? (
              <div className="space-y-4">
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
                      <div
                        key={index}
                        className="border-l-4 border-redAccent pl-4 py-2"
                      >
                        <p className="font-medium text-sm text-gray-600 mb-1">
                          Class: {classCode}
                        </p>
                        <p className="text-textMain">{enroll.comment}</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">
                  No comments yet from instructors.
                </p>
              </div>
            )}
          </div>
          {/* Raw Data Debug */}
          <div className="bg-red-100 border-l-4 border-redAccent rounded-lg p-4">
            <h3 className="font-bold text-red-800 mb-4">🔍 Raw Data Check</h3>
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800 transition">
                  Student Enrollments ({studentEnrollments.length})
                </summary>
                <div className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-32">
                  <pre>{JSON.stringify(studentEnrollments, null, 2)}</pre>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800 transition">
                  Enrolled Classes ({enrolledClasses.length})
                </summary>
                <div className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-32">
                  <pre>{JSON.stringify(enrolledClasses, null, 2)}</pre>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800 transition">
                  All Assessments ({data.assessments?.length || 0})
                </summary>
                <div className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-32">
                  <pre>
                    {JSON.stringify(data.assessments?.slice(0, 3), null, 2)}
                    {data.assessments?.length > 3 && "\n... (showing first 3)"}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentDashboard;
