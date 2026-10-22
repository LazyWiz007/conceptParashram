"use client";

import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useCallback, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Chamber3D, PEDESTAL_TOP } from "./Chamber3D";
import { SpeedLines } from "./SpeedLines";
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
  onSuitReady,
  hiddenIds,
}: {
  slots: Slot[];
  /** Slots kept mounted but not drawn, such as placeholders during a preview. */
  hiddenIds?: ReadonlySet<string>;
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
  /** Hands the loaded mesh out so callers can raycast against it. */
  onSuitReady?: (mesh: THREE.Mesh) => void;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [suit, setSuit] = useState<THREE.Mesh | null>(null);

  const handleSuitClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      // R3F still fires onClick at the end of a drag; a drag is an orbit, not a click
      if (e.delta > 2) return;
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
      style={{ background: "#111113" }}
      onPointerMissed={() => onBackgroundClick?.()}
    >
      <color attach="background" args={["#111113"]} />
      <fog attach="fog" args={["#111113", 22, 60]} />
      {/* outside Suspense, so the sky is moving before the suit has loaded */}
      <SpeedLines />

      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.5} color="#eaf6ff" />
      <directionalLight position={[-5, 2, -4]} intensity={2.2} color="#f4f6f8" />
      <directionalLight position={[5, 1.5, -4]} intensity={1.6} color="#f4f6f8" />
      <pointLight position={[0, -1.8, 1.6]} intensity={6} distance={7} color="#ffffff" />

      <Suspense fallback={null}>
        <Chamber3D />
        {video && <VideoPanel src={video} />}
        {/*
          The same clip on a screen facing the suit's back, so turning the suit
          round still shows footage behind it. It stands beyond the camera's
          orbit (~7.2), so from the front it is always behind the camera and
          never in shot. It is scaled up by the extra distance — about 1.7× —
          so it reads the same size as the front screen, and sits in the gap
          between the two pillars back here. drei caches the video by URL, so
          both screens share one <video> and stay in sync.
        */}
        {video && (
          <VideoPanel
            src={video}
            position={[0, 1.1, 9.6]}
            rotation={[0, Math.PI, 0]}
            width={6.63}
            height={3.72}
          />
        )}

        <group onClick={handleSuitClick}>
          <SuitModel
            onReady={(m) => {
              setSuit(m);
              onSuitReady?.(m);
            }}
          />
        </group>

        {slots.map((s) => (
          <SlotDecal3D
            key={s.id}
            target={suit}
            slot={s}
            active={focusedId === s.id || hoveredId === s.id}
            hidden={hiddenIds?.has(s.id) ?? false}
            dimmed={Boolean(focusedId) && focusedId !== s.id}
            onPointerOver={onHover ? () => onHover(s.id) : undefined}
            onPointerOut={onHover ? () => onHover(null) : undefined}
            onClick={onSelect ? () => onSelect(s.id) : undefined}
          />
        ))}

        <ContactShadows
          // on top of the pedestal's light pad, and no wider than it
          position={[0, PEDESTAL_TOP + 0.005, 0]}
          opacity={0.5}
          scale={3}
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
        // the wheel has to scroll the page past the hero; only the authoring
        // tools, which have no page below them, keep wheel zoom
        enableZoom={Boolean(onPlace)}
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
