"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useBoardStore } from "@/board/boardStore";
import { MemoryCard } from "@/board/MemoryCard";
import { useLocale } from "@/i18n/LocaleContext";
import { buildingById } from "@/gis";
import { useCampusStore } from "@/store/campusStore";

export function MemoryBoardClient() {
  const { tr } = useLocale();
  const load = useBoardStore((s) => s.load);
  const select = useCampusStore((s) => s.select);
  const flyTo = useCampusStore((s) => s.flyTo);

  // Pull memories from localStorage on mount
  useEffect(() => {
    load();
  }, [load]);

  const memories = useBoardStore((s) => s.memories);
  const [role, setRole] = useState<string>("all");
  const [year, setYear] = useState<string>("all");

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

  const handleNavigateToBuilding = (buildingId: string) => {
    const b = buildingById.get(buildingId);
    if (b) {
      select(b.id);
      const span = Math.max(b.bbox[2] - b.bbox[0], b.bbox[3] - b.bbox[1]) + b.height + 70;
      flyTo(b.center[0], b.center[1], span);
    }
  };

  const sel = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <Link href="/" className="text-sm font-medium text-sky-600 hover:underline">
              ← {tr("backToCampus")}
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{tr("boardTitle")}</h1>
            <p className="text-sm text-slate-500">
              {tr("boardSubtitle", { count: filtered.length })}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            🏫 {tr("backToCampus")}
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl gap-3 px-4 py-3">
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
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-400">{tr("noMemories")}</p>
          </div>
        )}
        <div className="space-y-4">
          {filtered.map((m) => (
            <div key={m.id}>
              <button
                onClick={() => handleNavigateToBuilding(m.buildingId)}
                className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-600 hover:underline"
              >
                📍 {m.buildingName}
              </button>
              <MemoryCard m={m} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-400">
          <p>KMK Digital Twin Campus © {new Date().getFullYear()}</p>
          <p className="mt-1 text-xs">Built on real GIS data · Three.js · Next.js</p>
        </div>
      </footer>
    </main>
  );
}
