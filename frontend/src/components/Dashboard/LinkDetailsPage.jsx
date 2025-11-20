import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCopy } from 'react-icons/fi';

export default function LinkDetailsPage({ link, onBack }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullUrl = `http://localhost:3000/${link.shortId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Mock data for click history over time
  const clickHistory = [
    { day: 'Mon', clicks: 12 },
    { day: 'Tue', clicks: 19 },
    { day: 'Wed', clicks: 15 },
    { day: 'Thu', clicks: 25 },
    { day: 'Fri', clicks: 30 },
    { day: 'Sat', clicks: 8 },
    { day: 'Sun', clicks: 5 },
  ];

  const maxClicks = Math.max(...clickHistory.map(d => d.clicks));

  // Mock data for device breakdown
  const deviceBreakdown = [
    { name: 'Mobile', percentage: 65, count: 208 },
    { name: 'Desktop', percentage: 30, count: 96 },
    { name: 'Tablet', percentage: 5, count: 16 },
  ];

  // Mock data for browser breakdown
  const browserBreakdown = [
    { name: 'Chrome', percentage: 45, count: 144 },
    { name: 'Safari', percentage: 25, count: 80 },
    { name: 'Firefox', percentage: 20, count: 64 },
    { name: 'Others', percentage: 10, count: 32 },
  ];

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

        {/* Device Breakdown */}
        <div className="bg-slate-900/40 border border-gray-500/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Device Breakdown</h2>

          <div className="space-y-4">
            {deviceBreakdown.map((device, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-300">{device.name}</p>
                  <p className="text-sm font-bold text-white">{device.percentage}%</p>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-600 h-full rounded-full transition-all"
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{device.count} clicks</p>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="bg-slate-900/40 border border-gray-500/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Browser Breakdown</h2>

          <div className="space-y-4">
            {browserBreakdown.map((browser, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-300">{browser.name}</p>
                  <p className="text-sm font-bold text-white">{browser.percentage}%</p>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-600 h-full rounded-full transition-all"
                    style={{ width: `${browser.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{browser.count} clicks</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-gray-500/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Top Referrers</h2>

          <div className="space-y-3">
            {[
              { referrer: 'Direct', clicks: 142 },
              { referrer: 'Google', clicks: 89 },
              { referrer: 'Twitter', clicks: 45 },
              { referrer: 'LinkedIn', clicks: 28 },
              { referrer: 'Others', clicks: 16 },
            ].map((ref, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <p className="text-sm text-gray-300">{ref.referrer}</p>
                <p className="text-sm font-bold text-white">{ref.clicks} clicks</p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
