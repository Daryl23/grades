import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Header from "./Header"; // assume this exists

const MainLayout = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block`}
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-blue-700">Navigation</h2>
          <nav className="space-y-2">
            <a
              href="/dashboard"
              className="block text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </a>
            <a
              href="/classes"
              className="block text-gray-700 hover:text-blue-600"
            >
              Classes
            </a>
            <a
              href="/assessments"
              className="block text-gray-700 hover:text-blue-600"
            >
              Assessments
            </a>
            <a
              href="/settings"
              className="block text-gray-700 hover:text-blue-600"
            >
              Settings
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with hamburger */}
        <div className="flex items-center justify-between px-4 py-3 bg-white shadow-md md:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold">LMS Portal</h1>
        </div>

        {/* Main Header for larger screens */}
        <div className="hidden md:block">
          <Header user={user} onLogout={onLogout} />
        </div>

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
