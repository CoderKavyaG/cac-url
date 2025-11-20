import React from 'react';

export default function StatsCard({ label, value, gradient, icon, trend, skeleton }) {
  if (skeleton) {
    return (
      <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-20 mb-3"></div>
        <div className="h-12 bg-gray-700 rounded w-32 mb-4"></div>
        <div className="h-1 bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-purple-700/30 rounded-xl p-6 hover:border-purple-600 transition">
      <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">{label}</p>
      <p className="text-5xl font-bold text-white mb-4">{value}</p>
      <div className={`h-1 bg-gradient-to-r ${gradient} rounded-full`}></div>
      {trend && (
        <p className={`text-xs mt-2 ${trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.percent}%
        </p>
      )}
    </div>
  );
}
