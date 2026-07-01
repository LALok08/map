"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Locale } from "./translations";
import { DEFAULT_LOCALE, t, type TranslationKey } from "./translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  tr: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("kmk_locale") as Locale | null;
    if (saved && ["zh", "ms", "en"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("kmk_locale", l);
    document.documentElement.lang = l;
  };

  const tr = (key: TranslationKey, params?: Record<string, string | number>) =>
    t(locale, key, params);

  if (!mounted) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, tr }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
