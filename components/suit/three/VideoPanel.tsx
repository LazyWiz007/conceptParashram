"use client";

import { useVideoTexture } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

const NEON = "#38d9ff";

function Screen({ src, width, height }: { src: string; width: number; height: number }) {
  const texture = useVideoTexture(src, {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: "anonymous",
  });

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
    </mesh>
  );
}

/**
 * The screen the suit hangs in front of, as on the reference site. It sits in
 * its own Suspense boundary on purpose: useVideoTexture suspends, and a failed
 * load inside the main boundary would blank the entire chamber.
 */
export function VideoPanel({
  src,
  position = [0, 0.35, -2.6],
  width = 2.7,
  height = 3.5,
}: {
  src: string;
  position?: [number, number, number];
  width?: number;
  height?: number;
}) {
  const fw = width + 0.14;
  const fh = height + 0.14;

  return (
    <group position={position}>
      {/* neon frame, drawn whether or not the video ever arrives */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(fw, fh)]} />
        <lineBasicMaterial color={NEON} transparent opacity={0.9} />
      </lineSegments>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[fw, fh]} />
        <meshBasicMaterial color="#061119" />
      </mesh>

      <Suspense fallback={null}>
        <Screen src={src} width={width} height={height} />
      </Suspense>
    </group>
  );
}
