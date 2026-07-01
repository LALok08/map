"use client";
import type { Memory } from "./boardStore";

/**
 * Memory persistence layer.
 *
 * This project currently ships as a pure front-end app (competition build,
 * no backend). All memories live in the visitor's own browser via
 * localStorage — nothing leaves the device.
 *
 * ── Reconnecting a real backend later ──────────────────────────────────
 * A matching REST API + Postgres schema already exist, fully written, in
 * `/future-backend` at the project root (not compiled into this app).
 * To go live with a shared backend:
 *   1. Move `future-backend/api/*`   → `src/app/api/*`
 *   2. Move `future-backend/db/*`    → `src/db/*`
 *   3. Move `future-backend/drizzle.config.json` → project root
 *   4. `npm install drizzle-orm pg dotenv` (+ `-D drizzle-kit @types/pg`)
 *   5. Set `DATABASE_URL` in your environment
 *   6. Replace the two function bodies below with the fetch() calls shown
 *      in the comments beneath each — the exported signatures don't change,
 *      so boardStore.ts and every component that uses it needs no edits.
 * See `future-backend/README.md` for full step-by-step instructions.
 * ─────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = "kmk-memories-v1";

function readAll(): Memory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Memory[]) : [];
  } catch {
    return [];
  }
}

function writeAll(memories: Memory[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch (e) {
    // Quota exceeded or storage disabled (private browsing) — fail soft.
    console.warn("[memoryService] could not persist memories:", e);
  }
}

export async function fetchMemories(buildingId?: string): Promise<Memory[]> {
  const all = readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return buildingId ? all.filter((m) => m.buildingId === buildingId) : all;

  // ── Future backend equivalent ──
  // const url = buildingId ? `/api/memories?buildingId=${buildingId}` : "/api/memories";
  // const res = await fetch(url, { cache: "no-store" });
  // if (!res.ok) throw new Error("Failed to load memories");
  // return ((await res.json()) as { memories: Memory[] }).memories;
}

export async function postMemory(input: Omit<Memory, "id" | "createdAt">): Promise<Memory> {
  const author = input.author.trim().slice(0, 80);
  const message = input.message.trim().slice(0, 2000);
  if (!author) throw new Error("Name is required.");
  if (!message) throw new Error("Message is required.");
  if (!input.buildingId || !input.buildingName) {
    throw new Error("A building must be selected.");
  }

  const memory: Memory = {
    ...input,
    author,
    message,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };

  const all = readAll();
  all.unshift(memory);
  writeAll(all);
  return memory;

  // ── Future backend equivalent ──
  // const res = await fetch("/api/memories", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(input),
  // });
  // if (!res.ok) {
  //   const j = await res.json().catch(() => ({}));
  //   throw new Error(j.error ?? "Failed to post memory");
  // }
  // return ((await res.json()) as { memory: Memory }).memory;
}
