import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const ClickAnalyticsChart = ({ clickHistory = [] }) => {
    const [filterBy, setFilterBy] = useState('week');

    // ----------------------------------------------------------------------
    // Aggregation Logic
    // ----------------------------------------------------------------------
    const stats = useMemo(() => {
        if (!Array.isArray(clickHistory) || clickHistory.length === 0) return null;

        const data = {
            timeline: [],
            browsers: {},
            os: {},
            devices: {},
            countries: {},
            referrers: {}
        };

        // 1. Timeline (existing logic)
        if (filterBy === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayCounts = [0, 0, 0, 0, 0, 0, 0];
            clickHistory.forEach(c => {
                if (!c.timestamp) return;
                const d = new Date(c.timestamp);
                if (!isNaN(d)) dayCounts[d.getDay()]++;
            });
            data.timeline = days.map((day, i) => ({ label: day, value: dayCounts[i] }));
        } else {
            const hourCounts = new Array(24).fill(0);
            clickHistory.forEach(c => {
                if (!c.timestamp) return;
                const d = new Date(c.timestamp);
                if (!isNaN(d)) hourCounts[d.getHours()]++;
            });
            data.timeline = hourCounts.map((val, i) => ({ label: `${i}h`, value: val }));
        }

        // 2. Drill-downs
        clickHistory.forEach(click => {
            // Browser
            let browser = click.browser || 'Unknown';
            if (browser === 'Unknown') browser = 'Other';
            data.browsers[browser] = (data.browsers[browser] || 0) + 1;

            // OS - Removed (skipped)

            // Device
            const device = click.device || 'Desktop';
            data.devices[device] = (data.devices[device] || 0) + 1;

            // Country
            let country = click.country || 'Unknown';
            if (country === 'Unknown') country = 'Unknown Location';
            data.countries[country] = (data.countries[country] || 0) + 1;

            // Referrer
            let ref = click.referrer || 'Direct';
            try {
                if (ref.startsWith('http')) {
                    const url = new URL(ref);
                    ref = url.hostname.replace('www.', '');
                }
            } catch (e) { }

            if (ref === 'Direct' || ref === 'Unknown' || ref === 'direct') {
                ref = 'Direct / Private';
            }

            data.referrers[ref] = (data.referrers[ref] || 0) + 1;
        });

        // Helper to format for Recharts
        const toChartData = (obj) => Object.entries(obj)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        return {
            timeline: data.timeline,
            browsers: toChartData(data.browsers),
            os: toChartData(data.os),
            devices: toChartData(data.devices),
            countries: toChartData(data.countries),
            referrers: toChartData(data.referrers),
        };

    }, [clickHistory, filterBy]);

    if (!clickHistory || clickHistory.length === 0) {
        return (
            <div className="bg-black/50 border border-gray-800 rounded-2xl p-12 text-center">
                <p className="text-gray-400 text-lg">No clicks recorded yet.</p>
                <p className="text-gray-600 text-sm mt-2">Share your link to see analytics!</p>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // Components
    // ----------------------------------------------------------------------
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black border border-purple-500/50 rounded-xl p-3 shadow-xl shadow-purple-900/20">
                    <p className="text-purple-300 font-bold mb-1">{label || payload[0].name}</p>
                    <p className="text-white text-sm">
                        {payload[0].value} clicks ({((payload[0].value / clickHistory.length) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const DonutChart = ({ data, title }) => (
        <div className="bg-black/50 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
            <h3 className="text-lg font-bold text-white mb-4 w-full text-left">{title}</h3>
            <div className="w-full h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center text for total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{clickHistory.length}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-8">

            {/* Main Timeline Chart */}
            <div className="bg-black border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl shadow-purple-900/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Activity over Time</h3>
                        <p className="text-gray-400 text-sm">Track engagement trends</p>
                    </div>
                    <div className="flex bg-gray-900/50 p-1 rounded-xl">
                        {['week', 'hours'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilterBy(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterBy === f
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {f === 'week' ? 'Last 7 Days' : 'Last 24 Hours'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.timeline}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#a855f7', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#a855f7"
                                strokeWidth={3}
                                dot={{ fill: '#000', stroke: '#a855f7', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#a855f7' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Drill Down Grid - Removed OS, now 2 cols */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DonutChart data={stats.devices} title="Devices" />
                <DonutChart data={stats.browsers} title="Browsers" />
            </div>

            {/* Bottom Row: Countries & Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Countries Bar Chart */}
                <div className="bg-black/50 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Top Locations</h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.countries} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fill: '#d1d5db', fontSize: 13 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={<CustomTooltip />}
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {stats.countries.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Referrers List */}
                <div className="bg-black/50 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Traffic Sources</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {stats.referrers.map((ref, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors">
                                <span className={`font-medium truncate max-w-[200px] ${ref.name === 'Direct / Private' ? 'text-gray-500 italic' : 'text-gray-300'}`}>
                                    {ref.name}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-24 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-full"
                                            style={{ width: `${(ref.value / clickHistory.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-white font-bold text-sm w-8 text-right">{ref.value}</span>
                                </div>
                            </div>
                        ))}
                        {stats.referrers.length === 0 && (
                            <p className="text-gray-500 italic text-center py-8">No referrer data available</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ClickAnalyticsChart;
