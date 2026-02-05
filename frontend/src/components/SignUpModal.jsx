import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignUpModal({ onClose, isLogin = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(isLogin);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);
    setError("");

    const result = isLoginMode 
      ? await login(email, password)
      : await register(email, password, confirmPassword);

    setLoading(false);

    if (result.success) {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Small delay to ensure state is updated before closing
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      setError(result.error || (isLoginMode ? "Login failed" : "Registration failed"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-black border border-gray-800 rounded-2xl shadow-2xl shadow-purple-900/20 p-8 w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-purple-300 text-2xl transition"
        >
          ✕
        </button>

        <h2 className="text-white text-2xl font-bold mb-2">
          {isLoginMode ? "Login" : "Create Account"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {isLoginMode 
            ? "Enter your email and password to login" 
            : "Create a new account with your email and password"}
        </p>

        {error && (
          <div className="bg-red-950/30 text-red-300 px-4 py-2 rounded mb-4 text-sm border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition disabled:opacity-50"
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition disabled:opacity-50"
          />

          {!isLoginMode && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition disabled:opacity-50"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-900/50 hover:bg-purple-900/70 disabled:bg-gray-900 text-purple-200 font-semibold py-3 rounded-lg transition border border-purple-500/30 mb-3"
          >
            {loading 
              ? (isLoginMode ? "Logging in..." : "Creating account...") 
              : (isLoginMode ? "Login" : "Create Account")}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="w-full text-gray-400 hover:text-purple-300 text-sm py-2 transition"
          >
            {isLoginMode 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
