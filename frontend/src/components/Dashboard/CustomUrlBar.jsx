import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CustomUrlBar({ token, onUrlCreated }) {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isValidUrl = (value) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const handleCreateCustomUrl = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (include http:// or https://)");
      return;
    }

    if (!customAlias) {
      setError("Please enter a custom alias");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
      setError("Alias can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    if (customAlias.length < 3) {
      setError("Alias must be at least 3 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalUrl: url,
          customAlias,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create custom URL");
      }

      const data = await response.json();
      setSuccess(`✓ Custom URL created: ${data.shortUrl}`);
      setUrl("");
      setCustomAlias("");

      // Notify parent to refresh the URL list
      if (onUrlCreated) {
        onUrlCreated();
      }
    } catch (err) {
      setError(err.message || "Error creating custom URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-gray-500/30 rounded-2xl p-6 mb-8">
      <h3 className="text-white font-semibold mb-4">Create Custom Short URL</h3>

      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Original URL</label>
          <input
            type="text"
            placeholder="https://example.com/very/long/url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateCustomUrl()}
            className="w-full bg-black/30 border border-gray-500/20 text-white placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition"
          />
        </div>

        {/* Custom Alias Input */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Custom Alias</label>
          <div className="flex items-center gap-2 bg-black/30 border border-gray-500/20 rounded-lg px-4 py-2">
            <span className="text-gray-500 text-sm whitespace-nowrap">{API_URL}/</span>
            <input
              type="text"
              placeholder="my-awesome-link"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
              onKeyPress={(e) => e.key === "Enter" && handleCreateCustomUrl()}
              maxLength="20"
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
            />
            <span className="text-xs text-gray-500">{customAlias.length}/20</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Use alphanumeric, hyphens, and underscores only (3-20 chars)</p>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="bg-red-950/30 text-red-300 px-4 py-2 rounded text-sm border border-red-500/20">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-950/30 text-green-300 px-4 py-2 rounded text-sm border border-green-500/20">
            {success}
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreateCustomUrl}
          disabled={loading}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-semibold py-2 rounded-lg transition border border-gray-500/20"
        >
          {loading ? "Creating..." : "Create Custom URL"}
        </button>
      </div>
    </div>
  );
}
