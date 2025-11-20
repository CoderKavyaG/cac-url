import React from 'react';

export default function DashboardHeader({ user, loading, onRefresh }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Statistics
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {user?.email || 'Anonymous'}
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
      >
        {loading ? 'Refreshing...' : '⟳ Refresh'}
      </button>
    </div>
  );
}
