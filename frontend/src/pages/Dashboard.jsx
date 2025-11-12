import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiCopy, FiTrash2, FiExternalLink, FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import ClickHistoryChart from "../components/ClickHistoryChart";
import CustomAliasEditor from "../components/CustomAliasEditor";
import SearchAndFilter from "../components/SearchAndFilter";

export default function DashboardNew() {
  const { user, token, logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [filteredUrls, setFilteredUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyStates, setCopyStates] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ totalUrls: 0, totalClicks: 0, avgClicks: 0, mostClicked: null });

  // Fetch user's shortened URLs
  const fetchUrls = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/urls", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch URLs");
      }

      const data = await response.json();
      const urlsArray = data.urls || [];
      const activeUrls = urlsArray.filter(url => !url.isDeleted);
      
      setUrls(urlsArray);
      setFilteredUrls(activeUrls);
      
      // Calculate stats
      const totalClicks = activeUrls.reduce((sum, url) => sum + (url.clicks || 0), 0);
      const mostClicked = activeUrls.length > 0 
        ? activeUrls.reduce((max, url) => url.clicks > max.clicks ? url : max, activeUrls[0])
        : null;
      
      setStats({
        totalUrls: activeUrls.length,
        totalClicks: totalClicks,
        avgClicks: activeUrls.length > 0 ? Math.round(totalClicks / activeUrls.length) : 0,
        mostClicked: mostClicked,
      });
      
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch URLs on mount
  useEffect(() => {
    if (!token) return;
    fetchUrls();
  }, [token]);

  // Copy short URL to clipboard
  const handleCopyUrl = (shortUrl, id) => {
    navigator.clipboard.writeText(shortUrl);
    setCopyStates({ ...copyStates, [id]: true });
    setTimeout(() => {
      setCopyStates({ ...copyStates, [id]: false });
    }, 2000);
  };

  // Delete a shortened URL
  const handleDeleteUrl = async (shortId) => {
    if (!window.confirm("Are you sure? This URL can be recovered within 30 days.")) return;

    try {
      const response = await fetch(`http://localhost:3000/urls/${shortId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete URL");
      }

      const updatedUrls = urls.map(url =>
        url.shortId === shortId ? { ...url, isDeleted: true, deletedAt: new Date() } : url
      );
      setUrls(updatedUrls);
      
      const activeUrls = updatedUrls.filter(url => !url.isDeleted);
      setFilteredUrls(activeUrls);
      
      // Recalculate stats
      const totalClicks = activeUrls.reduce((sum, url) => sum + (url.clicks || 0), 0);
      const mostClicked = activeUrls.length > 0 
        ? activeUrls.reduce((max, url) => url.clicks > max.clicks ? url : max, activeUrls[0])
        : null;
      
      setStats({
        totalUrls: activeUrls.length,
        totalClicks: totalClicks,
        avgClicks: activeUrls.length > 0 ? Math.round(totalClicks / activeUrls.length) : 0,
        mostClicked: mostClicked,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Recover a deleted URL
  const handleRecoverUrl = async (shortId) => {
    try {
      const response = await fetch(`http://localhost:3000/urls/${shortId}/recover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to recover URL");
      }

      const updatedUrls = urls.map(url =>
        url.shortId === shortId ? { ...url, isDeleted: false, deletedAt: null } : url
      );
      setUrls(updatedUrls);
      
      const activeUrls = updatedUrls.filter(url => !url.isDeleted);
      setFilteredUrls(activeUrls);
      
      // Recalculate stats
      const totalClicks = activeUrls.reduce((sum, url) => sum + (url.clicks || 0), 0);
      const mostClicked = activeUrls.length > 0 
        ? activeUrls.reduce((max, url) => url.clicks > max.clicks ? url : max, activeUrls[0])
        : null;
      
      setStats({
        totalUrls: activeUrls.length,
        totalClicks: totalClicks,
        avgClicks: activeUrls.length > 0 ? Math.round(totalClicks / activeUrls.length) : 0,
        mostClicked: mostClicked,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Update alias
  const handleAliasUpdate = (shortId, newAlias) => {
    const updatedUrls = urls.map((url) =>
      url.shortId === shortId ? { ...url, customAlias: newAlias } : url
    );
    setUrls(updatedUrls);
    setFilteredUrls(updatedUrls.filter(url => !url.isDeleted));
  };

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Please log in to view your analytics</p>
        </div>
      </div>
    );
  }

  // Validate URL
  const isValidUrl = (value) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  // Shorten a new URL
  const handleShortenUrl = async () => {
    if (!newUrl) {
      setShorteningError("Please enter a URL");
      return;
    }

    if (!isValidUrl(newUrl)) {
      setShorteningError("Please enter a valid URL (include http:// or https://)");
      setNewShortUrl("");
      return;
    }

    setShorteningLoading(true);
    setShorteningError("");
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await axios.post("http://localhost:3000/shorten", {
        originalUrl: newUrl,
      }, { headers });
      
      setNewShortUrl(res.data.shortUrl || "");
      setShorteningError("");
      
      // Refresh URLs list
      setTimeout(() => {
        fetchUrls();
        setNewUrl("");
        setNewShortUrl("");
      }, 1500);
    } catch (err) {
      console.error("Shorten error:", err);
      setShorteningError("Invalid URL or server error");
      setNewShortUrl("");
    } finally {
      setShorteningLoading(false);
    }
  };

  // Copy short URL
  const handleCopyShortUrl = async () => {
    if (!newShortUrl) return;
    try {
      await navigator.clipboard.writeText(newShortUrl);
      setShorteningError("✓ Copied to clipboard!");
      setTimeout(() => setShorteningError(""), 2000);
    } catch (e) {
      setShorteningError("Copy failed");
    }
  };

  const deletedUrls = urls.filter(url => url.isDeleted);
  const activeUrls = urls.filter(url => !url.isDeleted);

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-6 bg-gray-950">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">cac-url</h1>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = "/"}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg border border-gray-700 transition"
            >
              Create New URL
            </button>
            <button
              onClick={logout}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-2 rounded-lg border border-red-500/30 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 px-8 bg-gray-950">
        <div className="flex gap-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "analytics", label: "Analytics" },
            { id: "urls", label: "All URLs" },
            { id: "recovery", label: "Recovery", badge: deletedUrls.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-white font-semibold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.badge ? (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {error && (
          <div className="bg-red-500/10 text-red-400 px-6 py-4 rounded-lg mb-6 border border-red-500/30">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500">Loading your URLs...</div>
          </div>
        ) : (
          <>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Total Links</p>
                <p className="text-5xl font-bold">{stats.totalUrls}</p>
                <p className="text-gray-500 text-xs mt-2">Active shortened URLs</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp className="text-blue-500" size={18} />
                  <p className="text-gray-400 text-sm">Total Clicks</p>
                </div>
                <p className="text-5xl font-bold">{stats.totalClicks}</p>
                <p className="text-gray-500 text-xs mt-2">Cumulative redirects</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Avg Clicks</p>
                <p className="text-5xl font-bold">{stats.avgClicks}</p>
                <p className="text-gray-500 text-xs mt-2">Per link average</p>
              </div>
            </div>

            {/* Recent Links */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Links</h2>
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
              ) : activeUrls.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                  <p className="text-gray-400">No URLs created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeUrls.slice(0, 5).map((url) => (
                    <div key={url.shortId} className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex items-center justify-between hover:border-gray-700 transition">
                      <div className="flex-1">
                        <p className="font-mono text-blue-400 font-semibold">{url.shortId}</p>
                        <p className="text-gray-500 text-sm truncate mt-1">{url.originalUrl}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className="text-gray-300 font-semibold">{url.clicks || 0} clicks</span>
                        <button
                          onClick={() => handleCopyUrl(url.shortUrl, url.shortId)}
                          className="text-gray-400 hover:text-white transition"
                        >
                          <FiCopy size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : activeUrls.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400">No data yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeUrls.map((url) => (
                  url.clickHistory && url.clickHistory.length > 0 && (
                    <div key={url.shortId} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                      <div className="mb-4">
                        <h3 className="font-mono text-blue-400 font-semibold text-lg">{url.shortId}</h3>
                        <p className="text-gray-500 text-sm mt-1">{url.originalUrl}</p>
                      </div>
                      <ClickHistoryChart clickHistory={url.clickHistory} />
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* URLS TAB */}
        {activeTab === "urls" && (
          <div className="space-y-6">
            <SearchAndFilter urls={activeUrls} onFilter={setFilteredUrls} />
            
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filteredUrls.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400">No URLs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUrls.map((url) => (
                  <div key={url.shortId} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 font-mono font-semibold flex items-center gap-2 hover:text-blue-300"
                        >
                          {url.shortUrl}
                          <FiExternalLink size={14} />
                        </a>
                        {url.customAlias && (
                          <p className="text-green-400 text-xs mt-2 font-semibold">Custom: /{url.customAlias}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-2 truncate">{url.originalUrl}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleCopyUrl(url.shortUrl, url.shortId)}
                          className="text-gray-400 hover:text-white transition p-2"
                        >
                          <FiCopy />
                        </button>
                        <button
                          onClick={() => handleDeleteUrl(url.shortId)}
                          className="text-gray-400 hover:text-red-400 transition p-2"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    {copyStates[url.shortId] && (
                      <p className="text-green-400 text-xs mb-3 font-semibold">✓ Copied!</p>
                    )}

                    {/* Alias Editor */}
                    <div className="mb-4 pb-4 border-b border-gray-800">
                      <p className="text-gray-400 text-xs mb-2 font-semibold">Custom Alias</p>
                      <CustomAliasEditor
                        shortId={url.shortId}
                        currentAlias={url.customAlias}
                        token={token}
                        onUpdate={(newAlias) => handleAliasUpdate(url.shortId, newAlias)}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-xs font-semibold">Clicks</p>
                        <p className="text-2xl font-bold mt-2">{url.clicks || 0}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-xs font-semibold">Created</p>
                        <p className="text-sm mt-2">{new Date(url.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-400 text-xs font-semibold">ID</p>
                        <p className="text-sm font-mono mt-2">{url.shortId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RECOVERY TAB */}
        {activeTab === "recovery" && (
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm font-semibold">
                ⚠️ Deleted URLs can be recovered within 30 days. After that, they will be permanently removed.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : deletedUrls.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400">No deleted URLs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deletedUrls.map((url) => {
                  const daysLeft = url.expiresAt
                    ? Math.ceil((new Date(url.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
                    : 0;
                  const isExpired = daysLeft <= 0;

                  return (
                    <div
                      key={url.shortId}
                      className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-mono text-gray-400 font-semibold">{url.shortId}</p>
                          <p className="text-gray-500 text-sm mt-2 truncate">{url.originalUrl}</p>
                          <p className={`text-xs mt-3 font-semibold ${isExpired ? "text-red-400" : "text-yellow-400"}`}>
                            {isExpired ? "🚨 Recovery Expired" : `⏱️ ${daysLeft} days left to recover`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRecoverUrl(url.shortId)}
                          disabled={isExpired}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ml-4 ${
                            isExpired
                              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          <FiRefreshCw size={16} />
                          Recover
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
