'use client';

import { useState, useEffect, useRef, useMemo, useCallback, TouchEvent as ReactTouchEvent } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { getLocalizedField, calculateDashboardStats, getWhatsAppShareUrl } from '@/lib/utils';
import type { Project, ProjectImage, Language } from '@/lib/types';

/* ── Load data from Supabase on mount ── */
function useSupabaseLoader(): void {
    const loadFromSupabase = useAppStore((s) => s.loadFromSupabase);
    const dataLoaded = useAppStore((s) => s.dataLoaded);
    useEffect(() => {
        if (!dataLoaded) {
            loadFromSupabase();
        }
    }, [dataLoaded, loadFromSupabase]);
}

/* ── Loading Skeleton ── */
function LoadingSkeleton(): React.JSX.Element {
    return (
        <div className='min-h-screen bg-[#f0f4f8] animate-pulse'>
            {/* Hero skeleton */}
            <div className='bg-gradient-to-br from-emerald-600 to-teal-700 h-[400px] relative'>
                <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 px-6'>
                    <div className='h-3 w-28 bg-white/20 rounded' />
                    <div className='h-10 w-64 bg-white/20 rounded-xl' />
                    <div className='h-3 w-40 bg-white/20 rounded' />
                    <div className='flex gap-4 mt-6'>
                        <div className='w-40 h-56 bg-white/10 rounded-2xl' />
                        <div className='w-40 h-56 bg-white/10 rounded-2xl' />
                    </div>
                </div>
            </div>
            {/* Stats skeleton */}
            <div className='max-w-5xl mx-auto px-6 mt-8'>
                <div className='h-16 bg-amber-200/40 rounded-2xl mb-6' />
                <div className='grid grid-cols-2 gap-4 max-w-md mx-auto mb-8'>
                    <div className='h-28 bg-emerald-100 rounded-2xl' />
                    <div className='h-28 bg-blue-100 rounded-2xl' />
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mb-8'>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className='h-28 bg-white rounded-2xl border border-slate-100' />
                    ))}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className='h-64 bg-white rounded-2xl border border-slate-100' />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Scroll to Top Button ── */
function ScrollToTop(): React.JSX.Element {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const onScroll = (): void => setShow(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    if (!show) return <></>;
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='fixed bottom-20 right-4 z-40 w-11 h-11 bg-slate-800 text-white rounded-full shadow-xl flex items-center justify-center text-lg active:scale-90 transition-all'
            aria-label='Scroll to top'>
            ↑
        </button>
    );
}

