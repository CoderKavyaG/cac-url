import React, { useState } from 'react';

export default function ClickHistoryChart({ urls, loading }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (loading) {
    return (
      <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-8 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-32 mb-6"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  // Get last 7 URLs
  const last7Urls = urls.slice(-7);

  if (last7Urls.length === 0) {
    return (
      <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-8">
        <h2 className="text-white text-xl font-bold mb-6">Click History</h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">No data available yet</p>
        </div>
      </div>
    );
  }

  // Calculate max clicks for scaling
  const maxClicks = Math.max(...last7Urls.map((u) => u.clicks || 0), 1);

  return (
    <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-8 mb-8">
      <h2 className="text-white text-xl font-bold mb-6">Click History</h2>
      <div className="relative h-64 flex items-end gap-2">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-gray-400 text-xs mr-4 h-full font-semibold">
          <span>{Math.ceil(maxClicks * 0.8)}</span>
          <span>{Math.ceil(maxClicks * 0.6)}</span>
          <span>{Math.ceil(maxClicks * 0.4)}</span>
          <span>{Math.ceil(maxClicks * 0.2)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        {last7Urls.map((url, index) => {
          const heightPercent = (url.clicks / maxClicks) * 100;
          return (
            <div
              key={url.shortId}
              className="flex-1 flex flex-col justify-end items-center relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="w-full bg-gradient-to-t from-purple-500 via-purple-600 to-pink-500 rounded-t-lg hover:from-purple-600 transition-all cursor-pointer"
                style={{
                  height: `${heightPercent}%`,
                  minHeight: '10px',
                }}
              >
                {/* Tooltip */}
                {hoveredIndex === index && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    {url.clicks} clicks
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-2 truncate">{url.shortId.slice(0, 4)}</p>
              <p className="text-gray-500 text-xs">{url.clicks}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
