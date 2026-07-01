"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { trees } from "@/gis";

/**
 * Instanced trees (PRD §14 performance: Instancing for greenery).
 * Two instanced meshes — trunks and canopies — share the tree transforms.
 */
export function Trees() {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);
  const count = trees.length;

  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.25, 0.35, 1, 6), []);
  const canopyGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    trees.forEach((t, i) => {
      const h = t.s * 1.6;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t.r);
      // trunk
      pos.set(t.x, h / 2, t.z);
      scl.set(1, h, 1);
      m.compose(pos, q, scl);
      trunkRef.current?.setMatrixAt(i, m);
      // canopy
      pos.set(t.x, h + t.s * 0.6, t.z);
      scl.set(t.s, t.s * 1.1, t.s);
      m.compose(pos, q, scl);
      canopyRef.current?.setMatrixAt(i, m);
    });
    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (canopyRef.current) canopyRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[trunkGeo, undefined, count]} castShadow>
        <meshStandardMaterial color="#6b4a2f" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[canopyGeo, undefined, count]} castShadow>
        <meshStandardMaterial color="#4e8f43" roughness={1} flatShading />
      </instancedMesh>
    </group>
  );
}
