import React, { useState } from "react";
import { Menu, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import Header from "./Header"; // assume this exists

const MainLayout = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // for mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // for desktop

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 ${
          isCollapsed ? "w-12" : "w-64"
        } bg-white shadow-lg transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:sticky md:top-0 md:h-screen`}
      >
        <div className="flex flex-col h-full">
          {/* Collapse Toggle Button */}
          <div className="flex items-center justify-between px-4 py-1 border-b shadow-lg">
            <div className="py-2">
              <h2
                className={`text-xl font-bold text-red-700 transition-all duration-300 ${
                  isCollapsed
                    ? "opacity-0 w-0 overflow-hidden"
                    : "w-auto opacity-100"
                }`}
              >
                Navigation
              </h2>
              <p
                className={`text-sm text-gray-500 transition-all duration-300 ${
                  isCollapsed
                    ? "opacity-0 w-0 overflow-hidden"
                    : "w-auto opacity-100"
                }`}
              >
                LMS Portal
              </p>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="md:inline-block hidden text-gray-600 hover:text-black"
            >
              {isCollapsed ? (
                <ChevronsRight size={20} />
              ) : (
                <ChevronsLeft size={20} />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/classes", label: "Classes" },
              { href: "/assessments", label: "Assessments" },
              { href: "/settings", label: "Settings" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
              >
                {/* Add icons here if needed */}
                <span
                  className={`transition-all duration-300 ${
                    isCollapsed
                      ? "opacity-0 w-0 overflow-hidden"
                      : "opacity-100 w-auto"
                  }`}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Sticky Mobile Header */}
        <div className="sticky top-0 z-30 md:hidden bg-white shadow-md">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-lg font-bold">LMS Portal</h1>
          </div>
        </div>

        {/* Sticky Desktop Header */}
        <div className="hidden md:block sticky top-0 z-20 bg-white shadow-md">
          <Header user={user} onLogout={onLogout} />
        </div>

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
