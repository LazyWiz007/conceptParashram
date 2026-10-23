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
    blurb:
      "The two surfaces that carry the race. Centre chest owns every finish-line photo; the upper back is what everyone racing behind reads for the whole morning.",
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
    blurb:
      "Lower back and sleeves. Smaller, constantly in motion, and the placements that survive the aero tuck when the chest is hidden.",
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
    blurb:
      "Shoulders and rib panels. The entry point — real estate on a real 70.3 suit, at a price a small brand can say yes to.",
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
  title: 60000,
  prime: 25000,
  core: 15000,
  support: 10000,
};

export const SLOTS: Slot[] = [
  {
    id: "chest_centre",
    label: "Centre chest",
    tier: "title",
    price: 75000,
    status: "open",
    size: "22 × 9 cm",
    pitch:
      "The finish-line photograph. Every frame shot from the front — the arch, the podium, the press wall — puts this logo dead centre.",
    anchor: {
      position: [-0.0, 0.852, 0.385],
      rotation: [-0.133, 0.164, 0.022],
      size: [0.8, 0.24, 0.8],
    },
  },
  {
    id: "chest_band",
    label: "Chest band",
    tier: "prime",
    price: 45000,
    status: "open",
    size: "26 × 8 cm",
    pitch:
      "Full width across the chest, under the title band. The placement people actually read in a finish-line photo, because it sits where the eye lands.",
    anchor: {
      position: [0, 0.56, 0.415],
      rotation: [-0.052, 0.057, 0.003],
      size: [0.66, 0.21, 0.8],
    },
  },
  {
    id: "sleeve_left",
    label: "Left sleeve",
    tier: "core",
    price: 15000,
    status: "open",
    size: "8 × 7 cm",
    pitch:
      "Outer upper arm. Never still, never out of frame — it is the placement that shows up in video.",
    anchor: {
      position: [0.825, 1.017, -0.062],
      rotation: [-1.318, 1.409, 1.315],
      size: [0.26, 0.22, 0.8],
    },
  },
  {
    id: "sleeve_right",
    label: "Right sleeve",
    tier: "core",
    price: 15000,
    status: "open",
    size: "8 × 7 cm",
    pitch:
      "Outer upper arm, right side. The arm that faces the camera on most bike-course passes.",
    anchor: {
      position: [-0.839, 0.806, -0.085],
      rotation: [-0.923, -1.321, -0.908],
      size: [0.26, 0.22, 0.8],
    },
  },
  {
    id: "thigh_left",
    label: "Left thigh",
    tier: "prime",
    price: 25000,
    status: "open",
    size: "13 × 9 cm",
    pitch:
      "Black panel, high contrast. The thigh is at camera height for every roadside spectator on the run.",
    anchor: {
      position: [0.403, -0.794, 0.352],
      rotation: [-0.119, 0.179, 0.021],
      size: [0.36, 0.3, 0.7],
    },
  },
  {
    id: "thigh_right",
    label: "Right thigh",
    tier: "prime",
    price: 25000,
    status: "open",
    size: "13 × 9 cm",
    pitch:
      "Mirror of the left thigh, on the drive side of the bike — the side press photographers shoot from.",
    anchor: {
      position: [-0.347, -0.799, 0.353],
      rotation: [-0.136, 0.109, 0.015],
      size: [0.36, 0.3, 0.7],
    },
  },
  {
    id: "back_upper",
    label: "Upper back",
    tier: "title",
    price: 60000,
    status: "open",
    size: "24 × 14 cm",
    pitch:
      "The single most-seen surface in the sport. Everyone racing behind reads it for hours, and so does every follow camera on the run course.",
    anchor: {
      position: [-0.001, 0.782, -0.356],
      rotation: [2.888, 0.052, -3.128],
      size: [0.76, 0.25, 0.8],
    },
  },
  {
    id: "back_lower",
    label: "Lower back",
    tier: "core",
    price: 20000,
    status: "open",
    size: "16 × 8 cm",
    pitch:
      "Just above the bibs. The one placement that stays visible in the aero tuck from behind.",
    anchor: {
      position: [-0.011, 0.372, -0.254],
      rotation: [2.987, 0.002, -3.141],
      size: [0.26, 0.22, 0.7],
    },
  },
  {
    id: "side_left",
    label: "Left side panel",
    tier: "support",
    price: 10000,
    status: "sold",
    sponsor: {
      name: "Webrook",
      logo: "/sponsors/webrook.png",
      url: "https://webrook.in",
      // No brand colour: the wordmark is printed straight onto the fabric,
      // keeping its transparency, rather than sitting on a coloured patch.
      // Turned a quarter so it reads down the ribs, which is the only way a
      // wide wordmark fits a panel this narrow.
      logoTurn: 90,
    },
    size: "8 × 22 cm",
    pitch:
      "Down the ribs. A tall vertical panel, readable from the side for the whole 90 km bike leg — the longest single stretch of the race.",
    anchor: {
      position: [0.426, 0.402, 0.166],
      rotation: [0.435, 1.04, -0.381],
      size: [0.2, 0.52, 0.8],
    },
  },
  {
    id: "side_right",
    label: "Right side panel",
    tier: "support",
    price: 10000,
    status: "sold",
    sponsor: {
      name: "Webrook",
      logo: "/sponsors/webrook.png",
      url: "https://webrook.in",
      logoTurn: 90,
    },
    size: "8 × 22 cm",
    pitch:
      "Mirror of the left side panel. The drive side, which is where press photographers shoot from.",
    anchor: {
      position: [-0.448, 0.434, 0.137],
      rotation: [0.563, -1.127, 0.518],
      size: [0.2, 0.52, 0.8],
    },
  },
];

export const SLOTS_BY_ID = new Map(SLOTS.map((s) => [s.id, s]));
export const TIERS_BY_ID = new Map(TIERS.map((t) => [t.id, t]));

export const openSlotCount = () => SLOTS.filter((s) => s.status === "open").length;
