import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiCopy, FiTrash2, FiExternalLink } from "react-icons/fi";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyStates, setCopyStates] = useState({});

  // Fetch user's shortened URLs on component mount
  useEffect(() => {
    if (!token) return;

    const fetchUrls = async () => {
      try {
        const response = await fetch("http://localhost:3000/urls", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to fetch URLs");
        }

        const data = await response.json();
        setUrls(data.urls);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, [token]);

  // Copy short URL to clipboard
  const handleCopyUrl = (shortUrl, id) => {
    navigator.clipboard.writeText(shortUrl);
    
    // Show feedback
    setCopyStates({ ...copyStates, [id]: true });
    setTimeout(() => {
      setCopyStates({ ...copyStates, [id]: false });
    }, 2000);
  };

  // Delete a shortened URL
  const handleDeleteUrl = async (shortId) => {
    try {
      const response = await fetch(`http://localhost:3000/urls/${shortId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete URL");
      }

      // Remove from local state
      setUrls(urls.filter((url) => url.shortId !== shortId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Please log in to view your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <div className="w-full flex items-center justify-between py-6 px-10 border-b border-slate-800">
        <div className="text-white text-4xl font-bold tracking-tight font-mono">
          cac-url
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Welcome, <span className="text-blue-400 font-semibold">{user.email}</span></span>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 font-semibold text-white text-lg font-mono px-6 py-2 rounded-full transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-10 py-12">
        <div className="mb-8">
          <h2 className="text-white text-3xl font-bold mb-2">Your Shortened URLs</h2>
          <p className="text-gray-400">Manage and track analytics for all your shortened links</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 text-red-300 px-6 py-4 rounded-lg mb-6 border border-red-500/30">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">Loading your URLs...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && urls.length === 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <h3 className="text-white text-xl font-semibold mb-2">No URLs yet</h3>
            <p className="text-gray-400">Create your first shortened URL from the home page</p>
          </div>
        )}

        {/* URLs List */}
        {!loading && urls.length > 0 && (
          <div className="space-y-4">
            {urls.map((urlData) => (
              <div
                key={urlData.shortId}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">Short URL</p>
                    <a
                      href={urlData.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono text-lg break-all flex items-center gap-2"
                    >
                      {urlData.shortUrl}
                      <FiExternalLink className="text-sm" />
                    </a>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleCopyUrl(urlData.shortUrl, urlData.shortId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                      title="Copy to clipboard"
                    >
                      <FiCopy />
                    </button>
                    <button
                      onClick={() => handleDeleteUrl(urlData.shortId)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                      title="Delete URL"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* Copy Feedback */}
                {copyStates[urlData.shortId] && (
                  <p className="text-green-400 text-sm mb-4">✓ Copied to clipboard!</p>
                )}

                {/* Original URL */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Original URL</p>
                  <a
                    href={urlData.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white break-all text-sm"
                  >
                    {urlData.originalUrl}
                  </a>
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 rounded p-3">
                    <p className="text-gray-400 text-xs mb-1">Total Clicks</p>
                    <p className="text-white text-2xl font-bold">{urlData.clicks}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-3">
                    <p className="text-gray-400 text-xs mb-1">Created</p>
                    <p className="text-white text-sm font-mono">
                      {new Date(urlData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded p-3">
                    <p className="text-gray-400 text-xs mb-1">Short ID</p>
                    <p className="text-white font-mono text-sm">{urlData.shortId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
