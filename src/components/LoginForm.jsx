import React, { useState, useEffect } from "react";
import { account, databases, teams, IDHelper } from "../lib/appwrite";
import { COLLECTIONS, DATABASE_ID, TEAM_ID } from "../lib/constants";
import { Permission, Role } from "appwrite";
import { X } from "lucide-react";

const LoginForm = () => {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    srCode: "",
    firstName: "",
    lastName: "",
    classCode: "",
    password: "",
    confirmPassword: "",
  });

  const [showRegister, setShowRegister] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("userId");
      const secret = params.get("secret");

      if (userId && secret) {
        try {
          await account.updateVerification(userId, secret);
          setVerificationMessage(
            "✅ Your email has been verified. You may now log in."
          );
        } catch (err) {
          setVerificationMessage("❌ Verification failed. Please try again.");
        }
      }
    };

    verifyEmail();
  }, []);

  const handleLoginChange = (field, value) => {
    setLoginForm({ ...loginForm, [field]: value });
  };

  const handleRegisterChange = (field, value) => {
    setRegisterForm({ ...registerForm, [field]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await account.createEmailSession(loginForm.email, loginForm.password);
      window.location.reload();
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }

    try {
      // Look up the class by classCode
      const classQuery = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CLASSES,
        [],
        100
      );

      const classDoc = classQuery.documents.find(
        (doc) => doc.classCode === registerForm.classCode
      );

      if (!classDoc) {
        setRegisterError("Class code not found. Please check and try again.");
        return;
      }

      // Create user account
      const authResponse = await account.create(
        IDHelper.unique(),
        registerForm.email,
        registerForm.password,
        `${registerForm.firstName} ${registerForm.lastName}`
      );

      // Create session
      await account.createEmailSession(
        registerForm.email,
        registerForm.password
      );
      const user = await account.get();

      let studentDoc;

      try {
        studentDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.STUDENTS,
          IDHelper.unique(),
          {
            email: registerForm.email,
            srCode: registerForm.srCode,
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            authId: authResponse.$id,
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.write(Role.user(user.$id)),
          ]
        );
      } catch (err) {
        console.error("❌ Failed to create student document:", err);
        setRegisterError("Failed to create student document.");
        return;
      }

      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CLASS_ENROLLMENTS,
          IDHelper.unique(),
          {
            studentId: studentDoc.$id,
            classId: classDoc.$id,
            classCode: classDoc.classCode,
            status: "pending",
            dateJoined: new Date().toISOString(),
            comment: "",
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.write(Role.user(user.$id)),
          ]
        );
      } catch (err) {
        console.error("❌ Failed to create class enrollment:", err);
        setRegisterError("Failed to enroll in class. Please contact support.");
        console.log("📦 Creating class enrollment with data:", {
          studentId: studentDoc?.$id,
          classId: classDoc?.$id,
          studentDoc,
          classDoc,
        });
        return;
      }

      // Create team membership (optional)
      try {
        await teams.createMembership(TEAM_ID, ["student"], registerForm.email);
      } catch (teamError) {
        console.warn("Team membership creation failed:", teamError);
      }

      // Send verification email
      await account.createVerification(`${window.location.origin}/`);

      setRegisterSuccess(
        "Account created and logged in! Please check your email to verify."
      );
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setRegisterError(err.message || "Registration failed.");
    }
  };

  const handleForgotPassword = async () => {
    const email = loginForm.email;
    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    try {
      await account.createRecovery(
        email,
        "https://your-app.com/reset-password"
      );
      alert("Recovery email sent!");
    } catch (error) {
      console.error("Password recovery error:", error);
      alert(
        "Failed to send recovery email. Contact support if the issue persists."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-10">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      {verificationMessage && (
        <div className="mb-4 text-sm p-2 bg-blue-100 border border-blue-300 rounded text-blue-800">
          {verificationMessage}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={loginForm.email}
            onChange={(e) => handleLoginChange("email", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={loginForm.password}
            onChange={(e) => handleLoginChange("password", e.target.value)}
            required
          />
          <div className="mt-1 text-sm text-right">
            <button
              type="button"
              onClick={handleForgotPassword} // Define this function
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        Don't have an account?{" "}
        <button
          onClick={() => setShowRegister(true)}
          className="text-blue-600 hover:underline"
        >
          Register
        </button>
      </p>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowRegister(false)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Register</h2>

            <form
              onSubmit={handleRegisterSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { label: "Email", key: "email" },
                { label: "SR Code", key: "srCode" },
                { label: "First Name", key: "firstName" },
                { label: "Last Name", key: "lastName" },
                { label: "Class Code", key: "classCode" },
              ].map(({ label, key }) => (
                <div key={key} className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    value={registerForm[key]}
                    onChange={(e) => handleRegisterChange(key, e.target.value)}
                    required
                  />
                </div>
              ))}

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded"
                  value={registerForm.password}
                  onChange={(e) =>
                    handleRegisterChange("password", e.target.value)
                  }
                  required
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    handleRegisterChange("confirmPassword", e.target.value)
                  }
                  required
                />
              </div>

              {registerError && (
                <div className="col-span-2 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="col-span-2 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded">
                  {registerSuccess}
                </div>
              )}

              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
