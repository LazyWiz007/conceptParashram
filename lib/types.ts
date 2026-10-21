export type TierId = "title" | "prime" | "core" | "support";

export type SlotStatus = "open" | "pending" | "sold";

export type Sponsor = {
  name: string;
  /** Path under /public or an uploaded URL; null falls back to a wordmark. */
  logo: string | null;
  url?: string;
  /** Handle shown under the name in the slot card. */
  handle?: string;
  /** One line describing what they do. */
  tagline?: string;
  /** Brand colour the print is filled with. */
  color?: string;
};

/**
 * Where a slot sits on the suit, in the normalised model space SuitModel
 * establishes (centred on the origin, scaled to a fixed height). `rotation` is
 * the decal projector's orientation: its +Z axis is the outward surface normal.
 */
export type SlotAnchor = {
  position: [number, number, number];
  rotation: [number, number, number];
  /** Projector box [width, height, depth]; depth must cross the surface. */
  size: [number, number, number];
};

export type Slot = {
  id: string;
  label: string;
  tier: TierId;
  /** Price in rupees. */
  price: number;
  status: SlotStatus;
  sponsor?: Sponsor;
  /** Why this patch of fabric is worth the money. */
  pitch: string;
  /** Printed size on the real suit. */
  size: string;
  anchor: SlotAnchor;
};

export type Tier = {
  id: TierId;
  name: string;
  blurb: string;
  accent: string;
  deliverables: string[];
};
