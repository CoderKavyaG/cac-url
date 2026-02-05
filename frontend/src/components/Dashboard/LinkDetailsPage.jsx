import React, { useState } from 'react';
import { FiArrowLeft, FiCopy } from 'react-icons/fi';
import ClickAnalyticsChart from './ClickAnalyticsChart';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function LinkDetailsPage({ link, onBack }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullUrl = link.customAlias
      ? `${API_URL}/${link.customAlias}`
      : `${API_URL}/${link.shortId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 bg-black hover:bg-white/5 rounded-xl transition-all duration-200 flex items-center justify-center text-gray-400 hover:text-white border border-gray-800 hover:border-white/20 hover:shadow-lg hover:shadow-black/50"
          title="Go back"
        >
          <FiArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-white">Link Analytics</h1>
          <p className="text-gray-400 mt-1">Track performance and engagement</p>
        </div>
      </div>

      {/* Link Info Card */}
      <div className="bg-black border border-gray-800 rounded-2xl p-8 mb-8 shadow-2xl shadow-black hover:border-white/10 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Original Link</p>
            <p className="text-white font-mono break-all text-sm md:text-base bg-white/5 p-3 rounded-lg border border-gray-800">{link.originalUrl}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Short Link</p>
            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-gray-800">
              <p className="text-white font-mono font-bold text-sm md:text-base flex-1">{API_URL.replace(/https?:\/\//, '')}/{link.shortId}</p>
              <button
                onClick={handleCopy}
                className={`p-2.5 rounded-lg transition-all duration-200 ${copied
                  ? 'bg-green-900/40 text-green-400 border border-green-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                  }`}
              >
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800">
          <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Total Clicks</p>
            <p className="text-3xl font-bold text-white">{link.clicks || 0}</p>
          </div>
          <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Created</p>
            <p className="text-lg text-gray-300">{formatDate(link.createdAt)}</p>
          </div>
          {link.customAlias && (
            <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Custom Alias</p>
              <p className="text-lg text-gray-300 font-mono">{link.customAlias}</p>
            </div>
          )}
          <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Status</p>
            <p className="text-lg text-green-400 font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Active
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Detailed Analytics</h2>
        <ClickAnalyticsChart clickHistory={link.clickHistory || []} />
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={onBack}
          className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/50 flex items-center gap-2"
        >
          <FiArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
