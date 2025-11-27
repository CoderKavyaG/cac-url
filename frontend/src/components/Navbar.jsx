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
      <nav className="w-full flex items-center justify-between py-6 px-10">
        <div 
          onClick={() => setCurrentPage("home")}
          className="text-white text-4xl font-bold tracking-tight font-mono cursor-pointer hover:text-gray-300 transition"
        >
          cac-url
        </div>

        <div className="flex items-center gap-4">
          {/* Profile Icon */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-gray-500/30 bg-slate-900/20">
            <FiUser size={20} className="text-gray-400" />
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-300 text-sm">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition text-sm font-semibold"
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
                className="text-gray-300 hover:text-white transition text-sm font-semibold"
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