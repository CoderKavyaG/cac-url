import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCopy } from 'react-icons/fi';
import { 
  FaGoogle, 
  FaTwitter, 
  FaLinkedin, 
  FaFacebook, 
  FaReddit, 
  FaGithub, 
  FaLink 
} from 'react-icons/fa';
import ClickAnalyticsChart from './ClickAnalyticsChart';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function LinkDetailsPage({ link, onBack }) {
  const [copied, setCopied] = useState(false);
  const [referrers, setReferrers] = useState([]);

  // Debug log
  console.log('LinkDetailsPage received link:', {
    clicks: link.clicks,
    clickHistoryLength: link.clickHistory ? link.clickHistory.length : 0,
    clickHistory: link.clickHistory,
    shortId: link.shortId
  });

  useEffect(() => {
    // Parse real referrer data from clickHistory
    if (link.clickHistory && Array.isArray(link.clickHistory)) {
      const referrerMap = {};
      
      link.clickHistory.forEach(click => {
        const referer = click.referer || 'Direct';
        referrerMap[referer] = (referrerMap[referer] || 0) + 1;
      });

      // Sort by count and convert to array
      const sortedReferrers = Object.entries(referrerMap)
        .map(([referrer, count]) => ({ referrer, clicks: count }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      setReferrers(sortedReferrers);
    }
  }, [link]);

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

  // Calculate clicks over last 7 days from real data
  const getClickHistoryData = () => {
    const now = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toDateString(),
        clicks: 0
      });
    }

    // Count clicks per day
    if (link.clickHistory && Array.isArray(link.clickHistory)) {
      link.clickHistory.forEach(click => {
        const clickDate = new Date(click.timestamp).toDateString();
        const dayData = days.find(d => d.date === clickDate);
        if (dayData) dayData.clicks++;
      });
    }

    return days;
  };

  const clickHistory = getClickHistoryData();
  const maxClicks = Math.max(...clickHistory.map(d => d.clicks), 1);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-purple-900/20 rounded-lg transition flex items-center justify-center text-gray-400 hover:text-purple-300"
          title="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-white">Link Analytics</h1>
          <p className="text-gray-400 mt-1">Track performance and engagement</p>
        </div>
      </div>

      {/* Link Info Card */}
      <div className="bg-black border border-gray-800 rounded-2xl p-8 mb-8 shadow-2xl shadow-purple-900/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Original Link</p>
            <p className="text-white font-mono break-all text-sm md:text-base">{link.originalUrl}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Short Link</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono font-bold text-sm md:text-base">{API_URL.replace(/https?:\/\//, '')}/{link.shortId}</p>
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition ${
                  copied
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Clicks</p>
            <p className="text-3xl font-bold text-purple-300">{link.clicks || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Created</p>
            <p className="text-lg text-gray-300">{formatDate(link.createdAt)}</p>
          </div>
          {link.customAlias && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Custom Alias</p>
              <p className="text-lg text-gray-300 font-mono">{link.customAlias}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Status</p>
            <p className="text-lg text-green-400 font-bold">Active</p>
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
          className="bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 px-6 py-2 rounded-lg font-medium transition border border-purple-500/30"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
