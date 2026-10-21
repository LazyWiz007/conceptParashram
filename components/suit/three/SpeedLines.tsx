"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { NEON } from "./Chamber3D";

/**
 * The sky: streaks of light flying out of the far end of the arch tunnel, as
 * if the whole room were rushing forward. It is one full-screen quad drawn
 * before anything else, so the room and the suit paint over it and it only
 * shows through the void above and behind them.
 *
 * The streaks radiate from wherever the tunnel's vanishing point lands on
 * screen. Orbit to the side and that point slides off-screen, so the streaks
 * turn into near-parallel lines racing past; turn right round and they run
 * backwards into the point instead.
 */

const BACKGROUND = "#111113";

const vertex = /* glsl */ `
  varying vec2 vNdc;
  void main() {
    vNdc = position.xy;
    // pinned to the far plane in clip space: always behind, never culled
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uCentre;
  uniform float uHeading;
  uniform float uAspect;
  uniform float uPixel;
  uniform vec3 uBackground;
  uniform vec3 uTint;
  varying vec2 vNdc;

  float hash(float n) {
    return fract(sin(n * 127.1) * 43758.5453);
  }

  // One ring of rays. Each angular cell may hold a single streak with its own
  // angle, speed, length and brightness; a fifth of cells stay empty so the
  // burst never reads as a regular fan.
  float streaks(vec2 p, float rays, float seed) {
    float r = length(p);
    float cell = (atan(p.y, p.x) / 6.2831853 + 0.5) * rays;
    float id = floor(cell);
    float h1 = hash(id + seed);
    float h2 = hash(id * 1.7 + seed + 3.1);
    float h3 = hash(id * 2.3 + seed + 7.7);
    if (h3 < 0.2) return 0.0;

    // thin across: the distance from the ray, measured along the arc
    float offset = cell - (id + 0.2 + 0.6 * h1);
    float arc = abs(offset) / rays * 6.2831853 * r;
    // in clip units: one pixel is 2 / screen height, so this is roughly 1.5–3 px
    float width = (1.5 + 1.5 * h2) * uPixel;
    float across = 1.0 - smoothstep(0.0, width, arc);

    // along: the head accelerates outward like something passing close by
    float s = fract(uTime * (0.22 + 0.45 * h2) + h1 * 7.0);
    s = uHeading > 0.0 ? s : 1.0 - s;
    float head = s * s * 2.8;
    float len = (0.2 + 0.55 * h3) * head + 0.06;
    float along = r < head ? clamp((r - (head - len)) / len, 0.0, 1.0) : 0.0;

    // nothing in the hot centre, and a gentle fade-in from it
    float centre = smoothstep(0.04, 0.45, r);
    return across * along * centre * (0.35 + 0.65 * h2);
  }

  void main() {
    vec2 p = vNdc - uCentre;
    p.x *= uAspect;

    // two white rings at different densities and a yellow one between them
    float white = streaks(p, 320.0, 0.0) + 0.6 * streaks(p, 110.0, 41.0);
    float yellow = streaks(p, 180.0, 19.0);

    vec3 colour = uBackground + white * vec3(1.0) + yellow * uTint * 1.1;
    gl_FragColor = vec4(colour, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ahead = new THREE.Vector3();
const clip = new THREE.Vector4();

export function SpeedLines() {
  const { camera, size } = useThree();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uCentre: { value: new THREE.Vector2(0, 0) },
          uHeading: { value: 1 },
          uAspect: { value: 1 },
          uPixel: { value: 0.003 },
          uBackground: { value: new THREE.Color(BACKGROUND) },
          uTint: { value: new THREE.Color(NEON) },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.uniforms.uAspect.value = size.width / Math.max(1, size.height);
    material.uniforms.uPixel.value = 2 / Math.max(1, size.height);
  }, [material, size]);

  // freeze the streaks for visitors who ask the OS for less motion
  const still = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame(({ clock }) => {
    const u = material.uniforms;
    if (!still) u.uTime.value = clock.elapsedTime;

    // the tunnel runs down -z; find where that direction lands on screen.
    // Facing away from it, use +z instead and run the streaks backwards.
    ahead.set(0, 0, -1).transformDirection(camera.matrixWorldInverse);
    const facing = ahead.z < 0;
    if (!facing) ahead.negate();
    clip.set(ahead.x, ahead.y, ahead.z, 0).applyMatrix4(camera.projectionMatrix);
    const w = Math.max(Math.abs(clip.w), 1e-4);
    // far off to the side the point heads for infinity; clamped, the streaks
    // simply run nearly parallel across the screen
    u.uCentre.value.set(
      THREE.MathUtils.clamp(clip.x / w, -6, 6),
      THREE.MathUtils.clamp(clip.y / w, -6, 6),
    );
    u.uHeading.value = facing ? 1 : -1;
  });

  return (
    // raycast off: in world space this quad is a 2×2 plane at the origin,
    // right where the suit stands, and it must never take the suit's clicks
    <mesh frustumCulled={false} renderOrder={-1000} material={material} raycast={() => null}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
