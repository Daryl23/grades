// src/pages/VerifyUser.jsx
import React, { useEffect, useState } from "react";
import { account } from "../lib/appwrite"; // adjust the import path

const VerifyUser = () => {
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    const verify = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userId");
        const secret = urlParams.get("secret");

        if (userId && secret) {
          await account.updateVerification(userId, secret);
          setMessage(
            "✅ Your account has been successfully verified. You can now log in."
          );
        } else {
          setMessage("⚠️ Missing verification parameters.");
        }
      } catch (err) {
        setMessage(
          "❌ Verification failed. Maybe it’s already verified or expired."
        );
      }
    };

    verify();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="text-center text-lg font-medium">{message}</div>
    </div>
  );
};

export default VerifyUser;
