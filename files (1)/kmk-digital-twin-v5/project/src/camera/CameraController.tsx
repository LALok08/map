"use client";
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useCampusStore } from "@/store/campusStore";
import { CAMERA_PRESETS } from "./CameraPresets";

type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;

/**
 * Unified camera system (PRD §9). Handles orbit/bird/walk/fly presets and
 * smooth flyTo animations driven by campusStore.flyTarget.
 */
export function CameraController() {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);

  const mode = useCampusStore((s) => s.cameraMode);
  const flyTarget = useCampusStore((s) => s.flyTarget);

  // animation state
  const anim = useRef<{
    active: boolean;
    t: number;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
  }>({
    active: false,
    t: 0,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
  });

  // Apply preset constraints when mode changes
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const p = CAMERA_PRESETS[mode];
    c.minPolarAngle = p.minPolar;
    c.maxPolarAngle = p.maxPolar;
    c.minDistance = p.minDistance;
    c.maxDistance = p.maxDistance;
    c.enablePan = p.enablePan;
    c.enableRotate = p.enableRotate;
  }, [mode]);

  // Trigger a fly animation when flyTarget changes
  useEffect(() => {
    const c = controls.current;
    if (!c || !flyTarget) return;
    const p = CAMERA_PRESETS[mode];
    const dist = flyTarget.span;
    const polar = (p.minPolar + p.maxPolar) / 2;
    const azimuth = Math.PI * 0.25;

    const toTarget = new THREE.Vector3(flyTarget.x, p.targetY, flyTarget.z);
    const offset = new THREE.Vector3(
      Math.sin(polar) * Math.sin(azimuth),
      Math.cos(polar),
      Math.sin(polar) * Math.cos(azimuth),
    ).multiplyScalar(dist);
    const toPos = toTarget.clone().add(offset);

    anim.current.active = true;
    anim.current.t = 0;
    anim.current.fromPos.copy(camera.position);
    anim.current.toPos.copy(toPos);
    anim.current.fromTarget.copy(c.target);
    anim.current.toTarget.copy(toTarget);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget?.token]);

  useFrame((_, delta) => {
    const c = controls.current;
    const a = anim.current;
    if (c && a.active) {
      a.t = Math.min(1, a.t + delta * 1.4);
      const e = easeInOutCubic(a.t);
      camera.position.lerpVectors(a.fromPos, a.toPos, e);
      c.target.lerpVectors(a.fromTarget, a.toTarget, e);
      c.update();
      if (a.t >= 1) a.active = false;
    }
    if (c) {
      (window as unknown as { __campusCamera?: unknown }).__campusCamera = {
        x: camera.position.x,
        z: camera.position.z,
        tx: c.target.x,
        tz: c.target.z,
      };
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      target={[-16, 4, -60]}
    />
  );
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
