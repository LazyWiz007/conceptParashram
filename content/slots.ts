import type { Slot, Tier } from "@/lib/types";

/**
 * PLACEHOLDER PRICING — confirm with Omkar before launch.
 * Tiers are ordered by how long a camera, a spectator or the athlete behind you
 * actually looks at that patch of fabric.
 */
export const TIERS: Tier[] = [
  {
    id: "title",
    name: "Title",
    blurb: "The two surfaces that carry the race. Centre chest owns every finish-line photo; the upper back is what the field stares at for eleven hours.",
    accent: "var(--tier-title)",
    deliverables: [
      "Largest print on the suit",
      "Named in all 7 documentary episodes + end-credit card",
      "Logo on every race-day and training post",
      "Dedicated brand film segment",
      "Full post-race impression report",
    ],
  },
  {
    id: "prime",
    name: "Prime",
    blurb: "Front-facing and thigh placements. In every spectator photo, drone pass and bike-course frame.",
    accent: "var(--tier-prime)",
    deliverables: [
      "Large print, front or thigh",
      "Named in 3 documentary episodes",
      "4 dedicated social posts",
      "Post-race impression report",
    ],
  },
  {
    id: "core",
    name: "Core",
    blurb: "Sleeves, core and lower back. Smaller, constantly in motion, constantly in frame.",
    accent: "var(--tier-core)",
    deliverables: [
      "Mid-size print",
      "Logo in documentary end credits",
      "2 dedicated social posts",
      "Post-race impression report",
    ],
  },
  {
    id: "support",
    name: "Support",
    blurb: "The entry point. Real estate on a real Ironman suit, at a price a small brand can say yes to.",
    accent: "var(--tier-support)",
    deliverables: [
      "Compact print",
      "Logo in documentary end credits",
      "1 dedicated social post",
      "Post-race impression report",
    ],
  },
];

export const TIER_PRICE: Record<Tier["id"], number> = {
  title: 300000,
  prime: 150000,
  core: 75000,
  support: 40000,
};

export const SLOTS: Slot[] = [
  {
    id: "chest_centre",
    label: "Centre chest",
    tier: "title",
    price: TIER_PRICE.title,
    status: "open",
    size: "22 × 9 cm",
    pitch:
      "The finish-line photograph. Every frame shot from the front — the arch, the podium, the press wall — puts this logo dead centre.",
    anchor: {
      position: [0.077, 0.97, 0.367],
      rotation: [-0.303, -0.134, -0.042],
      size: [0.62, 0.26, 0.7],
    },
  },
  {
    id: "chest_left",
    label: "Left chest",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "12 × 10 cm",
    pitch: "Classic sponsor position. Reads clearly in every head-on photo and on the bike.",
    anchor: {
      position: [0.27, 0.548, 0.368],
      rotation: [0.083, 0.554, -0.044],
      size: [0.36, 0.3, 0.7],
    },
  },
  {
    id: "chest_right",
    label: "Right chest",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "12 × 10 cm",
    pitch: "Mirror of the left chest. Paired, the two read as a brand partnership rather than a patch.",
    anchor: {
      position: [-0.236, 0.547, 0.387],
      rotation: [0.068, -0.434, 0.029],
      size: [0.36, 0.3, 0.7],
    },
  },
  {
    id: "core_front",
    label: "Front core",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "16 × 7 cm",
    pitch: "Low front panel. Visible on the bike in the aero position, where the chest is hidden.",
    anchor: {
      position: [0.077, 0.157, 0.421],
      rotation: [0.007, 0.076, -0.001],
      size: [0.26, 0.22, 0.7],
    },
  },
  {
    id: "sleeve_left",
    label: "Left sleeve",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "8 × 7 cm",
    pitch: "Outer upper arm. Never still, never out of frame — it is the placement that shows up in video.",
    anchor: {
      position: [0.593, 0.678, 0.057],
      rotation: [0.399, -0.998, 0.341],
      size: [0.26, 0.22, 0.7],
    },
  },
  {
    id: "sleeve_right",
    label: "Right sleeve",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "8 × 7 cm",
    pitch: "Outer upper arm, right side. The arm that faces the camera on most bike-course passes.",
    anchor: {
      position: [-0.427, 0.664, 0.226],
      rotation: [0.109, -0.831, 0.081],
      size: [0.26, 0.22, 0.7],
    },
  },
  {
    id: "thigh_left",
    label: "Left thigh",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "13 × 9 cm",
    pitch: "Black panel, high contrast. The thigh is at camera height for every roadside spectator on the run.",
    anchor: {
      position: [0.279, -0.645, 0.323],
      rotation: [-0.101, -0.165, -0.017],
      size: [0.36, 0.3, 0.7],
    },
  },
  {
    id: "thigh_right",
    label: "Right thigh",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "13 × 9 cm",
    pitch: "Mirror of the left thigh, on the drive side of the bike — the side press photographers shoot from.",
    anchor: {
      position: [-0.14, -0.646, 0.314],
      rotation: [0.418, -0.496, 0.208],
      size: [0.36, 0.3, 0.7],
    },
  },
  {
    id: "back_upper",
    label: "Upper back",
    tier: "title",
    price: TIER_PRICE.title,
    status: "open",
    size: "24 × 14 cm",
    pitch:
      "The single most-seen surface in the sport. Everyone racing behind reads it for hours, and so does every follow camera on the run course.",
    anchor: {
      position: [-0.098, 0.895, -0.4],
      rotation: [3.038, 0.292, -3.112],
      size: [0.62, 0.26, 0.7],
    },
  },
  {
    id: "back_lower",
    label: "Lower back",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "16 × 8 cm",
    pitch: "Just above the bibs. The one placement that stays visible in the aero tuck from behind.",
    anchor: {
      position: [-0.101, 0.193, -0.244],
      rotation: [3.122, -0.015, 3.141],
      size: [0.26, 0.22, 0.7],
    },
  },
  {
    id: "blade_left",
    label: "Left shoulder blade",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "7 × 10 cm",
    pitch: "Flanking the upper back. Small, clean, and always alongside the title sponsor.",
    anchor: {
      position: [-0.508, 0.875, -0.333],
      rotation: [2.66, -0.713, 2.812],
      size: [0.22, 0.26, 0.7],
    },
  },
  {
    id: "blade_right",
    label: "Right shoulder blade",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "7 × 10 cm",
    pitch: "Mirror of the left blade. Sold as a pair if you want both.",
    anchor: {
      position: [0.305, 0.865, -0.42],
      rotation: [2.849, 0.056, -3.125],
      size: [0.22, 0.26, 0.7],
    },
  },
  {
    id: "thigh_rear_left",
    label: "Left rear thigh",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "11 × 8 cm",
    pitch: "What the athlete behind you looks at. Cheap, and seen for longer than anything on the front.",
    anchor: {
      position: [-0.323, -0.693, -0.346],
      rotation: [2.743, -0.497, 2.943],
      size: [0.22, 0.26, 0.7],
    },
  },
  {
    id: "thigh_rear_right",
    label: "Right rear thigh",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "11 × 8 cm",
    pitch: "Mirror of the left rear thigh. The last thing anyone you pass sees.",
    anchor: {
      position: [0.122, -0.689, -0.373],
      rotation: [2.601, -0.202, 3.022],
      size: [0.22, 0.26, 0.7],
    },
  },
];

export const SLOTS_BY_ID = new Map(SLOTS.map((s) => [s.id, s]));
export const TIERS_BY_ID = new Map(TIERS.map((t) => [t.id, t]));

export const openSlotCount = () => SLOTS.filter((s) => s.status === "open").length;
