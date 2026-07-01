"use client";
import { useEffect, useState } from "react";
import { useCampusStore } from "@/store/campusStore";
import { manifest } from "@/gis";
import { useLocale } from "@/i18n/LocaleContext";

export function LoadingScreen() {
  const { tr } = useLocale();
  const ready = useCampusStore((s) => s.ready);
  const [hidden, setHidden] = useState(false);
  const [pct, setPct] = useState(8);

  useEffect(() => {
    if (ready) {
      setPct(100);
      const t = setTimeout(() => setHidden(true), 650);
      return () => clearTimeout(t);
    }
    const id = setInterval(() => {
      setPct((p) => (p < 90 ? p + Math.random() * 12 : p));
    }, 240);
    return () => clearInterval(id);
  }, [ready]);

  if (hidden) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-50 grid place-items-center bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-opacity duration-700 ${
        ready ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-[min(86vw,420px)] text-center">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
          {tr("loadingTitle")}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">KMK Campus</h1>
        <p className="mt-2 text-sm text-slate-300">
          {tr("loadingSubtitle")} · {manifest.counts.buildings} buildings ·{" "}
          {manifest.counts.roads} roads · {manifest.counts.greenspace} green zones
        </p>
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-sky-400 transition-all duration-300"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {tr("loadingPipeline")}
        </p>
      </div>
    </div>
  );
}
