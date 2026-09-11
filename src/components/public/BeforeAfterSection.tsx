'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getLocalizedField, formatCostLakhs } from '@/lib/utils';
import ReactCompareImage from 'react-compare-image';
import { CheckCircle2 } from 'lucide-react';

const BeforeAfterSection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const getFeaturedProjects = useAppStore((s) => s.getFeaturedProjects);

    const featured = useMemo(() => getFeaturedProjects(), [getFeaturedProjects]);

    if (featured.length === 0) return <></>;

    return (
        <section
            id="before-after"
            className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
                        {t.beforeAfter.title}
                    </h2>
                    <p className="text-lg text-slate-500">{t.beforeAfter.subtitle}</p>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full mt-4" />
                </div>

                <div className="flex flex-col gap-10 md:gap-14">
                    {featured.map((project) => {
                        const title = getLocalizedField(project, 'title', lang);
                        const description = getLocalizedField(project, 'description', lang);
                        const beforeImg = project.images?.find((i) => i.image_type === 'before');
                        const afterImg = project.images?.find((i) => i.image_type === 'after');

                        if (!beforeImg || !afterImg) return null;

                        return (
                            <div
                                key={project.id}
                                className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden
                                    hover:shadow-2xl transition-shadow duration-300">
                                <div className="relative">
                                    <div className="aspect-[4/3] md:aspect-[16/9]">
                                        <ReactCompareImage
                                            leftImage={beforeImg.image_url}
                                            rightImage={afterImg.image_url}
                                            leftImageLabel={t.beforeAfter.before}
                                            rightImageLabel={t.beforeAfter.after}
                                            sliderLineWidth={3}
                                            sliderLineColor="#ffffff"
                                            handleSize={44}
                                        />
                                    </div>
                                </div>

                                <div className="p-5 md:p-8">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                                            <CheckCircle2 className="w-4 h-4" />
                                            {lang === 'hi' ? '✅ कार्य पूर्ण' : '✅ Completed'}
                                        </span>
                                        {project.ward && (
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">
                                                {project.ward}
                                            </span>
                                        )}
                                        {project.completion_year && (
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">
                                                {project.completion_year}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                                        {title}
                                    </h3>

                                    {description && (
                                        <p className="text-base text-slate-600 leading-relaxed mb-3">
                                            {description}
                                        </p>
                                    )}

                                    {project.cost_lakhs && project.cost_lakhs > 0 && (
                                        <p className="text-sm font-semibold text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full">
                                            {lang === 'hi' ? 'लागत' : 'Cost'}:{' '}
                                            {formatCostLakhs(project.cost_lakhs)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default BeforeAfterSection;
