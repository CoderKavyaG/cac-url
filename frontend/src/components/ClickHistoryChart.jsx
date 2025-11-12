import React from "react";

export default function ClickHistoryChart({ clickHistory }) {
  // Group clicks by day
  const groupByDay = (history) => {
    const grouped = {};

    history.forEach((click) => {
      const date = new Date(click.timestamp).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  const groupedData = groupByDay(clickHistory);
  const maxClicks = Math.max(...groupedData.map((d) => d[1]), 1);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mt-4">
      <h3 className="text-white font-semibold mb-4">Click History (Last 7 Days)</h3>

      {groupedData.length === 0 ? (
        <p className="text-gray-400 text-sm">No clicks yet</p>
      ) : (
        <div className="space-y-2">
          {groupedData.slice(-7).map(([date, count]) => (
            <div key={date} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-400">{date}</div>
              <div className="flex-1 bg-slate-900 rounded h-8 flex items-center overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    width: `${(count / maxClicks) * 100}%`,
                    minWidth: count > 0 ? "30px" : "0",
                  }}
                >
                  {count > 0 ? count : ""}
                </div>
              </div>
              <div className="w-12 text-right text-gray-300 text-sm">{count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
