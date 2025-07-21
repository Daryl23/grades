import { createContext, useContext, useEffect, useState } from "react";
import { account, databases } from "./lib/appwrite"; // adjust path if needed
import { DATABASE_ID, COLLECTIONS } from "./lib/constants"; // adjust path if needed

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    students: [],
    assessments: [],
    scores: [],
    classEnrollments: [],
    instructors: [],
    classes: [],
  });
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on first load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Check if there's an active Appwrite session
  useEffect(() => {
    const checkUser = async () => {
      try {
        const userAccount = await account.get();
        const userId = userAccount.$id;

        if (user && user.authId === userId) {
          setLoading(false);
          return; // Already set and matches current session
        }

        // Check if user is a student
        const studentRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.STUDENTS,
          [`equal("authId", "${userId}")`]
        );

        if (studentRes.total > 0) {
          const student = studentRes.documents[0];
          const userData = { ...student, role: "student" };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setLoading(false);
          return;
        }

        // Check if user is an instructor
        const instructorRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.INSTRUCTORS,
          [`equal("authId", "${userId}")`]
        );

        if (instructorRes.total > 0) {
          const instructor = instructorRes.documents[0];
          const userData = { ...instructor, role: "instructor" };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setLoading(false);
          return;
        }

        // User not found in database, clear session
        await account.deleteSession("current");
        setUser(null);
        localStorage.removeItem("user");
      } catch (err) {
        // No active session or session expired
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []); // Remove user dependency to avoid infinite loops

  // Fetch all data when user is authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setData({
          students: [],
          assessments: [],
          scores: [],
          classEnrollments: [],
          instructors: [],
          classes: [],
        });
        return;
      }

      try {
        // FIXED: Always fetch basic data for both students and instructors
        // Students need classes and assessments data to see their enrolled courses
        const basicPromises = [
          databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.ASSESSMENTS),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.SCORES),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.CLASS_ENROLLMENTS),
          databases.listDocuments(DATABASE_ID, COLLECTIONS.CLASSES), // ← NOW ALWAYS FETCHED
        ];

        // Only add instructors collection for instructors (students don't need it)
        const promises =
          user.role === "instructor"
            ? [
                ...basicPromises,
                databases.listDocuments(DATABASE_ID, COLLECTIONS.INSTRUCTORS),
              ]
            : basicPromises;

        const results = await Promise.all(promises);

        const newData = {
          students: results[0]?.documents || [],
          assessments: results[1]?.documents || [],
          scores: results[2]?.documents || [],
          classEnrollments: results[3]?.documents || [],
          classes: results[4]?.documents || [], // ← NOW ALWAYS AVAILABLE
          instructors: results[5]?.documents || [], // Only populated for instructors
        };

        console.log("=== APP CONTEXT DATA LOADED ===");
        console.log("User Role:", user.role);
        console.log("Students:", newData.students.length);
        console.log("Classes:", newData.classes.length);
        console.log("Assessments:", newData.assessments.length);
        console.log("ClassEnrollments:", newData.classEnrollments.length);
        console.log("Scores:", newData.scores.length);
        console.log("Instructors:", newData.instructors.length);
        console.log("================================");

        setData(newData);
      } catch (err) {
        console.error("Error loading data:", err);
        // Set empty data on error
        setData({
          students: [],
          assessments: [],
          scores: [],
          classEnrollments: [],
          instructors: [],
          classes: [],
        });
      }
    };

    fetchData();
  }, [user]);

  const onLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const onLogout = async () => {
    try {
      await account.deleteSession("current");
    } catch (err) {
      console.warn("Logout failed:", err.message);
    }

    setUser(null);
    localStorage.removeItem("user");
    setData({
      students: [],
      assessments: [],
      scores: [],
      classEnrollments: [],
      instructors: [],
      classes: [],
    });
  };

  const refreshData = async () => {
    if (!user) return;

    try {
      // FIXED: Same logic as fetchData - always fetch classes
      const basicPromises = [
        databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENTS),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.ASSESSMENTS),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.SCORES),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.CLASS_ENROLLMENTS),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.CLASSES), // ← NOW ALWAYS FETCHED
      ];

      const promises =
        user.role === "instructor"
          ? [
              ...basicPromises,
              databases.listDocuments(DATABASE_ID, COLLECTIONS.INSTRUCTORS),
            ]
          : basicPromises;

      const results = await Promise.all(promises);

      const newData = {
        students: results[0]?.documents || [],
        assessments: results[1]?.documents || [],
        scores: results[2]?.documents || [],
        classEnrollments: results[3]?.documents || [],
        classes: results[4]?.documents || [], // ← NOW ALWAYS AVAILABLE
        instructors: results[5]?.documents || [],
      };

      setData(newData);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  // Helper functions for relationship queries
  const getStudentEnrollments = (studentId) => {
    return data.classEnrollments.filter(
      (enrollment) => enrollment.studentId === studentId
    );
  };

  const getStudentClasses = (studentId) => {
    const enrollments = getStudentEnrollments(studentId);
    return data.classes.filter((cls) =>
      enrollments.some((enrollment) => enrollment.classId === cls.$id)
    );
  };

  const getClassStudents = (classId) => {
    const enrollments = data.classEnrollments.filter(
      (enrollment) => enrollment.classId === classId
    );
    return data.students.filter((student) =>
      enrollments.some((enrollment) => enrollment.studentId === student.$id)
    );
  };

  // FIXED: Updated to use classCode relationship instead of classId
  const getClassAssessments = (classId) => {
    // First get the class to find its classCode
    const cls = data.classes.find((c) => c.$id === classId);
    if (!cls) return [];

    // Then find assessments by classCode
    return data.assessments.filter(
      (assessment) => assessment.classCode === cls.classCode
    );
  };

  // NEW: Helper to get assessments by classCode directly
  const getAssessmentsByClassCode = (classCode) => {
    return data.assessments.filter(
      (assessment) => assessment.classCode === classCode
    );
  };

  const getStudentScores = (studentId, assessmentId = null) => {
    let scores = data.scores.filter((score) => score.studentId === studentId);
    if (assessmentId) {
      scores = scores.filter((score) => score.assessmentId === assessmentId);
    }
    return scores;
  };

  const getAssessmentScores = (assessmentId) => {
    return data.scores.filter((score) => score.assessmentId === assessmentId);
  };

  const getStudentsByClass = (classId) => {
    const enrollments = data.classEnrollments.filter(
      (e) => e.classId === classId
    );
    return data.students.filter((student) =>
      enrollments.some((e) => e.studentId === student.$id)
    );
  };

  const getClassesByInstructor = (instructorId) => {
    return data.classes.filter((cls) => cls.instructorId === instructorId);
  };

  // FIXED: Updated to use the corrected relationship
  const getStudentScoreDetails = (studentId) => {
    const scores = getStudentScores(studentId);
    return scores.map((score) => {
      const assessment = data.assessments.find(
        (a) => a.$id === score.assessmentId
      );
      // Find class by classCode instead of classId
      const cls = assessment
        ? data.classes.find((c) => c.classCode === assessment.classCode)
        : null;
      return {
        ...score,
        assessment,
        class: cls,
      };
    });
  };

  // NEW: Helper to get all assessments for a student with full details
  // NEW: Helper to get all assessments for a student with full details
  const getStudentAssessmentsWithScores = (studentId) => {
    console.log("=== getStudentAssessmentsWithScores DEBUG ===");
    console.log("1. Student ID:", studentId);
    console.log("2. Available data:", {
      classEnrollments: data.classEnrollments?.length || 0,
      classes: data.classes?.length || 0,
      assessments: data.assessments?.length || 0,
      scores: data.scores?.length || 0,
    });

    // Get student's enrollments - FIX: Handle object vs string studentId + null safety
    const enrollments =
      data.classEnrollments?.filter((enrollment) => {
        // Add null safety check
        if (!enrollment.studentId) return false;

        const enrollmentStudentId =
          typeof enrollment.studentId === "object"
            ? enrollment.studentId?.$id
            : enrollment.studentId;

        // Additional null check after extraction
        if (!enrollmentStudentId) return false;

        return enrollmentStudentId === studentId;
      }) || [];

    console.log("3. Found enrollments:", enrollments.length);
    console.log(
      "4. Enrollment details:",
      enrollments.map((e) => ({
        studentId:
          typeof e.studentId === "object" ? e.studentId.$id : e.studentId,
        classId: typeof e.classId === "object" ? e.classId.$id : e.classId,
      }))
    );

    // Get enrolled class IDs - FIX: Handle object vs string classId + null safety
    const enrolledClassIds = enrollments
      .map((enroll) => {
        if (!enroll.classId) return null;
        return typeof enroll.classId === "object"
          ? enroll.classId?.$id
          : enroll.classId;
      })
      .filter(Boolean); // Remove null/undefined values

    console.log("5. Enrolled class IDs:", enrolledClassIds);

    // Get all assessments for enrolled classes - FIX: Handle object vs string assessment.classId + null safety
    const assessments =
      data.assessments?.filter((assessment) => {
        if (!assessment.classId) return false;

        const assessmentClassId =
          typeof assessment.classId === "object"
            ? assessment.classId?.$id
            : assessment.classId;

        if (!assessmentClassId) return false;

        return enrolledClassIds.includes(assessmentClassId);
      }) || [];

    console.log("6. Found assessments:", assessments.length);
    console.log(
      "7. Assessment details:",
      assessments.map((a) => ({
        name: a.name,
        classId: typeof a.classId === "object" ? a.classId.$id : a.classId,
        id: a.$id,
      }))
    );

    // For each assessment, find the student's score
    const result = assessments.map((assessment) => {
      const score = data.scores?.find((s) => {
        // Add null safety checks
        if (!s.studentId || !s.assessmentId) return false;

        const scoreStudentId =
          typeof s.studentId === "object" ? s.studentId?.$id : s.studentId;
        const scoreAssessmentId =
          typeof s.assessmentId === "object"
            ? s.assessmentId?.$id
            : s.assessmentId;

        // Additional null checks after extraction
        if (!scoreStudentId || !scoreAssessmentId) return false;

        return (
          scoreStudentId === studentId && scoreAssessmentId === assessment.$id
        );
      });

      // Find class for this assessment - Add null safety
      const assessmentClassId =
        typeof assessment.classId === "object"
          ? assessment.classId?.$id
          : assessment.classId;
      const cls = assessmentClassId
        ? data.classes?.find((c) => c.$id === assessmentClassId)
        : null;

      const result = {
        ...assessment,
        className: cls ? cls.title || cls.name || cls.classCode : "",
        classCode: cls ? cls.classCode : "",
        scoreEntry: score || null, // Use scoreEntry to match your StudentDashboard
        hasScore: !!score,
        percentage:
          score && score.score !== null && score.score !== undefined
            ? ((score.score / assessment.maxScore) * 100).toFixed(1)
            : null,
      };

      console.log(`8. Assessment "${assessment.name}":`, {
        classId: assessmentClassId,
        className: result.className,
        hasScore: result.hasScore,
        score: score?.score,
      });

      return result;
    });

    console.log("9. Final result count:", result.length);
    console.log("=== END getStudentAssessmentsWithScores DEBUG ===");

    return result;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        data,
        loading,
        setData,
        onLogin,
        onLogout,
        refreshData,
        // Relationship helper functions
        getStudentEnrollments,
        getStudentClasses,
        getClassStudents,
        getClassAssessments,
        getAssessmentsByClassCode, // NEW
        getStudentScores,
        getAssessmentScores,
        getStudentsByClass,
        getClassesByInstructor,
        getStudentScoreDetails,
        getStudentAssessmentsWithScores, // NEW - This is what StudentDashboard should use!
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
