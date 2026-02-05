import React, { useState } from "react";
import { FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import SignUpModal from "./SignUpModal";

export default function Navbar({ setCurrentPage, onShowAuthModal }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage("home");
  };

  return (
    <>
      <nav className="w-full flex items-center justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10">
        <div 
          onClick={() => setCurrentPage("home")}
          className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-mono cursor-pointer hover:text-gray-300 transition"
        >
          cac-url
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Profile Icon */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-700/50 bg-black shadow-lg shadow-black/50">
            <FiUser size={18} className="text-gray-400 sm:w-5 sm:h-5" />
            
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-gray-300 text-xs sm:text-sm max-w-[100px] sm:max-w-none truncate">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition text-xs sm:text-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setShowAuthModal(true);
                }}
                className="text-gray-300 hover:text-white transition text-xs sm:text-sm font-semibold whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal - Unified Sign Up / Sign In */}
      {showAuthModal && (
        <SignUpModal onClose={() => setShowAuthModal(false)} isLogin={isLoginMode} />
      )}
    </>
  );
}