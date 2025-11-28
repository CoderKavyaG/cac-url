import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ClickAnalyticsChart = ({ clickHistory = [] }) => {
    const [showQR, setShowQR] = useState(false);

    // Process click data by date
    const clicksByDate = {};
    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    clickHistory.forEach(click => {
        const date = new Date(click.timestamp).toLocaleDateString();
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    const dateChartData = Object.entries(clicksByDate).map(([date, count]) => ({
        date,
        clicks: count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Process referrer data
    const referrerData = {};
    clickHistory.forEach(click => {
        const referrer = click.referrer || 'Direct';
        let displayReferrer = referrer;
        if (referrer !== 'Direct') {
            try {
                const url = new URL(referrer);
                displayReferrer = url.hostname || referrer;
            } catch (e) {
                displayReferrer = referrer;
            }
        }
        referrerData[displayReferrer] = (referrerData[displayReferrer] || 0) + 1;
    });

    const referrerChartData = Object.entries(referrerData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const totalClicks = clickHistory.length;

    const customTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-gray-500/40 p-3 rounded-lg">
                    <p className="text-white text-sm font-semibold">{payload[0].payload.date || payload[0].payload.name}</p>
                    <p className="text-blue-400 text-sm">{payload[0].name}: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Total Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-950/40 to-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Clicks</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{totalClicks}</p>
                </div>
                <div className="bg-gradient-to-br from-green-950/40 to-green-900/20 border border-green-500/30 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Unique Referrers</p>
                    <p className="text-3xl font-bold text-green-400 mt-2">{Object.keys(referrerData).length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 border border-purple-500/30 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Days Active</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">{dateChartData.length}</p>
                </div>
            </div>

            {/* Clicks Over Time */}
            {dateChartData.length > 0 && (
                <div className="bg-slate-800/40 border border-gray-500/30 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Clicks Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dateChartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.3)" />
                            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip content={customTooltip} />
                            <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Referrers Breakdown */}
            {referrerChartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Bar Chart */}
                    <div className="bg-slate-800/40 border border-gray-500/30 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Referrers</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={referrerChartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.3)" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip content={customTooltip} />
                                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-slate-800/40 border border-gray-500/30 p-6 rounded-xl flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-white mb-4 w-full">Referrer Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={referrerChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {referrerChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} clicks`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Referrer Details Table */}
            {Object.keys(referrerData).length > 0 && (
                <div className="bg-slate-800/40 border border-gray-500/30 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">All Referrers</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(referrerData)
                            .sort((a, b) => b[1] - a[1])
                            .map(([referrer, count]) => (
                                <div key={referrer} className="flex justify-between items-center p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-lg transition">
                                    <span className="text-sm text-gray-300 break-all flex-1">{referrer}</span>
                                    <span className="ml-4 flex items-center gap-2">
                                        <span className="font-semibold text-blue-400">{count}</span>
                                        <span className="text-gray-500 text-xs">
                                            ({((count / totalClicks) * 100).toFixed(1)}%)
                                        </span>
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {clickHistory.length === 0 && (
                <div className="bg-slate-800/40 border border-gray-500/30 p-8 rounded-xl text-center">
                    <p className="text-gray-400">No click data yet. Share your URL to see analytics!</p>
                </div>
            )}
        </div>
    );
};

export default ClickAnalyticsChart;
