"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * A dark hall lit by yellow neon: a tunnel of octagonal arches round the suit,
 * charcoal monoliths with glowing edges, a tiled floor with amber seams and a
 * pedestal whose top is a light pad.
 *
 * Every surface except the floor is unlit (MeshBasicMaterial) with its shading
 * baked into vertex colours, including the yellow spill on faces that look
 * towards the arches. Lights in three reach every mesh, so lighting the room
 * for real would also change how the suit looks — baking keeps the suit's
 * lighting exactly as it was. Anything meant to glow is simply bright enough
 * to cross the bloom threshold.
 */

/** The one theme colour. Change it here and the whole room follows. */
export const NEON = "#ffd400";
const neon = new THREE.Color(NEON);

const FLOOR_Y = -2.4;

/** The neon colour pushed past 1 so bloom flares it into a hot core. */
function hot(intensity: number): THREE.Color {
  return neon.clone().multiplyScalar(intensity);
}

/* ---------------- layout ---------------- */

/**
 * The camera orbits at up to ~7.2 units with zoom off, so nothing may come
 * nearer the suit than that or the orbit would pass through it. Blocks near
 * the front of the room sit wider; down the sides they can close in because
 * their distance from the suit is mostly depth.
 */
type Block =
  | { kind: "box"; x: number; z: number; w: number; h: number; d: number; y?: number }
  | { kind: "cyl"; x: number; z: number; r: number; h: number; y?: number };

const BLOCKS: Block[] = [
  // left wall, back to front
  { kind: "box", x: -3.8, z: -22, w: 2, h: 9, d: 2 },
  { kind: "box", x: -4.8, z: -18, w: 2, h: 10, d: 2 },
  { kind: "cyl", x: -7, z: -15.5, r: 0.7, h: 5 },
  { kind: "box", x: -5.8, z: -13.5, w: 1.3, h: 7, d: 1.3 },
  { kind: "box", x: -7.4, z: -10, w: 1.8, h: 11, d: 1.8 },
  { kind: "box", x: -6.2, z: -6.6, w: 1.4, h: 8, d: 1.4 },
  // stepped plinth
  { kind: "box", x: -7.3, z: -4.9, w: 2.2, h: 0.6, d: 2.2 },
  { kind: "box", x: -7.6, z: -5.1, w: 1.4, h: 1.2, d: 1.4, y: 0.6 },
  // column on a low base
  { kind: "box", x: -8.8, z: -1.6, w: 1.6, h: 0.5, d: 1.6 },
  { kind: "cyl", x: -8.8, z: -1.6, r: 0.55, h: 3.2, y: 0.5 },
  { kind: "box", x: -10.6, z: 1.2, w: 2, h: 12, d: 2 },
  { kind: "box", x: -9.6, z: 5, w: 1.5, h: 1.5, d: 1.5 },
  { kind: "box", x: -9.4, z: 5.2, w: 1, h: 1, d: 1, y: 1.5 },

  // right wall, back to front
  { kind: "box", x: 3.8, z: -23, w: 2.2, h: 12, d: 2.2 },
  { kind: "box", x: 5, z: -19.5, w: 2.2, h: 13, d: 2.2 },
  { kind: "cyl", x: 8.4, z: -14.5, r: 0.8, h: 6 },
  { kind: "box", x: 6, z: -15, w: 1.4, h: 8, d: 1.4 },
  { kind: "box", x: 7.6, z: -11, w: 2, h: 12, d: 2 },
  { kind: "box", x: 6.4, z: -7.2, w: 1.4, h: 9, d: 1.4 },
  // long low bench running in towards the suit
  { kind: "box", x: 7.6, z: -5, w: 3.2, h: 0.36, d: 1 },
  { kind: "box", x: 10.8, z: -0.6, w: 1.9, h: 11, d: 1.9 },
  // stepped block
  { kind: "box", x: 8.9, z: 2, w: 2.4, h: 0.8, d: 1.6 },
  { kind: "box", x: 9.4, z: 2, w: 1.4, h: 1, d: 1.6, y: 0.8 },
  { kind: "box", x: 9.6, z: 5.6, w: 1.2, h: 1.2, d: 1.2 },

  // behind the home camera, seen when the suit is turned round
  { kind: "box", x: -7, z: 8, w: 1.6, h: 1, d: 1.6 },
  { kind: "box", x: -4, z: 10, w: 1.6, h: 7, d: 1.6 },
  { kind: "box", x: 0, z: 13, w: 2.4, h: 0.8, d: 1.6 },
  { kind: "box", x: 3.6, z: 10.5, w: 1.8, h: 9, d: 1.8 },
  { kind: "cyl", x: 6.6, z: 8.4, r: 0.6, h: 4 },
];

