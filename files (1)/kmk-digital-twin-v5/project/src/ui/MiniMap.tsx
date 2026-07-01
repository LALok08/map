"use client";
import { useMemo, useState } from "react";
import { buildings, roads, greenspace, manifest } from "@/gis";
import { useCampusStore } from "@/store/campusStore";
import { useLocale } from "@/i18n/LocaleContext";

const W = 200;
const H = 160;

export function MiniMap() {
  const { tr } = useLocale();
  const { bounds } = manifest;
  const [open, setOpen] = useState(true);
  const selectedId     = useCampusStore((s) => s.selectedId);
  const categoryFilter = useCampusStore((s) => s.categoryFilter);
  const select         = useCampusStore((s) => s.select);
  const flyTo          = useCampusStore((s) => s.flyTo);

  const pad = 10;
  const scaleX = (W - pad * 2) / (bounds.maxX - bounds.minX);
  const scaleZ = (H - pad * 2) / (bounds.maxZ - bounds.minZ);
  const s = Math.min(scaleX, scaleZ);

  // Centre the map content within the SVG
  const totalW = (bounds.maxX - bounds.minX) * s;
  const totalH = (bounds.maxZ - bounds.minZ) * s;
  const offX = (W - totalW) / 2;
  const offZ = (H - totalH) / 2;

  const px = (x: number) => offX + (x - bounds.minX) * s;
  const pz = (z: number) => offZ + (z - bounds.minZ) * s;

  const roadPaths = useMemo(
    () =>
      roads.map((r) => ({
        id: r.id,
        d: r.polyline
          .map((p, i) => `${i ? "L" : "M"}${px(p[0]).toFixed(1)} ${pz(p[1]).toFixed(1)}`)
          .join(" "),
        w: Math.max(0.6, r.width * s * 0.55),
        color: r.type === "primary" ? "#7a838e" : r.type === "secondary" ? "#9aa3ad" : "#b0b8c0",
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s],
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto absolute bottom-20 right-3 z-20 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-md backdrop-blur sm:right-4 sm:bottom-24"
      >
        🗺️ {tr("miniMap")}
      </button>
    );
  }

  return (
    <div className="pointer-events-auto absolute bottom-20 right-3 z-20 overflow-hidden rounded-2xl border border-white/70 bg-white/92 shadow-xl backdrop-blur sm:right-4 sm:bottom-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          KMK · {tr("miniMap")}
        </span>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>
      </div>

      <svg width={W} height={H} className="block" style={{ background: "#b8906a" }}>
        {/* Greenspace */}
        {greenspace.map((g) => (
          <polygon
            key={g.id}
            points={g.polygon.map((p) => `${px(p[0])},${pz(p[1])}`).join(" ")}
            fill={
              g.type === "field"  ? "#7aad56" :
              g.type === "lawn"   ? "#8aba64" :
              g.type === "garden" ? "#6a9e46" :
              "#b0a888"
            }
          />
        ))}

        {/* Roads */}
        {roadPaths.map((r) => (
          <path
            key={r.id}
            d={r.d}
            stroke={r.color}
            strokeWidth={r.w}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Buildings */}
        {buildings.map((b) => {
          const sel = selectedId === b.id;
          const dim = categoryFilter != null && b.category !== categoryFilter;
          return (
            <polygon
              key={b.id}
              points={b.polygon.map((p) => `${px(p[0])},${pz(p[1])}`).join(" ")}
              fill={sel ? "#0f172a" : b.color}
              opacity={dim ? 0.18 : 1}
              stroke={sel ? "#ffffff" : "rgba(0,0,0,0.25)"}
              strokeWidth={sel ? 1.2 : 0.4}
              className="cursor-pointer"
              onClick={() => {
                select(b.id);
                const span =
                  Math.max(b.bbox[2] - b.bbox[0], b.bbox[3] - b.bbox[1]) + b.height + 60;
                flyTo(b.center[0], b.center[1], span);
              }}
            />
          );
        })}

        {/* North indicator */}
        <text x="6" y="14" fill="white" fontSize="8" fontWeight="bold">N↑</text>
      </svg>
    </div>
  );
}
