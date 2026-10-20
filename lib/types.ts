export type TierId = "title" | "prime" | "core" | "support";

export type SlotStatus = "open" | "pending" | "sold";

export type Sponsor = {
  name: string;
  /** Path under /public, or null while we only have a wordmark. */
  logo: string | null;
  url?: string;
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
