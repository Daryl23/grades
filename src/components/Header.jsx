import React, { useState } from "react";
import { LogOut, UserCircle2 } from "lucide-react";
import ProfileModal from "./ProfileModal";

const Header = ({ user, onLogout }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo + Title */}
          <div className="flex items-center space-x-4">
            <img
              src="icon.png"
              alt="Dashboard Icon"
              className="h-10 w-10 object-cover rounded-full"
            />
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition"
            >
              <UserCircle2 className="w-6 h-6 text-gray-800" />
              <span className="text-sm font-medium text-gray-800 hidden sm:block">
                {user?.lastname || user?.email || "User"}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition"
                >
                  Profile
                </button>
                <button
                  onClick={onLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
      )}
    </header>
  );
};

export default Header;
