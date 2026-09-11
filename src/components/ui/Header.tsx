'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';

interface NavLink {
    href: string;
    labelKey: keyof typeof import('@/i18n/translations').hi.nav;
}

const NAV_LINKS: NavLink[] = [
    { href: '#hero', labelKey: 'home' },
    { href: '#all-projects', labelKey: 'projects' },
    { href: '#before-after', labelKey: 'beforeAfter' },
    { href: '#other-works', labelKey: 'otherWorks' },
    { href: '#gallery', labelKey: 'gallery' },
    { href: '#download', labelKey: 'download' },
];

const Header = (): React.JSX.Element => {
    const { t, lang, toggleLanguage } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = (): void => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (href: string): void => {
        setIsMenuOpen(false);
        const el = document.querySelector(href);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/90 backdrop-blur-xl shadow-lg'
                        : 'bg-white/70 backdrop-blur-md'
                }`}
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <button
                            onClick={() => handleNavClick('#hero')}
                            className="flex items-center gap-2 min-h-[44px]">
                            <span className="text-2xl">🏛️</span>
                            <span className="font-bold text-lg md:text-xl text-emerald-800 leading-tight">
                                {t.siteName}
                            </span>
                        </button>

                        <nav className="hidden lg:flex items-center gap-1">
                            {NAV_LINKS.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavClick(link.href)}
                                    className="px-3 py-2 rounded-xl text-sm font-medium text-slate-700
                                        hover:text-emerald-700 hover:bg-emerald-50
                                        transition-colors duration-200 min-h-[44px]">
                                    {t.nav[link.labelKey]}
                                </button>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                                    bg-emerald-50 text-emerald-700 font-medium text-sm
                                    hover:bg-emerald-100 transition-colors duration-200
                                    min-h-[44px] min-w-[44px]"
                                aria-label="Toggle language">
                                <Globe className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {lang === 'hi' ? 'English' : 'हिंदी'}
                                </span>
                            </button>

                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="lg:hidden flex items-center justify-center
                                    w-11 h-11 rounded-xl text-slate-700
                                    hover:bg-slate-100 transition-colors duration-200"
                                aria-label="Open menu">
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div
                        className="absolute top-0 right-0 h-full w-[300px] max-w-[85vw]
                            bg-white shadow-2xl transform transition-transform duration-300
                            flex flex-col"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <span className="font-bold text-lg text-emerald-800">
                                {t.siteName}
                            </span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-11 h-11 flex items-center justify-center rounded-xl
                                    hover:bg-slate-100 transition-colors"
                                aria-label="Close menu">
                                <X className="w-6 h-6 text-slate-600" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4">
                            <div className="flex flex-col gap-1">
                                {NAV_LINKS.map((link) => (
                                    <button
                                        key={link.href}
                                        onClick={() => handleNavClick(link.href)}
                                        className="w-full text-left px-4 py-3 rounded-xl
                                            text-base font-medium text-slate-700
                                            hover:text-emerald-700 hover:bg-emerald-50
                                            transition-colors duration-200 min-h-[48px]">
                                        {t.nav[link.labelKey]}
                                    </button>
                                ))}
                            </div>
                        </nav>

                        <div className="p-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    toggleLanguage();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2
                                    px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700
                                    font-medium hover:bg-emerald-100 transition-colors
                                    min-h-[48px]">
                                <Globe className="w-5 h-5" />
                                {lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
