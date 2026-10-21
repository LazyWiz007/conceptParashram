import * as THREE from "three";
import type { SlotAnchor } from "./types";

const helper = new THREE.Object3D();
const _n = new THREE.Vector3();
const _e = new THREE.Euler();

/**
 * The outward surface normal baked into an anchor's rotation.
 *
 * anchorFromHit builds the rotation with lookAt(point + normal), and three.js
 * points a non-camera object's +Z at its lookAt target — so +Z *is* the normal.
 * Spin happens about that same axis, which is why reading the normal back is
 * stable no matter how the decal has been rotated in its own plane.
 */
export function normalFromEuler(rotation: [number, number, number]): THREE.Vector3 {
  _e.set(rotation[0], rotation[1], rotation[2]);
  return _n.set(0, 0, 1).applyEuler(_e).normalize().clone();
}

/** Rebuilds an orientation from a normal plus an absolute spin, in radians. */
export function eulerFromNormal(
  normal: THREE.Vector3,
  spin = 0,
): [number, number, number] {
  helper.position.set(0, 0, 0);
  helper.up.set(0, 1, 0);
  helper.lookAt(normal);
  helper.rotateZ(spin);
  const r = helper.rotation;
  return [r.x, r.y, r.z];
}

/**
 * The decal's own axes in world space: `right` and `up` run along the surface,
 * `normal` points out of it. Nudging along right/up is what keeps a slot
 * glued to the body instead of drifting into or out of it.
 */
export function surfaceAxes(rotation: [number, number, number]) {
  _e.set(rotation[0], rotation[1], rotation[2]);
  const m = new THREE.Matrix4().makeRotationFromEuler(_e);
  return {
    right: new THREE.Vector3().setFromMatrixColumn(m, 0).normalize(),
    up: new THREE.Vector3().setFromMatrixColumn(m, 1).normalize(),
    normal: new THREE.Vector3().setFromMatrixColumn(m, 2).normalize(),
  };
}

/** Re-applies an absolute spin without disturbing where the slot sits. */
export function withSpin(anchor: SlotAnchor, spin: number): SlotAnchor {
  return { ...anchor, spin, rotation: eulerFromNormal(normalFromEuler(anchor.rotation), spin) };
}

/**
 * Slides a slot across the surface by (dx, dy) in its own plane, then drops it
 * back onto the mesh so it stays flush. Returns null when the move would walk
 * off the model — better to refuse than to leave a decal floating.
 */
export function slideOnSurface(
  anchor: SlotAnchor,
  mesh: THREE.Mesh,
  dx: number,
  dy: number,
): SlotAnchor | null {
  const { right, up, normal } = surfaceAxes(anchor.rotation);
  const from = new THREE.Vector3(...anchor.position)
    .addScaledVector(right, dx)
    .addScaledVector(up, dy)
    .addScaledVector(normal, 0.5);

  const ray = new THREE.Raycaster(from, normal.clone().negate(), 0, 2);
  const hit = ray.intersectObject(mesh, true)[0];
  if (!hit?.face) return null;

  const worldNormal = hit.face.normal
    .clone()
    .transformDirection(hit.object.matrixWorld)
    .normalize();

  return {
    ...anchor,
    position: [hit.point.x, hit.point.y, hit.point.z],
    rotation: eulerFromNormal(worldNormal, anchor.spin ?? 0),
  };
}
