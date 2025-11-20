import React, { useState, useEffect } from 'react';
import { useAuth, MOCK_URLS } from '../../context/AuthContext';
import { FiCopy, FiTrash2, FiEye, FiLock, FiRefreshCw } from 'react-icons/fi';

export default function DashboardPage({ setCurrentPage, onViewLink, onShowAuthModal }) {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

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
    // Load URLs only once on mount
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      // Using mock data instead of MongoDB API
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUrls([...MOCK_URLS]); // Spread to create new array reference
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // COMMENTED OUT: MongoDB API calls
  /*
  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/urls');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setUrls(data.urls || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  */

  const handleCopy = (url) => {
    // Use custom alias if available, otherwise use shortId
    const urlToCopy = url.customAlias 
      ? `http://localhost:3000/${url.customAlias}`
      : `http://localhost:3000/${url.shortId}`;
    
    navigator.clipboard.writeText(urlToCopy);
    setCopied(url.shortId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (shortId) => {
    if (!window.confirm('Delete this URL? This action cannot be undone.')) return;
    try {
      // Remove from MOCK_URLS array
      const index = MOCK_URLS.findIndex(url => url.shortId === shortId);
      if (index > -1) {
        MOCK_URLS.splice(index, 1);
      }
      // Update UI
      setUrls(urls.filter(url => url.shortId !== shortId));
    } catch (err) {
      setError(err.message);
    }
  };

  // COMMENTED OUT: MongoDB API delete
  /*
  const handleDelete = async (shortId) => {
    if (!window.confirm('Delete this URL? This action cannot be undone.')) return;
    try {
      const response = await fetch(`http://localhost:3000/urls/${shortId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      fetchUrls();
    } catch (err) {
      setError(err.message);
    }
  };
  */

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading && urls.length === 0) {
    return (
      <div className="w-full">
        <h1 className="text-4xl font-bold text-white mb-8">Your Shortened Links</h1>
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">Loading your links...</p>
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      {urls.length === 0 ? (
        <div className="bg-slate-900/40 border border-gray-500/20 rounded-2xl p-16 text-center">
          <p className="text-gray-400 mb-6 text-lg">No shortened links yet</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List Header - Desktop only */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-800/30 rounded-xl border border-gray-500/10">
            <div className="col-span-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Original Link</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Short Link</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Link</p>
            </div>
            <div className="col-span-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Clicks</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</p>
            </div>
          </div>

          {/* Link Cards */}
          {urls.map((url) => (
            <div
              key={url.shortId}
              className="bg-gradient-to-br from-slate-900/60 to-slate-900/30 border border-gray-500/20 rounded-2xl p-6 hover:border-gray-500/40 transition-all hover:shadow-xl hover:shadow-black/20 md:grid md:grid-cols-12 md:gap-4 md:px-6 md:py-4 block"
            >
              {/* Mobile: Full card view */}
              <div className="md:hidden space-y-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">URL</p>
                    <p className="text-sm text-white font-mono font-bold break-all">
                      {url.customAlias || url.shortId}
                    </p>
                  </div>
                  <div className="ml-3 text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Clicks</p>
                    <p className="text-2xl font-bold text-white">{url.clicks || 0}</p>
                  </div>
                </div>

                <div className="border-t border-gray-500/20 pt-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Original Link</p>
                  <p className="text-xs text-gray-400 break-all font-mono">{url.originalUrl}</p>
                </div>

                {url.customAlias && (
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-500/10">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Custom Alias</p>
                    <p className="text-sm font-mono text-gray-300">{url.customAlias}</p>
                    <p className="text-xs text-gray-600 font-mono mt-1">Backup ID: {url.shortId}</p>
                  </div>
                )}

                <div className="text-xs text-gray-600">
                  Created: {formatDate(url.createdAt)}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleCopy(url)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 ${
                      copied === url.shortId
                        ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-gray-500/20'
                    }`}
                  >
                    <FiCopy size={14} />
                    {copied === url.shortId ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => onViewLink(url)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 border border-gray-500/20"
                  >
                    <FiEye size={14} />
                    Details
                  </button>
                  <button
                    onClick={() => handleDelete(url.shortId)}
                    disabled={loading}
                    className="flex-1 bg-red-950/20 hover:bg-red-950/40 disabled:bg-gray-700 text-red-400 py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-500/40"
                  >
                    <FiTrash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Desktop: Table row view */}
              <div className="hidden md:col-span-3 md:flex md:items-center">
                <p className="text-sm text-gray-300 font-mono truncate" title={url.originalUrl}>
                  {url.originalUrl}
                </p>
              </div>

              <div className="hidden md:col-span-2 md:flex md:items-center">
                <p className="text-sm font-mono font-bold text-white">
                  {url.customAlias || url.shortId}
                </p>
              </div>

              <div className="hidden md:col-span-2 md:flex md:items-center">
                <p className="text-sm text-gray-400 font-mono">
                  {url.customAlias ? `Backup: ${url.shortId}` : <span className="text-gray-600">—</span>}
                </p>
              </div>

              <div className="hidden md:col-span-1 md:flex md:items-center">
                <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg">
                  <span className="text-sm font-bold text-white">{url.clicks || 0}</span>
                  <span className="text-xs text-gray-500">👆</span>
                </div>
              </div>

              <div className="hidden md:col-span-2 md:flex md:items-center">
                <p className="text-sm text-gray-500">{formatDate(url.createdAt)}</p>
              </div>

              <div className="hidden md:col-span-2 md:flex md:items-center md:gap-2">
                <button
                  onClick={() => handleCopy(url)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${
                    copied === url.shortId
                      ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-gray-500/20'
                  }`}
                  title="Copy short link"
                >
                  <FiCopy size={14} />
                  Copy
                </button>
                <button
                  onClick={() => onViewLink(url)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-white/10 hover:bg-white/20 transition flex items-center justify-center gap-1 border border-gray-500/20"
                  title="View analytics"
                >
                  <FiEye size={14} />
                  Details
                </button>
                <button
                  onClick={() => handleDelete(url.shortId)}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-950/20 hover:bg-red-950/40 disabled:bg-gray-700 transition flex items-center justify-center gap-1 border border-red-500/20 hover:border-red-500/40"
                  title="Delete link"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
