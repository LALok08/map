"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { CampusEnvironment } from "./Environment";
import { Buildings } from "./Buildings";
import { Corridors } from "./Corridors";
import { Roads } from "./Roads";
import { Greenspace } from "./Greenspace";
import { Trees } from "./Trees";
import { Labels } from "./Labels";
import { CameraController } from "@/camera/CameraController";
import { useCampusStore } from "@/store/campusStore";

// OSM-aligned KMK campus. Origin = centroid of named campus buildings. Bounds ~738 × 687.
const CAM_TARGET = [-16, 0, -60] as [number, number, number];
const CAM_START  = [-16 + 360, 350, -60 + 440] as [number, number, number];

function SceneReady() {
  const setReady = useCampusStore((s) => s.setReady);
  useEffect(() => {
    // Brief delay so Three.js finishes first paint
    const t = setTimeout(() => setReady(true), 400);
    return () => { clearTimeout(t); setReady(false); };
  }, [setReady]);
  return null;
}

export function CampusScene() {
  const select = useCampusStore((s) => s.select);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: CAM_START, fov: 48, near: 1, far: 6000 }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color("#d4e8f0");
      }}
      onPointerMissed={() => select(null)}
    >
      <Suspense fallback={null}>
        <CampusEnvironment />
        <Greenspace />
        <Roads />
        <Trees />
        <Corridors />
        <Buildings />
        <Labels />
        <SceneReady />
      </Suspense>
      <CameraController />
    </Canvas>
  );
}
