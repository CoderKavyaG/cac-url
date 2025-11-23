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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function LinkDetailsPage({ link, onBack }) {
  const [copied, setCopied] = useState(false);
  const [referrers, setReferrers] = useState([]);

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
          className="p-2 hover:bg-slate-800 rounded-lg transition flex items-center justify-center text-gray-400 hover:text-white"
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
      <div className="bg-slate-900/40 border border-gray-500/10 rounded-2xl p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Original Link</p>
            <p className="text-white font-mono break-all text-sm md:text-base">{link.originalUrl}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Short Link</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono font-bold text-sm md:text-base">localhost:3000/{link.shortId}</p>
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition ${
                  copied
                    ? 'bg-green-600/30 text-green-400'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-500/10">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Clicks</p>
            <p className="text-3xl font-bold text-white">{link.clicks || 0}</p>
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

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Click History Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-gray-500/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Clicks Over Time (Last 7 Days)</h2>

          <div className="flex items-end gap-2 h-48">
            {clickHistory.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-lg hover:from-slate-500 hover:to-slate-400 transition relative group"
                  style={{ height: `${(day.clicks / maxClicks) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                    {day.clicks}
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">{day.day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-slate-900/40 border border-gray-500/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Top Referrers</h2>

          <div className="space-y-3">
            {referrers.length > 0 ? (
              referrers.map((ref, idx) => {
                const getReferrerIcon = (referrer) => {
                  const lower = referrer.toLowerCase();
                  if (lower.includes('google')) return <FaGoogle className="text-blue-400" />;
                  if (lower.includes('twitter') || lower.includes('x.com')) return <FaTwitter className="text-blue-300" />;
                  if (lower.includes('linkedin')) return <FaLinkedin className="text-blue-600" />;
                  if (lower.includes('facebook')) return <FaFacebook className="text-blue-500" />;
                  if (lower.includes('reddit')) return <FaReddit className="text-orange-600" />;
                  if (lower.includes('github')) return <FaGithub className="text-gray-300" />;
                  if (lower === 'direct') return <FaLink className="text-gray-400" />;
                  return <FaLink className="text-gray-400" />;
                };

                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getReferrerIcon(ref.referrer)}
                      </div>
                      <p className="text-sm text-gray-300">{ref.referrer}</p>
                    </div>
                    <p className="text-sm font-bold text-white">{ref.clicks}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-400">
                <p className="text-sm">No referrer data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Width Referrers Table */}
      {referrers.length > 5 && (
        <div className="mt-8 bg-slate-900/40 border border-gray-500/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">All Referrers</h2>

          <div className="space-y-2">
            {referrers.slice(0, 10).map((ref, idx) => {
              const getReferrerIcon = (referrer) => {
                const lower = referrer.toLowerCase();
                if (lower.includes('google')) return <FaGoogle className="text-blue-400" />;
                if (lower.includes('twitter') || lower.includes('x.com')) return <FaTwitter className="text-blue-300" />;
                if (lower.includes('linkedin')) return <FaLinkedin className="text-blue-600" />;
                if (lower.includes('facebook')) return <FaFacebook className="text-blue-500" />;
                if (lower.includes('reddit')) return <FaReddit className="text-orange-600" />;
                if (lower.includes('github')) return <FaGithub className="text-gray-300" />;
                if (lower === 'direct') return <FaLink className="text-gray-400" />;
                return <FaLink className="text-gray-400" />;
              };

              return (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">
                      {getReferrerIcon(ref.referrer)}
                    </div>
                    <p className="text-sm text-gray-300">{ref.referrer}</p>
                  </div>
                  <p className="text-sm font-bold text-white">{ref.clicks} clicks</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={onBack}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition border border-gray-500/20"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
