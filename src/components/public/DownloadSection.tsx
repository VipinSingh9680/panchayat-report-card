'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getLocalizedField, getWhatsAppShareUrl } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';

const DownloadSection = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const settings = useAppStore((s) => s.settings);

    const panchayatName = getLocalizedField(settings, 'panchayat_name', lang);
    const [siteUrl, setSiteUrl] = useState('https://panchayat-report-card.vercel.app');

    useEffect(() => {
        setSiteUrl(window.location.origin);
    }, []);

    const handleDownload = (): void => {
        alert(
            lang === 'hi'
                ? 'PDF जनरेशन जल्द ही आ रहा है!'
                : 'PDF generation coming soon!'
        );
    };

    const handleWhatsAppShare = (): void => {
        const text = lang === 'hi'
            ? `${panchayatName} का विकास रिपोर्ट कार्ड देखें`
            : `View ${panchayatName} Development Report Card`;
        const url = getWhatsAppShareUrl(text, siteUrl);
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <section
            id="download"
            className="py-16 md:py-24 bg-gradient-to-b from-white to-emerald-50/50"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800
                    rounded-3xl shadow-2xl overflow-hidden">
                    <div className="relative p-8 md:p-12 lg:p-16">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                    {t.download.title}
                                </h2>
                                <p className="text-base md:text-lg text-emerald-100/80 mb-8 leading-relaxed">
                                    {t.download.subtitle}
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                    <button
                                        onClick={handleDownload}
                                        className="w-full sm:w-auto flex items-center justify-center gap-3
                                            px-8 py-4 rounded-2xl bg-white text-emerald-800
                                            font-bold text-lg shadow-xl shadow-black/20
                                            hover:bg-emerald-50 hover:scale-[1.02]
                                            active:scale-[0.98] transition-all duration-200
                                            min-h-[56px]">
                                        <Download className="w-6 h-6" />
                                        📥 {t.download.button}
                                    </button>

                                    <button
                                        onClick={handleWhatsAppShare}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2
                                            px-6 py-4 rounded-2xl
                                            bg-green-500 text-white
                                            font-semibold text-base
                                            hover:bg-green-600 hover:scale-[1.02]
                                            active:scale-[0.98] transition-all duration-200
                                            min-h-[56px]">
                                        <Share2 className="w-5 h-5" />
                                        WhatsApp
                                    </button>
                                </div>
                            </div>

                            <div className="flex-shrink-0 text-center">
                                <div className="bg-white rounded-2xl p-4 shadow-xl inline-block">
                                    <QRCodeSVG
                                        value={siteUrl || 'https://panchayat-report-card.vercel.app'}
                                        size={160}
                                        level="H"
                                        includeMargin={false}
                                        fgColor="#064e3b"
                                    />
                                </div>
                                <p className="text-sm text-emerald-200/70 mt-4 max-w-[200px] mx-auto leading-snug">
                                    {t.download.qrText}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DownloadSection;
