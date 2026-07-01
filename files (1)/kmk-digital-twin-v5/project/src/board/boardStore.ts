"use client";
import { create } from "zustand";
import { fetchMemories, postMemory } from "./memoryService";

export interface Memory {
  id: number;
  buildingId: string;
  buildingName: string;
  author: string;
  role: string;
  gradYear: number | null;
  faculty: string | null;
  message: string;
  photoUrl: string | null;
  createdAt: string | Date;
}

interface BoardState {
  memories: Memory[];
  loading: boolean;
  error: string | null;
  yearFilter: number | null;
  setMemories: (m: Memory[]) => void;
  load: () => Promise<void>;
  add: (m: Omit<Memory, "id" | "createdAt">) => Promise<boolean>;
  setYearFilter: (y: number | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  memories: [],
  loading: false,
  error: null,
  yearFilter: null,

  setMemories: (m) => set({ memories: m }),

  load: async () => {
    set({ loading: true, error: null });
    try {
      const memories = await fetchMemories();
      set({ memories, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  add: async (m) => {
    try {
      const memory = await postMemory(m);
      set({ memories: [memory, ...get().memories], error: null });
      return true;
    } catch (e) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  setYearFilter: (y) => set({ yearFilter: y }),
}));
