"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Compass (PRD §11). Reads the OrbitControls camera azimuth from the
 * default camera via a lightweight rAF loop on window — no Three import.
 */
export function Compass() {
  const [deg, setDeg] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const tick = () => {
      const cam = (window as unknown as { __campusCamera?: { x: number; z: number; tx: number; tz: number } }).__campusCamera;
      if (cam) {
        const angle = Math.atan2(cam.x - cam.tx, cam.z - cam.tz);
        setDeg((angle * 180) / Math.PI);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div className="grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-white/90 shadow-md backdrop-blur">
      <div className="relative h-10 w-10" style={{ transform: `rotate(${deg}deg)` }}>
        <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[11px] font-bold text-red-500">
          N
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-400">
          S
        </span>
        <div className="absolute left-1/2 top-1/2 h-7 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-red-500 via-slate-300 to-slate-400" />
      </div>
    </div>
  );
}
