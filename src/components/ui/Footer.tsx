'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { useAppStore } from '@/lib/store';
import { getLocalizedField } from '@/lib/utils';

const NAV_SECTIONS = [
    { href: '#hero', key: 'home' as const },
    { href: '#all-projects', key: 'projects' as const },
    { href: '#before-after', key: 'beforeAfter' as const },
    { href: '#other-works', key: 'otherWorks' as const },
    { href: '#gallery', key: 'gallery' as const },
    { href: '#download', key: 'download' as const },
];

const Footer = (): React.JSX.Element => {
    const { t, lang } = useLanguage();
    const settings = useAppStore((s) => s.settings);

    const panchayatName = getLocalizedField(settings, 'panchayat_name', lang);
    const block = getLocalizedField(settings, 'block', lang);
    const district = getLocalizedField(settings, 'district', lang);
    const state = getLocalizedField(settings, 'state', lang);
    const representative = getLocalizedField(settings, 'representative_name', lang);
    const tenure =
        settings.tenure_start && settings.tenure_end
            ? `${settings.tenure_start} - ${settings.tenure_end}`
            : '';

    const handleNavClick = (href: string): void => {
        const el = document.querySelector(href);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="bg-slate-900 text-slate-300"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏛️</span>
                            <h3 className="text-xl font-bold text-white">{panchayatName}</h3>
                        </div>
                        <div className="space-y-1 text-sm text-slate-400">
                            {block && (
                                <p>
                                    {lang === 'hi' ? 'ब्लॉक' : 'Block'}: {block}
                                </p>
                            )}
                            {district && (
                                <p>
                                    {lang === 'hi' ? 'जिला' : 'District'}: {district}
                                </p>
                            )}
                            {state && (
                                <p>
                                    {lang === 'hi' ? 'राज्य' : 'State'}: {state}
                                </p>
                            )}
                        </div>

                        {representative && (
                            <div className="mt-5 pt-5 border-t border-slate-800">
                                <p className="text-sm text-slate-500 mb-1">
                                    {lang === 'hi' ? 'जनप्रतिनिधि' : 'Representative'}
                                </p>
                                <p className="text-base font-semibold text-white">
                                    {representative}
                                </p>
                                {tenure && (
                                    <p className="text-sm text-slate-400 mt-0.5">
                                        {lang === 'hi' ? 'कार्यकाल' : 'Tenure'}: {tenure}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="text-base font-semibold text-white mb-4">
                            {lang === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}
                        </h4>
                        <nav className="flex flex-col gap-1">
                            {NAV_SECTIONS.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavClick(link.href)}
                                    className="text-left text-sm text-slate-400 hover:text-emerald-400
                                        transition-colors py-1.5 min-h-[44px] flex items-center">
                                    {t.nav[link.key]}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h4 className="text-base font-semibold text-white mb-4">
                            {lang === 'hi' ? 'सम्पर्क' : 'Contact'}
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {panchayatName}
                            {block && `, ${block}`}
                            {district && `, ${district}`}
                            {state && `, ${state}`}
                        </p>
                        <p className="text-sm text-emerald-400 mt-4">{t.footer.madeWith} 💚</p>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                        © {currentYear} {panchayatName}. {t.footer.copyright}.
                    </p>
                    <p className="text-xs text-slate-600">
                        {lang === 'hi'
                            ? 'पंचायत विकास रिपोर्ट कार्ड'
                            : 'Panchayat Development Report Card'}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
