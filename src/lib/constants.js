// lib/constants.js
export const DATABASE_ID = "grading-db"; // Replace with your actual database ID
export const TEAM_ID = "studentid"; // Replace with your student team ID

export const COLLECTIONS = {
  SCORES: "scores-id",
  ASSESSMENTS: "assessment-id",
  CLASS_ENROLLMENTS: "classenrollments-id",
  INSTRUCTORS: "instructors-id",
  STUDENTS: "students-id",
  CLASSES: "classes-id",
};

// Collection field structures for reference
export const COLLECTION_FIELDS = {
  STUDENTS: {
    email: "string",
    srCode: "string",
    firstName: "string",
    lastName: "string",
    password: "string", // Consider removing this and using only authId
    authId: "string", // Reference to Appwrite auth user ID
  },

  CLASS_ENROLLMENTS: {
    studentsId: "string", // Reference to students.$id
    classCode: "string",
    status: "string", // e.g., "pending", "active", "inactive"
    dateJoined: "datetime",
    comment: "string",
  },

  SCORES: {
    // Add your scores fields here
  },

  ASSESSMENTS: {
    // Add your assessment fields here
  },

  INSTRUCTORS: {
    // Add your instructor fields here
  },

  CLASSES: {
    // Add your class fields here
  },
};

// Permissions configuration for collections
export const COLLECTION_PERMISSIONS = {
  // Students can read all collections, admins can write
  STUDENT_READ_ALL: ["read('role:student')", "write('role:admin')"],

  // More specific permissions
  STUDENT_MANAGE_OWN: [
    "read('role:student')",
    "write('role:student', 'role:admin')",
  ],
};

// Status options for class enrollments
export const ENROLLMENT_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive",
  WITHDRAWN: "withdrawn",
};
