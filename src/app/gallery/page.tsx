'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getLocalizedField } from '@/lib/utils';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

interface GalleryItem {
    id: string;
    url: string;
    type: 'before' | 'after' | 'additional' | 'other';
    projectTitle: string;
    category: string;
    year: number | null;
}

function GalleryContent(): React.JSX.Element {
    const { lang, t } = useLanguage();
    const { projects, categories, otherWorks } = useAppStore();
    const [filter, setFilter] = useState<'all' | 'before' | 'after' | 'other'>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const allImages = useMemo(() => {
        const images: GalleryItem[] = [];

        projects
            .filter((p) => p.status === 'published')
            .forEach((p) => {
                const title = getLocalizedField(p, 'title', lang);
                const cat = categories.find((c) => c.id === p.category_id);
                const catName = cat
                    ? lang === 'hi'
                        ? cat.name_hi
                        : cat.name_en
                    : '';

                p.images?.forEach((img) => {
                    images.push({
                        id: img.id,
                        url: img.image_url,
                        type: img.image_type,
                        projectTitle: title,
                        category: catName,
                        year: p.completion_year,
                    });
                });
            });

        otherWorks
            .filter((w) => w.status === 'published')
            .forEach((w) => {
                const title = getLocalizedField(w, 'title', lang);
                w.images?.forEach((img) => {
                    images.push({
                        id: img.id,
                        url: img.image_url,
                        type: 'other',
                        projectTitle: title,
                        category: w.category || '',
                        year: w.event_year,
                    });
                });
            });

        return images;
    }, [projects, otherWorks, categories, lang]);

    const filtered = useMemo(() => {
        if (filter === 'all') return allImages;
        return allImages.filter((img) => img.type === filter);
    }, [allImages, filter]);

    const filterTabs: { key: typeof filter; label: string }[] = [
        { key: 'all', label: lang === 'hi' ? 'सभी' : 'All' },
        { key: 'before', label: lang === 'hi' ? 'पहले' : 'Before' },
        { key: 'after', label: lang === 'hi' ? 'अब' : 'After' },
        { key: 'other', label: lang === 'hi' ? 'अन्य' : 'Other' },
    ];

    const openLightbox = (index: number): void => setLightboxIndex(index);
    const closeLightbox = (): void => setLightboxIndex(null);
    const prevImage = (): void => {
        if (lightboxIndex !== null && lightboxIndex > 0) {
            setLightboxIndex(lightboxIndex - 1);
        }
    };
    const nextImage = (): void => {
        if (lightboxIndex !== null && lightboxIndex < filtered.length - 1) {
            setLightboxIndex(lightboxIndex + 1);
        }
    };

    return (
        <>
            <Header />
            <main className='pt-20 pb-12'>
                <div className='max-w-6xl mx-auto px-4'>
                    {/* Back */}
                    <div className='py-4'>
                        <Link
                            href='/'
                            className='inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium'
                        >
                            <ArrowLeft size={20} />
                            {lang === 'hi' ? 'वापस जाएं' : 'Go Back'}
                        </Link>
                    </div>

                    <h1 className='text-3xl md:text-4xl font-bold text-slate-900 mb-6'>
                        {t.gallery.title}
                    </h1>

                    {/* Filter Tabs */}
                    <div className='flex gap-2 mb-8 flex-wrap'>
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-5 py-2.5 rounded-full font-medium text-base transition-colors ${
                                    filter === tab.key
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Masonry Grid */}
                    <div className='masonry-grid'>
                        {filtered.map((img, index) => (
                            <button
                                key={img.id}
                                onClick={() => openLightbox(index)}
                                className='w-full relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group block'
                            >
                                <Image
                                    src={img.url}
                                    alt={img.projectTitle}
                                    width={400}
                                    height={300}
                                    className='w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300'
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <div className='absolute bottom-0 left-0 right-0 p-3'>
                                        <p className='text-white text-sm font-medium truncate'>
                                            {img.projectTitle}
                                        </p>
                                        <p className='text-white/70 text-xs'>
                                            {img.category}
                                            {img.year && ` • ${img.year}`}
                                        </p>
                                    </div>
                                </div>
                                <span className='absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize'>
                                    {img.type === 'before'
                                        ? lang === 'hi'
                                            ? 'पहले'
                                            : 'Before'
                                        : img.type === 'after'
                                        ? lang === 'hi'
                                            ? 'अब'
                                            : 'After'
                                        : '📷'}
                                </span>
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className='text-center py-20 text-slate-400'>
                            <p className='text-xl'>
                                {lang === 'hi'
                                    ? 'कोई तस्वीर नहीं मिली'
                                    : 'No photos found'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Lightbox */}
                {lightboxIndex !== null && filtered[lightboxIndex] && (
                    <div className='fixed inset-0 z-50 bg-black/95 flex items-center justify-center'>
                        <button
                            onClick={closeLightbox}
                            className='absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-50'
                        >
                            <X size={28} />
                        </button>

                        {lightboxIndex > 0 && (
                            <button
                                onClick={prevImage}
                                className='absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full z-50'
                            >
                                <ChevronLeft size={36} />
                            </button>
                        )}

                        {lightboxIndex < filtered.length - 1 && (
                            <button
                                onClick={nextImage}
                                className='absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full z-50'
                            >
                                <ChevronRight size={36} />
                            </button>
                        )}

                        <div className='max-w-5xl max-h-[85vh] p-4'>
                            <Image
                                src={filtered[lightboxIndex].url}
                                alt={filtered[lightboxIndex].projectTitle}
                                width={1200}
                                height={900}
                                className='object-contain max-h-[75vh] w-auto mx-auto rounded-lg'
                            />
                            <div className='text-center mt-4'>
                                <p className='text-white text-lg font-medium'>
                                    {filtered[lightboxIndex].projectTitle}
                                </p>
                                <p className='text-white/60 text-sm'>
                                    {filtered[lightboxIndex].category}
                                    {filtered[lightboxIndex].year &&
                                        ` • ${filtered[lightboxIndex].year}`}
                                </p>
                                <p className='text-white/40 text-sm mt-1'>
                                    {lightboxIndex + 1} / {filtered.length}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}

export default function GalleryPage(): React.JSX.Element {
    return (
        <LanguageProvider>
            <GalleryContent />
        </LanguageProvider>
    );
}
