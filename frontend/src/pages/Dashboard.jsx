import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiHome, FiBarChart2, FiSettings, FiLogOut, FiCopy, FiTrash2 } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Dashboard({ setCurrentPage }) {
  const { user, token, logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/urls`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setUrls(data.urls || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (shortId) => {
    const fullUrl = `${API_URL}/${shortId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(shortId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (shortId) => {
    if (!window.confirm("Delete this URL? This action cannot be undone.")) return;
    try {
      const response = await fetch(`${API_URL}/urls/${shortId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      fetchUrls();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalClicks = urls.reduce((sum, u) => sum + (u.clicks || 0), 0);
  const avgClicks = urls.length > 0 ? Math.round(totalClicks / urls.length) : 0;
  const topClicks = urls.length > 0 ? Math.max(...urls.map(u => u.clicks || 0)) : 0;

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="w-20 bg-slate-950 border-r border-purple-700/30 flex flex-col items-center py-6 gap-8">
        <button 
          onClick={() => setCurrentPage("home")}
          className="p-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          <FiHome size={24} />
        </button>
        <button className="p-3 rounded-lg text-purple-400 hover:bg-slate-900 transition">
          <FiBarChart2 size={24} />
        </button>
        <button className="p-3 rounded-lg text-gray-400 hover:bg-slate-900 transition">
          <FiSettings size={24} />
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={() => {
            logout();
            setCurrentPage("home");
          }} 
          className="p-3 rounded-lg text-red-400 hover:bg-red-950/30 transition"
        >
          <FiLogOut size={24} />
        </button>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Statistics</h1>
            <p className="text-gray-400 text-sm mt-2">{user?.email || "Anonymous"}</p>
          </div>
          <button
            onClick={() => fetchUrls()}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            {loading ? "Refreshing..." : "⟳ Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-6 hover:border-purple-600 transition">
            <p className="text-gray-400 text-sm mb-3">Total Links</p>
            <p className="text-5xl font-bold text-white mb-4">{urls.length}</p>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>

          <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-6 hover:border-purple-600 transition">
            <p className="text-gray-400 text-sm mb-3">Total Clicks</p>
            <p className="text-5xl font-bold text-white mb-4">{totalClicks}</p>
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"></div>
          </div>

          <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-6 hover:border-purple-600 transition">
            <p className="text-gray-400 text-sm mb-3">Avg Clicks</p>
            <p className="text-5xl font-bold text-white mb-4">{avgClicks}</p>
            <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
          </div>

          <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-6 hover:border-purple-600 transition">
            <p className="text-gray-400 text-sm mb-3">Top Link</p>
            <p className="text-5xl font-bold text-white mb-4">{topClicks}</p>
            <div className="h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
          </div>
        </div>

        <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-8 mb-8">
          <h2 className="text-white text-xl font-bold mb-6">Click History</h2>
          <div className="relative h-64 flex items-end gap-2">
            <div className="flex flex-col justify-between text-gray-400 text-xs mr-4 h-full font-semibold">
              <span>4h</span>
              <span>3h</span>
              <span>2h</span>
              <span>1h</span>
              <span>0</span>
            </div>
            {urls.length > 0 ? (
              urls.slice(-7).map((url) => {
                const maxClicks = Math.max(...urls.map(u => u.clicks || 0), 1);
                const height = (url.clicks / maxClicks) * 100;
                return (
                  <div key={url.shortId} className="flex-1 flex flex-col justify-end items-center">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 via-purple-600 to-pink-500 rounded-t-lg hover:from-purple-600 transition-all"
                      style={{ height: `${height}%`, minHeight: "10px" }}
                    ></div>
                    <p className="text-gray-400 text-xs mt-2">{url.shortId.slice(0, 3)}</p>
                    <p className="text-gray-500 text-xs">{url.clicks}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400">No data</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-white text-xl font-bold mb-6">Your Shortened URLs</h2>
          {error && (
            <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}
          {loading && urls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading your URLs...</p>
            </div>
          ) : urls.length === 0 ? (
            <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-12 text-center">
              <p className="text-gray-400 mb-4">No URLs yet. Create your first shortened URL!</p>
              <button
                onClick={() => setCurrentPage("home")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Create URL
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urls.map((url) => (
                <div key={url.shortId} className="bg-slate-950 border border-purple-700/30 rounded-xl p-6 hover:border-purple-500 transition">
                  <p className="text-purple-400 font-mono text-sm font-bold">{url.shortId}</p>
                  <p className="text-gray-500 text-xs mt-1 truncate">{url.originalUrl}</p>
                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="bg-purple-950/30 rounded p-3">
                      <p className="text-gray-400 text-xs">Clicks</p>
                      <p className="text-lg font-bold text-white">{url.clicks || 0}</p>
                    </div>
                    <div className="bg-purple-950/30 rounded p-3">
                      <p className="text-gray-400 text-xs">Date</p>
                      <p className="text-sm font-bold text-white">{formatDate(url.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(url.shortId)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                        copied === url.shortId
                          ? "bg-green-600 text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      <FiCopy size={16} /> {copied === url.shortId ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => handleDelete(url.shortId)}
                      disabled={loading}
                      className="flex-1 bg-red-950/30 hover:bg-red-950/50 disabled:bg-gray-700 text-red-400 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <FiTrash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
