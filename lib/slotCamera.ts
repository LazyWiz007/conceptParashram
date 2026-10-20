import * as THREE from "three";
import type { SlotAnchor } from "./types";

const probe = new THREE.Object3D();
const dir = new THREE.Vector3();

/**
 * The camera position that looks straight at a slot. The anchor's rotation was
 * built with lookAt(point + normal), so the projector's +Z axis *is* the
 * outward surface normal — which means the ideal viewpoint falls out of the
 * data for free, with no per-slot camera authoring.
 */
export function cameraForAnchor(
  anchor: SlotAnchor,
  distance = 3.9,
): { position: [number, number, number]; target: [number, number, number] } {
  probe.rotation.set(...anchor.rotation);
  probe.updateMatrixWorld(true);
  dir.set(0, 0, 1).applyEuler(probe.rotation).normalize();

  const [px, py, pz] = anchor.position;
  return {
    position: [px + dir.x * distance, py + dir.y * distance * 0.5 + 0.1, pz + dir.z * distance],
    target: [px, py, pz],
  };
}

/** Horizontal angle to a slot, for orienting the camera without pitching it. */
export function azimuthForAnchor(anchor: SlotAnchor): number {
  probe.rotation.set(...anchor.rotation);
  dir.set(0, 0, 1).applyEuler(probe.rotation);
  return Math.atan2(dir.x, dir.z);
}
