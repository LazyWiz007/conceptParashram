import type { TierId } from "./types";

/** Hex values for the 3D scene — CSS variables cannot reach a WebGL material. */
export const TIER_HEX: Record<TierId, string> = {
  title: "#d9f03c",
  prime: "#22d3ee",
  core: "#818cf8",
  support: "#7c93a8",
};

export const SOLD_HEX = "#64748b";
