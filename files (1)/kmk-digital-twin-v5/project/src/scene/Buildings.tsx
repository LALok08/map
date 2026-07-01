"use client";
import { useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { buildings } from "@/gis";
import type { Building } from "@/gis/types";
import { useCampusStore } from "@/store/campusStore";

/**
 * Building system (PRD §7):
 *   GIS polygon (+ courtyard holes) → ExtrudeGeometry → walls + roof + outline.
 *   Special features: Masjid dome + minaret, Dewan big roof.
 *   Courtyards (holes) create an open-air void through the whole building.
 */

// Build a THREE.Shape from outer polygon + courtyard holes.
function buildShape(b: Building): THREE.Shape {
  const shape = new THREE.Shape();
  b.polygon.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();

  (b.holes || []).forEach((hole) => {
    const path = new THREE.Path();
    hole.forEach(([x, z], i) => {
      if (i === 0) path.moveTo(x, -z);
      else path.lineTo(x, -z);
    });
    path.closePath();
    shape.holes.push(path);
  });
  return shape;
}

function roofColor(wallHex: string, category: string): string {
  if (category === "residence_m") return "#8ab0d0";
  if (category === "residence_f") return "#c44070";
  if (category === "dewan")       return "#b07820";
  if (category === "masjid")      return "#cdb47a"; // light flat roof around dome
  if (category === "library")     return "#b07020";
  if (category === "cafe")        return "#b05535";
  const c = new THREE.Color(wallHex);
  c.multiplyScalar(0.72);
  return `#${c.getHexString()}`;
}

function makeWallGeometry(b: Building) {
  const shape = buildShape(b);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: b.height,
    bevelEnabled: false,
    curveSegments: 4,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

// Roof = same shape (with holes) as a flat cap on top.
function makeRoofGeometry(b: Building) {
  const shape = buildShape(b);
  const geo = new THREE.ShapeGeometry(shape, 4);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, b.height + 0.05, 0);
  return geo;
}

// Floor-slab lines: faint horizontal outlines at each storey to imply floors.
function makeFloorLines(b: Building) {
  const segs: THREE.Vector3[] = [];
  const ring = [...b.polygon, b.polygon[0]];
  for (let f = 1; f < b.floors; f++) {
    const y = f * (b.height / b.floors);
    for (let i = 0; i < ring.length - 1; i++) {
      segs.push(new THREE.Vector3(ring[i][0], y, ring[i][1]));
      segs.push(new THREE.Vector3(ring[i + 1][0], y, ring[i + 1][1]));
    }
  }
  return new THREE.BufferGeometry().setFromPoints(segs);
}

function makeOutline(b: Building) {
  const pts: THREE.Vector3[] = [];
  const ring = [...b.polygon, b.polygon[0]];
  for (let i = 0; i < ring.length - 1; i++) {
    pts.push(new THREE.Vector3(ring[i][0], b.height + 0.1, ring[i][1]));
    pts.push(new THREE.Vector3(ring[i + 1][0], b.height + 0.1, ring[i + 1][1]));
  }
  // also outline courtyard holes on top
  (b.holes || []).forEach((hole) => {
    const hr = [...hole, hole[0]];
    for (let i = 0; i < hr.length - 1; i++) {
      pts.push(new THREE.Vector3(hr[i][0], b.height + 0.1, hr[i][1]));
      pts.push(new THREE.Vector3(hr[i + 1][0], b.height + 0.1, hr[i + 1][1]));
    }
  });
  return new THREE.BufferGeometry().setFromPoints(pts);
}

// ── Masjid dome + minaret ────────────────────────────────────────────────────
function MasjidExtras({ b }: { b: Building }) {
  const r = b.features.domeRadius ?? 10;
  const minH = b.features.minaretHeight ?? 30;
  const [cx, cz] = b.center;
  // minaret offset to a corner
  const mx = cx + (b.bbox[2] - b.bbox[0]) / 2 - 4;
  const mz = cz - (b.bbox[3] - b.bbox[1]) / 2 + 4;
  return (
    <group>
      {/* Dome base drum */}
      <mesh position={[cx, b.height, cz]} castShadow>
        <cylinderGeometry args={[r * 0.92, r, 2.5, 24]} />
        <meshStandardMaterial color="#3fa873" roughness={0.7} />
      </mesh>
      {/* Dome */}
      <mesh position={[cx, b.height + 2.5, cz]} castShadow>
        <sphereGeometry args={[r, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2f8f63" roughness={0.45} metalness={0.25} />
      </mesh>
      {/* Dome finial */}
      <mesh position={[cx, b.height + 2.5 + r + 1.2, cz]} castShadow>
        <coneGeometry args={[0.6, 2.4, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Minaret shaft */}
      <mesh position={[mx, minH / 2, mz]} castShadow>
        <cylinderGeometry args={[2.2, 2.6, minH, 12]} />
        <meshStandardMaterial color="#e8efe6" roughness={0.8} />
      </mesh>
      {/* Minaret cap */}
      <mesh position={[mx, minH + 2, mz]} castShadow>
        <coneGeometry args={[2.6, 4, 12]} />
        <meshStandardMaterial color="#2f8f63" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[mx, minH + 5, mz]} castShadow>
        <coneGeometry args={[0.4, 1.6, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ── Dewan big pitched roof ───────────────────────────────────────────────────
function DewanRoof({ b }: { b: Building }) {
  const w = b.bbox[2] - b.bbox[0];
  const d = b.bbox[3] - b.bbox[1];
  const [cx, cz] = b.center;
  return (
    <mesh position={[cx, b.height + 4, cz]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[Math.max(w, d) * 0.62, 9, 4]} />
      <meshStandardMaterial color="#9c6418" roughness={0.85} flatShading />
    </mesh>
  );
}

function BuildingMesh({ b }: { b: Building }) {
  const wallGeo  = useMemo(() => makeWallGeometry(b), [b]);
  const roofGeo  = useMemo(() => makeRoofGeometry(b), [b]);
  const floorGeo = useMemo(() => makeFloorLines(b), [b]);
  const outGeo   = useMemo(() => makeOutline(b), [b]);

  const selectedId     = useCampusStore((s) => s.selectedId);
  const hoveredId      = useCampusStore((s) => s.hoveredId);
  const categoryFilter = useCampusStore((s) => s.categoryFilter);
  const select         = useCampusStore((s) => s.select);
  const hover          = useCampusStore((s) => s.hover);
  const flyTo          = useCampusStore((s) => s.flyTo);

  const isSelected = selectedId === b.id;
  const isHovered  = hoveredId  === b.id;
  const dimmed     = categoryFilter != null && b.category !== categoryFilter;

  const base = new THREE.Color(b.color);
  const wallColor = isSelected
    ? base.clone().lerp(new THREE.Color("#ffffff"), 0.3)
    : isHovered
      ? base.clone().lerp(new THREE.Color("#ffffff"), 0.15)
      : base;
  const rColor = roofColor(b.color, b.category);
  const span = Math.max(b.bbox[2] - b.bbox[0], b.bbox[3] - b.bbox[1]) + b.height + 55;

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); hover(b.id); document.body.style.cursor = "pointer";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); hover(null); document.body.style.cursor = "auto";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation(); select(b.id); flyTo(b.center[0], b.center[1], span);
  };

  return (
    <group>
      <mesh geometry={wallGeo} castShadow receiveShadow
        onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <meshStandardMaterial
          color={wallColor} roughness={0.82} metalness={0.03}
          emissive={isSelected ? new THREE.Color(b.color) : new THREE.Color("#000")}
          emissiveIntensity={isSelected ? 0.28 : 0}
          transparent opacity={dimmed ? 0.14 : 1}
        />
      </mesh>

      <mesh geometry={roofGeo} receiveShadow>
        <meshStandardMaterial color={rColor} roughness={0.9}
          transparent opacity={dimmed ? 0.12 : 1} />
      </mesh>

      {/* Floor-slab lines */}
      {b.floors > 1 && !dimmed && (
        <lineSegments geometry={floorGeo}>
          <lineBasicMaterial color="#000000" transparent opacity={0.12} />
        </lineSegments>
      )}

      {/* Outline */}
      <lineSegments geometry={outGeo}>
        <lineBasicMaterial color={isSelected ? "#ffffff" : "#1e293b"}
          transparent opacity={dimmed ? 0.08 : isSelected ? 1 : 0.3} />
      </lineSegments>

      {/* Special features */}
      {!dimmed && b.features.dome && <MasjidExtras b={b} />}
      {!dimmed && b.features.bigRoof && <DewanRoof b={b} />}
    </group>
  );
}

export function Buildings() {
  return (
    <group>
      {buildings.map((b) => (
        <BuildingMesh key={b.id} b={b} />
      ))}
    </group>
  );
}
