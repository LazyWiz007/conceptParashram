import type { Pt, Quad } from "./types";

/**
 * Solve the 3x3 homography mapping the unit square (0,0)(1,0)(1,1)(0,1)
 * onto `dst`, by Gaussian elimination on the 8x8 system. Returns the matrix
 * row-major with h33 fixed at 1.
 */
function unitSquareHomography(dst: Quad): number[] {
  const src: Quad = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];

  // 8 equations, 8 unknowns: h11 h12 h13 h21 h22 h23 h31 h32
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }

  const n = 8;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    }
    if (pivot !== col) {
      [A[col], A[pivot]] = [A[pivot], A[col]];
      [b[col], b[pivot]] = [b[pivot], b[col]];
    }
    const p = A[col][col];
    if (Math.abs(p) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col] / p;
      if (f === 0) continue;
      for (let c = col; c < n; c++) A[r][c] -= f * A[col][c];
      b[r] -= f * b[col];
    }
  }

  const h = new Array(9).fill(0);
  for (let i = 0; i < n; i++) h[i] = A[i][i] === 0 ? 0 : b[i] / A[i][i];
  h[8] = 1;
  return h;
}

/**
 * CSS `matrix3d` that warps a `w` x `h` element (transform-origin: 0 0) so its
 * corners land on `quad`, expressed in the same pixel space as w/h.
 */
export function quadToMatrix3d(quad: Quad, w: number, h: number): string {
  const px: Quad = [quad[0], quad[1], quad[2], quad[3]];
  const t = unitSquareHomography(px);
  // Pre-scale the unit square up to the element's own box.
  const sx = 1 / w;
  const sy = 1 / h;
  const m = [
    t[0] * sx, t[3] * sx, 0, t[6] * sx,
    t[1] * sy, t[4] * sy, 0, t[7] * sy,
    0, 0, 1, 0,
    t[2], t[5], 0, t[8],
  ];
  return `matrix3d(${m.map((v) => (Number.isFinite(v) ? v.toFixed(6) : 0)).join(",")})`;
}

export function quadCentroid(quad: Quad): Pt {
  let x = 0;
  let y = 0;
  for (const p of quad) {
    x += p[0];
    y += p[1];
  }
  return [x / 4, y / 4];
}

/** Axis-aligned bounds of a quad: [x, y, width, height]. */
export function quadBounds(quad: Quad): [number, number, number, number] {
  const xs = quad.map((p) => p[0]);
  const ys = quad.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  return [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0];
}

export function svgPolygonPoints(quad: Quad, w: number, h: number): string {
  return quad.map(([x, y]) => `${(x * w).toFixed(2)},${(y * h).toFixed(2)}`).join(" ");
}
