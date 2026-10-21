"use client";

import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useCallback, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Chamber3D } from "./Chamber3D";
import { SuitModel } from "./SuitModel";
import { SlotDecal3D } from "./SlotDecal3D";
import { anchorFromHit, type Anchor } from "./anchorMath";
import { CameraRig, type CameraMove } from "./CameraRig";
import { VideoPanel } from "./VideoPanel";
import type { Slot } from "@/lib/types";

export function Stage3D({
  slots,
  move,
  focusedId,
  hoveredId,
  onHover,
  onSelect,
  onBackgroundClick,
  onPlace,
  spin = 0,
  placementSize,
  video,
}: {
  slots: Slot[];
  move: CameraMove | null;
  focusedId?: string | null;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  onBackgroundClick?: () => void;
  /** Dev authoring only: click the suit to emit an anchor at that point. */
  onPlace?: (a: Anchor) => void;
  spin?: number;
  placementSize?: [number, number, number];
  /** Ambient clip on the screen behind the suit. */
  video?: string;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [suit, setSuit] = useState<THREE.Mesh | null>(null);

  const handleSuitClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (onPlace && e.face) {
        e.stopPropagation();
        onPlace(
          anchorFromHit(e.point, e.face.normal, e.object.matrixWorld, placementSize ?? [0.34, 0.2, 0.6], spin),
        );
        return;
      }
      onBackgroundClick?.();
    },
    [onPlace, placementSize, spin, onBackgroundClick],
  );

  return (
    <Canvas
      camera={{ position: [0, 0.3, 7.2], fov: 40 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ background: "#03070d" }}
      onPointerMissed={() => onBackgroundClick?.()}
    >
      <color attach="background" args={["#03070d"]} />
      <fog attach="fog" args={["#03070d", 12, 34]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.5} color="#eaf6ff" />
      <directionalLight position={[-5, 2, -4]} intensity={2.2} color="#36c8ff" />
      <directionalLight position={[5, 1.5, -4]} intensity={1.6} color="#36c8ff" />
      <pointLight position={[0, -1.8, 1.6]} intensity={6} distance={7} color="#38d9ff" />

      <Suspense fallback={null}>
        <Chamber3D />
        {video && <VideoPanel src={video} />}

        <group onClick={handleSuitClick}>
          <SuitModel onReady={setSuit} />
        </group>

        {slots.map((s) => (
          <SlotDecal3D
            key={s.id}
            target={suit}
            slot={s}
            active={focusedId === s.id || hoveredId === s.id}
            dimmed={Boolean(focusedId) && focusedId !== s.id}
            onPointerOver={onHover ? () => onHover(s.id) : undefined}
            onPointerOut={onHover ? () => onHover(null) : undefined}
            onClick={onSelect ? () => onSelect(s.id) : undefined}
          />
        ))}

        <ContactShadows
          position={[0, -2.37, 0]}
          opacity={0.5}
          scale={7}
          blur={2.4}
          far={3}
          color="#000000"
        />
      </Suspense>

      <CameraRig move={move} controls={controls} />

      <OrbitControls
        ref={controls}
        target={[0, -0.2, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        minDistance={3.2}
        maxDistance={11}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.62}
      />

      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.42} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette offset={0.26} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}