/* ── Bottom Section Navigator ── */
function BottomNav({ t, sections }: {
    t: (hi: string, en: string) => string;
    sections: { id: string; icon: string; label: string }[];
}): React.JSX.Element {
    const [active, setActive] = useState('');
    useEffect(() => {
        const onScroll = (): void => {
            let current = '';
            for (const s of sections) {
                const el = document.getElementById(s.id);
                if (el && el.getBoundingClientRect().top <= 150) current = s.id;
            }
            setActive(current);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [sections]);
    return (
        <nav className='fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom'>
            <div className='flex justify-around items-center h-14 max-w-lg mx-auto'>
                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                            active === s.id ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                        <span className='text-lg'>{s.icon}</span>
                        <span className='text-[10px] font-semibold'>{s.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}

/* ── Animated Counter ── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }): React.JSX.Element {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const done = useRef(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !done.current) {
                done.current = true;
                const t0 = performance.now();
                const step = (now: number): void => {
                    const p = Math.min((now - t0) / 1400, 1);
                    setCount(Math.round((1 - Math.pow(1 - p, 3)) * end));
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.2 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [end]);
    return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Fade-in ── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }): React.JSX.Element {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.08 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} className={`transition-all duration-600 ease-out ${className}`}
            style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(20px)', transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

/* ── Photo Gallery Modal ── */
function PhotoGallery({
    images,
    title,
    onClose,
    t,
}: {
    images: ProjectImage[];
    title: string;
    onClose: () => void;
    t: (hi: string, en: string) => string;
}): React.JSX.Element {
    const [activeIdx, setActiveIdx] = useState(0);
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') setActiveIdx((p) => Math.min(p + 1, images.length - 1));
        if (e.key === 'ArrowLeft') setActiveIdx((p) => Math.max(p - 1, 0));
    }, [images.length, onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const getLabel = (type: string): string => {
        if (type === 'before') return t('पहले', 'BEFORE');
        if (type === 'after') return t('बाद में', 'AFTER');
        return t('फोटो', 'PHOTO');
    };

    const getLabelColor = (type: string): string => {
        if (type === 'before') return 'bg-red-500';
        if (type === 'after') return 'bg-emerald-500';
        return 'bg-blue-500';
    };

    const active = images[activeIdx];
    const touchStartX = useRef(0);
    const handleTouchStart = (e: ReactTouchEvent): void => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e: ReactTouchEvent): void => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) setActiveIdx((p) => Math.min(p + 1, images.length - 1));
        if (diff < -50) setActiveIdx((p) => Math.max(p - 1, 0));
    };
    if (!active) return <></>;

    return (
        <div className='fixed inset-0 z-[100] flex items-center justify-center' onClick={onClose}>
            <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' />
            <div className='relative z-10 w-full max-w-3xl mx-4' onClick={(e) => e.stopPropagation()}>
                {/* Close */}
                <button onClick={onClose}
                    className='absolute -top-12 right-0 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1'>
                    ✕ {t('बंद करें', 'Close')}
                </button>

                {/* Title */}
                <h3 className='text-white font-bold text-lg mb-3 truncate'>{title}</h3>

                {/* Main image */}
                <div
                    className='relative aspect-[16/10] bg-black rounded-2xl overflow-hidden'
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}>
                    <Image src={active.image_url} alt={title} fill className='object-contain' sizes='90vw' />
                    <span className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-lg ${getLabelColor(active.image_type)}`}>
                        {getLabel(active.image_type)}
                    </span>

                    {/* Nav arrows */}
                    {activeIdx > 0 && (
                        <button onClick={() => setActiveIdx((p) => p - 1)}
                            className='absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xl'>
                            ‹
                        </button>
                    )}
                    {activeIdx < images.length - 1 && (
                        <button onClick={() => setActiveIdx((p) => p + 1)}
                            className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xl'>
                            ›
                        </button>
                    )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className='flex gap-2 mt-3 overflow-x-auto pb-2'>
                        {images.map((img, idx) => (
                            <button key={img.id} onClick={() => setActiveIdx(idx)}
                                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                                    idx === activeIdx ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-90'
                                }`}>
                                <Image src={img.image_url} alt={getLabel(img.image_type)} fill className='object-cover' sizes='80px' />
                                <span className={`absolute bottom-0.5 left-0.5 text-white text-[9px] font-bold px-1 rounded ${getLabelColor(img.image_type)}`}>
                                    {getLabel(img.image_type)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Counter */}
                <p className='text-white/50 text-xs text-center mt-2'>
                    {activeIdx + 1} / {images.length} {t('फोटो', 'photos')}
                </p>
            </div>
        </div>
    );
}

