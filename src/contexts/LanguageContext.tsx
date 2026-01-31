import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, getTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('edge88_language') as Language;
    if (stored === 'en' || stored === 'cz') return stored;
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('cs') || browserLang.startsWith('cz')) {
      return 'cz';
    }
    return 'en';
  });

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('edge88_language', lang);
    
    // TODO: Save to user profile when DB column is added
    // if (user) {
    //   await supabase
    //     .from('profiles')
    //     .update({ preferred_language: lang })
    //     .eq('user_id', user.id);
    // }
  };

  // Load language preference from profile when user logs in
  useEffect(() => {
    if (user) {
      // TODO: Load from profile when DB column is added
      // supabase
      //   .from('profiles')
      //   .select('preferred_language')
      //   .eq('user_id', user.id)
      //   .single()
      //   .then(({ data }) => {
      //     if (data?.preferred_language) {
      //       setLanguageState(data.preferred_language);
      //     }
      //   });
    }
  }, [user]);

  const t = getTranslation(language);

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
