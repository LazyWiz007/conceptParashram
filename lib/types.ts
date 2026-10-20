export type ViewId = "front" | "three-quarter" | "side" | "back";

export const VIEW_ORDER: ViewId[] = ["front", "three-quarter", "side", "back"];

/** A point in normalised canvas space: 0..1 across the 940x1380 suit plate. */
export type Pt = readonly [number, number];

/** Four corners, clockwise from top-left, in normalised canvas space. */
export type Quad = readonly [Pt, Pt, Pt, Pt];

export type TierId = "title" | "prime" | "core" | "support";

export type SlotStatus = "open" | "pending" | "sold";

export type Sponsor = {
  name: string;
  /** Path under /public, or null while we only have a wordmark. */
  logo: string | null;
  url?: string;
};

export type Slot = {
  id: string;
  label: string;
  tier: TierId;
  /** Price in paise-free rupees. */
  price: number;
  status: SlotStatus;
  sponsor?: Sponsor;
  /** Why this patch of fabric is worth the money. */
  pitch: string;
  /** Printed size on the real suit. */
  size: string;
  /** Where the slot sits in each view it is visible from. */
  placement: Partial<Record<ViewId, Quad>>;
  /** The view that shows this slot best; clicking the slot rotates here. */
  bestView: ViewId;
};

export type Tier = {
  id: TierId;
  name: string;
  blurb: string;
  accent: string;
  deliverables: string[];
};
