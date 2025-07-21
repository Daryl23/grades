import React, { useState } from "react";
import { LogOut, UserCircle2 } from "lucide-react"; // Lucide icons
import ProfileModal from "./ProfileModal"; // You'll create this next

const InstructorHeader = ({ user, onLogout }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg"
            >
              <UserCircle2 className="w-6 h-6 text-gray-700" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.lastname || user.email || "User"}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={onLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfileModal && (
        <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

export default InstructorHeader;
