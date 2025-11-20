import React, { useState } from "react";
import { useAuth, MOCK_URLS } from "../context/AuthContext";

export default function ShortenInput() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [useCustom, setUseCustom] = useState(false);
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

  const isValidAlias = (alias) => {
    // Only alphanumeric, hyphens, and underscores allowed
    return /^[a-zA-Z0-9_-]+$/.test(alias) && alias.length >= 3 && alias.length <= 30;
  };

  const aliasExists = (alias) => {
    return MOCK_URLS.some((url) => url.customAlias === alias || url.shortId === alias);
  };

  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8);
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

    // Validate custom alias if provided
    if (useCustom && customAlias) {
      if (!isValidAlias(customAlias)) {
        setError("Alias must be 3-30 characters (alphanumeric, hyphens, underscores only)");
        setShortUrl("");
        return;
      }
      if (aliasExists(customAlias)) {
        setError("This alias is already taken. Try another one.");
        setShortUrl("");
        return;
      }
    } else if (useCustom && !customAlias) {
      setError("Please enter a custom alias");
      return;
    }

    setLoading(true);
    try {
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const finalAlias = useCustom ? customAlias : generateShortId();
      const fullShortUrl = `http://localhost:3000/${finalAlias}`;

      // Create new URL entry
      const newUrl = {
        shortId: generateShortId(), // Always generate a random backup ID
        customAlias: useCustom ? customAlias : null,
        originalUrl: url,
        clicks: 0,
        createdAt: new Date().toISOString(),
      };

      // Add to mock URLs (in real app, would save to DB)
      MOCK_URLS.push(newUrl);

      setShortUrl(fullShortUrl);
      setError("");
      setUrl("");
      setCustomAlias("");
      setUseCustom(false);
    } catch (err) {
      setError("Error creating short URL");
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
            onKeyPress={(e) => e.key === "Enter" && !useCustom && handleShorten()}
          />

          {!useCustom && (
            <button
              onClick={handleShorten}
              disabled={loading}
              className="bg-white text-gray-900 font-medium px-8 py-4 rounded-full shadow-md hover:scale-[.99] transition-transform disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "..." : "Shorten →"}
            </button>
          )}
        </div>

        {/* Custom URL Toggle */}
        <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/30 rounded-full border border-gray-500/20">
          <input
            type="checkbox"
            id="customToggle"
            checked={useCustom}
            onChange={(e) => {
              setUseCustom(e.target.checked);
              setCustomAlias("");
              setError("");
            }}
            className="w-5 h-5 accent-white cursor-pointer"
          />
          <label htmlFor="customToggle" className="text-gray-300 cursor-pointer flex-1 text-sm">
            Custom short URL
          </label>
        </div>

        {/* Custom Alias Input - Conditional */}
        {useCustom && (
          <div className="flex items-center gap-4">
            <div className="text-gray-400 text-sm font-medium min-w-fit">localhost:3000/</div>
            <input
              aria-label="Custom alias"
              className="flex-1 bg-black/30 text-gray-100 placeholder-gray-300 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur border border-gray-500/20"
              placeholder="my-awesome-link (3-30 chars, alphanumeric + hyphens)"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value.toLowerCase())}
              onKeyPress={(e) => e.key === "Enter" && handleShorten()}
            />
            <button
              onClick={handleShorten}
              disabled={loading}
              className="bg-white text-gray-900 font-medium px-8 py-4 rounded-full shadow-md hover:scale-[.99] transition-transform disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "..." : "Create →"}
            </button>
          </div>
        )}

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
