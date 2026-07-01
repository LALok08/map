"use client";
import Link from "next/link";
import { useCampusStore, type CameraMode } from "@/store/campusStore";
import { CATEGORY_COLORS, CATEGORY_LABELS, manifest } from "@/gis";
import { Compass } from "./Compass";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { useLocale } from "@/i18n/LocaleContext";
import type { TranslationKey } from "@/i18n/translations";

const MODES: { id: CameraMode; labelKey: TranslationKey; icon: string }[] = [
  { id: "bird",  labelKey: "birdView",  icon: "🦅" },
  { id: "orbit", labelKey: "orbitView", icon: "🛰️" },
  { id: "fly",   labelKey: "flyView",   icon: "✈️" },
  { id: "walk",  labelKey: "walkView",  icon: "🚶" },
];

// KMK categories shown in the legend — grouped for clarity
const LEGEND_CATS = [
  "dewan", "academic", "library", "masjid",
  "residence_m", "residence_f",
  "cafe", "sports", "admin", "koop",
];

export function HUD() {
  const { tr } = useLocale();
  const cameraMode   = useCampusStore((s) => s.cameraMode);
  const setCameraMode = useCampusStore((s) => s.setCameraMode);
  const showLabels   = useCampusStore((s) => s.showLabels);
  const toggleLabels = useCampusStore((s) => s.toggleLabels);
  const reset        = useCampusStore((s) => s.reset);
  const setSearchOpen = useCampusStore((s) => s.setSearchOpen);
  const categoryFilter = useCampusStore((s) => s.categoryFilter);
  const setCategoryFilter = useCampusStore((s) => s.setCategoryFilter);
  const setBoardOpen = useCampusStore((s) => s.setBoardOpen);

  // Build a translation key for category label
  const catLabel = (c: string) => {
    const key = `category${c.charAt(0).toUpperCase() + c.slice(1)}` as TranslationKey;
    return CATEGORY_LABELS[c] ? tr(key) || CATEGORY_LABELS[c] : CATEGORY_LABELS[c] ?? c;
  };

  return (
    <>
      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-3 sm:p-4">

        {/* Logo */}
        <div className="pointer-events-auto shrink-0 rounded-2xl border border-white/60 bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-600">
            {tr("digitalTwin")}
          </div>
          <div className="text-lg font-black leading-none text-slate-900">KMK</div>
          <div className="text-[9px] text-slate-500">{tr("kmkFull")}</div>
        </div>

        {/* Action buttons */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>🔍</span>
            <span className="hidden sm:inline">{tr("search")}</span>
            <kbd className="hidden rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-400 sm:inline">/</kbd>
          </button>

          {/* Memories board (in-canvas overlay) */}
          <button
            onClick={() => setBoardOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>💬</span>
            <span className="hidden sm:inline">{tr("memories")}</span>
          </button>

          {/* Separate memories page */}
          <Link
            href="/memories"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>📋</span>
            <span className="hidden sm:inline">Board</span>
          </Link>

          <LanguageSwitcher />
          <Compass />
        </div>
      </div>

      {/* ── BOTTOM LEFT: Camera mode controls ─────────────────────────────── */}
      <div className="pointer-events-auto absolute bottom-20 left-3 z-30 sm:bottom-24 sm:left-4">
        <div className="flex flex-col gap-1.5 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-lg backdrop-blur">
          <div className="flex gap-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setCameraMode(m.id)}
                title={tr(m.labelKey)}
                className={`flex h-11 w-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold transition ${
                  cameraMode === m.id
                    ? "bg-slate-900 text-white shadow-inner"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="text-base leading-none">{m.icon}</span>
                <span>{tr(m.labelKey)}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={toggleLabels}
              className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                showLabels ? "bg-sky-100 text-sky-700" : "text-slate-400 hover:bg-slate-100"
              }`}
            >
              🏷️ {tr("labels")}
            </button>
            <button
              onClick={reset}
              className="flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-100"
            >
              ↺ {tr("reset")}
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Category legend / filter ──────────────────────────────── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3">
        <div className="pointer-events-auto flex max-w-[95vw] flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur">
          {LEGEND_CATS.map((c) => {
            const active = categoryFilter === c;
            return (
              <button
                key={c}
                onClick={() => setCategoryFilter(active ? null : c)}
                className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : categoryFilter
                      ? "text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                      : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: CATEGORY_COLORS[c] }}
                />
                {catLabel(c)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOP-RIGHT info badge ────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute right-3 top-[4.5rem] z-20 hidden flex-col items-end gap-0.5 text-right sm:flex">
        <span className="rounded-lg bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-500 backdrop-blur shadow">
          {manifest.counts.buildings} {tr("buildingCount", { n: "" }).replace("{n} ", "")}
        </span>
        <span className="rounded-lg bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-500 backdrop-blur shadow">
          ~32 ha · KMK Kedah
        </span>
      </div>
    </>
  );
}
