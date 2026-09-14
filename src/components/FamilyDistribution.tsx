import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MoodEntry } from '../types/mood';
import { calculateFamilyDistribution } from '../utils/trendCalculations';

interface FamilyDistributionProps {
    entries: MoodEntry[];
}

export default function FamilyDistribution({ entries }: FamilyDistributionProps) {
    const data = useMemo(() => calculateFamilyDistribution(entries), [entries]);

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-80 flex flex-col items-center justify-center border border-white/10 border-dashed rounded-3xl bg-black/40 backdrop-blur-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <span className="text-2xl opacity-50">🧭</span>
                </div>
                <h3 className="text-lg text-white/70 mb-2 font-medium">No Emotional Center Yet</h3>
                <p className="text-white/40 text-sm tracking-widest uppercase">Log at least one entry to reveal your family distribution</p>
            </div>
        );
    }

    return (
        <div className="w-full h-80 bg-black/40 backdrop-blur-xl border border-white/15 rounded-3xl p-6 relative flex flex-col items-center shadow-2xl">
            <div className="text-center w-full mb-4">
                <h3 className="text-lg font-light tracking-wide">Emotional Center</h3>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1 block">Family Proportions</span>
            </div>

            <div className="w-full flex-grow relative -mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value: any, name: any) => [`${value} logs`, String(name)]}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center text overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center mt-4">
                        <span className="text-3xl font-light text-white">{data[0]?.name || ''}</span>
                        <span className="block text-xs uppercase tracking-widest text-white/40 mt-1">Dominant</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
