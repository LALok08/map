"use client";
import { create } from "zustand";

export type CameraMode = "bird" | "orbit" | "walk" | "fly";

export interface FlyTarget {
  x: number;
  z: number;
  /** distance scalar for framing */
  span: number;
  /** monotonically increasing token so repeated flyTo to same place re-triggers */
  token: number;
}

interface CampusState {
  ready: boolean;
  loadProgress: number;
  cameraMode: CameraMode;
  selectedId: string | null;
  hoveredId: string | null;
  searchOpen: boolean;
  query: string;
  flyTarget: FlyTarget | null;
  showLabels: boolean;
  categoryFilter: string | null;
  boardOpen: boolean;

  setReady: (v: boolean) => void;
  setBoardOpen: (v: boolean) => void;
  setProgress: (v: number) => void;
  setCameraMode: (m: CameraMode) => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setSearchOpen: (v: boolean) => void;
  setQuery: (q: string) => void;
  flyTo: (x: number, z: number, span?: number) => void;
  clearFly: () => void;
  toggleLabels: () => void;
  setCategoryFilter: (c: string | null) => void;
  reset: () => void;
}

export const useCampusStore = create<CampusState>((set, get) => ({
  ready: false,
  loadProgress: 0,
  cameraMode: "orbit",
  selectedId: null,
  hoveredId: null,
  searchOpen: false,
  query: "",
  flyTarget: null,
  showLabels: true,
  categoryFilter: null,
  boardOpen: false,

  setReady: (v) => set({ ready: v }),
  setBoardOpen: (v) => set({ boardOpen: v }),
  setProgress: (v) => set({ loadProgress: v }),
  setCameraMode: (m) => set({ cameraMode: m }),
  select: (id) => set({ selectedId: id }),
  hover: (id) => set({ hoveredId: id }),
  setSearchOpen: (v) => set({ searchOpen: v }),
  setQuery: (q) => set({ query: q }),
  flyTo: (x, z, span = 90) =>
    set({ flyTarget: { x, z, span, token: get().flyTarget ? get().flyTarget!.token + 1 : 1 } }),
  clearFly: () => set({ flyTarget: null }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  setCategoryFilter: (c) => set({ categoryFilter: c }),
  reset: () =>
    set({
      selectedId: null,
      hoveredId: null,
      cameraMode: "orbit",
      // Real campus centroid (derived from surveyed building footprints)
      flyTarget: { x: -16, z: -60, span: 820, token: (get().flyTarget?.token ?? 0) + 1 },
      categoryFilter: null,
    }),
}));
