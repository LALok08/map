"use client";
import { useState } from "react";
import { useLocale } from "./LocaleContext";
import { LOCALES } from "./translations";

export function LanguageSwitcher() {
  const { locale, setLocale, tr } = useLocale();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        <span>🌐</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="text-slate-400">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                  locale === l.code
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {l.code === "zh" && "🇨🇳"}
                {l.code === "ms" && "🇲🇾"}
                {l.code === "en" && "🇬"}
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
