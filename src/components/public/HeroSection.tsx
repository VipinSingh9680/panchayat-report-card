'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getLocalizedField } from '@/lib/utils';
import { ChevronDown, Download, UserCircle } from 'lucide-react';

const HeroSection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const settings = useAppStore((s) => s.settings);

    const panchayatName = getLocalizedField(settings, 'panchayat_name', lang);
    const block = getLocalizedField(settings, 'block', lang);
    const district = getLocalizedField(settings, 'district', lang);
    const state = getLocalizedField(settings, 'state', lang);
    const representative = getLocalizedField(settings, 'representative_name', lang);
    const tenure =
        settings.tenure_start && settings.tenure_end
            ? `${settings.tenure_start} – ${settings.tenure_end}`
            : '';

    const scrollTo = (id: string): void => {
        const el = document.querySelector(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            id="hero"
            className="relative min-h-[90vh] flex items-center overflow-hidden"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-emerald-100 text-sm mb-6">
                            <span>🏛️</span>
                            <span>
                                {block && `${block}, `}
                                {district && `${district}, `}
                                {state}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                            {panchayatName}
                        </h1>

                        <p className="text-xl md:text-2xl text-emerald-100 font-medium mb-3">
                            {t.hero.title}
                        </p>

                        <p className="text-base md:text-lg text-emerald-200/80 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                            {t.hero.subtitle}
                        </p>

                        {tenure && (
                            <p className="text-sm text-emerald-200/60 mb-8">
                                {lang === 'hi' ? 'कार्यकाल' : 'Tenure'}: {tenure}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => scrollTo('#all-projects')}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-emerald-800
                                    font-bold text-lg shadow-xl shadow-black/20
                                    hover:bg-emerald-50 hover:scale-[1.02]
                                    active:scale-[0.98] transition-all duration-200
                                    min-h-[52px]">
                                {t.hero.cta}
                            </button>
                            <button
                                onClick={() => scrollTo('#download')}
                                className="w-full sm:w-auto flex items-center justify-center gap-2
                                    px-8 py-4 rounded-2xl
                                    bg-white/10 backdrop-blur-sm text-white border border-white/20
                                    font-semibold text-lg
                                    hover:bg-white/20 hover:scale-[1.02]
                                    active:scale-[0.98] transition-all duration-200
                                    min-h-[52px]">
                                <Download className="w-5 h-5" />
                                {t.hero.downloadCta}
                            </button>
                        </div>
                    </div>

                    {(representative || settings.representative_photo_url) && (
                        <div className="flex-shrink-0">
                            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-2xl">
                                {settings.representative_photo_url ? (
                                    <img
                                        src={settings.representative_photo_url}
                                        alt={representative || ''}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserCircle className="w-24 h-24 text-white/40" />
                                    </div>
                                )}
                            </div>
                            {representative && (
                                <div className="mt-4 text-center">
                                    <p className="text-lg font-bold text-white">{representative}</p>
                                    <p className="text-sm text-emerald-200/70">
                                        {lang === 'hi' ? 'जनप्रतिनिधि' : 'Representative'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={() => scrollTo('#dashboard')}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
                    w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm
                    flex items-center justify-center
                    hover:bg-white/20 transition-colors
                    animate-bounce"
                aria-label="Scroll down">
                <ChevronDown className="w-6 h-6 text-white" />
            </button>
        </section>
    );
};

export default HeroSection;
