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
      position: [0.0, 0.97, 0.361],
      rotation: [-0.243, 0.279, 0.068],
      size: [0.8, 0.24, 0.8],
    },
  },
  {
    id: "chest_band",
    label: "Chest band",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "26 × 8 cm",
    pitch:
      "Full width across the chest, under the title band. The placement people actually read in a finish-line photo, because it sits where the eye lands.",
    anchor: {
      position: [0.0, 0.56, 0.415],
      rotation: [-0.052, 0.057, 0.003],
      size: [0.66, 0.21, 0.8],
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
      position: [0.824, 0.72, 0.0],
      rotation: [-0.403, 0.937, 0.331],
      size: [0.26, 0.22, 0.8],
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
      position: [-0.822, 0.72, 0.0],
      rotation: [-0.332, -0.927, -0.269],
      size: [0.26, 0.22, 0.8],
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
      position: [0.0, 0.9, -0.375],
      rotation: [3.01, 0.118, -3.126],
      size: [0.76, 0.25, 0.8],
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
  {
    id: "shoulder_left",
    label: "Left shoulder",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "9 × 5 cm",
    pitch:
      "Top of the shoulder. Small, but it is the one spot that stays in frame whether the camera is in front, beside or above you.",
    anchor: {
      position: [0.35, 1.19, 0.223],
      rotation: [-0.592, 0.311, 0.203],
      size: [0.28, 0.15, 0.8],
    },
  },
  {
    id: "shoulder_right",
    label: "Right shoulder",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "9 × 5 cm",
    pitch: "Mirror of the left shoulder. Sold as a pair if you want both.",
    anchor: {
      position: [-0.35, 1.19, 0.222],
      rotation: [-0.585, -0.283, -0.183],
      size: [0.28, 0.15, 0.8],
    },
  },
  {
    id: "side_left",
    label: "Left side panel",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "8 × 22 cm",
    pitch:
      "Down the ribs. A tall vertical panel that is readable from the side for the whole bike leg, which is five of the eleven hours.",
    anchor: {
      position: [0.377, 0.4, 0.235],
      rotation: [0.185, 0.864, -0.142],
      size: [0.2, 0.52, 0.8],
    },
  },
  {
    id: "side_right",
    label: "Right side panel",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "8 × 22 cm",
    pitch: "Mirror of the left side panel. The drive side, which is where press photographers shoot from.",
    anchor: {
      position: [-0.377, 0.4, 0.235],
      rotation: [0.235, -0.814, 0.172],
      size: [0.2, 0.52, 0.8],
    },
  },
];

export const SLOTS_BY_ID = new Map(SLOTS.map((s) => [s.id, s]));
export const TIERS_BY_ID = new Map(TIERS.map((t) => [t.id, t]));

export const openSlotCount = () => SLOTS.filter((s) => s.status === "open").length;
