import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const AnalyticsList = ({ data, type, total }) => {
    return (
        <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {data.map((item, idx) => {
                const percentage = Math.round((item.value / total) * 100);

                // Content based on type
                let icon;
                if (type === 'referrer') {
                    const domain = item.name === 'Direct / Private' ? 'google.com' : item.name; // Fallback icon
                    icon = (
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                            alt="icon"
                            className="w-5 h-5 mr-3 rounded-sm opacity-80"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    );
                }

                return (
                    <div key={idx} className="relative group">
                        {/* Background Progress Bar */}
                        <div
                            className="absolute inset-0 bg-gray-900/40 rounded-lg transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                        />

                        <div className="relative flex items-center justify-between p-3 rounded-lg z-10">
                            <div className="flex items-center min-w-0">
                                {icon}
                                <span className="text-sm text-gray-200 font-medium truncate max-w-[150px] sm:max-w-[200px]">
                                    {item.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">{item.value.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {data.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">No data available</div>
            )}
        </div>
    );
};

const ClickAnalyticsChart = ({ clickHistory = [] }) => {
    const [filterBy, setFilterBy] = useState('week');

    const stats = useMemo(() => {
        if (!Array.isArray(clickHistory) || clickHistory.length === 0) return null;

        const data = {
            timeline: [],
            referrers: {}
        };

        // 1. Timeline
        if (filterBy === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            // Create last 7 days array dynamically
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                last7Days.push({
                    date: d.toISOString().split('T')[0],
                    label: days[d.getDay()],
                    value: 0
                });
            }

            clickHistory.forEach(c => {
                if (!c.timestamp) return;
                const d = c.timestamp.split('T')[0];
                const dayStat = last7Days.find(x => x.date === d);
                if (dayStat) dayStat.value++;
            });
            data.timeline = last7Days;
        } else {
            // Hours
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
            // Referrer
            let ref = click.referrer || 'Direct / Private';
            try {
                if (ref.startsWith('http')) {
                    const url = new URL(ref);
                    ref = url.hostname.replace('www.', '');
                }
            } catch (e) { }
            if (ref === 'Direct' || ref === 'Unknown' || ref === 'direct') ref = 'Direct / Private';

            data.referrers[ref] = (data.referrers[ref] || 0) + 1;
        });

        const toList = (obj) => Object.entries(obj)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return {
            timeline: data.timeline,
            referrers: toList(data.referrers),
            total: clickHistory.length
        };

    }, [clickHistory, filterBy]);

    if (!stats) {
        return (
            <div className="bg-black border border-gray-800 rounded-xl p-12 text-center">
                <p className="text-gray-500">No data available yet.</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">

            {/* Main Graph Card */}
            <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">Visitors</h3>
                        <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                    </div>
                    <div className="flex bg-gray-900 rounded-lg p-1">
                        {['week', 'hours'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilterBy(f)}
                                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filterBy === f
                                        ? 'bg-gray-800 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {f === 'week' ? 'Last 7 Days' : '24 Hours'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.timeline}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: '#525252', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fill: '#525252', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Grid for Bottom Cards */}
            <div className="grid grid-cols-1 gap-6">

                {/* Referrers Card */}
                <div className="bg-black border border-gray-800 rounded-xl p-6 flex flex-col h-full">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Top Referrers</h3>
                    <AnalyticsList
                        data={stats.referrers}
                        type="referrer"
                        total={stats.total}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClickAnalyticsChart;
