'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { hi, en } from './translations';
import { Language } from '@/lib/types';

type Translations = typeof hi;

interface LanguageContextType {
    lang: Language;
    t: Translations;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'hi',
    t: hi,
    toggleLanguage: () => {},
    setLanguage: () => {},
});

const translations: Record<Language, Translations> = { hi, en };

export const LanguageProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
    const [lang, setLang] = useState<Language>('hi');

    const toggleLanguage = useCallback(() => {
        setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
    }, []);

    const setLanguage = useCallback((newLang: Language) => {
        setLang(newLang);
    }, []);

    return (
        <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => useContext(LanguageContext);
