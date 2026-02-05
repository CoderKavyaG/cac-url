import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { urlApi } from "../services/api";
import ShareModal from "./ShareModal";

export default function ShortenInput() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUrlData, setCurrentUrlData] = useState(null);
  const { user } = useAuth();

  const isValidUrl = (value) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const handleShorten = async () => {
    setError("");
    setSuccess("");

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (include http:// or https://)");
      setShortUrl("");
      return;
    }

    setLoading(true);
    try {
      const data = await urlApi.shorten(url);
      
      setShortUrl(data.data.shortUrl);
      setCurrentUrlData({
        shortId: data.data.shortId,
        customAlias: data.data.customAlias,
        originalUrl: url,
        shortUrl: data.data.shortUrl,
      });
      setSuccess("✓ Link shortened successfully!");
      setUrl("");

      // If user is not logged in, save to localStorage
      if (!user) {
        const newAnonymousUrl = {
          originalUrl: url,
          shortId: data.data.shortId,
          shortUrl: data.data.shortUrl,
          clicks: 0,
          createdAt: new Date().toISOString(),
        };

        const existingUrls = localStorage.getItem("anonymousUrls");
        const anonymousUrls = existingUrls ? JSON.parse(existingUrls) : [];
        anonymousUrls.unshift(newAnonymousUrl);
        localStorage.setItem("anonymousUrls", JSON.stringify(anonymousUrls.slice(0, 50)));
      }
    } catch (err) {
      setError(err.message || "Error creating short URL");
      setShortUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setSuccess("✓ Copied to clipboard!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (e) {
      setError("Copy failed");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 md:mt-10 px-4 md:px-0">
      <div className="space-y-4">
        {/* Main URL Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
          <input
            aria-label="Enter your link"
            className="w-full bg-black/30 text-gray-100 placeholder-gray-300 rounded-full px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur border border-gray-500/20 text-sm md:text-base"
            placeholder="Enter your link (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleShorten()}
          />

          <button
            onClick={handleShorten}
            disabled={loading}
            className="w-full sm:w-auto bg-white text-gray-900 font-medium px-6 md:px-8 py-3 md:py-4 rounded-full shadow-md hover:scale-[.99] transition-transform disabled:opacity-50 whitespace-nowrap text-sm md:text-base"
          >
            {loading ? "..." : "Shorten →"}
          </button>
        </div>

        {/* Error / Success Message */}
        <div className="text-sm min-h-[20px]">
          {error && (
            <span className="text-red-400 flex items-center justify-center gap-2">
              <span className="text-lg">⚠️</span> {error}
            </span>
          )}
          {success && (
            <span className="text-green-400 flex items-center justify-center gap-2">
              <span className="text-lg">✓</span> {success}
            </span>
          )}
        </div>

        {/* Short URL Display */}
        {shortUrl && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 bg-slate-900/40 border border-gray-500/20 rounded-2xl p-3 md:p-4 animate-fadeIn">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">Your shortened link:</p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white font-mono text-xs md:text-lg hover:text-gray-300 transition break-all"
              >
                {shortUrl}
              </a>
            </div>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 md:py-2 rounded-lg text-xs md:text-sm font-medium transition border border-gray-500/20 whitespace-nowrap"
            >
              📋 Copy
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
            >
              🔗 Share
            </button>
          </div>
        )}

        {/* Tip */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Sign in to save and track your links
        </p>
      </div>

      {/* Share Modal */}
      {showShareModal && currentUrlData && (
        <ShareModal 
          url={currentUrlData}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
