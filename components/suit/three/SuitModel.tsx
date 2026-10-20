"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

const MODEL = "/models/trisuit.glb";

/**
 * Loads the trisuit and normalises it: the source model is at an arbitrary
 * scale and origin, so it is re-centred on the world origin and scaled to a
 * fixed height. Everything downstream (slot anchors, camera, pedestal) is
 * authored against that normalised space, so re-exporting the model does not
 * invalidate the slot coordinates.
 */
export function SuitModel({
  targetHeight = 3.1,
  onReady,
}: {
  targetHeight?: number;
  onReady?: (mesh: THREE.Mesh) => void;
}) {
  const { scene } = useGLTF(MODEL);

  const { object, mesh } = useMemo(() => {
    const root = scene.clone(true);

    let found: THREE.Mesh | null = null;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (!found || getCount(m) > getCount(found)) found = m;
      m.castShadow = true;
      m.receiveShadow = true;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.roughness = Math.min(1, (mat.roughness ?? 1) * 0.9 + 0.25);
        mat.envMapIntensity = 0.7;
        mat.side = THREE.FrontSide;
      }
    });

    // normalise: centre on origin, scale to targetHeight
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const scale = targetHeight / (size.y || 1);

    const holder = new THREE.Group();
    root.position.set(-centre.x, -centre.y, -centre.z);
    holder.add(root);
    holder.scale.setScalar(scale);

    return { object: holder, mesh: found as THREE.Mesh | null };
  }, [scene, targetHeight]);

  useEffect(() => {
    if (!mesh || !onReady) return;
    // DecalGeometry projects through mesh.matrixWorld. Straight after mount
    // three has not refreshed the world matrices yet, so without this the
    // decals are built against an identity transform and come out degenerate.
    object.updateMatrixWorld(true);
    onReady(mesh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesh, object]);

  return <primitive object={object} />;
}

function getCount(m: THREE.Mesh): number {
  return m.geometry?.attributes?.position?.count ?? 0;
}

useGLTF.preload(MODEL);
