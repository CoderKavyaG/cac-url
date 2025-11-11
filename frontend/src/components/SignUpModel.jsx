import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignUpModal({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  // ✅ Fixed async typo and logic inversion
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = await signup(email, password);
    setLoading(false);

    // ✅ Fixed logic for showing error/success
    if (result.error) {
      setError(result.error);
    } else {
      onClose(); // Close modal on successful signup
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-gradient-to-br from-stone-900 to-gray-900 rounded-lg shadow-lg p-8 w-96">
        <h2 className="text-white text-2xl font-bold mb-6">Sign Up</h2>

        {error && (
          <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/30 text-white placeholder-gray-400 px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/30 text-white placeholder-gray-400 px-4 py-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-300 text-center mt-4 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => {
              setEmail("");
              setPassword("");
              setError("");
              onSwitchToLogin();
            }}
            className="text-blue-400 hover:underline"
          >
            Sign In
          </button>
        </p>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
