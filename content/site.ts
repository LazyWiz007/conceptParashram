/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DRAFT CONTENT.  Every value marked TODO is a placeholder that Omkar has to
 * confirm before this site goes live.  While `DRAFT` is true the page shows a
 * small "draft content" chip so nobody mistakes these numbers for real ones.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const DRAFT = true;

export const athlete = {
  name: "Parashram Gore",
  title: "Founder · Hybrid Athlete",
  tagline: "Here to prove you can do it all.",
  handle: "@parshuram_.gore",
  instagram: "https://www.instagram.com/parshuram_.gore/",
  website: "https://webrook.in",
  strava: "", // TODO: Strava profile, if you want it linked
  youtube: "", // TODO
  email: "pgore.work@gmail.com",
  phone: "+91 00000 00000", // TODO
  entity: "TODO Pvt Ltd", // TODO: who invoices sponsors
  /** Looping ambient clip behind the suit. */
  video: "/media/swim.mp4",
  videoPoster: "/media/swim-poster.jpg",
  videoCaption: "I'll make it work. I'm insane.",
};

export const race = {
  name: "IRONMAN", // TODO: which race
  distance: "3.8 km swim · 180 km bike · 42.2 km run",
  location: "TODO — city, country",
  /** ISO date. Drives the countdown. TODO: real race date. */
  date: "2027-03-14T06:00:00+05:30",
  goal: "Finish under 12 hours.", // TODO: your actual target
  story: [
    "I run a company and I race. Most people pick one.",
    "An Ironman is a 3.8 km swim, a 180 km ride and then a marathon, back to back, inside a single day. I have already done the 70.3, Hyrox, the 5i50 and a string of MTB and road events — this is the full distance, and it is the hardest thing I have signed up for. Training sits either side of a working day, roughly 18 hours a week, most of it before sunrise.",
    "This page is how I cover the rest: the entry, the travel, the bike, the coaching, and a seven-part film crew following the whole thing.",
  ],
};

/**
 * Lifted from the Instagram highlights. Some of these were brand shoots rather
 * than sponsorships — TODO: confirm which can be described as partnerships
 * before this goes anywhere near a sponsor deck.
 */
export const track = [
  "IRONMAN 70.3",
  "Ironman 5i50",
  "Hyrox",
  "Heritage Run",
  "Red Bull",
  "Formula E",
  "MTB",
];

export const reach = {
  /** Instagram is live as of 21 Oct 2026; the rest still need real figures. */
  stats: [
    { label: "Instagram", value: 9643, suffix: "followers" },
    { label: "Strava", value: 0, suffix: "followers" }, // TODO
    { label: "YouTube", value: 0, suffix: "subscribers" }, // TODO
  ],
  raceDay: [
    { label: "Spectators on course", value: "TODO" },
    { label: "Athletes in the field", value: "TODO" },
    { label: "Official race photos", value: "TODO" },
  ],
  note:
    "Every sponsor gets a post-race report with the real numbers: impressions, reach, saves, and the race photos their logo appears in.",
};

export const documentary = {
  title: "Seven episodes",
  producer: "TODO — production house", // TODO
  platform: "YouTube", // TODO
  blurb:
    "The whole build is being filmed as a seven-part series. A logo on the suit is a patch. A logo on the suit plus seven episodes is a campaign — your brand is in the story, not beside it.",
  sponsorGets: [
    "Brand card in the end credits of every episode",
    "Product placement where it genuinely fits the story",
    "A cut-down of your segment, yours to post",
  ],
  episodes: [
    { n: 1, title: "The decision", blurb: "Signing up for something I am not yet capable of finishing." },
    { n: 2, title: "Base", blurb: "Twenty weeks of unglamorous volume. The part nobody films." },
    { n: 3, title: "Water", blurb: "Learning to swim properly, at an age when that is embarrassing." },
    { n: 4, title: "The bike", blurb: "Fitting, fuelling, and the 180 km that decides the whole race." },
    { n: 5, title: "Breaking", blurb: "The injury, the bad block, and what it costs at home." },
    { n: 6, title: "Taper", blurb: "Doing less, badly. The two weeks before the start line." },
    { n: 7, title: "Race day", blurb: "Eleven hours, start to finish, uncut." },
  ],
};

export const faq = [
  {
    q: "What artwork do you need?",
    a: "A vector file — SVG, AI, EPS or a layered PDF. One-colour and full-colour versions if you have them. We will send a proof on the real suit before anything goes to print.",
  },
  {
    q: "When is the deadline?",
    a: "Artwork has to be with the manufacturer eight weeks before race day. Slots sold after that still get everything else — the documentary, the posts, the report — but not the print.",
  },
  {
    q: "How do I pay?",
    a: "There is no checkout here. You send an enquiry, we talk, and you get a proper invoice from a registered entity with GST. Payment by bank transfer.",
  },
  {
    q: "What if you do not finish?",
    a: "Then you get a film about someone not finishing, which is usually the better film. The logo is printed, the posts go out and the report still lands either way. Sponsorship buys the attempt, not the result.",
  },
  {
    q: "Can I buy more than one slot?",
    a: "Yes, and most brands should. A chest and a back slot together read as a title partnership rather than a patch. Ask and we will price the pair.",
  },
  {
    q: "Is the suit in these pictures the real one?",
    a: "It is a render of the same cut we are printing. You will see your logo on a photo of the actual suit before race day.",
  },
];
