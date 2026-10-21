import type { TierId } from "./types";

/** Hex values for the 3D scene — CSS variables cannot reach a WebGL material. */
export const TIER_HEX: Record<TierId, string> = {
  title: "#ffd400",
  prime: "#ffe14d",
  core: "#ffeb85",
  support: "#fff3b8",
};

export const SOLD_HEX = "#ffffff";
