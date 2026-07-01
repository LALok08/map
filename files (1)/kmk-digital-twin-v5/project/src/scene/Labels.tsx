"use client";
import { Html } from "@react-three/drei";
import { buildings, metadata } from "@/gis";
import { useCampusStore } from "@/store/campusStore";

/**
 * Building name labels anchored to 3D positions via drei <Html>.
 * Always pure React/HTML — no Three API in this file.
 */
export function Labels() {
  const showLabels     = useCampusStore((s) => s.showLabels);
  const selectedId     = useCampusStore((s) => s.selectedId);
  const hoveredId      = useCampusStore((s) => s.hoveredId);
  const categoryFilter = useCampusStore((s) => s.categoryFilter);
  const select         = useCampusStore((s) => s.select);
  const flyTo          = useCampusStore((s) => s.flyTo);

  return (
    <>
      {buildings.map((b) => {
        const active = selectedId === b.id || hoveredId === b.id;
        const dimmed = categoryFilter != null && b.category !== categoryFilter;
        if (!showLabels && !active) return null;
        if (dimmed && !active) return null;

        const meta = metadata[b.id];
        const span = Math.max(b.bbox[2] - b.bbox[0], b.bbox[3] - b.bbox[1]) + b.height + 60;
        const labelY = b.height + 6;

        return (
          <Html
            key={b.id}
            position={[b.center[0], labelY, b.center[1]]}
            center
            distanceFactor={220}
            zIndexRange={[20, 0]}
            occlude={false}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                select(b.id);
                flyTo(b.center[0], b.center[1], span);
              }}
              className={`pointer-events-auto select-none whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-semibold shadow transition ${
                active
                  ? "border-slate-800 bg-slate-900 text-white shadow-lg"
                  : "border-slate-300/80 bg-white/88 text-slate-700 hover:bg-white hover:border-slate-400"
              }`}
              style={{ backdropFilter: "blur(3px)" }}
            >
              <span className="mr-1 text-[11px]">{meta?.emoji}</span>
              {b.name}
            </button>
          </Html>
        );
      })}
    </>
  );
}
