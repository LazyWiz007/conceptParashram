"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export type CameraMove = {
  position: [number, number, number];
  target: [number, number, number];
};

export const HOME: CameraMove = { position: [0, 0.3, 7.2], target: [0, -0.2, 0] };

/**
 * Eases the camera onto a pose, then hands control straight back to
 * OrbitControls. Driving the camera directly rather than poking the controls'
 * internals keeps the two from fighting each other mid-flight.
 */
export function CameraRig({
  move,
  controls,
}: {
  move: CameraMove | null;
  controls: React.RefObject<{ target: THREE.Vector3; update: () => void } | null>;
}) {
  const { camera } = useThree();
  const goalPos = useRef<THREE.Vector3 | null>(null);
  const goalTarget = useRef(new THREE.Vector3(...HOME.target));

  useEffect(() => {
    if (!move) return;
    goalPos.current = new THREE.Vector3(...move.position);
    goalTarget.current.set(...move.target);
  }, [move]);

  useFrame((_, dt) => {
    if (!goalPos.current) return;
    const t = Math.min(1, dt * 3.2);
    camera.position.lerp(goalPos.current, t);

    const c = controls.current;
    if (c) {
      c.target.lerp(goalTarget.current, t);
      c.update();
    } else {
      camera.lookAt(goalTarget.current);
    }

    if (camera.position.distanceTo(goalPos.current) < 0.02) {
      camera.position.copy(goalPos.current);
      c?.target.copy(goalTarget.current);
      c?.update();
      goalPos.current = null;
    }
  });

  return null;
}
