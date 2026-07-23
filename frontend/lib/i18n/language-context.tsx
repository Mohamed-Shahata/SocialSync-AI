"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { translations, Language, TranslationKey } from "./translations";

type LanguageContextValue = {
  language: Language;
  dir: "rtl" | "ltr";
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "omnipost-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === "ar" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
  }

  function toggleLanguage() {
    setLanguageState((prev) => (prev === "ar" ? "en" : "ar"));
  }

  function t(key: TranslationKey) {
    return translations[language][key] ?? key;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir: language === "ar" ? "rtl" : "ltr",
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
