import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ShortenInput() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

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
      const headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await axios.post("http://localhost:3000/shorten", {
        originalUrl: url,
      }, { headers });
      
      setShortUrl(res.data.shortUrl || "");
      setError("");
    } catch (err) {
      setError("Invalid URL or server error");
      setShortUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setError("Copied to clipboard");
      setTimeout(() => setError(""), 1600);
    } catch (e) {
      setError("Copy failed");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-10">
      <div className="flex items-center gap-4">
        <input
          aria-label="Enter your link"
          className="flex-1 bg-black/30 text-gray-100 placeholder-gray-300 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur"
          placeholder="Enter your link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={handleShorten}
          disabled={loading}
          className="bg-white text-gray-900 font-medium px-5 py-3 rounded-full shadow-md hover:scale-[.99] transition-transform"
        >
          {loading ? "..." : "Next →"}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-300">{error && <span className="text-red-400">{error}</span>}</div>
        {shortUrl && (
          <div className="ml-auto flex items-center gap-3">
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-white/90 bg-white/5 px-4 py-2 rounded-lg"
            >
              {shortUrl}
            </a>
            <button
              onClick={handleCopy}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-sm"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
