'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getProjectsByYear, getLocalizedField } from '@/lib/utils';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

const TimelineSection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const projects = useAppStore((s) => s.projects);
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

    const yearMap = useMemo(() => getProjectsByYear(projects), [projects]);
    const years = useMemo(() => Array.from(yearMap.keys()).reverse(), [yearMap]);

    const toggleYear = (year: number): void => {
        setExpandedYears((prev) => {
            const next = new Set(prev);
            if (next.has(year)) {
                next.delete(year);
            } else {
                next.add(year);
            }
            return next;
        });
    };

    if (years.length === 0) return <></>;

    return (
        <section
            id="timeline"
            className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
                        {t.timeline.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
                </div>

                <div className="relative">
                    <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-300" />

                    <div className="flex flex-col gap-6">
                        {years.map((year) => {
                            const yearProjects = yearMap.get(year) || [];
                            const isExpanded = expandedYears.has(year);

                            return (
                                <div key={year} className="relative pl-16 md:pl-20">
                                    <div
                                        className="absolute left-3.5 md:left-5.5 top-4 w-5 h-5 md:w-5 md:h-5
                                            rounded-full bg-emerald-500 border-4 border-white shadow-md
                                            z-10"
                                    />

                                    <button
                                        onClick={() => toggleYear(year)}
                                        className="w-full flex items-center justify-between
                                            bg-white rounded-2xl shadow-md border border-slate-100
                                            px-5 py-4 hover:shadow-lg transition-shadow
                                            min-h-[56px] text-left">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl md:text-3xl font-extrabold text-emerald-700">
                                                {year}
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                                                {yearProjects.length} {t.timeline.works}
                                            </span>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-slate-400 transition-transform" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-slate-400 transition-transform" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                            {yearProjects.map((project, idx) => {
                                                const title = getLocalizedField(project, 'title', lang);
                                                return (
                                                    <Link
                                                        key={project.id}
                                                        href={`/projects/${project.slug}`}
                                                        className={`flex items-center justify-between px-5 py-3.5
                                                            hover:bg-emerald-50 transition-colors min-h-[48px]
                                                            ${idx > 0 ? 'border-t border-slate-50' : ''}`}>
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                                            <span className="text-base text-slate-700 truncate">
                                                                {title}
                                                            </span>
                                                        </div>
                                                        <ExternalLink className="w-4 h-4 text-slate-300 flex-shrink-0 ml-2" />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
