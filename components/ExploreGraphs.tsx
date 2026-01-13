"use client";

import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid
} from "recharts";

const POPULAR_SKILLS = [
    { name: 'Coding', count: 85, fill: '#60a5fa' }, // blue-400
    { name: 'Music', count: 65, fill: '#c084fc' }, // purple-400
    { name: 'Design', count: 75, fill: '#f472b6' }, // pink-400
    { name: 'Langs', count: 55, fill: '#4ade80' }, // green-400
    { name: 'Cooking', count: 45, fill: '#fb923c' }, // orange-400
    { name: 'Math', count: 30, fill: '#f87171' }, // red-400
];

const ACTIVITY_DATA = [
    { time: 'Mon', exchanges: 12 },
    { time: 'Tue', exchanges: 19 },
    { time: 'Wed', exchanges: 15 },
    { time: 'Thu', exchanges: 25 },
    { time: 'Fri', exchanges: 32 },
    { time: 'Sat', exchanges: 45 },
    { time: 'Sun', exchanges: 38 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0c1121] border border-white/10 p-3 rounded-lg shadow-xl">
                <p className="font-bold text-white mb-1">{label}</p>
                <p className="text-sm text-blue-300">
                    {payload[0].value} {payload[0].name === 'count' ? 'Users' : 'Sessions'}
                </p>
            </div>
        );
    }
    return null;
};

export function ExploreGraphs() {
    return (
        <section className="mb-16 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popularity Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-6 rounded-2xl border border-white/5"
                >
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        🔥 Trending Skills
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={POPULAR_SKILLS} layout="vertical" margin={{ left: -20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    width={60}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                                <Bar
                                    dataKey="count"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Activity Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-6 rounded-2xl border border-white/5"
                >
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        🚀 Weekly Activity
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ACTIVITY_DATA}>
                                <defs>
                                    <linearGradient id="colorExchanges" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="exchanges"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExchanges)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
