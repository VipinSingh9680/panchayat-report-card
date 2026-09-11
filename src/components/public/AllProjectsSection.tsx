'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getLocalizedField } from '@/lib/utils';
import ProjectCard from './ProjectCard';
import { Search, Filter, X } from 'lucide-react';

const AllProjectsSection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const projects = useAppStore((s) => s.projects);
    const categories = useAppStore((s) => s.categories);
    const getPublishedProjects = useAppStore((s) => s.getPublishedProjects);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedWard, setSelectedWard] = useState('all');

    const published = useMemo(() => getPublishedProjects(), [getPublishedProjects]);

    const years = useMemo(() => {
        const uniqueYears = new Set(
            published.map((p) => p.completion_year).filter(Boolean) as number[]
        );
        return Array.from(uniqueYears).sort((a, b) => b - a);
    }, [published]);

    const wards = useMemo(() => {
        const uniqueWards = new Set(
            published.map((p) => p.ward).filter(Boolean) as string[]
        );
        return Array.from(uniqueWards).sort();
    }, [published]);

    const handleCategoryFilter = useCallback((e: Event) => {
        const customEvent = e as CustomEvent<string>;
        setSelectedCategory(customEvent.detail);
    }, []);

    useEffect(() => {
        window.addEventListener('filterCategory', handleCategoryFilter);
        return () => window.removeEventListener('filterCategory', handleCategoryFilter);
    }, [handleCategoryFilter]);

    const filtered = useMemo(() => {
        return published.filter((project) => {
            if (selectedCategory !== 'all' && project.category_id !== selectedCategory) {
                return false;
            }
            if (selectedYear !== 'all' && project.completion_year !== Number(selectedYear)) {
                return false;
            }
            if (selectedWard !== 'all' && project.ward !== selectedWard) {
                return false;
            }
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const title = getLocalizedField(project, 'title', lang).toLowerCase();
                const desc = getLocalizedField(project, 'description', lang).toLowerCase();
                if (!title.includes(query) && !desc.includes(query)) {
                    return false;
                }
            }
            return true;
        });
    }, [published, selectedCategory, selectedYear, selectedWard, searchQuery, lang]);

    const hasActiveFilters =
        selectedCategory !== 'all' || selectedYear !== 'all' || selectedWard !== 'all' || searchQuery.trim();

    const clearFilters = (): void => {
        setSelectedCategory('all');
        setSelectedYear('all');
        setSelectedWard('all');
        setSearchQuery('');
    };

    return (
        <section
            id="all-projects"
            className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
                        {t.allProjects.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 p-4 md:p-6 mb-8 md:mb-10">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.allProjects.search}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200
                                text-base text-slate-800 placeholder-slate-400
                                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                min-h-[48px]"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-500 flex-shrink-0">
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                {lang === 'hi' ? 'फ़िल्टर:' : 'Filters:'}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                                    text-sm text-slate-700 min-h-[44px] min-w-[140px]
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="all">
                                    {t.allProjects.all} {t.allProjects.filterCategory}
                                </option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {lang === 'hi' ? cat.name_hi : cat.name_en}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                                    text-sm text-slate-700 min-h-[44px] min-w-[120px]
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="all">
                                    {t.allProjects.all} {t.allProjects.filterYear}
                                </option>
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                                    text-sm text-slate-700 min-h-[44px] min-w-[120px]
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="all">
                                    {t.allProjects.all} {t.allProjects.filterWard}
                                </option>
                                {wards.map((ward) => (
                                    <option key={ward} value={ward}>
                                        {ward}
                                    </option>
                                ))}
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                                        bg-red-50 text-red-600 text-sm font-medium
                                        hover:bg-red-100 transition-colors min-h-[44px]">
                                    <X className="w-4 h-4" />
                                    {lang === 'hi' ? 'सभी हटाएँ' : 'Clear All'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                        {filtered.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                categories={categories}
                                lang={lang}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <span className="text-5xl block mb-4">🔍</span>
                        <p className="text-xl text-slate-500 font-medium">
                            {lang === 'hi' ? 'कोई कार्य नहीं मिला' : 'No projects found'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700
                                    font-medium hover:bg-emerald-200 transition-colors min-h-[48px]">
                                {lang === 'hi' ? 'फ़िल्टर हटाएँ' : 'Clear filters'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllProjectsSection;
