"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { SlotDecal3D } from "./SlotDecal3D";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Chamber3D } from "./Chamber3D";
import { SuitModel } from "./SuitModel";

export function Stage3D() {
  const controls = useRef<OrbitControlsImpl>(null);
  const [suit, setSuit] = useState<THREE.Mesh | null>(null);

  return (
    <Canvas
      camera={{ position: [0, 0.3, 7.2], fov: 40 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ background: "#03070d" }}
    >
      <color attach="background" args={["#03070d"]} />
      <fog attach="fog" args={["#03070d", 12, 34]} />

      {/* key + rim, roughly the reference's lighting: cool from behind, soft from front */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.5} color="#eaf6ff" />
      <directionalLight position={[-5, 2, -4]} intensity={2.2} color="#36c8ff" />
      <directionalLight position={[5, 1.5, -4]} intensity={1.6} color="#36c8ff" />
      <pointLight position={[0, -1.8, 1.6]} intensity={6} distance={7} color="#38d9ff" />

      <Suspense fallback={null}>
        <Chamber3D />
        <SuitModel onReady={setSuit} />

        {/* decal projection smoke test against the stand-in's torso */}
        <SlotDecal3D
          target={suit}
          position={[0, 0.17, 0.42]}
          rotation={[0, 0, 0]}
          size={[0.5, 0.2, 0.8]}
          color="#d9f03c"
        />
        <SlotDecal3D
          target={suit}
          position={[-0.18, -0.1, 0.4]}
          rotation={[0, -0.3, 0]}
          size={[0.24, 0.18, 0.8]}
          color="#22d3ee"
        />

        <ContactShadows
          position={[0, -2.37, 0]}
          opacity={0.5}
          scale={7}
          blur={2.4}
          far={3}
          color="#000000"
        />
      </Suspense>

      <OrbitControls
        ref={controls}
        target={[0, -0.2, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        minDistance={3.4}
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
