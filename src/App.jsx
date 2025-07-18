import React, { useState, createContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import InstructorDashboard from "./InstructorDashboard";
import StudentDashboard from "./StudentDashboard";
import ScoreModal from "./components/ScoreModal";
import AssessmentModal from "./components/AssessmentModal";

// Create and export context
export const AppContext = createContext();

// Sample data
const initialData = {
  users: [
    {
      id: "i001",
      name: "Prof. Smith",
      role: "instructor",
      password: "instructor123",
    },
    {
      id: "s001",
      name: "Juan Dela Cruz",
      role: "student",
      password: "student123",
    },
    {
      id: "s002",
      name: "Maria Santos",
      role: "student",
      password: "student123",
    },
    {
      id: "s003",
      name: "Pedro Garcia",
      role: "student",
      password: "student123",
    },
  ],
  assessments: [
    { name: "Quiz 1", maxScore: 20, weight: 10 },
    { name: "Midterm", maxScore: 50, weight: 30 },
    { name: "Final", maxScore: 100, weight: 60 },
  ],
  students: [
    {
      id: "s001",
      name: "Juan Dela Cruz",
      scores: { "Quiz 1": 18, Midterm: 45, Final: 85 },
      comment: "Good progress, keep it up.",
      finalGrade: 0,
    },
    {
      id: "s002",
      name: "Maria Santos",
      scores: { "Quiz 1": 20, Midterm: 48, Final: 92 },
      comment: "Excellent performance!",
      finalGrade: 0,
    },
    {
      id: "s003",
      name: "Pedro Garcia",
      scores: { "Quiz 1": 15, Midterm: 42, Final: 78 },
      comment: "Needs improvement in final exam preparation.",
      finalGrade: 0,
    },
  ],
};

// Login component
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const user = initialData.users.find(
      (u) => u.name === username && u.password === password
    );
    if (user) {
      onLogin(user);
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Grading System
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="mb-2">Demo Accounts:</p>
          <div className="bg-gray-50 p-3 rounded-lg text-left">
            <p>
              <strong>Instructor:</strong> Prof. Smith / instructor123
            </p>
            <p>
              <strong>Student:</strong> Juan Dela Cruz / student123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(initialData);

  // Modal state placeholders if needed globally
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentScore, setCurrentScore] = useState(null);

  const handleLogout = () => setUser(null);

  return (
    <AppContext.Provider value={{ data, setData }}>
      {!user ? (
        <Login onLogin={setUser} />
      ) : user.role === "instructor" ? (
        <InstructorDashboard user={user} onLogout={handleLogout} />
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}

      {/* Optional global modals if triggered from App */}
      <AssessmentModal
        isOpen={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        onSave={(newAssessment) => {
          setData((prev) => ({
            ...prev,
            assessments: [...prev.assessments, newAssessment],
          }));
          setAssessmentModalOpen(false);
        }}
        assessment={selectedAssessment}
      />

      <ScoreModal
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        onSave={(updatedScore) => {
          const updatedStudents = data.students.map((s) =>
            s.id === selectedStudent.id
              ? {
                  ...s,
                  scores: {
                    ...s.scores,
                    [selectedAssessment.name]: updatedScore,
                  },
                }
              : s
          );
          setData({ ...data, students: updatedStudents });
          setScoreModalOpen(false);
        }}
        student={selectedStudent}
        assessment={selectedAssessment}
        currentScore={currentScore}
      />
    </AppContext.Provider>
  );
};

export default App;