/**
 * The arch tunnel. The first arch stands in front of the screen and frames
 * the suit and pedestal; its posts sit at about ±4.2, well inside the camera's
 * orbit, so the camera passes beside it rather than through it.
 */
const ARCHES = [
  { z: 1.6, scale: 1, glow: 1.05 },
  { z: -2, scale: 0.86, glow: 0.95 },
  { z: -5.5, scale: 0.74, glow: 0.9 },
  { z: -9, scale: 0.64, glow: 0.85 },
  { z: -12.5, scale: 0.56, glow: 0.8 },
  { z: -16, scale: 0.5, glow: 0.75 },
];
const ARCH = { w: 8.4, h: 8, cut: 1.7 };
const TUNNEL_FRONT = ARCHES[0].z;
const TUNNEL_BACK = ARCHES[ARCHES.length - 1].z;

/* ---------------- baked shading ---------------- */

// a soft key from above, front and a little to the left
const KEY = new THREE.Vector3(-0.45, 0, 0.9).normalize();
const n = new THREE.Vector3();
const toAxis = new THREE.Vector3();

/**
 * Writes vertex colours that fake the room's light: tops brightest, faces
 * turned to the key a little lighter, a darker band where a block meets the
 * floor in place of real ambient occlusion, and a yellow wash on faces that
 * look in towards the arch tunnel. Expects world-space geometry.
 */
function bake(geo: THREE.BufferGeometry, tone: number, spill = 0): THREE.BufferGeometry {
  const pos = geo.getAttribute("position");
  const nor = geo.getAttribute("normal");
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    n.fromBufferAttribute(nor, i);
    // the tunnel runs along the z axis between its first and last arch; the
    // light comes from the nearest point on that line
    const x = pos.getX(i);
    const z = pos.getZ(i);
    toAxis.set(-x, 0, THREE.MathUtils.clamp(z, TUNNEL_BACK, TUNNEL_FRONT) - z);
    const distance = toAxis.length();
    toAxis.normalize();

    let face: number;
    let facing = 0;
    if (n.y > 0.5) face = 1;
    else if (n.y < -0.5) face = 0.35;
    else {
      n.y = 0;
      n.normalize();
      face = 0.58 + 0.3 * Math.max(0, n.dot(KEY));
      facing = Math.max(0, n.dot(toAxis));
    }
    const lift = pos.getY(i) - FLOOR_Y;
    const ao = 0.55 + 0.45 * THREE.MathUtils.smoothstep(lift, 0, 1.4);
    const c = tone * face * ao;
    // spill fades with distance from the tunnel and with height
    const reach = Math.exp(-distance / 7) * (1 - THREE.MathUtils.smoothstep(lift, 0, 9) * 0.6);
    const warm = spill * facing * reach;
    colors[i * 3] = c + warm * neon.r;
    colors[i * 3 + 1] = c + warm * neon.g;
    colors[i * 3 + 2] = c * 1.02 + warm * neon.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

function blockGeometry(b: Block): THREE.BufferGeometry {
  const base = FLOOR_Y + (b.y ?? 0);
  const g =
    b.kind === "box"
      ? new THREE.BoxGeometry(b.w, b.h, b.d)
      : new THREE.CylinderGeometry(b.r, b.r, b.h, 40);
  g.translate(b.x, base + b.h / 2, b.z);
  return bake(g, 0.07, 0.09);
}

/* ---------------- arches ---------------- */

/**
 * An octagon with its bottom edge dropped below the floor, so the arch reads
 * as rising out of the tiles. Corner cuts are what give it the rounded look.
 */
function archPath(w: number, h: number, cut: number): THREE.Vector3[] {
  const x = w / 2;
  const top = FLOOR_Y + h;
  const sunk = FLOOR_Y - 0.3;
  return [
    [-x, sunk], [-x, top - cut], [-x + cut, top],
    [x - cut, top], [x, top - cut], [x, sunk],
  ].map(([px, py]) => new THREE.Vector3(px, py, 0));
}

/** A solid tube through the points: a cylinder per leg, a ball at each bend. */
function tube(points: THREE.Vector3[], radius: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const leg = new THREE.Vector3().subVectors(b, a);
    const g = new THREE.CylinderGeometry(radius, radius, leg.length(), 12, 1, true);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, leg.clone().normalize()));
    g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    parts.push(g.toNonIndexed());
    g.dispose();
    if (i > 0) {
      const joint = new THREE.SphereGeometry(radius, 12, 8).translate(a.x, a.y, a.z);
      parts.push(joint.toNonIndexed());
      joint.dispose();
    }
  }
  for (const p of parts) p.deleteAttribute("uv");
  const merged = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return merged;
}

/**
 * The black band an arch is made of: the outer octagon, then the inner one
 * walked back the other way, extruded to `depth` and centred on z = 0.
 */
