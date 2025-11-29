import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiCopy, FiTrash2, FiEye, FiLock, FiRefreshCw, FiDownload } from 'react-icons/fi';
import QRCodeDisplay from './QRCodeDisplay';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function DashboardPage({ setCurrentPage, onViewLink, onShowAuthModal }) {
  const { user, token } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(null);
  const [aliasInput, setAliasInput] = useState({});
  const [creatingAlias, setCreatingAlias] = useState({});
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest, mostClicks, leastClicks
  const [showQR, setShowQR] = useState(null); // null or shortId of URL to show QR for

  // If not logged in, show locked message
  if (!user) {
    return (
      <div className="w-full">
        <h1 className="text-4xl font-bold text-white mb-8">Your Shortened Links</h1>
        <div className="bg-slate-900/40 border border-gray-500/20 rounded-2xl p-16 text-center">
          <FiLock size={64} className="mx-auto mb-6 text-gray-500" />
          <h2 className="text-2xl font-bold text-gray-200 mb-3">Dashboard is Locked</h2>
          <p className="text-gray-400 mb-8 text-lg">Sign in to access your shortened links and analytics</p>
          <button
            onClick={onShowAuthModal}
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition border border-gray-500/20"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Load URLs when component mounts or when user/token changes
    if (user && token) {
      fetchUrls(true);
    }
  }, [user, token]);

  const fetchUrls = async (showTransferMessage = false) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/urls`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to fetch URLs");
      }

      const data = await response.json();
      console.log('Fetched URLs with data:', data.urls);
      setUrls(data.urls || []);
      setError('');
      
      if (showTransferMessage && data.urls.length > 0) {
        setSuccess(`✓ Loaded ${data.urls.length} URL(s) to your dashboard!`);
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleCopy = (url) => {
    const urlToCopy = url.customAlias 
      ? `${API_URL}/${url.customAlias}`
      : `${API_URL}/${url.shortId}`;
    
    navigator.clipboard.writeText(urlToCopy);
    setCopied(url.shortId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (shortId) => {
    if (!window.confirm('Delete this URL? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_URL}/urls/${shortId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete URL");
      }

      setUrls(urls.filter(url => url.shortId !== shortId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateAlias = async (shortId) => {
    const alias = aliasInput[shortId];
    
    if (!alias) {
      setError("Please enter a custom alias");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
      setError("Alias can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    if (alias.length < 3) {
      setError("Alias must be at least 3 characters");
      return;
    }

    setCreatingAlias(prev => ({ ...prev, [shortId]: true }));
    setError("");

    try {
      const response = await fetch(`${API_URL}/urls/${shortId}/alias`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customAlias: alias }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create alias");
      }

      // Update the URL with the new alias
      setUrls(urls.map(url => 
        url.shortId === shortId 
          ? { ...url, customAlias: alias }
          : url
      ));

      setSuccess("✓ Custom alias created successfully!");
      setAliasInput(prev => ({ ...prev, [shortId]: "" }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create alias");
    } finally {
      setCreatingAlias(prev => ({ ...prev, [shortId]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFullUrl = (url) => {
    if (url.customAlias && url.userName) {
      return `${API_URL}/${url.userName}/${url.customAlias}`;
    }
    return `${API_URL}/${url.shortId}`;
  };

  const getSortedUrls = () => {
    let sorted = [...urls];
    
    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'latest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'mostClicks':
        sorted.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
        break;
      case 'leastClicks':
        sorted.sort((a, b) => (a.clicks || 0) - (b.clicks || 0));
        break;
      default:
        break;
    }
    
    return sorted;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Shortened Links</h1>
          <p className="text-gray-400">Manage and track all your shortened URLs</p>
        </div>
        <button
          onClick={fetchUrls}
          disabled={loading}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 border border-gray-500/20"
          title="Refresh links"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Sort Controls */}
      {urls.length > 0 && (
        <div className="mb-6 flex gap-2">
          <span className="text-gray-400 text-sm font-semibold py-2">Sort by:</span>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'latest'
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/15 border border-gray-500/20'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => setSortBy('oldest')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'oldest'
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/15 border border-gray-500/20'
            }`}
          >
            Oldest
          </button>
          <button
            onClick={() => setSortBy('mostClicks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'mostClicks'
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/15 border border-gray-500/20'
            }`}
          >
            Most Clicks
          </button>
          <button
            onClick={() => setSortBy('leastClicks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'leastClicks'
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/15 border border-gray-500/20'
            }`}
          >
            Least Clicks
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-950/30 border border-green-700/50 rounded-lg p-4 mb-6 text-green-400 text-sm">
          {success}
        </div>
      )}



      {urls.length === 0 ? (
        <div className="bg-slate-900/40 border border-gray-500/20 rounded-2xl p-16 text-center">
          <p className="text-gray-400 mb-6 text-lg">
            No shortened links yet
          </p>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-medium transition border border-gray-500/20"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="ml-32 border-2 border-dotted border-gray-500/50 rounded-2xl p-8 min-h-screen">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {/* Link Cards */}
            {getSortedUrls().map((url) => (
              <div
                key={url.shortId}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-gray-500/30 rounded-2xl p-6 hover:border-gray-500/60 transition-all hover:shadow-2xl hover:shadow-black/40 hover:scale-[1.02] flex flex-col"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Short URL</p>
                      <p className="text-lg font-mono font-bold text-white truncate" title={`localhost:3000/${url.customAlias || url.shortId}`}>
                        {url.customAlias || url.shortId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Clicks</p>
                      <p className="text-3xl font-bold text-white">{url.clicks || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-500/20 my-3"></div>

                {/* Original URL */}
                <div className="mb-4 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Original Link</p>
                  <p className="text-sm text-gray-300 break-all line-clamp-2" title={url.originalUrl}>
                    {url.originalUrl}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-600 mb-4">
                  Created: {formatDate(url.createdAt)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleCopy(url)}
                    className={`flex-1 px-3 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                      copied === url.shortId
                        ? 'bg-green-600/40 text-green-300 border border-green-500/40'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-gray-500/20'
                    }`}
                    title="Copy link"
                  >
                    <FiCopy size={16} />
                    Copy
                  </button>
                  <button
                    onClick={() => setShowQR(url)}
                    className="flex-1 px-3 py-3 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition flex items-center justify-center gap-2 border border-gray-500/20"
                    title="View QR Code"
                  >
                    <FiDownload size={16} />
                    QR
                  </button>
                  <button
                    onClick={() => onViewLink(url)}
                    className="flex-1 px-3 py-3 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition flex items-center justify-center gap-2 border border-gray-500/20"
                    title="View analytics"
                  >
                    <FiEye size={16} />
                    Stats
                  </button>
                  <button
                    onClick={() => handleDelete(url.shortId)}
                    disabled={loading}
                    className="flex-1 px-3 py-3 rounded-lg text-sm font-medium text-red-400 bg-red-950/20 hover:bg-red-950/40 disabled:opacity-50 transition flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-500/40"
                    title="Delete link"
                  >
                    <FiTrash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeDisplay
          shortUrl={getFullUrl(showQR)}
          shortId={showQR.shortId}
          onClose={() => setShowQR(null)}
        />
      )}
    </div>
  );
}
