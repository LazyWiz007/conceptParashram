"use client";

import { useVideoTexture } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import * as THREE from "three";

import { NEON } from "./Chamber3D";

function Screen({ src, width, height }: { src: string; width: number; height: number }) {
  const texture = useVideoTexture(src, {
    muted: true,
    loop: true,
    start: true,
    playsInline: true,
    crossOrigin: "anonymous",
  });

  // Chrome pauses muted background video to save power, and drei's play() call
  // then rejects unhandled. Swallow that, and pick the clip back up when the
  // tab returns — otherwise the screen stays frozen for the rest of the visit.
  useEffect(() => {
    const video = texture.image as HTMLVideoElement | undefined;
    if (!video) return;

    const resume = () => {
      if (document.visibilityState !== "visible" || !video.paused) return;
      video.play().catch(() => {});
    };

    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    video.addEventListener("pause", resume);
    return () => {
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
      video.removeEventListener("pause", resume);
    };
  }, [texture]);

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
  rotation = [0, 0, 0],
  width = 2.7,
  height = 3.5,
}: {
  src: string;
  position?: [number, number, number];
  /** The screen shows on its +z face; turn it to face the suit from elsewhere. */
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}) {
  const fw = width + 0.14;
  const fh = height + 0.14;

  return (
    <group position={position} rotation={rotation}>
      {/* neon frame, drawn whether or not the video ever arrives */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(fw, fh)]} />
        <lineBasicMaterial color={NEON} transparent opacity={0.9} />
      </lineSegments>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[fw, fh]} />
        <meshBasicMaterial color="#0c0c0d" />
      </mesh>

      <Suspense fallback={null}>
        <Screen src={src} width={width} height={height} />
      </Suspense>
    </group>
  );
}
