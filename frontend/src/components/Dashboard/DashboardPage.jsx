import React, { useState, useEffect } from 'react';
import { useAuth, MOCK_URLS } from '../../context/AuthContext';
import { FiCopy, FiTrash2, FiEye, FiLock, FiRefreshCw } from 'react-icons/fi';

export default function DashboardPage({ setCurrentPage, onViewLink, onShowAuthModal }) {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'custom'
  const [customAlias, setCustomAlias] = useState('');
  const [customAliasError, setCustomAliasError] = useState('');
  const [customAliasLoading, setCustomAliasLoading] = useState(false);

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
      setUrls([...MOCK_URLS]);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isValidAlias = (alias) => {
    return /^[a-zA-Z0-9_-]+$/.test(alias) && alias.length >= 3 && alias.length <= 30;
  };

  const aliasExists = (alias) => {
    return MOCK_URLS.some((url) => url.customAlias === alias || url.shortId === alias);
  };

  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleCreateCustomAlias = async (originalUrl) => {
    if (!customAlias) {
      setCustomAliasError('Please enter a custom alias');
      return;
    }

    if (!isValidAlias(customAlias)) {
      setCustomAliasError('Alias must be 3-30 characters (alphanumeric, hyphens, underscores only)');
      return;
    }

    if (aliasExists(customAlias)) {
      setCustomAliasError('This alias is already taken. Try another one.');
      return;
    }

    setCustomAliasLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create new URL entry with custom alias
      const newUrl = {
        shortId: generateShortId(),
        customAlias: customAlias,
        originalUrl: originalUrl,
        clicks: 0,
        createdAt: new Date().toISOString(),
      };

      MOCK_URLS.push(newUrl);
      setUrls([...MOCK_URLS]);
      setCustomAlias('');
      setCustomAliasError('');
      setCustomAliasError('✓ Custom alias created!');
      setTimeout(() => setCustomAliasError(''), 2000);
    } catch (err) {
      setCustomAliasError('Error creating custom alias');
    } finally {
      setCustomAliasLoading(false);
    }
  };

  const handleCopy = (url) => {
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
      const index = MOCK_URLS.findIndex(url => url.shortId === shortId);
      if (index > -1) {
        MOCK_URLS.splice(index, 1);
      }
      setUrls(urls.filter(url => url.shortId !== shortId));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter URLs based on active tab
  const displayedUrls = activeTab === 'custom' 
    ? urls.filter(url => url.customAlias)
    : urls;

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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-500/20">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-3 font-medium transition border-b-2 ${
            activeTab === 'all'
              ? 'text-white border-b-white'
              : 'text-gray-400 hover:text-gray-300 border-b-transparent'
          }`}
        >
          All Links ({urls.length})
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-3 font-medium transition border-b-2 ${
            activeTab === 'custom'
              ? 'text-white border-b-white'
              : 'text-gray-400 hover:text-gray-300 border-b-transparent'
          }`}
        >
          Custom Aliases ({urls.filter(u => u.customAlias).length})
        </button>
      </div>

      {/* Custom Alias Creation Form - Only in Custom Tab */}
      {activeTab === 'custom' && (
        <div className="bg-slate-900/40 border border-gray-500/20 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Custom Short URL</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 bg-black/30 rounded-lg border border-gray-500/20">
              <span className="text-gray-400 font-mono text-sm">localhost:3000/</span>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => {
                  setCustomAlias(e.target.value.toLowerCase());
                  setCustomAliasError('');
                }}
                placeholder="my-awesome-link (3-30 chars)"
                className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none text-sm"
                disabled={customAliasLoading}
              />
            </div>
            <p className="text-xs text-gray-500">Use alphanumeric characters, hyphens, and underscores only</p>
            {customAliasError && (
              <p className={`text-xs ${customAliasError.includes('✓') ? 'text-green-400' : 'text-red-400'}`}>
                {customAliasError}
              </p>
            )}
          </div>
        </div>
      )}

      {displayedUrls.length === 0 ? (
        <div className="bg-slate-900/40 border border-gray-500/20 rounded-2xl p-16 text-center">
          <p className="text-gray-400 mb-6 text-lg">
            {activeTab === 'custom' ? 'No custom aliases yet' : 'No shortened links yet'}
          </p>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-medium transition border border-gray-500/20"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Link Cards */}
          {displayedUrls.map((url) => (
            <div
              key={url.shortId}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-gray-500/30 rounded-2xl p-6 hover:border-gray-500/60 transition-all hover:shadow-2xl hover:shadow-black/40 hover:scale-[1.02] flex flex-col h-full"
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
              <div className="mb-4 flex-grow">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Original Link</p>
                <p className="text-sm text-gray-300 break-all line-clamp-2" title={url.originalUrl}>
                  {url.originalUrl}
                </p>
              </div>

              {/* Custom Alias Badge */}
              {url.customAlias && (
                <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-1">Custom Alias</p>
                  <p className="text-sm font-mono text-blue-300">{url.customAlias}</p>
                  <p className="text-xs text-gray-600 font-mono mt-2">Backup ID: {url.shortId}</p>
                </div>
              )}

              {/* Custom Alias Creation Form - Only show for non-custom URLs when in custom tab */}
              {!url.customAlias && activeTab === 'custom' && (
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold mb-2">Add Custom Alias</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1">
                      <span className="text-xs text-gray-500">localhost:3000/</span>
                      <input
                        type="text"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value.toLowerCase())}
                        placeholder="alias"
                        className="flex-1 bg-black/30 text-gray-100 placeholder-gray-600 rounded text-xs px-2 py-1 border border-gray-500/20 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled={customAliasLoading}
                      />
                    </div>
                    <button
                      onClick={() => handleCreateCustomAlias(url.originalUrl)}
                      disabled={customAliasLoading}
                      className="bg-purple-950/40 hover:bg-purple-950/60 disabled:opacity-50 text-purple-300 px-2 py-1 rounded text-xs font-medium transition"
                    >
                      {customAliasLoading ? '...' : 'Add'}
                    </button>
                  </div>
                </div>
              )}

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
      )}
    </div>
  );
}
