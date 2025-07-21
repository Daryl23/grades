import { useEffect, useState } from "react";
import { account, databases, IDHelper } from "./lib/appwrite";
import { useApp } from "./AppContext";
import { DATABASE_ID, COLLECTIONS } from "./lib/constants";
import InstructorDashboard from "./InstructorDashboard";
import StudentDashboard from "./StudentDashboard";
import LoginForm from "./components/LoginForm";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import VerifyUser from "./pages/VerifyUser"; // ✅ adjust path

function App() {
  const { user, onLogin, onLogout } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // ✅ Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userAccount = await account.get();
        const userId = userAccount.$id;

        // Check student
        const studentRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.STUDENTS,
          [`equal("authId", "${userId}")`]
        );

        if (studentRes.total > 0) {
          return onLogin({ ...studentRes.documents[0], role: "student" });
        }

        // Check instructor
        const instructorRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.INSTRUCTORS,
          [`equal("authId", "${userId}")`]
        );

        if (instructorRes.total > 0) {
          return onLogin({ ...instructorRes.documents[0], role: "instructor" });
        }
      } catch (err) {
        console.warn("No active session:", err.message);
      }
    };

    checkSession();
  }, []);

  // 🔐 Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const session = await account.createEmailSession(email, password);
      const userAccount = await account.get();
      const userId = userAccount.$id;

      // Check student
      const studentRes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STUDENTS,
        [`equal("authId", "${userId}")`]
      );

      if (studentRes.total > 0) {
        return onLogin({
          ...studentRes.documents[0],
          role: "student",
          session,
        });
      }

      // Check instructor
      const instructorRes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INSTRUCTORS,
        [`equal("authId", "${userId}")`]
      );

      if (instructorRes.total > 0) {
        return onLogin({
          ...instructorRes.documents[0],
          role: "instructor",
          session,
        });
      }

      setError("🛑 Account exists but not linked to any role.");
    } catch (err) {
      console.error("❌ Login failed:", err.message);
      setError("Invalid email or password");
    }
  };

  // 📝 Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const newAccount = await account.create(
        IDHelper.unique(),
        email,
        password
      );
      const session = await account.createEmailSession(email, password);
      const userAccount = await account.get();

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.STUDENTS,
        IDHelper.unique(),
        {
          authId: userAccount.$id,
          email,
        }
      );

      return onLogin({ ...userAccount, role: "student", session });
    } catch (err) {
      console.error("❌ Registration failed:", err.message);
      setError(err.message || "Registration failed");
    }
  };

  return (
    <Router>
      <Routes>
        {/* ✅ Standalone route for verification */}
        <Route path="/verify-user" element={<VerifyUser />} />

        {/* ✅ Main app logic route */}
        <Route
          path="*"
          element={
            !user ? (
              <LoginForm
                emailOrSrCode={email}
                setEmailOrSrCode={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={handleLogin}
                error={error}
                onRegister={handleRegister}
              />
            ) : user.role === "instructor" ? (
              <InstructorDashboard user={user} onLogout={onLogout} />
            ) : (
              <StudentDashboard user={user} onLogout={onLogout} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
