"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { roads, crossings } from "@/gis";
import type { Crossing, Road } from "@/gis/types";

/**
 * Road system (PRD §8): real polylines with real width — not a plane texture.
 * Each polyline is turned into a flat ribbon mesh with mitred-ish joints.
 */
function ribbonGeometry(road: Road, y: number) {
  const pts = road.polyline.map(([x, z]) => new THREE.Vector2(x, z));
  const half = road.width / 2;
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];

  for (let i = 0; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const next = pts[i + 1];
    let dir: THREE.Vector2;
    if (!prev) dir = next.clone().sub(cur).normalize();
    else if (!next) dir = cur.clone().sub(prev).normalize();
    else dir = next.clone().sub(prev).normalize();
    const normal = new THREE.Vector2(-dir.y, dir.x).multiplyScalar(half);
    left.push(cur.clone().add(normal));
    right.push(cur.clone().sub(normal));
  }

  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    positions.push(left[i].x, y, left[i].y);
    positions.push(right[i].x, y, right[i].y);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const ROAD_COLORS: Record<Road["type"], string> = {
  primary: "#4b5563",
  secondary: "#5b6472",
  path: "#9a8d76",
  external: "#3f4752",
};

function RoadMesh({ road }: { road: Road }) {
  const y = road.type === "path" ? 0.18 : 0.12;
  const geom = useMemo(() => ribbonGeometry(road, y), [road, y]);
  return (
    <mesh geometry={geom} receiveShadow>
      <meshStandardMaterial
        color={ROAD_COLORS[road.type]}
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  );
}

function CrossingMesh({ crossing }: { crossing: Crossing }) {
  const stripeWidth = crossing.length / crossing.stripes;
  const angle = (crossing.rotation * Math.PI) / 180;
  return (
    <group position={[crossing.center[0], 0.24, crossing.center[1]]} rotation={[0, angle, 0]}>
      {Array.from({ length: crossing.stripes }).map((_, i) => (
        <mesh key={i} position={[0, 0, -crossing.length / 2 + stripeWidth * (i + 0.5)]} receiveShadow>
          <boxGeometry args={[crossing.width, 0.035, stripeWidth * 0.55]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.75} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

export function Roads() {
  return (
    <group>
      {roads.map((r) => (
        <RoadMesh key={r.id} road={r} />
      ))}
      {crossings.map((c) => (
        <CrossingMesh key={c.id} crossing={c} />
      ))}
    </group>
  );
}
