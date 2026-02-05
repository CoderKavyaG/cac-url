import React from "react";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ setCurrentPage }) {
  const { user, logout, signInWithGoogle } = useAuth();

  const handleLogout = () => {
    logout();
    setCurrentPage("home");
  };

  return (
    <nav className="w-full flex items-center justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10">
      <div
        onClick={() => setCurrentPage("home")}
        className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-mono cursor-pointer hover:text-gray-300 transition"
      >
        cac-url
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          /* Logged in - Show profile */
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-700/50 bg-black shadow-lg shadow-black/50">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'Profile'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white text-xs font-bold">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-gray-300 text-xs sm:text-sm max-w-[80px] sm:max-w-[120px] truncate hidden sm:block">
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition text-xs sm:text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        ) : (
          /* Not logged in - Google Sign In button */
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black border border-gray-700/50 hover:border-white/30 shadow-lg shadow-black/50 transition group"
          >
            <FaGoogle size={16} className="text-white group-hover:text-white transition" />
            <span className="text-gray-300 group-hover:text-white text-xs sm:text-sm font-semibold transition">
              Sign in with Google
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}