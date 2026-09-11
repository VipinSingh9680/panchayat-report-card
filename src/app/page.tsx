'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { getLocalizedField, calculateDashboardStats, getWhatsAppShareUrl } from '@/lib/utils';
import type { Project, Language } from '@/lib/types';

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

/* ══════════════ MAIN PAGE ══════════════ */
export default function ReportCard(): React.JSX.Element {
    useSupabaseLoader();
    const [lang, setLang] = useState<Language>('hi');
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

    const years = [2025, 2024, 2023, 2022, 2021];
    const projectsByYear = useMemo(() => {
        const map = new Map<number, Project[]>();
        years.forEach((y) => {
            const yp = published.filter((p) => p.completion_year === y);
            if (yp.length > 0) map.set(y, yp);
        });
        const rest = published.filter((p) => !p.completion_year || !years.includes(p.completion_year));
        if (rest.length > 0) map.set(0, rest);
        return map;
    }, [published]);

    return (
        <div className='min-h-screen bg-[#f0f4f8]' style={{ fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif" }}>

            {/* Language Toggle */}
            <button onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
                className='fixed top-4 right-4 z-50 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 text-sm font-bold border border-slate-200 active:scale-95 transition-all'>
                {lang === 'hi' ? 'EN' : 'हि'}
            </button>

            {/* ════════ HERO ════════ */}
            <section className='relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700' />
                {/* Village background photo */}
                <div className='absolute inset-0'>
                    <Image
                        src={settings.village_photo_url || 'https://placehold.co/1920x800/1a5c3a/1a5c3a?text=+'}
                        alt='Village'
                        fill
                        className='object-cover opacity-20 mix-blend-overlay'
                        sizes='100vw'
                        priority
                    />
                </div>
                <div className='absolute inset-0 bg-gradient-to-b from-emerald-900/60 via-teal-800/50 to-emerald-900/70' />

                <div className='relative max-w-5xl mx-auto px-6 pt-14 pb-24 text-center text-white'>
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
                        <div className='mt-8 inline-grid grid-cols-2 gap-6'>
                            {/* Gram Pradhan */}
                            <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-6 text-center flex flex-col items-center justify-center'>
                                {settings.representative_photo_url ? (
                                    <Image src={settings.representative_photo_url} alt={repName} width={120} height={120} className='rounded-full border-4 border-white/30 object-cover w-28 h-28 md:w-32 md:h-32 mb-3' />
                                ) : (
                                    <div className='w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/20 flex items-center justify-center text-5xl mb-3'>👤</div>
                                )}
                                <p className='text-white/50 text-xs'>{t('ग्राम प्रधान', 'Gram Pradhan')}</p>
                                <p className='text-lg font-bold'>{repName}</p>
                                {settings.tenure_start && settings.tenure_end && (
                                    <p className='text-white/40 text-xs mt-0.5'>{settings.tenure_start} — {settings.tenure_end}</p>
                                )}
                            </div>

                            {/* Husband */}
                            {(settings.spouse_name_hi || settings.spouse_name_en) && (
                                <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-6 text-center flex flex-col items-center justify-center'>
                                    {settings.spouse_photo_url ? (
                                        <Image src={settings.spouse_photo_url} alt={lf(settings, 'spouse_name')} width={120} height={120} className='rounded-full border-4 border-white/30 object-cover w-28 h-28 md:w-32 md:h-32 mb-3' />
                                    ) : (
                                        <div className='w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/20 flex items-center justify-center text-5xl mb-3'>👤</div>
                                    )}
                                    <p className='text-white/50 text-xs'>{t('पति', 'Husband')}</p>
                                    <p className='text-lg font-bold'>{lf(settings, 'spouse_name')}</p>
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
            <div className='max-w-5xl mx-auto px-6 mb-6'>
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
            <div className='max-w-5xl mx-auto px-6 mb-6'>
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

            {/* ════════ PROJECTS — Year-wise, 2 columns, ALL details visible ════════ */}
            <div className='max-w-5xl mx-auto px-6 mb-10'>
                <FadeIn>
                    <h2 className='text-3xl font-black text-slate-900 text-center mb-8'>
                        🏗️ {t('पूर्ण विकास कार्य', 'Completed Development Works')}
                    </h2>
                </FadeIn>

                {Array.from(projectsByYear.entries()).map(([year, yProjects]) => (
                    <div key={year} className='mb-10'>
                        <FadeIn>
                            <div className='flex items-center gap-4 mb-5'>
                                <div className='bg-slate-800 text-white font-black text-xl px-5 py-2 rounded-xl shadow'>
                                    📅 {year === 0 ? t('अन्य', 'Other') : year}
                                </div>
                                <div className='flex-1 h-px bg-slate-300' />
                                <span className='text-slate-400 text-base font-bold'>{yProjects.length} {t('कार्य', 'works')}</span>
                            </div>
                        </FadeIn>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                            {yProjects.map((project, i) => {
                                const title = lf(project, 'title');
                                const desc = lf(project, 'description');
                                const beforeImg = project.images?.find((img) => img.image_type === 'before');
                                const afterImg = project.images?.find((img) => img.image_type === 'after');
                                const anyImg = project.images?.[0];
                                const hasBothBA = Boolean(beforeImg && afterImg);

                                return (
                                    <FadeIn key={project.id} delay={i * 60}>
                                        <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300'>
                                            {/* Before & After side by side */}
                                            {hasBothBA && (
                                                <div className='grid grid-cols-2 relative'>
                                                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center'>
                                                        <span className='text-sm font-bold text-slate-400'>→</span>
                                                    </div>
                                                    <div className='relative aspect-[4/3]'>
                                                        <Image src={beforeImg!.image_url} alt='Before' fill className='object-cover grayscale brightness-50' sizes='25vw' />
                                                        <div className='absolute bottom-2 left-2'>
                                                            <span className='text-white text-xs font-bold bg-red-500/90 px-2 py-0.5 rounded'>{t('पहले', 'BEFORE')}</span>
                                                        </div>
                                                    </div>
                                                    <div className='relative aspect-[4/3]'>
                                                        <Image src={afterImg!.image_url} alt='After' fill className='object-cover' sizes='25vw' />
                                                        <div className='absolute bottom-2 right-2'>
                                                            <span className='text-white text-xs font-bold bg-emerald-500/90 px-2 py-0.5 rounded'>✅ {t('अब', 'NOW')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Single image fallback */}
                                            {!hasBothBA && anyImg && (
                                                <div className='relative aspect-[16/9]'>
                                                    <Image src={anyImg.image_url} alt={title} fill className='object-cover' sizes='50vw' />
                                                    {anyImg.image_type === 'before' && (
                                                        <div className='absolute bottom-2 left-2'>
                                                            <span className='text-white text-xs font-bold bg-red-500/90 px-2 py-0.5 rounded'>{t('पहले', 'BEFORE')}</span>
                                                        </div>
                                                    )}
                                                    {anyImg.image_type === 'after' && (
                                                        <div className='absolute bottom-2 right-2'>
                                                            <span className='text-white text-xs font-bold bg-emerald-500/90 px-2 py-0.5 rounded'>✅ {t('अब', 'NOW')}</span>
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
                                            </div>
                                        </div>
                                    </FadeIn>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ════════ OTHER ACHIEVEMENTS ════════ */}
            {publishedOther.length > 0 && (
                <div className='max-w-5xl mx-auto px-6 mb-10'>
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
        </div>
    );
}
