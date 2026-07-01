"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { greenspace, track } from "@/gis";
import type { Greenspace as GS, Vec2 } from "@/gis/types";

const SURFACE_COLORS: Record<GS["type"], string> = {
  lawn:   "#7aad56",
  field:  "#8fba60",
  garden: "#6a9e46",
  plaza:  "#b0a888",
};
const SURFACE_Y: Record<GS["type"], number> = {
  lawn: 0.06, field: 0.06, garden: 0.06, plaza: 0.1,
};

function flatPoly(poly: Vec2[], y: number) {
  const shape = new THREE.Shape();
  poly.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape, 2);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y, 0);
  return geo;
}

function GSMesh({ gs }: { gs: GS }) {
  const y = SURFACE_Y[gs.type];
  const geom = useMemo(() => flatPoly(gs.polygon, y), [gs, y]);
  return (
    <mesh geometry={geom} receiveShadow>
      <meshStandardMaterial
        color={SURFACE_COLORS[gs.type]}
        roughness={gs.type === "plaza" ? 0.96 : 1}
        metalness={0}
      />
    </mesh>
  );
}

// Athletics track from GIS (outer ring with inner hole)
function TrackRing() {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    track.outer.forEach(([x, z], i) => {
      if (i === 0) shape.moveTo(x, -z);
      else shape.lineTo(x, -z);
    });
    shape.closePath();
    const hole = new THREE.Path();
    track.inner.forEach(([x, z], i) => {
      if (i === 0) hole.moveTo(x, -z);
      else hole.lineTo(x, -z);
    });
    hole.closePath();
    shape.holes.push(hole);
    const g = new THREE.ShapeGeometry(shape, 4);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0.07, 0);
    return g;
  }, []);
  return (
    <mesh geometry={geom} receiveShadow>
      <meshStandardMaterial color="#c8734a" roughness={1} metalness={0} />
    </mesh>
  );
}

export function Greenspace() {
  return (
    <group>
      {greenspace.map((g) => (
        <GSMesh key={g.id} gs={g} />
      ))}
      <TrackRing />
    </group>
  );
}
