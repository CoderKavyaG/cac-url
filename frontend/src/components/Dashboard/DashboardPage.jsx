import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { urlApi } from '../../services/api';
import { FiCopy, FiTrash2, FiEye, FiLock, FiRefreshCw, FiDownload, FiShare2 } from 'react-icons/fi';
import QRCodeDisplay from './QRCodeDisplay';
import ShareModal from '../ShareModal';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function DashboardPage({ setCurrentPage, onViewLink, onShowAuthModal }) {
  const { user, token } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [showQR, setShowQR] = useState(null);
  const [showShare, setShowShare] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState({});

  // If not logged in, show locked message
  if (!user) {
    return (
      <div className="w-full">
        <h1 className="text-4xl font-bold text-white mb-8">Your Shortened Links</h1>
        <div className="bg-black border border-gray-800 rounded-2xl p-16 text-center shadow-2xl shadow-purple-900/10">
          <FiLock size={64} className="mx-auto mb-6 text-purple-500/50" />
          <h2 className="text-2xl font-bold text-gray-200 mb-3">Dashboard is Locked</h2>
          <p className="text-gray-400 mb-8 text-lg">Sign in to access your shortened links and analytics</p>
          <button
            onClick={onShowAuthModal}
            className="bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 px-8 py-3 rounded-lg font-medium transition border border-purple-500/30"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const fetchUrls = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await urlApi.getAll();
      setUrls(response.data?.urls || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (user && token) {
      fetchUrls();
    }
  }, [user, token, fetchUrls]);

  // Update expiration countdown timer every minute
  useEffect(() => {
    const updateCountdown = () => {
      const newDaysRemaining = {};
      urls.forEach(url => {
        if (url.expiresAt) {
          const expiryDate = new Date(url.expiresAt);
          const now = new Date();
          const msRemaining = expiryDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
          newDaysRemaining[url.shortId] = Math.max(0, daysLeft);
        }
      });
      setDaysRemaining(newDaysRemaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [urls]);

  const handleCopy = (url) => {
    const urlToCopy = url.customAlias 
      ? `${API_URL}/${url.customAlias}`
      : `${API_URL}/${url.shortId}`;
    
    navigator.clipboard.writeText(urlToCopy);
    setCopied(url.shortId);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (shortId) => {
    if (!window.confirm('Delete this URL? It can be recovered within 30 days.')) return;
    
    try {
      await urlApi.delete(shortId);
      setUrls(urls.filter(url => url.shortId !== shortId));
      setError('');
    } catch (err) {
      setError(err.message);
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
          className="bg-black hover:bg-gray-900 disabled:opacity-50 text-purple-300 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 border border-gray-800 shadow-lg shadow-purple-900/10"
          title="Refresh links"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Sort Controls */}
      {urls.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <span className="text-gray-400 text-sm font-semibold py-2">Sort by:</span>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'latest'
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                : 'bg-black text-gray-300 hover:bg-gray-900 border border-gray-800'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => setSortBy('oldest')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'oldest'
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                : 'bg-black text-gray-300 hover:bg-gray-900 border border-gray-800'
            }`}
          >
            Oldest
          </button>
          <button
            onClick={() => setSortBy('mostClicks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'mostClicks'
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                : 'bg-black text-gray-300 hover:bg-gray-900 border border-gray-800'
            }`}
          >
            Most Clicks
          </button>
          <button
            onClick={() => setSortBy('leastClicks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              sortBy === 'leastClicks'
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                : 'bg-black text-gray-300 hover:bg-gray-900 border border-gray-800'
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



      {urls.length === 0 ? (
        <div className="bg-black border border-gray-800 rounded-2xl p-16 text-center shadow-2xl shadow-purple-900/10">
          <p className="text-gray-400 mb-6 text-lg">
            No shortened links yet
          </p>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 px-8 py-3 rounded-lg font-medium transition border border-purple-500/30"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="border border-gray-800 rounded-2xl p-4 md:p-8 min-h-screen bg-black/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-max">
            {/* Link Cards */}
            {getSortedUrls().map((url) => (
              <div
                key={url.shortId}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-900/20 hover:scale-[1.02] flex flex-col group"
              >
                {/* Header with Delete Icon */}
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 md:mb-2">Short URL</p>
                    <p className="text-base md:text-lg font-mono font-bold text-white truncate" title={`${API_URL}/${url.customAlias || url.shortId}`}>
                      {url.customAlias || url.shortId}
                    </p>
                  </div>
                  {/* Delete Icon Button */}
                  <button
                    onClick={() => handleDelete(url.shortId)}
                    className="flex-shrink-0 p-1.5 md:p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition opacity-0 group-hover:opacity-100 md:opacity-100"
                    title="Delete link"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                {/* Clicks Counter */}
                <div className="text-right mb-3 md:mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Clicks</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">{url.clicks || 0}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-500/20 my-2 md:my-3"></div>

                {/* Original URL */}
                <div className="mb-3 md:mb-4 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 md:mb-2">Original Link</p>
                  <p className="text-sm text-gray-300 break-all line-clamp-2" title={url.originalUrl}>
                    {url.originalUrl}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="text-xs text-gray-600 mb-3 md:mb-4 space-y-0.5 md:space-y-1">
                  <div>Created: {formatDate(url.createdAt)}</div>
                  {url.expiresAt && (
                    <div className="text-orange-500 font-semibold text-sm">
                      ⏰ Expiring in {daysRemaining[url.shortId] ?? '...'} days
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5 md:gap-2 mt-auto flex-wrap md:flex-nowrap">
                  <button
                    onClick={() => handleCopy(url)}
                    className={`flex-1 min-w-fit px-2 md:px-3 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition flex items-center justify-center gap-1 md:gap-2 ${
                      copied === url.shortId
                        ? 'bg-green-900/40 text-green-300 border border-green-500/40'
                        : 'bg-black hover:bg-gray-900 text-white border border-gray-800'
                    }`}
                    title="Copy link"
                  >
                    <FiCopy size={16} />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                  <button
                    onClick={() => setShowQR(url)}
                    className="flex-1 min-w-fit px-2 md:px-3 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium text-white bg-black hover:bg-gray-900 transition flex items-center justify-center gap-1 md:gap-2 border border-gray-800"
                    title="View QR Code"
                  >
                    <FiDownload size={16} />
                    <span className="hidden sm:inline">QR</span>
                  </button>
                  <button
                    onClick={() => setShowShare(url)}
                    className="flex-1 min-w-fit px-2 md:px-3 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium text-purple-300 bg-purple-900/30 hover:bg-purple-900/50 transition flex items-center justify-center gap-1 md:gap-2 border border-purple-500/30 hover:border-purple-500/50"
                    title="Share link"
                  >
                    <FiShare2 size={16} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={() => onViewLink(url)}
                    className="flex-1 min-w-fit px-2 md:px-3 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium text-white bg-black hover:bg-gray-900 transition flex items-center justify-center gap-1 md:gap-2 border border-gray-800"
                    title="View analytics"
                  >
                    <FiEye size={16} />
                    <span className="hidden sm:inline">Stats</span>
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

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          url={showShare}
          onClose={() => setShowShare(null)}
        />
      )}
    </div>
  );
}
