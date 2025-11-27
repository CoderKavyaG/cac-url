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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-900/60 border border-gray-500/30 rounded-2xl shadow-lg p-8 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
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
          <div className="bg-red-950/30 text-red-300 px-4 py-2 rounded mb-4 text-sm border border-red-500/20">
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
            className="w-full bg-slate-800/40 border border-gray-500/20 text-white placeholder-gray-500 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition disabled:opacity-50"
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-800/40 border border-gray-500/20 text-white placeholder-gray-500 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition disabled:opacity-50"
          />

          {!isLoginMode && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-800/40 border border-gray-500/20 text-white placeholder-gray-500 px-4 py-2 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition disabled:opacity-50"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-2 rounded-lg transition border border-gray-500/20 mb-3"
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
            className="w-full text-gray-400 hover:text-gray-300 text-sm py-2"
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
