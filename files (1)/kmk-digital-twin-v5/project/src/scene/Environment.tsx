"use client";
import * as THREE from "three";
import { Sky } from "@react-three/drei";
import { manifest } from "@/gis";

/**
 * KMK campus environment: tropical sky, warm sunlight, reddish-earth terrain.
 * Based on the satellite imagery showing laterite/red-clay soil typical of Kedah.
 */
export function CampusEnvironment() {
  const { bounds } = manifest;
  const W = bounds.maxX - bounds.minX + 300;
  const D = bounds.maxZ - bounds.minZ + 300;
  const cx = (bounds.maxX + bounds.minX) / 2;
  const cz = (bounds.maxZ + bounds.minZ) / 2;

  return (
    <>
      {/* Tropical sky — Kedah midday */}
      <Sky
        distance={6000}
        sunPosition={[300, 280, 160]}
        turbidity={3.5}
        rayleigh={1.0}
        mieCoefficient={0.004}
        mieDirectionalG={0.85}
        inclination={0.49}
        azimuth={0.18}
      />
      <fog attach="fog" args={["#d4e8f0", 800, 1800]} />

      {/* Lighting: tropical bright + warm hemisphere */}
      <ambientLight intensity={0.35} color="#fff5e0" />
      <hemisphereLight args={["#b8d8f0", "#c8a070", 0.75]} />
      <directionalLight
        castShadow
        position={[300, 280, 160]}
        intensity={2.4}
        color="#fffae8"
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={1600}
        shadow-camera-left={-450}
        shadow-camera-right={450}
        shadow-camera-top={450}
        shadow-camera-bottom={-450}
        shadow-bias={-0.0004}
      />

      {/* ── TERRAIN GROUND ────────────────────────────────────────────────── */}
      {/* Base: reddish laterite soil (matches KMK satellite colour) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.05, cz]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#b8906a" roughness={1} metalness={0} />
      </mesh>

      {/* Paved campus core — lighter concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.01, 15]} receiveShadow>
        <planeGeometry args={[380, 310]} />
        <meshStandardMaterial color="#c4b89a" roughness={0.98} metalness={0} />
      </mesh>

      {/* East campus — also paved */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[180, 0.01, 80]} receiveShadow>
        <planeGeometry args={[240, 280]} />
        <meshStandardMaterial color="#c4b89a" roughness={0.98} metalness={0} />
      </mesh>

      {/* Subtle orientation grid (very faint) */}
      <gridHelper
        args={[Math.max(W, D), 60, "#b0a890", "#b8b0a0"]}
        position={[cx, 0.06, cz]}
      />
    </>
  );
}
