'use client';

import React, { createContext, useContext } from 'react';
import { Language, translations, TranslationKeys } from '@/lib/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: () => void; // Changed from (lang: Language) => void
    t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // We force English as per user request
    const language: Language = 'en';

    const t = (key: TranslationKeys): string => {
        return translations.en[key] || key;
    };

    const setLanguage = () => { // Removed _lang parameter
        console.log('Language switching disabled, staying in English');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
