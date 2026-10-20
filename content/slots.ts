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
    bestView: "front",
    pitch:
      "The finish-line photograph. Every frame shot from the front — the arch, the podium, the press wall — puts this logo dead centre.",
    placement: {
      front: [[0.358, 0.162], [0.642, 0.162], [0.654, 0.236], [0.346, 0.236]],
    },
  },
  {
    id: "chest_left",
    label: "Left chest",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "12 × 10 cm",
    bestView: "front",
    pitch: "Classic sponsor position. Reads clearly in every head-on photo and on the bike.",
    placement: {
      front: [[0.276, 0.266], [0.454, 0.254], [0.454, 0.356], [0.280, 0.346]],
    },
  },
  {
    id: "chest_right",
    label: "Right chest",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "12 × 10 cm",
    bestView: "front",
    pitch: "Mirror of the left chest. Paired, the two read as a brand partnership rather than a patch.",
    placement: {
      front: [[0.546, 0.254], [0.724, 0.266], [0.720, 0.346], [0.546, 0.356]],
    },
  },
  {
    id: "core_front",
    label: "Front core",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "16 × 7 cm",
    bestView: "front",
    pitch: "Low front panel. Visible on the bike in the aero position, where the chest is hidden.",
    placement: {
      front: [[0.392, 0.388], [0.608, 0.388], [0.614, 0.466], [0.386, 0.466]],
    },
  },
  {
    id: "sleeve_left",
    label: "Left sleeve",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "8 × 7 cm",
    bestView: "front",
    pitch: "Outer upper arm. Never still, never out of frame — it is the placement that shows up in video.",
    placement: {
      front: [[0.118, 0.208], [0.206, 0.196], [0.202, 0.276], [0.114, 0.270]],
    },
  },
  {
    id: "sleeve_right",
    label: "Right sleeve",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "8 × 7 cm",
    bestView: "front",
    pitch: "Outer upper arm, right side. The arm that faces the camera on most bike-course passes.",
    placement: {
      front: [[0.794, 0.196], [0.882, 0.208], [0.886, 0.270], [0.798, 0.276]],
    },
  },
  {
    id: "thigh_left",
    label: "Left thigh",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "13 × 9 cm",
    bestView: "front",
    pitch: "Black panel, high contrast. The thigh is at camera height for every roadside spectator on the run.",
    placement: {
      front: [[0.278, 0.626], [0.436, 0.616], [0.430, 0.722], [0.284, 0.714]],
    },
  },
  {
    id: "thigh_right",
    label: "Right thigh",
    tier: "prime",
    price: TIER_PRICE.prime,
    status: "open",
    size: "13 × 9 cm",
    bestView: "front",
    pitch: "Mirror of the left thigh, on the drive side of the bike — the side press photographers shoot from.",
    placement: {
      front: [[0.564, 0.616], [0.722, 0.626], [0.716, 0.714], [0.570, 0.722]],
    },
  },
  {
    id: "back_upper",
    label: "Upper back",
    tier: "title",
    price: TIER_PRICE.title,
    status: "open",
    size: "24 × 14 cm",
    bestView: "back",
    pitch:
      "The single most-seen surface in the sport. Everyone racing behind reads it for hours, and so does every follow camera on the run course.",
    placement: {
      back: [[0.325, 0.150], [0.675, 0.150], [0.664, 0.302], [0.336, 0.302]],
    },
  },
  {
    id: "back_lower",
    label: "Lower back",
    tier: "core",
    price: TIER_PRICE.core,
    status: "open",
    size: "16 × 8 cm",
    bestView: "back",
    pitch: "Just above the bibs. The one placement that stays visible in the aero tuck from behind.",
    placement: {
      back: [[0.368, 0.392], [0.632, 0.392], [0.626, 0.478], [0.374, 0.478]],
    },
  },
  {
    id: "blade_left",
    label: "Left shoulder blade",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "7 × 10 cm",
    bestView: "back",
    pitch: "Flanking the upper back. Small, clean, and always alongside the title sponsor.",
    placement: {
      back: [[0.245, 0.176], [0.322, 0.168], [0.328, 0.300], [0.251, 0.304]],
    },
  },
  {
    id: "blade_right",
    label: "Right shoulder blade",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "7 × 10 cm",
    bestView: "back",
    pitch: "Mirror of the left blade. Sold as a pair if you want both.",
    placement: {
      back: [[0.678, 0.168], [0.755, 0.176], [0.749, 0.304], [0.672, 0.300]],
    },
  },
  {
    id: "thigh_rear_left",
    label: "Left rear thigh",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "11 × 8 cm",
    bestView: "back",
    pitch: "What the athlete behind you looks at. Cheap, and seen for longer than anything on the front.",
    placement: {
      back: [[0.286, 0.620], [0.444, 0.614], [0.438, 0.722], [0.292, 0.728]],
    },
  },
  {
    id: "thigh_rear_right",
    label: "Right rear thigh",
    tier: "support",
    price: TIER_PRICE.support,
    status: "open",
    size: "11 × 8 cm",
    bestView: "back",
    pitch: "Mirror of the left rear thigh. The last thing anyone you pass sees.",
    placement: {
      back: [[0.556, 0.614], [0.714, 0.620], [0.708, 0.728], [0.562, 0.722]],
    },
  },
];

export const SLOTS_BY_ID = new Map(SLOTS.map((s) => [s.id, s]));
export const TIERS_BY_ID = new Map(TIERS.map((t) => [t.id, t]));

export const openSlotCount = () => SLOTS.filter((s) => s.status === "open").length;
