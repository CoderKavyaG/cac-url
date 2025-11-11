import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    let result;

    if (isSignUp) {
      result = await signup(email, password);
    } else {
      result = await login(email, password);
    }

    setLoading(false);

    if (result.success) {
      onClose(); // Close modal on success
    } else {
      setError(result.error);
    }
  };

  const handleToggle = () => {
    setEmail("");
    setPassword("");
    setError("");
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl p-8 w-96 border border-blue-500/30 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>

        <h2 className="text-white text-2xl font-bold mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        
        <p className="text-gray-400 text-sm mb-6">
          {isSignUp 
            ? "Join us to track your shortened links" 
            : "Sign in to view your analytics"}
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-700/40 text-white placeholder-gray-500 px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder={isSignUp ? "Password (min 6 chars)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700/40 text-white placeholder-gray-500 px-4 py-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          >
            {loading 
              ? (isSignUp ? "Creating account..." : "Signing in...") 
              : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-gray-400 text-center text-sm">
            {isSignUp 
              ? "Already have an account?" 
              : "Don't have an account?"}
            {" "}
            <button
              onClick={handleToggle}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
