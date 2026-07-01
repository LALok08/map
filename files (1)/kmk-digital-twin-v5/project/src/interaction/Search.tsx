"use client";
import { useEffect, useMemo, useRef } from "react";
import { buildings, metadata, CATEGORY_LABELS } from "@/gis";
import { useCampusStore } from "@/store/campusStore";
import { useLocale } from "@/i18n/LocaleContext";

/**
 * Search & locate (PRD §10). Matches building name, category and tags,
 * then flies the camera to the chosen result.
 */
export function Search() {
  const { tr } = useLocale();
  const open = useCampusStore((s) => s.searchOpen);
  const setOpen = useCampusStore((s) => s.setSearchOpen);
  const query = useCampusStore((s) => s.query);
  const setQuery = useCampusStore((s) => s.setQuery);
  const select = useCampusStore((s) => s.select);
  const flyTo = useCampusStore((s) => s.flyTo);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = buildings.map((b) => ({ b, meta: metadata[b.id] }));
    if (!q) return list.slice(0, 8);
    return list
      .filter(({ b, meta }) => {
        const hay = [
          b.name,
          CATEGORY_LABELS[b.category],
          ...(meta?.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 10);
  }, [query]);

  if (!open) return null;

  const choose = (id: string) => {
    const b = buildings.find((x) => x.id === id)!;
    select(id);
    const span = Math.max(b.bbox[2] - b.bbox[0], b.bbox[3] - b.bbox[1]) + b.height + 70;
    flyTo(b.center[0], b.center[1], span);
    setOpen(false);
  };

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-slate-900/30 px-4 pt-24 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-4">
          <span className="text-slate-400">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) choose(results[0].b.id);
            }}
            placeholder={tr("searchPlaceholder")}
            className="w-full bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
            Esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              {tr("noResults")}
            </li>
          )}
          {results.map(({ b, meta }) => (
            <li key={b.id}>
              <button
                onClick={() => choose(b.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
              >
                <span className="text-lg">{meta?.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {b.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {CATEGORY_LABELS[b.category]} · {b.floors} floors · {Math.round(b.area)} m²
                  </span>
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: b.color }}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
