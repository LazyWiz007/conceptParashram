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
  controls: React.RefObject<{
    target: THREE.Vector3;
    update: () => void;
    addEventListener: (type: "start", listener: () => void) => void;
    removeEventListener: (type: "start", listener: () => void) => void;
  } | null>;
}) {
  const { camera } = useThree();
  const goalPos = useRef<THREE.Vector3 | null>(null);
  const goalTarget = useRef(new THREE.Vector3(...HOME.target));
  const grabbed = useRef(false);
  const steer = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!move) return;
    goalPos.current = new THREE.Vector3(...move.position);
    goalTarget.current.set(...move.target);
    grabbed.current = false;
  }, [move]);

  // The ease takes a second or two to settle. If the visitor grabs the suit
  // before then, stop fighting them for the angle — otherwise every frame drags
  // the camera back and the orbit snaps home. The distance and target still
  // finish easing, since the wheel cannot zoom out on the page.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const grab = () => {
      grabbed.current = true;
    };
    c.addEventListener("start", grab);
    return () => c.removeEventListener("start", grab);
  }, [controls]);

  useFrame((_, dt) => {
    if (!goalPos.current) return;
    const t = Math.min(1, dt * 3.2);
    const c = controls.current;

    if (grabbed.current && c) {
      // keep the visitor's viewing angle, only carry the distance to the goal
      const distance = goalPos.current.distanceTo(goalTarget.current);
      steer.current.copy(camera.position).sub(c.target).setLength(distance).add(goalTarget.current);
      camera.position.lerp(steer.current, t);
      c.target.lerp(goalTarget.current, t);
      c.update();
      if (camera.position.distanceTo(steer.current) < 0.02) {
        c.target.copy(goalTarget.current);
        c.update();
        goalPos.current = null;
      }
      return;
    }

    camera.position.lerp(goalPos.current, t);

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
