# Sponsor my trisuit

Sells sponsor slots on an Ironman trisuit. Modelled on
[hyrox.marclou.com](https://hyrox.marclou.com) — a rotatable suit with clickable
slots, tiered pricing, per-slot view counts and a live visitor ticker — but
built from flat studio renders rather than a 3D model, and pointed at Indian
sponsors paying in rupees through an enquiry-and-invoice flow rather than a
checkout.

```bash
npm install
npm run dev
```

It runs with **no environment variables at all**. Without Supabase, views and
enquiries are kept in process memory and vanish on restart — fine for local
work, not for production.

---

## Before this goes live

Everything below is a placeholder. `content/site.ts` has `DRAFT = true`, which
puts a "draft content" chip on the page; flip it to `false` once the real
content is in.

### 1. Content — `content/site.ts`

Search the file for `TODO`. You need:

- **The race** — which Ironman, the exact date (ISO, drives the countdown),
  location, and whether it is full distance or 70.3
- **Reach** — real Instagram / Strava / YouTube numbers, and the race-day
  spectator and field figures
- **The documentary** — production house, platform, release timeline
- **Contact** — enquiry inbox, phone, and the entity that will invoice
- **Your story** — the three paragraphs under `race.story` are a draft written
  from nothing. Rewrite them in your own words; this is the part that actually
  converts small brands.

### 2. Prices — `content/slots.ts`

`TIER_PRICE` is a guess:

| Tier | Placeholder | Slots |
|---|---|---|
| Title | ₹3,00,000 | centre chest, upper back |
| Prime | ₹1,50,000 | left/right chest, left/right thigh |
| Core | ₹75,000 | sleeves, front core, lower back |
| Support | ₹40,000 | shoulder blades, rear thighs |

All fourteen sold at these prices is ₹16.6 lakh. Set them against what you
actually need to raise.

### 3. Photos

Add real training and race photos. The reach section is the weakest part of the
page right now because it has nothing to show.

---

## Environment

Copy `.env.example` to `.env.local`. Each group degrades on its own:

| Missing | What breaks |
|---|---|
| `SUPABASE_*` | Views, ticker and enquiries live in memory and reset on deploy |
| `RESEND_*` | Enquiries are still saved, just not emailed |
| `ADMIN_PASSWORD` | `/admin` cannot be opened at all |

Run `supabase/schema.sql` once in the Supabase SQL editor. It creates the four
tables, an atomic `increment_slot_view` function, and leaves RLS on with no
public policies — every write goes through the service-role key from a server
route, never the browser.

---

## How the viewer works

The reference site renders a Draco-compressed GLB through React Three Fiber.
This one does not, and gets most of the way there from four flat images.

**The plate.** `scripts/cut-suit-views.py` cuts four views out of a studio
render collage and composites them onto one shared 940 × 1380 canvas, so all
four sit in the same coordinate space. That shared canvas is what makes the spin
register and what lets one set of slot coordinates work across every view.
Output: `public/suit/{front,three-quarter,side,back}.webp`.

**The logos.** Each slot stores four corner points per view in normalised
0–1 canvas space. `lib/geometry.ts` solves the homography mapping a unit square
onto those corners and emits a CSS `matrix3d`, so the logo follows the body's
curve. `mix-blend-mode: multiply` lets the fabric's shading through on the white
jersey; the black bib panels use `screen` instead, because multiply would erase
the mark entirely (see `DARK_PANEL` in `SlotDecal.tsx`).

**The camera.** Clicking a slot springs the stage's scale and translate so the
slot's longest side fills about a quarter of the plate width, parked off-centre
so the detail card does not cover it. Markers counter-scale by `1 / cameraScale`
so dots and labels keep a constant size on screen.

### Moving a slot

Edit its `placement` quad in `content/slots.ts`. Corners are clockwise from
top-left, in fractions of the plate. To find values, overlay a percentage grid
on `public/suit/front.webp` and read them off — that is how the current ones
were set.

### Swapping in a real 3D model

The viewer is isolated behind `components/suit/SuitStage.tsx`. A React Three
Fiber scene can replace it without touching the slot data, the panels or the
API, as long as it accepts the same props and reports the same slot ids.

Note: the `.glb` currently in `~/Downloads` is **not a model** — it is 768 KB of
Meshy's download page HTML. Re-export it if you want to go this route.

---

## Routes

| Route | What it does |
|---|---|
| `/` | The page |
| `/admin` | Enquiry list, behind `ADMIN_PASSWORD` |
| `GET /api/slot-views` | View count per slot, cached 60s |
| `POST /api/slot-view` | Increments one slot; debounced client-side |
| `GET /api/activity` | Active now, visitors today, last five countries |
| `POST /api/enquiry` | Validates, saves, emails both sides |

Visitors are identified by a salted hash of IP + user agent + date. Raw IPs are
never stored. Country comes from Vercel's `x-vercel-ip-country` header, so the
ticker stays empty in local development unless `NODE_ENV=development`, where it
falls back to `IN` so you can see it working.

---

## Deploying

Vercel, with the env vars above. `NEXT_PUBLIC_SITE_URL` must be the real domain
or the OG tags will point at localhost.

Regenerate `public/og.jpg` if the headline or prices change — it is a static
image, not generated at request time.
