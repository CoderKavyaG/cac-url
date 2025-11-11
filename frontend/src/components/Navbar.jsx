import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import SignUpModal from "./SignUpModal";

export default function Navbar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="w-full flex items-center justify-between py-6 px-10">
        <div className="text-white text-4xl font-bold tracking-tight font-mono">
          cac-url
        </div>

        <div className="flex items-center gap-4">
          <div className="cursor-pointer text-4xl text-white hover:text-gray-300 transition">
            <FaGithub />
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">{user.email}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 font-semibold text-white text-lg font-mono px-6 py-2 rounded-full transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 font-semibold text-white text-lg font-mono px-6 py-2 rounded-full transition"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal - Unified Sign Up / Sign In */}
      {showAuthModal && (
        <SignUpModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}