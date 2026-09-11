'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactCompareImage from 'react-compare-image';
import { ArrowLeft, MapPin, Calendar, Tag, IndianRupee, Building2, FileText, Share2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getLocalizedField, getWhatsAppShareUrl } from '@/lib/utils';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import type { Project, ProjectImage } from '@/lib/types';

function ProjectDetailContent(): React.JSX.Element {
    const params = useParams();
    const slug = params.slug as string;
    const { lang, t } = useLanguage();
    const { projects, categories } = useAppStore();
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const project = projects.find((p) => p.slug === slug && p.status === 'published');

    if (!project) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold mb-4'>
                        {lang === 'hi' ? 'कार्य नहीं मिला' : 'Project Not Found'}
                    </h1>
                    <Link href='/' className='text-primary-600 hover:underline'>
                        {lang === 'hi' ? 'होम पेज पर जाएं' : 'Go to Home'}
                    </Link>
                </div>
            </div>
        );
    }

    const category = categories.find((c) => c.id === project.category_id);
    const beforeImages = project.images?.filter((img) => img.image_type === 'before') || [];
    const afterImages = project.images?.filter((img) => img.image_type === 'after') || [];
    const additionalImages = project.images?.filter((img) => img.image_type === 'additional') || [];
    const allImages = project.images || [];

    const primaryBefore = beforeImages[0]?.image_url;
    const primaryAfter = afterImages[0]?.image_url;

    const title = getLocalizedField(project, 'title', lang);
    const description = getLocalizedField(project, 'description', lang);
    const location = getLocalizedField(project, 'location', lang);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = lang === 'hi'
        ? `${title} — ${t.siteName}`
        : `${title} — ${t.siteName}`;

    const infoRows: { label: string; value: string; icon: React.ReactNode }[] = [];

    if (location) {
        infoRows.push({ label: t.project.location, value: `${project.ward ? project.ward + ', ' : ''}${location}`, icon: <MapPin size={18} /> });
    }
    if (category) {
        const catName = lang === 'hi' ? category.name_hi : category.name_en;
        infoRows.push({ label: t.project.category, value: `${category.icon} ${catName}`, icon: <Tag size={18} /> });
    }
    if (project.completion_year) {
        infoRows.push({ label: t.project.year, value: String(project.completion_year), icon: <Calendar size={18} /> });
    }
    if (project.cost_lakhs) {
        infoRows.push({ label: t.project.cost, value: `₹${project.cost_lakhs} ${lang === 'hi' ? 'लाख' : 'Lakhs'}`, icon: <IndianRupee size={18} /> });
    }
    if (project.scheme) {
        infoRows.push({ label: t.project.scheme, value: project.scheme, icon: <FileText size={18} /> });
    }
    if (project.department) {
        infoRows.push({ label: t.project.department, value: project.department, icon: <Building2 size={18} /> });
    }

    return (
        <>
            <Header />
            <main className='pt-20 pb-12'>
                {/* Back button */}
                <div className='max-w-4xl mx-auto px-4 py-4'>
                    <Link
                        href='/'
                        className='inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-lg'
                    >
                        <ArrowLeft size={20} />
                        {lang === 'hi' ? 'वापस जाएं' : 'Go Back'}
                    </Link>
                </div>

                {/* Project Header */}
                <div className='max-w-4xl mx-auto px-4'>
                    <div className='mb-6'>
                        <div className='flex items-center gap-3 mb-3'>
                            <span className='inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold'>
                                ✅ {t.project.completed}
                            </span>
                            {category && (
                                <span className='inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm'>
                                    {category.icon} {lang === 'hi' ? category.name_hi : category.name_en}
                                </span>
                            )}
                        </div>
                        <h1 className='text-3xl md:text-4xl font-bold text-slate-900 leading-tight'>
                            {title}
                        </h1>
                        {project.ward && (
                            <p className='text-lg text-slate-500 mt-2 flex items-center gap-2'>
                                <MapPin size={18} />
                                {project.ward}{location ? `, ${location}` : ''}
                                {project.completion_year && (
                                    <span className='ml-3 flex items-center gap-1'>
                                        <Calendar size={18} /> {project.completion_year}
                                    </span>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Before/After Slider */}
                    {primaryBefore && primaryAfter && (
                        <section className='mb-12'>
                            <h2 className='text-2xl font-bold text-slate-900 mb-4'>
                                {t.beforeAfter.title}
                            </h2>
                            <div className='rounded-2xl overflow-hidden shadow-xl relative'>
                                <ReactCompareImage
                                    leftImage={primaryBefore}
                                    rightImage={primaryAfter}
                                    leftImageLabel={t.beforeAfter.before}
                                    rightImageLabel={t.beforeAfter.after}
                                    sliderLineWidth={3}
                                    sliderLineColor='#ffffff'
                                />
                            </div>
                        </section>
                    )}

                    {/* Description */}
                    {description && (
                        <section className='mb-12'>
                            <h2 className='text-2xl font-bold text-slate-900 mb-4'>
                                {t.project.about}
                            </h2>
                            <div className='bg-slate-50 rounded-2xl p-6'>
                                <p className='text-lg leading-relaxed text-slate-700'>
                                    {description}
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Project Info Table */}
                    {infoRows.length > 0 && (
                        <section className='mb-12'>
                            <h2 className='text-2xl font-bold text-slate-900 mb-4'>
                                {t.project.info}
                            </h2>
                            <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden'>
                                {infoRows.map((row, i) => (
                                    <div
                                        key={row.label}
                                        className={`flex items-center px-6 py-4 ${
                                            i < infoRows.length - 1 ? 'border-b border-slate-100' : ''
                                        }`}
                                    >
                                        <span className='text-primary-600 mr-3'>{row.icon}</span>
                                        <span className='font-semibold text-slate-600 w-32 shrink-0'>
                                            {row.label}
                                        </span>
                                        <span className='text-slate-800'>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Photo Gallery */}
                    {allImages.length > 0 && (
                        <section className='mb-12'>
                            <h2 className='text-2xl font-bold text-slate-900 mb-4'>
                                {t.project.photos}
                            </h2>
                            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                {allImages.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setLightboxImage(img.image_url)}
                                        className='relative aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group'
                                    >
                                        <Image
                                            src={img.image_url}
                                            alt={img.caption || title}
                                            fill
                                            className='object-cover group-hover:scale-105 transition-transform duration-300'
                                            sizes='(max-width: 768px) 50vw, 33vw'
                                        />
                                        <span className='absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize'>
                                            {img.image_type === 'before'
                                                ? t.beforeAfter.before
                                                : img.image_type === 'after'
                                                ? t.beforeAfter.after
                                                : '📷'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Share Buttons */}
                    <section className='mb-8'>
                        <div className='flex flex-col sm:flex-row gap-4'>
                            <a
                                href={getWhatsAppShareUrl(shareText, shareUrl)}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-colors'
                            >
                                <Share2 size={20} />
                                {t.project.shareWhatsapp}
                            </a>
                            <Link
                                href='/#download'
                                className='inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-colors'
                            >
                                📥 {t.project.shareReport}
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Lightbox */}
                {lightboxImage && (
                    <div
                        className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4'
                        onClick={() => setLightboxImage(null)}
                    >
                        <button
                            onClick={() => setLightboxImage(null)}
                            className='absolute top-4 right-4 text-white text-4xl font-light hover:text-gray-300 z-50'
                        >
                            ✕
                        </button>
                        <div className='relative w-full max-w-4xl max-h-[90vh]'>
                            <Image
                                src={lightboxImage}
                                alt='Full size'
                                width={1200}
                                height={900}
                                className='object-contain w-full h-full rounded-lg'
                            />
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}

export default function ProjectDetailPage(): React.JSX.Element {
    return (
        <LanguageProvider>
            <ProjectDetailContent />
        </LanguageProvider>
    );
}
