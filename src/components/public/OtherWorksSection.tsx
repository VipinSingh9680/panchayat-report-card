'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getLocalizedField } from '@/lib/utils';
import { MapPin, Calendar } from 'lucide-react';

const OtherWorksSection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const otherWorks = useAppStore((s) => s.otherWorks);

    const published = useMemo(
        () => otherWorks.filter((w) => w.status === 'published'),
        [otherWorks]
    );

    if (published.length === 0) return <></>;

    return (
        <section
            id="other-works"
            className="py-16 md:py-24 bg-gradient-to-b from-amber-50/60 to-orange-50/40"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
                        {t.otherWorks.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                    {published.map((work) => {
                        const title = getLocalizedField(work, 'title', lang);
                        const description = getLocalizedField(work, 'description', lang);
                        const location = getLocalizedField(work, 'location', lang);
                        const primaryImage = work.images?.[0];

                        return (
                            <div
                                key={work.id}
                                className="group bg-white rounded-2xl shadow-md border border-amber-100
                                    overflow-hidden hover:shadow-xl transition-all duration-300">
                                {primaryImage && (
                                    <div className="relative aspect-[3/2] overflow-hidden bg-amber-50">
                                        <img
                                            src={primaryImage.image_url}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        {work.category && (
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold">
                                                    {work.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-4 md:p-5">
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug">
                                        {title}
                                    </h3>

                                    {description && (
                                        <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-3">
                                            {description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-3 border-t border-slate-50">
                                        {location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {location}
                                            </span>
                                        )}
                                        {work.event_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(work.event_date).toLocaleDateString(
                                                    lang === 'hi' ? 'hi-IN' : 'en-IN',
                                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default OtherWorksSection;
