import type { CameraMode } from "@/store/campusStore";

export interface CamPreset {
  minPolar: number;
  maxPolar: number;
  distance: number;
  targetY: number;
  enableRotate: boolean;
  enablePan: boolean;
  maxDistance: number;
  minDistance: number;
}

const D2R = Math.PI / 180;

// KMK campus is ~738m × 687m; scale distances accordingly
export const CAMERA_PRESETS: Record<CameraMode, CamPreset> = {
  bird: {
    minPolar:      0.01,
    maxPolar:      22 * D2R,
    distance:      820,
    targetY:       0,
    enableRotate:  true,
    enablePan:     true,
    maxDistance:   1200,
    minDistance:   300,
  },
  orbit: {
    minPolar:      12 * D2R,
    maxPolar:      78 * D2R,
    distance:      450,
    targetY:       8,
    enableRotate:  true,
    enablePan:     true,
    maxDistance:   1000,
    minDistance:   60,
  },
  walk: {
    minPolar:      68 * D2R,
    maxPolar:      90 * D2R,
    distance:      28,
    targetY:       8,
    enableRotate:  true,
    enablePan:     true,
    maxDistance:   80,
    minDistance:   8,
  },
  fly: {
    minPolar:      6 * D2R,
    maxPolar:      82 * D2R,
    distance:      260,
    targetY:       12,
    enableRotate:  true,
    enablePan:     true,
    maxDistance:   1200,
    minDistance:   30,
  },
};
