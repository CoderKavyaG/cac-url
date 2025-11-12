import React, { useState } from "react";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

export default function SearchAndFilter({ urls, onFilter }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterByClicks, setFilterByClicks] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterUrls(value, sortBy, filterByClicks);
  };

  const handleSort = (value) => {
    setSortBy(value);
    filterUrls(searchTerm, value, filterByClicks);
  };

  const handleFilterClicks = (value) => {
    setFilterByClicks(value);
    filterUrls(searchTerm, sortBy, value);
  };

  const filterUrls = (search, sort, clicks) => {
    let filtered = [...urls];

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(
        (url) =>
          url.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
          url.shortId.toLowerCase().includes(search.toLowerCase()) ||
          (url.customAlias && url.customAlias.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Click filter
    if (clicks === "popular") {
      filtered = filtered.filter((url) => url.clicks >= 5);
    } else if (clicks === "new") {
      filtered = filtered.filter((url) => url.clicks === 0);
    }

    // Sort
    if (sort === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === "clicks-high") {
      filtered.sort((a, b) => b.clicks - a.clicks);
    } else if (sort === "clicks-low") {
      filtered.sort((a, b) => a.clicks - b.clicks);
    }

    onFilter(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("recent");
    setFilterByClicks("all");
    filterUrls("", "recent", "all");
  };

  const hasActiveFilters =
    searchTerm.trim() || sortBy !== "recent" || filterByClicks !== "all";

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3">
        <FiSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search URLs, aliases..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Filter Button & Active Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg transition"
        >
          <FiFilter size={16} />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition"
          >
            <FiX size={14} />
            Clear All
          </button>
        )}

        {searchTerm && (
          <span className="text-sm text-gray-400">
            Found: <span className="text-white font-semibold">{urls.length} results</span>
          </span>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          {/* Sort By */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="clicks-high">Most Clicks</option>
              <option value="clicks-low">Least Clicks</option>
            </select>
          </div>

          {/* Filter by Clicks */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Click Status</label>
            <select
              value={filterByClicks}
              onChange={(e) => handleFilterClicks(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All URLs</option>
              <option value="popular">Popular (5+ clicks)</option>
              <option value="new">New (0 clicks)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