/* ══════════════ MAIN PAGE ══════════════ */
export default function ReportCard(): React.JSX.Element {
    useSupabaseLoader();
    const [lang, setLang] = useState<Language>('hi');
    const [galleryProject, setGalleryProject] = useState<Project | null>(null);
    const [activeFY, setActiveFY] = useState<string>('__all__');
    const [openFYs, setOpenFYs] = useState<Set<string>>(new Set());
    const { settings, projects, categories, otherWorks, welfareStats, isLoading } = useAppStore();

    const published = projects.filter((p) => p.status === 'published');
    const publishedOther = otherWorks.filter((w) => w.status === 'published');
    const stats = calculateDashboardStats(projects, categories);

    const t = (hi: string, en: string): string => (lang === 'hi' ? hi : en);
    const lf = (item: object, field: string): string => getLocalizedField(item, field, lang);

    const panchayatName = lf(settings, 'panchayat_name');
    const block = lf(settings, 'block');
    const district = lf(settings, 'district');
    const state = lf(settings, 'state');
    const repName = lf(settings, 'representative_name');

    const getCatLabel = (catId: string | null): string => {
        const c = categories.find((cat) => cat.id === catId);
        return c ? `${c.icon} ${lang === 'hi' ? c.name_hi : c.name_en}` : '';
    };

    /* Fiscal year: April–March. If date available, use month; else treat completion_year as the start year */
    const getFiscalYear = (project: Project): string => {
        if (project.completion_date) {
            const d = new Date(project.completion_date);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            const startYear = month >= 4 ? year : year - 1;
            return `${startYear}-${String(startYear + 1).slice(2)}`;
        }
        if (project.completion_year) {
            return `${project.completion_year}-${String(project.completion_year + 1).slice(2)}`;
        }
        return '';
    };

    const projectsByFY = useMemo(() => {
        const map = new Map<string, Project[]>();
        published.forEach((p) => {
            const fy = getFiscalYear(p);
            const key = fy || '__other__';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        });
        const sorted = new Map(
            [...map.entries()].sort((a, b) => {
                if (a[0] === '__other__') return 1;
                if (b[0] === '__other__') return -1;
                return b[0].localeCompare(a[0]);
            }),
        );
        return sorted;
    }, [published]);

    const fyKeys = useMemo(() => Array.from(projectsByFY.keys()), [projectsByFY]);

    const toggleFY = (fy: string): void => {
        setOpenFYs((prev) => {
            const next = new Set(prev);
            if (next.has(fy)) next.delete(fy);
            else next.add(fy);
            return next;
        });
    };

    const handleTabClick = (fy: string): void => {
        setActiveFY(fy);
        if (fy !== '__all__') {
            setOpenFYs(new Set([fy]));
        } else {
            setOpenFYs(new Set());
        }
    };

    const visibleFYs = useMemo(() => {
        if (activeFY === '__all__') return fyKeys;
        return fyKeys.filter((k) => k === activeFY);
    }, [activeFY, fyKeys]);

    const navSections = useMemo(() => {
        const sections = [
            { id: 'sec-stats', icon: '📊', label: t('आँकड़े', 'Stats') },
            { id: 'sec-projects', icon: '🏗️', label: t('कार्य', 'Projects') },
            { id: 'sec-other', icon: '🎉', label: t('अन्य', 'Other') },
            { id: 'sec-welfare', icon: '❤️', label: t('कल्याण', 'Welfare') },
        ];
        if (settings.show_campaign) {
            sections.push({ id: 'sec-campaign', icon: '🗳️', label: t('चुनाव', 'Vote') });
        }
        return sections;
    }, [lang, settings.show_campaign]);

    if (isLoading) return <LoadingSkeleton />;

    return (
        <div className='min-h-screen bg-[#f0f4f8] pb-16' style={{ fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif" }}>

            <ScrollToTop />
            <BottomNav t={t} sections={navSections} />

            {/* Language Toggle */}
            <button onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
                className='fixed top-4 right-4 z-50 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 text-sm font-bold border border-slate-200 active:scale-95 transition-all'>
                {lang === 'hi' ? 'EN' : 'हि'}
            </button>

            {/* ════════ HERO ════════ */}
            <section className='relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900' />
                {/* Village background photo */}
                {settings.village_photo_url && (
                    <div className='absolute inset-0'>
                        <Image
                            src={settings.village_photo_url}
                            alt='Village'
                            fill
                            className='object-cover opacity-[0.65]'
                            sizes='100vw'
                            priority
                        />
                    </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-teal-900/20 to-emerald-900/50' />

                <div className='relative max-w-5xl mx-auto px-6 pt-14 pb-24 text-center text-white'>
                    {/* Tenure period at top */}
                    {settings.tenure_start && settings.tenure_end && (
                        <FadeIn>
                            <div className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4'>
                                <span className='text-emerald-200 text-xs font-semibold'>{t('कार्यकाल', 'Tenure')}</span>
                                <span className='text-white text-xs font-bold'>{settings.tenure_start} — {settings.tenure_end}</span>
                            </div>
                        </FadeIn>
                    )}
                    <FadeIn>
                        <p className='text-emerald-200 text-xs font-semibold tracking-[0.25em] uppercase mb-3'>{t('ग्राम पंचायत', 'Gram Panchayat')}</p>
                    </FadeIn>
                    <FadeIn delay={100}>
                        <h1 className='text-4xl md:text-5xl font-black leading-tight mb-2'>{panchayatName}</h1>
                    </FadeIn>
                    <FadeIn delay={150}>
                        <p className='text-white/60 text-base'>{[block, district, state].filter(Boolean).join(' · ')}</p>
                    </FadeIn>
                    <FadeIn delay={250}>
                        <div className='mt-8 inline-grid grid-cols-2 gap-5'>
                            {/* Gram Pradhan */}
                            <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden text-center w-44 md:w-52'>
                                {settings.representative_photo_url ? (
                                    <div className='relative w-full aspect-square'>
                                        <Image src={settings.representative_photo_url} alt={repName} fill className='object-cover' sizes='220px' />
                                    </div>
                                ) : (
                                    <div className='w-full aspect-square bg-white/10 flex items-center justify-center text-5xl'>👤</div>
                                )}
                                <div className='px-3 py-3'>
                                    <p className='text-emerald-300 text-xs font-semibold tracking-wide'>{t('ग्राम प्रधान', 'Gram Pradhan')}</p>
                                    <p className='text-white text-sm md:text-base font-bold mt-0.5 leading-tight'>{repName}</p>
                                </div>
                            </div>

                            {/* Husband / Pati */}
                            {(settings.spouse_name_hi || settings.spouse_name_en) && (
                                <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden text-center w-44 md:w-52'>
                                    {settings.spouse_photo_url ? (
                                        <div className='relative w-full aspect-square'>
                                            <Image src={settings.spouse_photo_url} alt={lf(settings, 'spouse_name')} fill className='object-cover' sizes='220px' />
                                        </div>
                                    ) : (
                                        <div className='w-full aspect-square bg-white/10 flex items-center justify-center text-5xl'>👤</div>
                                    )}
                                    <div className='px-3 py-3'>
                                        <p className='text-emerald-300 text-xs font-semibold tracking-wide'>{t('पति', 'Husband')}</p>
                                        <p className='text-white text-sm md:text-base font-bold mt-0.5 leading-tight'>{lf(settings, 'spouse_name')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FadeIn>
                </div>
                <div className='absolute bottom-0 left-0 right-0'>
                    <svg viewBox='0 0 1440 50' fill='none' className='w-full'><path d='M0 50V15Q720 0 1440 15V50H0Z' fill='#f0f4f8' /></svg>
                </div>
            </section>

            {/* ════════ Report Card Title ════════ */}
            <div className='max-w-5xl mx-auto px-6 -mt-5 mb-8 relative z-10'>
                <FadeIn>
                    <div className='bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl px-8 py-4 text-center shadow-xl shadow-amber-200/40'>
                        <h2 className='text-white font-black text-2xl md:text-3xl'>📋 {t('विकास रिपोर्ट कार्ड', 'Development Report Card')}</h2>
                        <p className='text-amber-100 text-sm mt-1'>{t('पूरे हुए विकास कार्यों का विवरण', 'Details of completed development works')}</p>
                    </div>
                </FadeIn>
            </div>

            {/* ════════ Stats ════════ */}
            <div id='sec-stats' className='max-w-5xl mx-auto px-6 mb-6 scroll-mt-16'>
                <div className='grid grid-cols-2 gap-4 max-w-md mx-auto'>
                    {[
                        { value: stats.totalProjects, suffix: '+', label: t('पूर्ण कार्य', 'Completed Works'), gradient: 'from-emerald-500 to-teal-500' },
                        { value: stats.totalCategories, suffix: '', label: t('विकास क्षेत्र', 'Development Areas'), gradient: 'from-blue-500 to-indigo-500' },
                    ].map((s, i) => (
                        <FadeIn key={s.label} delay={i * 80}>
                            <div className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-6 text-center text-white shadow-lg`}>
                                <p className='text-4xl md:text-5xl font-black'><Counter end={s.value} suffix={s.suffix} /></p>
                                <p className='text-white/70 text-sm font-medium mt-1'>{s.label}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>

            {/* ════════ Welfare Distribution Stats ════════ */}
            {welfareStats.length > 0 && (
            <div id='sec-welfare' className='max-w-5xl mx-auto px-6 mb-6 scroll-mt-16'>
                <FadeIn>
                    <h3 className='text-xl font-bold text-slate-800 text-center mb-4'>
                        📊 {t('योजनाओं का वितरण एवं लाभ', 'Scheme Distribution & Benefits')}
                    </h3>
                </FadeIn>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    {welfareStats.sort((a, b) => a.sort_order - b.sort_order).map((ws, i) => (
                        <FadeIn key={ws.id} delay={i * 60}>
                            <div className='bg-white rounded-2xl p-4 text-center shadow-md border border-slate-100 hover:shadow-lg transition-shadow'>
                                <span className='text-3xl block mb-1'>{ws.icon}</span>
                                <p className='text-3xl md:text-4xl font-black text-slate-900'>
                                    <Counter end={ws.count} suffix='' />
                                </p>
                                <p className='text-xs text-slate-500 font-medium mt-0.5'>
                                    {lang === 'hi' ? ws.unit_hi : ws.unit_en}
                                </p>
                                <p className='text-sm font-semibold text-slate-700 mt-1'>
                                    {lang === 'hi' ? ws.label_hi : ws.label_en}
                                </p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
            )}

            {/* ════════ BEFORE vs AFTER COMPARISON ════════ */}
            {settings.comparisons && settings.comparisons.length > 0 && (
                <div id='sec-compare' className='max-w-5xl mx-auto px-6 mb-8 scroll-mt-16'>
                    <FadeIn>
                        <h3 className='text-xl font-bold text-slate-800 text-center mb-1'>
                            🏆 {t('विकास की उपलब्धियाँ', 'Development Achievements')}
                        </h3>
                        <p className='text-xs text-slate-400 text-center mb-4'>
                            {t('कार्यकाल में किए गए प्रमुख कार्य', 'Key work done during tenure')}
                        </p>
                    </FadeIn>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                        {settings.comparisons.map((c, i) => {
                            const beforeNum = parseFloat(c.before_value) || 0;
                            const afterNum = parseFloat(c.after_value) || 0;
                            const diff = afterNum - beforeNum;
                            const isNew = beforeNum === 0 && afterNum > 0;
                            const label = lang === 'hi' ? (c.label_hi || c.label_en) : (c.label_en || c.label_hi);
                            return (
                                <FadeIn key={i} delay={i * 80}>
                                    <div className='bg-white rounded-2xl border border-slate-100 shadow-md p-4 text-center relative overflow-hidden hover:shadow-lg transition-shadow'>
                                        {/* Badge */}
                                        {isNew && (
                                            <div className='absolute top-2 right-2'>
                                                <span className='bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm'>
                                                    ✅ {t('नया', 'NEW')}
                                                </span>
                                            </div>
                                        )}
                                        {!isNew && diff > 0 && (
                                            <div className='absolute top-2 right-2'>
                                                <span className='bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full'>
                                                    +{diff}
                                                </span>
                                            </div>
                                        )}
                                        {/* Icon */}
                                        <span className='text-3xl block mb-2'>{c.icon}</span>
                                        {/* After number (big) */}
                                        <p className='text-4xl font-black text-slate-900 leading-none'>{c.after_value}</p>
                                        {/* Label */}
                                        <p className='text-sm font-bold text-slate-700 mt-2 leading-tight'>{label}</p>
                                        {/* Before context */}
                                        {isNew ? (
                                            <p className='text-[10px] text-white font-bold mt-2 bg-emerald-500 rounded-full px-3 py-1 inline-block shadow-sm'>
                                                ✨ {t('पहली बार बना', 'Built first time')}
                                            </p>
                                        ) : (
                                            <p className='text-[10px] text-slate-400 font-semibold mt-1.5'>
                                                {t('पहले', 'Before')}: {c.before_value} → {t('अब', 'Now')}: {c.after_value}
                                            </p>
                                        )}
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Category Chips */}
            <div className='max-w-5xl mx-auto px-6 mb-10'>
                <FadeIn>
                    <div className='flex flex-wrap gap-2 justify-center'>
                        {stats.categoryStats.map((cat) => (
                            <span key={cat.name_hi} className='inline-flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl text-sm shadow-sm border border-slate-100'>
                                <span className='text-lg'>{cat.icon}</span>
                                <span className='text-slate-700 font-medium'>{lang === 'hi' ? cat.name_hi : cat.name_en}</span>
                                <span className='bg-emerald-100 text-emerald-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center'>{cat.count}</span>
                            </span>
                        ))}
                    </div>
                </FadeIn>
            </div>

            {/* ════════ PROJECTS — Sticky FY tabs + Accordion ════════ */}
            <div id='sec-projects' className='max-w-5xl mx-auto px-6 mb-10 scroll-mt-16'>
                <FadeIn>
                    <h2 className='text-3xl font-black text-slate-900 text-center mb-6'>
                        🏗️ {t('पूर्ण विकास कार्य', 'Completed Development Works')}
                    </h2>
                </FadeIn>

                {/* Sticky FY Tabs */}
                <div className='sticky top-0 z-30 bg-[#f0f4f8] pt-2 pb-3 -mx-1'>
                    <div className='flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide'>
                        <button
                            onClick={() => handleTabClick('__all__')}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                activeFY === '__all__'
                                    ? 'bg-slate-800 text-white shadow-lg'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                            }`}>
                            {t('सभी', 'All')} ({published.length})
                        </button>
                        {fyKeys.map((fy) => {
                            const count = projectsByFY.get(fy)?.length ?? 0;
                            const label = fy === '__other__' ? t('अन्य', 'Other') : fy;
                            return (
                                <button
                                    key={fy}
                                    onClick={() => handleTabClick(fy)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        activeFY === fy
                                            ? 'bg-emerald-600 text-white shadow-lg'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-400'
                                    }`}>
                                    📅 {label} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Accordion Sections */}
                {visibleFYs.map((fy) => {
                    const fyProjects = projectsByFY.get(fy) ?? [];
                    const isOpen = activeFY !== '__all__' || openFYs.has(fy);
                    const label = fy === '__other__' ? t('अन्य', 'Other') : fy;

                    return (
                        <div key={fy} className='mb-4'>
                            {/* Accordion Header */}
                            <button
                                onClick={() => activeFY === '__all__' ? toggleFY(fy) : undefined}
                                className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all ${
                                    isOpen
                                        ? 'bg-slate-800 text-white shadow-lg'
                                        : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-400 shadow-sm'
                                }`}>
                                <span className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                                    ▶
                                </span>
                                <span className='font-black text-lg'>📅 {label}</span>
                                <div className='flex-1' />
                                <span className={`text-sm font-bold px-3 py-0.5 rounded-full ${
                                    isOpen ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {fyProjects.length} {t('कार्य', 'works')}
                                </span>
                            </button>

                            {/* Accordion Content */}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                isOpen ? 'max-h-[5000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                            }`}>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                            {fyProjects.map((project, i) => {
                                const title = lf(project, 'title');
                                const desc = lf(project, 'description');
                                const beforeImg = project.images?.find((img) => img.image_type === 'before');
                                const afterImg = project.images?.find((img) => img.image_type === 'after');
                                const anyImg = project.images?.[0];
                                const hasBothBA = Boolean(beforeImg && afterImg);
                                const totalPhotos = project.images?.length ?? 0;

                                return (
                                    <FadeIn key={project.id} delay={i * 60}>
                                        <div
                                            className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group'
                                            onClick={() => totalPhotos > 0 ? setGalleryProject(project) : undefined}>

                                            {/* Before & After comparison */}
                                            {hasBothBA && (
                                                <div className='relative'>
                                                    <div className='grid grid-cols-2'>
                                                        <div className='relative aspect-[4/3]'>
                                                            <Image src={beforeImg!.image_url} alt='Before' fill className='object-cover' sizes='25vw' />
                                                            <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                                                            <div className='absolute bottom-2 left-2'>
                                                                <span className='text-white text-xs font-bold bg-red-500 px-2.5 py-1 rounded-lg shadow'>{t('पहले', 'BEFORE')}</span>
                                                            </div>
                                                        </div>
                                                        <div className='relative aspect-[4/3]'>
                                                            <Image src={afterImg!.image_url} alt='After' fill className='object-cover' sizes='25vw' />
                                                            <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                                                            <div className='absolute bottom-2 right-2'>
                                                                <span className='text-white text-xs font-bold bg-emerald-500 px-2.5 py-1 rounded-lg shadow'>✅ {t('बाद में', 'AFTER')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Center divider arrow */}
                                                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20'>
                                                        <div className='w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center'>
                                                            <span className='text-base font-black text-emerald-600'>→</span>
                                                        </div>
                                                    </div>
                                                    {/* Photo count badge */}
                                                    {totalPhotos > 2 && (
                                                        <div className='absolute top-2 right-2 z-20 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-lg'>
                                                            📷 +{totalPhotos - 2} {t('और', 'more')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Single image fallback */}
                                            {!hasBothBA && anyImg && (
                                                <div className='relative aspect-[16/9]'>
                                                    <Image src={anyImg.image_url} alt={title} fill className='object-cover group-hover:scale-105 transition-transform duration-500' sizes='50vw' />
                                                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                                                    {anyImg.image_type === 'before' && (
                                                        <div className='absolute bottom-2 left-2'>
                                                            <span className='text-white text-xs font-bold bg-red-500 px-2.5 py-1 rounded-lg shadow'>{t('पहले', 'BEFORE')}</span>
                                                        </div>
                                                    )}
                                                    {anyImg.image_type === 'after' && (
                                                        <div className='absolute bottom-2 right-2'>
                                                            <span className='text-white text-xs font-bold bg-emerald-500 px-2.5 py-1 rounded-lg shadow'>✅ {t('बाद में', 'AFTER')}</span>
                                                        </div>
                                                    )}
                                                    {totalPhotos > 1 && (
                                                        <div className='absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-lg'>
                                                            📷 {totalPhotos} {t('फोटो', 'photos')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* All details shown directly */}
                                            <div className='p-5'>
                                                <h3 className='font-bold text-slate-900 text-lg leading-snug mb-2'>{title}</h3>

                                                <div className='flex flex-wrap gap-2 mb-3'>
                                                    {project.category_id && (
                                                        <span className='text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium'>{getCatLabel(project.category_id)}</span>
                                                    )}
                                                    {(project.location_hi || project.location_en) && (
                                                        <span className='text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-medium'>📍 {lf(project, 'location')}</span>
                                                    )}
                                                    <span className='text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-medium'>✅ {t('पूर्ण', 'Completed')}</span>
                                                </div>

                                                {desc && (
                                                    <p className='text-sm text-slate-600 leading-relaxed mb-3'>{desc}</p>
                                                )}

                                                {(project.scheme || project.department) && (
                                                    <div className='border-t border-slate-100 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400'>
                                                        {project.scheme && <span>{t('योजना', 'Scheme')}: <strong className='text-slate-500'>{project.scheme}</strong></span>}
                                                        {project.department && <span>{t('विभाग', 'Dept')}: <strong className='text-slate-500'>{project.department}</strong></span>}
                                                    </div>
                                                )}

                                                {totalPhotos > 0 && (
                                                    <div className='mt-3 pt-2 border-t border-slate-100'>
                                                        <span className='text-xs text-blue-600 font-medium group-hover:text-blue-700 transition-colors'>
                                                            📷 {t('सभी फोटो देखें', 'View all photos')} ({totalPhotos})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </FadeIn>
                                );
                            })}
                        </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ════════ OTHER ACHIEVEMENTS ════════ */}
            {publishedOther.length > 0 && (
                <div id='sec-other' className='max-w-5xl mx-auto px-6 mb-10 scroll-mt-16'>
                    <FadeIn>
                        <h2 className='text-3xl font-black text-slate-900 text-center mb-8'>
                            🌟 {t('अन्य उपलब्धियाँ', 'Other Achievements')}
                        </h2>
                    </FadeIn>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5'>
                        {publishedOther.map((work, i) => {
                            const title = lf(work, 'title');
                            const desc = lf(work, 'description');
                            const wloc = lf(work, 'location');
                            const img = work.images?.[0];
                            return (
                                <FadeIn key={work.id} delay={i * 60}>
                                    <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300'>
                                        {img && (
                                            <div className='relative aspect-[16/10]'>
                                                <Image src={img.image_url} alt={title} fill className='object-cover' sizes='(max-width:640px) 100vw, 33vw' />
                                            </div>
                                        )}
                                        <div className='p-4'>
                                            <h4 className='font-bold text-slate-900 text-base leading-snug mb-2'>{title}</h4>
                                            <div className='flex flex-wrap gap-1.5 mb-2'>
                                                {work.category && <span className='text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full'>{work.category}</span>}
                                                {work.event_year && <span className='text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full'>📅 {work.event_year}</span>}
                                                {wloc && <span className='text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full'>📍 {wloc}</span>}
                                            </div>
                                            {desc && <p className='text-sm text-slate-500 leading-relaxed'>{desc}</p>}
                                        </div>
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ════════ ELECTION CAMPAIGN ════════ */}
            {settings.show_campaign && (
                <div id='sec-campaign' className='max-w-5xl mx-auto px-6 mb-10 scroll-mt-16'>
                    <FadeIn>
                        <div className='relative overflow-hidden rounded-3xl shadow-2xl shadow-indigo-300/30'>
                            {/* Deep gradient background */}
                            <div className='absolute inset-0 bg-gradient-to-br from-[#1a1a4e] via-[#2d1b69] to-[#1e3a5f]' />
                            {/* Soft radial glow */}
                            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-400/10 rounded-full blur-3xl' />
                            <div className='absolute bottom-0 right-0 w-[300px] h-[200px] bg-indigo-400/10 rounded-full blur-3xl' />
                            {/* Subtle star pattern */}
                            <div className='absolute inset-0 opacity-[0.04]' style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                            <div className='relative'>
                                {/* Tricolor stripe top */}
                                <div className='flex h-1.5'>
                                    <div className='flex-1 bg-[#FF9933]' />
                                    <div className='flex-1 bg-white' />
                                    <div className='flex-1 bg-[#138808]' />
                                </div>

                                {/* Election year badge */}
                                <div className='text-center pt-6 pb-2'>
                                    <div className='inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 px-5 py-1.5 rounded-full'>
                                        <span className='text-amber-300 text-xs font-bold tracking-[0.15em]'>
                                            {settings.election_year
                                                ? `✦ ${t(`ग्राम पंचायत चुनाव ${settings.election_year}`, `Gram Panchayat Election ${settings.election_year}`)} ✦`
                                                : `✦ ${t('ग्राम पंचायत चुनाव', 'Gram Panchayat Election')} ✦`}
                                        </span>
                                    </div>
                                </div>

                                <div className='px-6 py-6 md:px-10'>
                                    {/* Husband Photo with golden frame */}
                                    {settings.spouse_photo_url && (
                                        <div className='flex justify-center mb-5'>
                                            <div className='text-center'>
                                                <div className='relative'>
                                                    <div className='w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl mx-auto ring-[3px] ring-amber-400/60 ring-offset-4 ring-offset-[#1a1a4e]'>
                                                        <Image src={settings.spouse_photo_url} alt={lf(settings, 'spouse_name')} width={144} height={144} className='w-full h-full object-cover' />
                                                    </div>
                                                </div>
                                                <p className='text-amber-200 font-black text-lg mt-3 leading-tight tracking-wide'>{lf(settings, 'spouse_name')}</p>
                                                <p className='text-indigo-300/70 text-[11px] font-semibold mt-0.5'>{t('प्रधान पति', 'Pradhan Pati')} • {panchayatName}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Slogan in elegant card */}
                                    {(settings.election_slogan_hi || settings.election_slogan_en) && (
                                        <div className='max-w-sm mx-auto mb-5'>
                                            <div className='bg-gradient-to-r from-amber-400/10 via-amber-400/20 to-amber-400/10 border border-amber-400/20 rounded-2xl px-5 py-4 text-center backdrop-blur-sm'>
                                                {settings.election_symbol && (
                                                    <span className='text-4xl block mb-2'>{settings.election_symbol}</span>
                                                )}
                                                <p className='text-amber-100 text-lg md:text-xl font-black italic leading-snug'>
                                                    &ldquo;{lf(settings, 'election_slogan')}&rdquo;
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appeal Message */}
                                    {(settings.campaign_message_hi || settings.campaign_message_en) && (
                                        <div className='max-w-md mx-auto mb-5'>
                                            <p className='text-indigo-100/80 text-[15px] leading-relaxed text-center'>
                                                {lf(settings, 'campaign_message')}
                                            </p>
                                        </div>
                                    )}

                                    {/* Works Done — subtle line */}
                                    <div className='flex justify-center mb-5'>
                                        <div className='flex items-center gap-3 text-amber-300/80'>
                                            <div className='h-px w-8 bg-amber-400/30' />
                                            <span className='text-sm font-bold'>✅ {stats.totalProjects}+ {t('विकास कार्य पूर्ण', 'Development Works Completed')}</span>
                                            <div className='h-px w-8 bg-amber-400/30' />
                                        </div>
                                    </div>

                                    {/* Promises */}
                                    {settings.promises && settings.promises.length > 0 && (
                                        <div className='max-w-md mx-auto mb-6'>
                                            <h4 className='text-amber-200/90 font-black text-center text-sm tracking-wide mb-3'>
                                                📋 {t('अगले कार्यकाल का मुख्य ध्यान', 'Key Focus for Next Term')}
                                            </h4>
                                            <div className='grid grid-cols-1 gap-2'>
                                                {settings.promises.map((p, i) => (
                                                    <div key={i} className='flex items-center gap-3 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm rounded-xl px-4 py-3 transition-colors'>
                                                        <span className='text-2xl flex-shrink-0'>{p.icon}</span>
                                                        <p className='text-indigo-100 text-sm font-semibold leading-snug'>
                                                            {lang === 'hi' ? (p.text_hi || p.text_en) : (p.text_en || p.text_hi)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Vote Appeal — elegant CTA */}
                                    <div className='text-center'>
                                        <div className='inline-block'>
                                            <div className='bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl px-8 py-4 shadow-xl shadow-amber-400/20'>
                                                <p className='text-[#1a1a4e] font-black text-xl md:text-2xl'>
                                                    🙏 {t('आपसे वोट की अपील', 'An Appeal for Your Vote')}
                                                </p>
                                                <p className='text-[#1a1a4e]/60 text-sm font-bold mt-1'>
                                                    {t('फिर से सेवा का मौका दीजिए', 'Give a chance to serve again')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tricolor stripe bottom */}
                                <div className='flex h-1.5'>
                                    <div className='flex-1 bg-[#FF9933]' />
                                    <div className='flex-1 bg-white' />
                                    <div className='flex-1 bg-[#138808]' />
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            )}

            {/* ════════ FOOTER ════════ */}
            <div className='max-w-5xl mx-auto px-6 pb-12'>
                <FadeIn>
                    <div className='bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-center shadow-xl'>
                        <p className='text-white/80 text-base mb-5'>
                            {t('यह रिपोर्ट कार्ड अपने परिवार और पड़ोसियों को भी दिखाएं', 'Share this report card with family and neighbors')}
                        </p>
                        <button
                            onClick={() => {
                                const url = typeof window !== 'undefined' ? window.location.origin : '';
                                const msg = `${panchayatName} — ${t('विकास रिपोर्ट कार्ड', 'Development Report Card')}\n${stats.totalProjects}+ ${t('पूर्ण विकास कार्य', 'completed works')}\n${t('देखें', 'View')}: `;
                                window.open(getWhatsAppShareUrl(msg, url), '_blank');
                            }}
                            className='bg-white text-emerald-700 font-bold px-10 py-4 rounded-xl text-lg active:scale-95 transition-all duration-200 shadow-lg'>
                            💬 {t('WhatsApp पर भेजें', 'Share on WhatsApp')}
                        </button>
                    </div>
                </FadeIn>
                <div className='mt-8 text-center'>
                    <p className='text-base font-bold text-slate-600'>{panchayatName}</p>
                    <p className='text-sm text-slate-400 mt-0.5'>{[block, district, state].filter(Boolean).join(' · ')}</p>
                    <p className='text-xs text-slate-300 mt-4'>© {new Date().getFullYear()} {t('सर्वाधिकार सुरक्षित', 'All Rights Reserved')}</p>
                </div>
            </div>

            {/* ════════ PHOTO GALLERY MODAL ════════ */}
            {galleryProject && galleryProject.images && galleryProject.images.length > 0 && (
                <PhotoGallery
                    images={galleryProject.images}
                    title={lf(galleryProject, 'title')}
                    onClose={() => setGalleryProject(null)}
                    t={t}
                />
            )}
        </div>
    );
}
