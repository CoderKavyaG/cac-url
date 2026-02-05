import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ClickAnalyticsChart = ({ clickHistory = [] }) => {
    const [filterBy, setFilterBy] = useState('week');

    // Debug: Log what we're receiving
    console.log('ClickAnalyticsChart received:', {
        clickHistoryLength: clickHistory.length,
        clickHistory: clickHistory,
        isArray: Array.isArray(clickHistory)
    });

    // Simple data transformation
    const getChartData = () => {
        if (!Array.isArray(clickHistory) || clickHistory.length === 0) {
            console.log('No click history data');
            return [];
        }

        if (filterBy === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayData = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

            clickHistory.forEach((click) => {
                if (click && click.timestamp) {
                    try {
                        const date = new Date(click.timestamp);
                        if (!isNaN(date.getTime())) {
                            const day = date.getDay();
                            dayData[day]++;
                        }
                    } catch (e) {
                        console.warn('Invalid timestamp:', click.timestamp);
                    }
                }
            });

            const result = days.map((day, index) => ({
                label: day,
                value: dayData[index]
            }));
            
            console.log('Week data:', result);
            return result;
        } else {
            // 24 hours
            const hourData = {};
            for (let i = 0; i < 24; i++) {
                hourData[i] = 0;
            }

            clickHistory.forEach(click => {
                if (click && click.timestamp) {
                    try {
                        const date = new Date(click.timestamp);
                        if (!isNaN(date.getTime())) {
                            const hour = date.getHours();
                            hourData[hour]++;
                        }
                    } catch (e) {
                        console.warn('Invalid timestamp:', click.timestamp);
                    }
                }
            });

            const result = Object.entries(hourData).map(([hour, count]) => ({
                label: `${hour}h`,
                value: count
            }));
            
            console.log('Hour data:', result);
            return result;
        }
    };

    const chartData = getChartData();
    const totalClicks = Array.isArray(clickHistory) ? clickHistory.length : 0;

    console.log('Chart render:', { totalClicks, chartDataLength: chartData.length });

    return (
        <div className="w-full space-y-6">
            {/* Filter Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => setFilterBy('week')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        filterBy === 'week'
                            ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-lg shadow-purple-500/20'
                            : 'bg-black text-gray-400 border border-gray-800 hover:border-purple-500/30 hover:text-purple-300'
                    }`}
                >
                    Week
                </button>
                <button
                    onClick={() => setFilterBy('hours')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        filterBy === 'hours'
                            ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 shadow-lg shadow-purple-500/20'
                            : 'bg-black text-gray-400 border border-gray-800 hover:border-purple-500/30 hover:text-purple-300'
                    }`}
                >
                    24 Hours
                </button>
            </div>

            {/* Graph Container */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full shadow-2xl shadow-purple-900/10">
                <h3 className="text-xl font-bold text-white mb-2">Clicks Over Time</h3>
                <p className="text-gray-400 text-sm mb-6">Total: <span className="text-purple-400 font-bold">{totalClicks} clicks</span></p>

                {totalClicks > 0 && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                            <XAxis 
                                dataKey="label" 
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <YAxis 
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: '#000000',
                                    border: '1px solid rgba(147, 51, 234, 0.5)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(147, 51, 234, 0.2)'
                                }}
                                labelStyle={{ color: '#c4b5fd' }}
                                formatter={(value) => [value, 'Clicks']}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#a855f7"
                                dot={{ fill: '#a855f7', r: 5, strokeWidth: 2, stroke: '#581c87' }}
                                strokeWidth={3}
                                isAnimationActive={true}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                        <p>No data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClickAnalyticsChart;
