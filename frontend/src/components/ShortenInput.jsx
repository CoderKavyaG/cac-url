import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ShortenInput() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  const isValidUrl = (value) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const handleShorten = async () => {
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
      const response = await fetch(`${API_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({ originalUrl: url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to shorten URL");
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setError("");
      setUrl("");

      // If user is not logged in, save to localStorage
      if (!user) {
        const newAnonymousUrl = {
          originalUrl: url,
          shortId: data.shortUrl.split("/").pop(),
          shortUrl: data.shortUrl,
          clicks: 0,
          createdAt: new Date().toISOString(),
          customAlias: null,
        };

        // Get existing anonymous URLs
        const existingUrls = localStorage.getItem("anonymousUrls");
        const anonymousUrls = existingUrls ? JSON.parse(existingUrls) : [];
        
        // Add new URL
        anonymousUrls.unshift(newAnonymousUrl);
        
        // Store back (keep last 50 URLs)
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
      setError("✓ Copied to clipboard");
      setTimeout(() => setError(""), 2000);
    } catch (e) {
      setError("Copy failed");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="space-y-4">
        {/* URL Input */}
        <div className="flex items-center gap-4">
          <input
            aria-label="Enter your link"
            className="flex-1 bg-black/30 text-gray-100 placeholder-gray-300 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur border border-gray-500/20"
            placeholder="Enter your link (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleShorten()}
          />

          {
            <button
              onClick={handleShorten}
              disabled={loading}
              className="bg-white text-gray-900 font-medium px-8 py-4 rounded-full shadow-md hover:scale-[.99] transition-transform disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "..." : "Shorten →"}
            </button>
          }
        </div>



        {/* Error / Success Message */}
        <div className="text-sm text-gray-300 min-h-[20px]">
          {error && (
            <span className={error.includes("✓") ? "text-green-400" : "text-red-400"}>
              {error}
            </span>
          )}
        </div>

        {/* Short URL Display */}
        {shortUrl && (
          <div className="flex items-center gap-3 bg-slate-900/40 border border-gray-500/20 rounded-2xl p-4 animate-fadeIn">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">Your shortened link:</p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white font-mono text-lg hover:text-gray-300 transition break-all"
              >
                {shortUrl}
              </a>
            </div>
            <button
              onClick={handleCopy}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-500/20 whitespace-nowrap"
            >
              📋 Copy
            </button>
          </div>
        )}

        {/* Tip */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Sign in to save and track your links
        </p>
      </div>
    </div>
  );
}
