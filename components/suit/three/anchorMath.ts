import * as THREE from "three";

export type Anchor = {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
};

const helper = new THREE.Object3D();

/**
 * Turn a raycast hit into a decal projector transform. The face normal, taken
 * into world space, is what the projector has to look down — which is why
 * clicking the model is a far better authoring method than typing coordinates.
 *
 * `spin` rotates the decal within the surface plane (radians).
 */
export function anchorFromHit(
  point: THREE.Vector3,
  faceNormal: THREE.Vector3,
  objectMatrixWorld: THREE.Matrix4,
  size: [number, number, number],
  spin = 0,
): Anchor {
  const n = faceNormal.clone().transformDirection(objectMatrixWorld).normalize();

  helper.position.copy(point);
  helper.lookAt(point.clone().add(n));
  helper.rotateZ(spin);

  return {
    position: [round(point.x), round(point.y), round(point.z)],
    rotation: [round(helper.rotation.x), round(helper.rotation.y), round(helper.rotation.z)],
    size,
  };
}

const round = (v: number) => Math.round(v * 1000) / 1000;
