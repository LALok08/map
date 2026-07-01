"use client";
import { useEffect, useMemo, useState } from "react";
import { useBoardStore } from "./boardStore";
import { useCampusStore } from "@/store/campusStore";
import { buildingById } from "@/gis";
import { MemoryCard } from "./MemoryCard";
import { useLocale } from "@/i18n/LocaleContext";

/**
 * In-canvas Memory Board overlay (PRD §12).
 * Fully decoupled from the 3D scene — campus never depends on it.
 */
export function MemoryBoard() {
  const { tr } = useLocale();
  const open    = useCampusStore((s) => s.boardOpen);
  const setOpen = useCampusStore((s) => s.setBoardOpen);
  const select  = useCampusStore((s) => s.select);
  const flyTo   = useCampusStore((s) => s.flyTo);

  const memories = useBoardStore((s) => s.memories);
  const load     = useBoardStore((s) => s.load);
  const [role, setRole] = useState<string>("all");
  const [year, setYear] = useState<string>("all");

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const years = useMemo(() => {
    const set = new Set<number>();
    memories.forEach((m) => m.gradYear && set.add(m.gradYear));
    return [...set].sort((a, b) => b - a);
  }, [memories]);

  const filtered = useMemo(
    () =>
      memories.filter(
        (m) =>
          (role === "all" || m.role === role) &&
          (year === "all" || String(m.gradYear) === year),
      ),
    [memories, role, year],
  );

  if (!open) return null;

  const sel = "rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none";

  return (
    <div
      className="absolute inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{tr("boardTitle")}</h2>
            <p className="text-xs text-slate-400">
              {tr("boardSubtitle", { count: filtered.length })}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-slate-100 px-4 py-2.5">
          <select className={sel} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">{tr("allRoles")}</option>
            <option value="student">{tr("student")}</option>
            <option value="alumni">{tr("alumni")}</option>
            <option value="staff">{tr("staff")}</option>
            <option value="visitor">{tr("visitor")}</option>
          </select>
          <select className={sel} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">{tr("allYears")}</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {tr("classOf", { year: y })}
              </option>
            ))}
          </select>
        </div>

        {/* Memory list */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              {tr("noMemories")}
            </p>
          )}
          {filtered.map((m) => (
            <div key={m.id}>
              <button
                onClick={() => {
                  const b = buildingById.get(m.buildingId);
                  if (b) {
                    setOpen(false);
                    select(b.id);
                    const span =
                      Math.max(b.bbox[2] - b.bbox[0], b.bbox[3] - b.bbox[1]) +
                      b.height + 60;
                    flyTo(b.center[0], b.center[1], span);
                  }
                }}
                className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-sky-600 hover:underline"
              >
                <span>📍</span>
                {m.buildingName}
              </button>
              <MemoryCard m={m} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
