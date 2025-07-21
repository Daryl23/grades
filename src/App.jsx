import { useEffect, useState } from "react";
import { account, databases, IDHelper } from "./lib/appwrite";
import { useApp } from "./AppContext";
import { DATABASE_ID, COLLECTIONS } from "./lib/constants";
import InstructorDashboard from "./InstructorDashboard";
import StudentDashboard from "./StudentDashboard";
import LoginForm from "./components/LoginForm";

function App() {
  const { user, onLogin, onLogout } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // 🧠 Check if there's an existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userAccount = await account.get();
        const userId = userAccount.$id;
  
        // Check if student
        const studentRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.STUDENTS,
          [`equal("authId", "${userId}")`]
        );
  
        if (studentRes.total > 0) {
          return onLogin({ ...studentRes.documents[0], role: "student" });
        }
  
        // Check if instructor
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
        const studentDoc = studentRes.documents[0];
        return onLogin({ ...studentDoc, role: "student", session });
      }

      // Check instructor
      const instructorRes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INSTRUCTORS,
        [`equal("authId", "${userId}")`]
      );

      if (instructorRes.total > 0) {
        const instructorDoc = instructorRes.documents[0];
        return onLogin({ ...instructorDoc, role: "instructor", session });
      }

      setError("🛑 Account exists but not linked to any role.");
    } catch (err) {
      console.error("❌ Login failed:", err.message);
      setError("Invalid email or password");
    }
  };

  // 📝 Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
  
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
  
    try {
      // Create Appwrite account
      const newAccount = await account.create(IDHelper.unique(), email, password);
  
      // Create session immediately after registration
      const session = await account.createEmailSession(email, password);
  
      const userAccount = await account.get();
  
      // Create student/instructor document based on role
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.STUDENTS,
        IDHelper.unique(),
        {
          authId: userAccount.$id,
          email,
          // other user fields
        }
      );
  
      return onLogin({ ...userAccount, role: "student", session });
    } catch (err) {
      console.error("❌ Registration failed:", err.message);
      setError(err.message || "Registration failed");
    }
  };
  

  if (!user) {
    return (
      <LoginForm
        emailOrSrCode={email}
        setEmailOrSrCode={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
        error={error}
        onRegister={handleRegister}
      />
    );
  }

  return user.role === "instructor" ? (
    <InstructorDashboard user={user} onLogout={onLogout} />
  ) : (
    <StudentDashboard user={user} onLogout={onLogout} />
  );
}

export default App;
