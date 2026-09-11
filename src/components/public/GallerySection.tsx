'use client';

import { useMemo, useState, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryImage {
    url: string;
    caption: string;
    type: 'before' | 'after' | 'other';
    projectTitle: string;
}

type FilterTab = 'all' | 'before' | 'after' | 'other';

const HOMEPAGE_LIMIT = 12;

const GallerySection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const projects = useAppStore((s) => s.projects);
    const otherWorks = useAppStore((s) => s.otherWorks);

    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);

    const allImages = useMemo(() => {
        const images: GalleryImage[] = [];

        projects
            .filter((p) => p.status === 'published')
            .forEach((p) => {
                const title = lang === 'hi' ? p.title_hi : (p.title_en || p.title_hi);
                p.images?.forEach((img) => {
                    images.push({
                        url: img.image_url,
                        caption: img.caption || title,
                        type: img.image_type === 'before' ? 'before' : 'after',
                        projectTitle: title,
                    });
                });
            });

        otherWorks
            .filter((w) => w.status === 'published')
            .forEach((w) => {
                const title = lang === 'hi' ? w.title_hi : (w.title_en || w.title_hi);
                w.images?.forEach((img) => {
                    images.push({
                        url: img.image_url,
                        caption: img.caption || title,
                        type: 'other',
                        projectTitle: title,
                    });
                });
            });

        return images;
    }, [projects, otherWorks, lang]);

    const filtered = useMemo(() => {
        if (activeTab === 'all') return allImages;
        return allImages.filter((img) => img.type === activeTab);
    }, [allImages, activeTab]);

    const displayed = showAll ? filtered : filtered.slice(0, HOMEPAGE_LIMIT);

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        document.body.style.overflow = 'hidden';
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxIndex(null);
        document.body.style.overflow = '';
    }, []);

    const navigateLightbox = useCallback(
        (direction: 1 | -1) => {
            if (lightboxIndex === null) return;
            const nextIndex = lightboxIndex + direction;
            if (nextIndex >= 0 && nextIndex < displayed.length) {
                setLightboxIndex(nextIndex);
            }
        },
        [lightboxIndex, displayed.length]
    );

    const tabs: { key: FilterTab; label: string }[] = [
        { key: 'all', label: lang === 'hi' ? 'सभी' : 'All' },
        { key: 'before', label: lang === 'hi' ? 'पहले' : 'Before' },
        { key: 'after', label: lang === 'hi' ? 'अब' : 'After' },
        { key: 'other', label: lang === 'hi' ? 'अन्य कार्य' : 'Other Works' },
    ];

    if (allImages.length === 0) return <></>;

    return (
        <section
            id="gallery"
            className="py-16 md:py-24 bg-white"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
                        {t.gallery.title}
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full" />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setShowAll(false);
                            }}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold
                                transition-all duration-200 min-h-[44px]
                                ${
                                    activeTab === tab.key
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div
                    className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4"
                    style={{ columnFill: 'balance' }}>
                    {displayed.map((img, index) => (
                        <button
                            key={`${img.url}-${index}`}
                            onClick={() => openLightbox(index)}
                            className="block w-full mb-3 md:mb-4 break-inside-avoid
                                rounded-xl md:rounded-2xl overflow-hidden
                                shadow-md hover:shadow-xl
                                transform hover:scale-[1.02]
                                transition-all duration-300
                                focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <img
                                src={img.url}
                                alt={img.caption}
                                className="w-full h-auto object-cover"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>

                {filtered.length > HOMEPAGE_LIMIT && !showAll && (
                    <div className="text-center mt-8">
                        <button
                            onClick={() => setShowAll(true)}
                            className="px-8 py-3.5 rounded-2xl bg-emerald-100 text-emerald-700
                                font-semibold text-base hover:bg-emerald-200
                                transition-colors min-h-[48px]">
                            {lang === 'hi' ? 'और देखें' : 'See More'} ({filtered.length - HOMEPAGE_LIMIT}+)
                        </button>
                    </div>
                )}
            </div>

            {lightboxIndex !== null && displayed[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center"
                    onClick={closeLightbox}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeLightbox();
                        }}
                        className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full
                            bg-white/10 hover:bg-white/20 flex items-center justify-center
                            transition-colors"
                        aria-label="Close lightbox">
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {lightboxIndex > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateLightbox(-1);
                            }}
                            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10
                                w-12 h-12 rounded-full bg-white/10 hover:bg-white/20
                                flex items-center justify-center transition-colors"
                            aria-label="Previous image">
                            <ChevronLeft className="w-7 h-7 text-white" />
                        </button>
                    )}

                    {lightboxIndex < displayed.length - 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateLightbox(1);
                            }}
                            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10
                                w-12 h-12 rounded-full bg-white/10 hover:bg-white/20
                                flex items-center justify-center transition-colors"
                            aria-label="Next image">
                            <ChevronRight className="w-7 h-7 text-white" />
                        </button>
                    )}

                    <div
                        className="max-w-5xl max-h-[85vh] mx-4"
                        onClick={(e) => e.stopPropagation()}>
                        <img
                            src={displayed[lightboxIndex].url}
                            alt={displayed[lightboxIndex].caption}
                            className="max-w-full max-h-[75vh] object-contain rounded-xl mx-auto"
                        />
                        <p className="text-center text-white/80 text-sm mt-4">
                            {displayed[lightboxIndex].projectTitle}
                            <span className="text-white/50 ml-3">
                                {lightboxIndex + 1} / {displayed.length}
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
};

export default GallerySection;
