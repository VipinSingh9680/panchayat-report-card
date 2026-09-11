'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';

const GRADIENT_CLASSES = [
    'from-emerald-500 to-teal-500',
    'from-teal-500 to-cyan-500',
    'from-blue-500 to-indigo-500',
    'from-violet-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-orange-500',
    'from-lime-500 to-green-500',
    'from-cyan-500 to-blue-500',
];

const CategoriesSection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const categories = useAppStore((s) => s.categories);
    const projects = useAppStore((s) => s.projects);

    const categoryCounts = useMemo(() => {
        const counts = new Map<string, number>();
        projects
            .filter((p) => p.status === 'published' && p.category_id)
            .forEach((p) => {
                const catId = p.category_id as string;
                counts.set(catId, (counts.get(catId) || 0) + 1);
            });
        return counts;
    }, [projects]);

    const handleCategoryClick = (categoryId: string): void => {
        const el = document.querySelector('#all-projects');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
        const event = new CustomEvent('filterCategory', { detail: categoryId });
        window.dispatchEvent(event);
    };

    return (
        <section
            id="categories"
            className="py-16 md:py-24 bg-white"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
                        {t.categories.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((cat, index) => {
                        const count = categoryCounts.get(cat.id) || 0;
                        if (count === 0) return null;

                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className="group relative overflow-hidden rounded-2xl md:rounded-3xl
                                    p-5 md:p-7 text-left
                                    shadow-lg hover:shadow-2xl
                                    transform hover:scale-[1.03] active:scale-[0.98]
                                    transition-all duration-300
                                    min-h-[140px] flex flex-col justify-between">
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${
                                        GRADIENT_CLASSES[index % GRADIENT_CLASSES.length]
                                    } opacity-90 group-hover:opacity-100 transition-opacity`}
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

                                <div className="relative z-10">
                                    <span className="text-4xl md:text-5xl block mb-3">
                                        {cat.icon}
                                    </span>
                                    <h3 className="text-base md:text-lg font-bold text-white leading-snug">
                                        {lang === 'hi' ? cat.name_hi : cat.name_en}
                                    </h3>
                                </div>

                                <div className="relative z-10 mt-3">
                                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                                        {count} {t.categories.completedWorks}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;
