"use client";
import dynamic from "next/dynamic";
import { HUD } from "@/ui/HUD";
import { MiniMap } from "@/ui/MiniMap";
import { BuildingInfo } from "@/ui/BuildingInfo";
import { LoadingScreen } from "@/ui/LoadingScreen";
import { Search } from "@/interaction/Search";
import { MemoryBoard } from "@/board/MemoryBoard";

// The Three.js engine is client-only (no SSR).
const CampusScene = dynamic(
  () => import("@/scene/CampusScene").then((m) => m.CampusScene),
  { ssr: false },
);

export function CampusApp() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#cfe0ea]">
      <CampusScene />
      <HUD />
      <MiniMap />
      <BuildingInfo />
      <Search />
      <MemoryBoard />
      <LoadingScreen />
    </main>
  );
}
