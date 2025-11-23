import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignUpModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const { sendOtp, verifyOtp, otpSent, pendingEmail } = useAuth();

  // OTP Timer countdown
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    
    const result = await sendOtp(email);
    setLoading(false);

    if (result.success) {
      setOtpTimer(300); // 5 minutes timer
    } else {
      setError(result.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    const result = await verifyOtp(email, otp);
    setLoading(false);

    if (result.success) {
      setEmail("");
      setOtp("");
      // Small delay to ensure state is updated before closing
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      setError(result.error || "OTP verification failed");
      setOtp("");
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const result = await sendOtp(email);
    setLoading(false);

    if (result.success) {
      setOtp("");
      setOtpTimer(300); // Reset timer to 5 minutes
    } else {
      setError(result.error || "Failed to resend OTP");
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
          {otpSent ? "Verify Email" : "Sign In / Create Account"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {otpSent ? "Enter the OTP sent to your email" : "We'll send you a one-time code to verify your email"}
        </p>

        {error && (
          <div className="bg-red-950/30 text-red-300 px-4 py-2 rounded mb-4 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        {!otpSent ? (
          // Step 1: Email Entry
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-800/40 border border-gray-500/20 text-white placeholder-gray-500 px-4 py-2 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-2 rounded-lg transition border border-gray-500/20"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          // Step 2: OTP Verification
          <form onSubmit={handleVerifyOtp}>
            <div className="bg-slate-800/20 border border-gray-500/20 rounded-lg p-3 mb-4">
              <p className="text-gray-300 text-sm">Email: <span className="font-semibold">{email}</span></p>
            </div>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              disabled={loading}
              className="w-full bg-slate-800/40 border border-gray-500/20 text-white placeholder-gray-500 px-4 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition disabled:opacity-50 text-center text-lg tracking-widest"
            />

            <div className="text-gray-400 text-xs mb-6 text-center">
              {otpTimer > 0 ? (
                <span>
                  OTP expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </span>
              ) : (
                <span className="text-red-400">OTP expired</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-2 rounded-lg transition border border-gray-500/20 mb-3"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading || otpTimer > 0}
              className="w-full bg-transparent hover:bg-slate-700/30 disabled:opacity-50 text-gray-300 hover:text-white font-semibold py-2 rounded-lg transition border border-gray-500/20"
            >
              Resend OTP {otpTimer > 0 && `(${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')})`}
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail("");
                setOtp("");
                setError("");
              }}
              className="w-full text-gray-400 hover:text-gray-300 text-sm py-2 mt-2"
            >
              Use different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
