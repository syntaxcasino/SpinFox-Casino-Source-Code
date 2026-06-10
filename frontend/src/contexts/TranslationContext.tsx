import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import i18n from "@/i18n";

interface TranslationContextType {
  t: (key: string, namespaces?: string | string[]) => string;
  language: string;
  setLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  t: (key) => key,
  language: "en",
  setLanguage: () => {},
});

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(i18n.language || "en");

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
  };

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => setLanguageState(lng);
    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, []);

  const t = (key: string, namespaces: string | string[] = "common") => {
    if (Array.isArray(namespaces)) {
      for (const ns of namespaces) {
        const translation = i18n.t(key, { ns });
        if (translation !== key) return translation;
      }
      return key; // fallback
    }
    return i18n.t(key, { ns: namespaces });
  };

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook that binds the namespace(s) automatically
export const useTranslation = (namespaces?: string | string[]) => {
  const { t, language, setLanguage } = useContext(TranslationContext);
  const translate = (key: string) => t(key, namespaces);
  return { t: translate, language, setLanguage };
};
