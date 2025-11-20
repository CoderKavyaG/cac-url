import React from 'react';
import { FiCopy, FiTrash2 } from 'react-icons/fi';

export default function UrlManagementSection({
  urls,
  loading,
  error,
  onCopy,
  onDelete,
  copied,
  setCurrentPage,
  formatDate,
}) {
  if (loading && urls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading your URLs...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-white text-xl font-bold mb-6">Your Shortened URLs</h2>

      {error && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      {urls.length === 0 ? (
        <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No URLs yet. Create your first shortened URL!</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Create URL
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {urls.map((url) => (
            <div
              key={url.shortId}
              className="bg-slate-950 border border-purple-700/30 rounded-xl p-6 hover:border-purple-500 transition"
            >
              <p className="text-purple-400 font-mono text-sm font-bold">{url.shortId}</p>
              <p className="text-gray-500 text-xs mt-1 truncate" title={url.originalUrl}>
                {url.originalUrl}
              </p>

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
                  onClick={() => onCopy(url.shortId)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2
                    ${
                      copied === url.shortId
                        ? 'bg-green-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }
                  `}
                >
                  <FiCopy size={16} /> {copied === url.shortId ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => onDelete(url.shortId)}
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
  );
}
