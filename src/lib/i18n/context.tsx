"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/types";
import { dictionary, type TranslationKey } from "./dictionary";

const STORAGE_KEY = "emis.locale.v1";
const DEFAULT_LOCALE: Locale = "bn";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync of client-only state (localStorage) into React on mount —
    // this can't be computed during render because localStorage isn't
    // available during SSR, so the effect-plus-setState pattern is correct
    // here despite the rule's general preference for computing during render.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === "en" || stored === "bn") setLocaleState(stored);
    } catch {
      // localStorage unavailable (private browsing, disabled) — fall back silently.
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage failures — in-memory state still updates
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "bn" ? "en" : "bn");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      interpolate(dictionary[locale][key] ?? dictionary.en[key] ?? key, vars),
    [locale],
  );

  // Keep <html lang> in sync for accessibility/SEO once hydrated.
  useEffect(() => {
    if (hydrated) document.documentElement.lang = locale;
  }, [locale, hydrated]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Convenience for rendering an entity's Bilingual field in the active locale. */
export function useBilingual() {
  const { locale } = useLanguage();
  return useCallback(
    (pair: { bn: string; en: string } | undefined | null) => (pair ? pair[locale] : ""),
    [locale],
  );
}
