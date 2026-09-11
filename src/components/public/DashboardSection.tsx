'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { calculateDashboardStats } from '@/lib/utils';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { CheckCircle, Layers, MapPin, IndianRupee } from 'lucide-react';

const CHART_COLORS = [
    '#059669', '#0d9488', '#0891b2', '#2563eb',
    '#7c3aed', '#db2777', '#ea580c', '#ca8a04',
];

const DashboardSection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const projects = useAppStore((s) => s.projects);
    const categories = useAppStore((s) => s.categories);

    const stats = useMemo(
        () => calculateDashboardStats(projects, categories),
        [projects, categories]
    );

    const chartData = useMemo(
        () =>
            stats.categoryStats.map((cs) => ({
                name: lang === 'hi' ? cs.name_hi : cs.name_en,
                icon: cs.icon,
                count: cs.count,
            })),
        [stats.categoryStats, lang]
    );

    const statCards = [
        {
            icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
            value: stats.totalProjects,
            suffix: '+',
            label: t.dashboard.totalProjects,
            bg: 'from-emerald-50 to-teal-50',
            border: 'border-emerald-200',
        },
        {
            icon: <Layers className="w-8 h-8 text-teal-600" />,
            value: stats.totalCategories,
            suffix: '',
            label: t.dashboard.categories,
            bg: 'from-teal-50 to-cyan-50',
            border: 'border-teal-200',
        },
        {
            icon: <MapPin className="w-8 h-8 text-blue-600" />,
            value: stats.totalWards,
            suffix: '',
            label: t.dashboard.wards,
            bg: 'from-blue-50 to-indigo-50',
            border: 'border-blue-200',
        },
    ];

    if (stats.totalCostLakhs > 0) {
        statCards.push({
            icon: <IndianRupee className="w-8 h-8 text-amber-600" />,
            value: Math.round(stats.totalCostLakhs),
            suffix: ` ${t.dashboard.lakhs}`,
            label: t.dashboard.totalCost,
            bg: 'from-amber-50 to-orange-50',
            border: 'border-amber-200',
        });
    }

    return (
        <section
            id="dashboard"
            className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
                        {t.dashboard.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-14 md:mb-20">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className={`relative overflow-hidden rounded-2xl md:rounded-3xl
                                bg-gradient-to-br ${card.bg} border ${card.border}
                                p-5 md:p-7 text-center
                                shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                            <div className="flex justify-center mb-3">{card.icon}</div>
                            <div className="mb-2">
                                <AnimatedCounter
                                    end={card.value}
                                    suffix={card.suffix}
                                    prefix={card.label === t.dashboard.totalCost ? '₹' : ''}
                                />
                            </div>
                            <p className="text-sm md:text-base text-slate-600 font-medium">
                                {card.label}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-5 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 text-center">
                        {t.dashboard.chartTitle}
                    </h3>
                    <div className="w-full" style={{ height: Math.max(300, chartData.length * 50) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 14 }} allowDecimals={false} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 13 }}
                                    width={140}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        fontFamily: "'Noto Sans Devanagari', sans-serif",
                                    }}
                                    formatter={(value) => [
                                        `${value} ${lang === 'hi' ? 'कार्य' : 'works'}`,
                                        '',
                                    ]}
                                />
                                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={28}>
                                    {chartData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardSection;
