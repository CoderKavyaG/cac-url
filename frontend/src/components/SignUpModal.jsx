import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignUpModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Default to Sign In mode
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
    setError("");
    const result = isSignUp ? await signup(email, password) : await login(email, password);
    setLoading(false);

    if (result.success) {
      setEmail("");
      setPassword("");
      // Small delay to ensure state is updated before closing
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      setError(result.error || "Authentication failed");
    }
  };

  const toggleMode = () => {
    setEmail("");
    setPassword("");
    setError("");
    setIsSignUp(!isSignUp);
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
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {isSignUp ? "Join us to manage your links" : "Access your shortened links"}
        </p>

        {error && (
          <div className="bg-red-950/30 text-red-300 px-4 py-2 rounded mb-4 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800/40 border border-gray-500/20 text-white placeholder-gray-500 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition"
          />

          <input
            type="password"
            placeholder={isSignUp ? "Password (min 6 chars)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800/40 border border-gray-500/20 text-white placeholder-gray-500 px-4 py-2 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-2 rounded-lg transition border border-gray-500/20"
          >
            {loading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-4 text-sm">
          {isSignUp ? "Already have an account?" : "New user?"}{" "}
          <button
            onClick={toggleMode}
            className="text-gray-300 hover:text-white font-semibold transition"
          >
            {isSignUp ? "Sign In instead" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}