function band(outer: THREE.Vector3[], inner: THREE.Vector3[], depth: number) {
  const outline = [...outer, ...[...inner].reverse()].map((p) => new THREE.Vector2(p.x, p.y));
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(outline), { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}

/**
 * Each arch is a black frame with a neon tube along its outer edge and
 * another along its inner edge, both the same thickness and both on the face
 * towards the suit. The inner octagon is a true parallel offset of the outer
 * one — a 45° chamfer moves in by tan(22.5°) of the band width — so the two
 * tubes stay evenly spaced all the way round.
 */
function Arches() {
  const { frames, tubes } = useMemo(() => {
    const frameParts: THREE.BufferGeometry[] = [];
    const tubes = ARCHES.map(({ z, scale, glow }) => {
      const w = ARCH.w * scale;
      const h = ARCH.h * scale;
      const cut = ARCH.cut * scale;
      const width = 0.42 * scale;
      const depth = 0.5 * scale;
      const radius = 0.055 * scale + 0.015;

      const outerPath = archPath(w, h, cut);
      const innerPath = archPath(w - width * 2, h - width, cut - width * Math.tan(Math.PI / 8));

      const frame = band(outerPath, innerPath, depth);
      frame.translate(0, 0, z);
      frameParts.push(bake(frame, 0.05));

      const front = z + depth / 2;
      const outer = tube(outerPath, radius);
      const inner = tube(innerPath, radius);
      const geo = mergeGeometries([outer, inner]);
      outer.dispose();
      inner.dispose();
      geo.translate(0, 0, front);
      return { geo, color: hot(glow), key: z };
    });
    const frames = mergeGeometries(frameParts);
    frameParts.forEach((p) => p.dispose());
    return { frames, tubes };
  }, []);
  useEffect(
    () => () => {
      frames.dispose();
      tubes.forEach((t) => t.geo.dispose());
    },
    [frames, tubes],
  );

  return (
    <>
      <mesh geometry={frames}>
        <meshBasicMaterial vertexColors />
      </mesh>
      {tubes.map((t) => (
        <mesh key={t.key} geometry={t.geo}>
          <meshBasicMaterial color={t.color} />
        </mesh>
      ))}
    </>
  );
}

/* ---------------- block edges ---------------- */

/**
 * Collects every edge of every block into one line geometry. Each piece gets
 * its own `phase` so the pulse ripples round the room instead of every block
 * breathing in unison. Cylinders only keep their rims, not their facet seams.
 */
function edgeGeometry(pieces: { geo: THREE.BufferGeometry; round: boolean; phase: number }[]) {
  const positions: number[] = [];
  const phases: number[] = [];
  for (const { geo, round, phase } of pieces) {
    const edges = new THREE.EdgesGeometry(geo, round ? 30 : 1);
    const pos = edges.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      phases.push(phase);
    }
    edges.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
  return g;
}

/**
 * Neon edge shader: a slow breathe per block, plus a band of light that rises
 * up through the room every few seconds. Kept a step below the arches so the
 * blocks trace the dark rather than compete with the tunnel.
 */
const edgeVertex = /* glsl */ `
  attribute float phase;
  varying float vPhase;
  varying float vY;
  #include <fog_pars_vertex>
  void main() {
    vPhase = phase;
    vY = position.y;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const edgeFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying float vPhase;
  varying float vY;
  #include <fog_pars_fragment>
  void main() {
    float breathe = 0.5 + 0.5 * sin(uTime * 1.3 + vPhase);
    // rises from the floor to above the tallest block, then starts again
    float scanY = ${FLOOR_Y.toFixed(1)} - 1.0 + mod(uTime * 2.4, 19.0);
    float band = exp(-pow((vY - scanY) / 0.7, 2.0));
    // a floor of 0.5 keeps the edges lit without letting the blocks outshine the arches
    float glow = 0.5 + 0.3 * breathe + 1.1 * band;
    gl_FragColor = vec4(uColor * glow, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

function NeonEdges({ geometry }: { geometry: THREE.BufferGeometry }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
          uTime: { value: 0 },
          uColor: { value: neon.clone() },
        },
        vertexShader: edgeVertex,
        fragmentShader: edgeFragment,
        fog: true,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  // hold a still glow for visitors who ask the OS for less motion
  const still = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  useFrame(({ clock }) => {
    if (!still) material.uniforms.uTime.value = clock.elapsedTime;
  });

  return <lineSegments geometry={geometry} material={material} />;
}

function Blocks() {
  const { faces, edges } = useMemo(() => {
    const pieces = BLOCKS.map((b, i) => ({
      geo: blockGeometry(b),
      round: b.kind === "cyl",
      phase: i * 1.7,
    }));
    const faces = mergeGeometries(pieces.map((p) => p.geo));
    const edges = edgeGeometry(pieces);
    pieces.forEach((p) => p.geo.dispose());
    return { faces, edges };
  }, []);

  return (
    <group>
      <mesh geometry={faces}>
        {/* pushed back a hair so the edge lines on the same corners always win */}
        <meshBasicMaterial vertexColors polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <NeonEdges geometry={edges} />
    </group>
  );
}

/* ---------------- floor and pedestal ---------------- */

/**
 * A flat disc whose vertex colours fall off from `centre` to black at the
 * rim. CircleGeometry fans out from one centre vertex, so the gradient is
 * radial for free.
 */
function radialDisc(radius: number, centre: THREE.Color, rim: THREE.Color): THREE.BufferGeometry {
  const g = new THREE.CircleGeometry(radius, 96);
  const pos = g.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.hypot(pos.getX(i), pos.getY(i)) / radius);
    c.copy(centre).lerp(rim, t);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return g;
}

/** Dark tiles with amber seams, centred so the suit stands mid-tile. */
function Floor() {
  const seams = useMemo(() => {
    const TILE = 1.1;
    const HALF = 30;
    const WIDTH = 0.04;
    const parts: THREE.BufferGeometry[] = [];
    for (let k = -HALF; k <= HALF; k += TILE) {
      const at = k + TILE / 2;
      const alongZ = new THREE.PlaneGeometry(WIDTH, HALF * 2).rotateX(-Math.PI / 2);
      alongZ.translate(at, FLOOR_Y + 0.006, 0);
      const alongX = new THREE.PlaneGeometry(HALF * 2, WIDTH).rotateX(-Math.PI / 2);
      alongX.translate(0, FLOOR_Y + 0.006, at);
      parts.push(alongZ, alongX);
    }
    const merged = mergeGeometries(parts);
    parts.forEach((p) => p.dispose());
    return merged;
  }, []);

  // the warm pool the pedestal and first arch throw on the tiles
  const pool = useMemo(
    () => radialDisc(7, neon.clone().multiplyScalar(0.17), new THREE.Color(0, 0, 0)),
    [],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#141416" roughness={0.85} metalness={0.15} />
      </mesh>
      <mesh geometry={pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.003, 0]}>
        <meshBasicMaterial
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      <mesh geometry={seams}>
        <meshBasicMaterial color={hot(0.6)} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
}

export const PEDESTAL_TOP = FLOOR_Y + 0.32;

/**
 * How far the haze above the pad rises. It stops just under the hem of the
 * suit, so the glow never washes over the suit itself.
 */
const HALO_HEIGHT = 0.48;

/** A charcoal drum whose top is a yellow light pad, ringed with neon. */
function Pedestal() {
  const { side, pad, halo } = useMemo(() => {
    const side = new THREE.CylinderGeometry(1.5, 1.56, PEDESTAL_TOP - FLOOR_Y, 72, 1, true);
    side.translate(0, (FLOOR_Y + PEDESTAL_TOP) / 2, 0);
    bake(side, 0.12);

    const pad = radialDisc(1.5, hot(1.35), hot(0.6));

    // a curtain of light standing on the pad's rim, bright at the foot and
    // gone by the top
    const halo = new THREE.CylinderGeometry(1.5, 1.5, HALO_HEIGHT, 96, 1, true);
    halo.translate(0, PEDESTAL_TOP + HALO_HEIGHT / 2, 0);
    const pos = halo.getAttribute("position");
    const colors = new Float32Array(pos.count * 3);
    const foot = neon.clone().multiplyScalar(0.42);
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) - PEDESTAL_TOP) / HALO_HEIGHT;
      colors.set([foot.r * (1 - t), foot.g * (1 - t), foot.b * (1 - t)], i * 3);
    }
    halo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return { side, pad, halo };
  }, []);

  return (
    <group>
      <mesh geometry={side}>
        <meshBasicMaterial vertexColors />
      </mesh>
      <mesh geometry={pad} rotation={[-Math.PI / 2, 0, 0]} position={[0, PEDESTAL_TOP, 0]}>
        <meshBasicMaterial vertexColors />
      </mesh>
      <mesh geometry={halo}>
        <meshBasicMaterial
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* bright lip round the pad */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, PEDESTAL_TOP, 0]}>
        <torusGeometry args={[1.5, 0.045, 10, 120]} />
        <meshBasicMaterial color={hot(1.8)} />
      </mesh>
      {/* and a ring on the floor around the drum */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.01, 0]}>
        <ringGeometry args={[1.78, 1.92, 120]} />
        <meshBasicMaterial color={hot(1.35)} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Chamber3D() {
  return (
    <group>
      <Floor />
      <Arches />
      <Blocks />
      <Pedestal />
    </group>
  );
}
