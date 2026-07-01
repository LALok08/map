"use client";
import { useEffect, useMemo } from "react";
import { buildingById, metadata, CATEGORY_LABELS, CATEGORY_COLORS } from "@/gis";
import { useCampusStore } from "@/store/campusStore";
import { useBoardStore } from "@/board/boardStore";
import { MemoryCard } from "@/board/MemoryCard";
import { MemoryForm } from "@/board/MemoryForm";
import { useLocale } from "@/i18n/LocaleContext";

export function BuildingInfo() {
  const { tr } = useLocale();
  const selectedId = useCampusStore((s) => s.selectedId);
  const select = useCampusStore((s) => s.select);
  const memories = useBoardStore((s) => s.memories);
  const load = useBoardStore((s) => s.load);
  const loading = useBoardStore((s) => s.loading);

  useEffect(() => {
    load();
  }, [load]);

  const building = selectedId ? buildingById.get(selectedId) : undefined;
  const meta = selectedId ? metadata[selectedId] : undefined;

  const buildingMemories = useMemo(
    () => memories.filter((m) => m.buildingId === selectedId),
    [memories, selectedId],
  );

  const open = Boolean(building);

  return (
    <div
      className={`pointer-events-none absolute right-0 top-0 z-30 h-full w-full max-w-[400px] p-3 transition-transform duration-300 sm:p-4 ${
        open ? "translate-x-0" : "translate-x-[120%]"
      }`}
    >
      <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-2xl backdrop-blur">
        {building && meta && (
          <>
            <div
              className="relative px-4 pb-4 pt-5"
              style={{
                background: `linear-gradient(135deg, ${building.color}, ${building.color}cc)`,
              }}
            >
              <button
                onClick={() => select(null)}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/15 text-white transition hover:bg-black/30"
              >
                ✕
              </button>
              <div className="text-3xl">{meta.emoji}</div>
              <h2 className="mt-1.5 text-xl font-bold leading-tight text-white drop-shadow">
                {building.name}
              </h2>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/25 px-2 py-0.5 text-xs font-medium text-white">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: CATEGORY_COLORS[building.category] }}
                />
                {tr(`category${building.category.charAt(0).toUpperCase() + building.category.slice(1)}` as any)}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <Stat label={tr("floors")} value={String(building.floors)} />
                <Stat label={tr("height")} value={`${building.height} m`} />
                <Stat label={tr("footprint")} value={`${Math.round(building.area)} m²`} />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                {meta.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {meta.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                🕘 {meta.hours}
              </div>

              <div className="mt-5">
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    {tr("memoriesTitle")}
                    <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                      {buildingMemories.length}
                    </span>
                  </h3>
                </div>

                <MemoryForm buildingId={building.id} buildingName={building.name} />

                <div className="mt-3 space-y-2.5">
                  {loading && buildingMemories.length === 0 && (
                    <p className="py-4 text-center text-xs text-slate-400">Loading…</p>
                  )}
                  {!loading && buildingMemories.length === 0 && (
                    <p className="py-6 text-center text-sm text-slate-400">
                      {tr("noMemories")}
                    </p>
                  )}
                  {buildingMemories.map((m) => (
                    <MemoryCard key={m.id} m={m} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
      <div className="text-sm font-bold text-slate-800">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
