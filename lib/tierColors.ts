import type { TierId } from "./types";

/** Hex values for the 3D scene — CSS variables cannot reach a WebGL material. */
export const TIER_HEX: Record<TierId, string> = {
  title: "#ffd400",
  prime: "#ff5a36",
  core: "#22c3f0",
  support: "#a78bfa",
};

export const SOLD_HEX = "#ffffff";
