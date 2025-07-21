import React from "react";
import { X } from "lucide-react";

const ProfileModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {user.name || "—"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "—"}
          </p>
          {/* Add other profile info or an update form here */}
        </div>

        {/* Optionally, include update inputs and a Save button */}
      </div>
    </div>
  );
};

export default ProfileModal;
