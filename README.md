# Sponsor my trisuit

Sells sponsor slots on an Ironman trisuit. Modelled on
[hyrox.marclou.com](https://hyrox.marclou.com) — a rotatable suit with clickable
slots, tiered pricing, per-slot view counts and a live visitor ticker — but
pointed at Indian sponsors paying in rupees through an enquiry-and-invoice flow
rather than a checkout.

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

Real 3D, via React Three Fiber — the suit orbits freely, the same as the
reference site.

**The model.** `public/models/trisuit.glb`, one mesh, ~141k verts, with normals
and UVs. `SuitModel` normalises it on load — centred on the origin, scaled to a
fixed height — so slot anchors survive a re-export at a different scale.

> The GLB is gitignored (12 MB). Draco-compress it before launch; the reference
> site ships its model that way.

**The logos.** `SlotDecal3D` uses `DecalGeometry`, which clips the target's
triangles against a projector box. That needs **no UV layout**, which is what
makes it safe on a generated mesh whose UVs are usually a mess.

One subtlety worth keeping: `DecalGeometry` projects through `mesh.matrixWorld`,
and immediately after mount three has not refreshed the world matrices yet. The
decals come out degenerate unless `updateMatrixWorld(true)` runs first — see the
comment in `SuitModel.tsx`.

**The camera.** Clicking a slot eases the camera onto it via `CameraRig`, then
hands control back to `OrbitControls`. The viewpoint is derived from the
anchor's own orientation (`lib/slotCamera.ts`), so there is no per-slot camera
data to keep in sync.

**No `<Environment preset>`.** drei fetches its HDRs from an external CDN, and a
failed fetch suspends the whole subtree — which silently blanks the hero. The
chamber is emissive neon plus explicit lights instead.

### Moving a slot

Run the dev server and open **`/lab`**. Pick a slot, click that spot on the
suit, and the anchor moves there. It starts from whatever is baked into
`content/slots.ts`, keeps your edits in `localStorage` across reloads, and the
Copy JSON button gives you the block to paste back into `content/slots.ts`.

Clicking beats typing coordinates because the raycast returns the hit point
*and* the surface normal together, and the normal is exactly the projector
orientation. The spin slider rotates a decal within the surface plane.

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
