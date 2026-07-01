"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { corridors } from "@/gis";
import type { Corridor } from "@/gis/types";

/**
 * Covered walkways / corridors (selasar) connecting blocks.
 * Rendered as low single-storey roofed links so the campus reads as a
 * connected complex rather than isolated boxes.
 */
const CORRIDOR_H = 3.2;

function makeGeometry(c: Corridor) {
  const shape = new THREE.Shape();
  c.rect.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: CORRIDOR_H,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function CorridorMesh({ c }: { c: Corridor }) {
  const geo = useMemo(() => makeGeometry(c), [c]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color="#d9d2c4" roughness={0.9} metalness={0} />
    </mesh>
  );
}

export function Corridors() {
  return (
    <group>
      {corridors.map((c) => (
        <CorridorMesh key={c.id} c={c} />
      ))}
    </group>
  );
}
