# Patch notes

Changes made on top of the cloned repo (base commit `066e4bb`). Newest first.

## 2026-10-21

### Second video screen, seen from behind the suit
- **What it is:** the training clip now also plays on a screen in front of
  the suit, turned to face it. When you rotate round to the back, there's
  footage behind the suit just like from the front.
- **Placement:**
  - It stands at z = 9.6, beyond the camera's orbit of about 7.2. From the
    front it's always behind the camera, so the front view is unchanged.
  - It's about 1.7× the size of the front screen (4.6 × 5.96), to make up
    for the extra distance, so both screens look the same size in shot.
  - It sits in the gap between the two pillars at that end of the room, with
    the same yellow frame.
- **One video:** both screens use the same video element, because drei caches
  it by URL. They play in sync and nothing extra is downloaded.
- `VideoPanel` takes a new `rotation` prop so a screen can face any direction.
- Files: `components/suit/three/Stage3D.tsx`, `VideoPanel.tsx`.

### Warp-speed streaks in the sky
- **The effect:** thin white and yellow streaks of light now fly out of the
  far end of the arch tunnel, as if the room were rushing forward. Each
  streak has its own angle, speed, length and brightness, and the heads
  speed up as they move out. There are two white layers at different
  densities plus a yellow one.
- **Where it shows:** it's the sky behind everything. The room and the suit
  draw over it, so it shows through the void above the blocks, between the
  pillars and down the tunnel. The suit, the patches and the room are
  unchanged.
- **Follows the camera:**
  - The burst is centred on wherever the tunnel's vanishing point is on
    screen.
  - Orbit round and the centre moves with it. From the side the streaks
    become near-parallel lines racing past.
  - Facing away from the tunnel, they run backwards into the opposite
    vanishing point.
- **Details:**
  - The lines are 1.5–3 pixels wide at any screen size. A first try was
    under a pixel and didn't show.
  - It's a single full-screen shader layer drawn first, so it costs very
    little.
  - It ignores clicks, so the suit's patches stay clickable.
  - It starts moving before the suit finishes loading.
  - Reduced motion freezes it.
- Files: `components/suit/three/SpeedLines.tsx` (new), `Stage3D.tsx` (mounts
  it).

### Pedestal glow turned down a little
- Every part of the pedestal's glow is about 20% dimmer, so the pad reads as
  a yellow gradient instead of blowing out to white in the middle.
  - Light pad: centre 1.7 → 1.35, edge 0.75 → 0.6
  - Haze above the pad: 0.55 → 0.42
  - Lip round the pad: 2.2 → 1.8
  - Ring on the floor: 1.6 → 1.35
  - Warm pool on the floor: 0.2 → 0.17
- File: `components/suit/three/Chamber3D.tsx`.

### Hydration warning from browser extensions silenced
- **The warning:** in development, Next.js showed "A tree hydrated but some
  attributes of the server rendered HTML didn't match". It was caused by the
  Grammarly extension adding `data-gr-ext-installed` and
  `data-new-gr-c-s-check-loaded` to `<body>` before React loaded. It wasn't a
  bug in the site.
- **The fix:** `<body>` now has `suppressHydrationWarning`. This only ignores
  attribute differences on that one element. Real mismatches anywhere inside
  the page are still reported.
- File: `app/layout.tsx`.

### Scroll-down button for phones
- **The problem:** on touch screens the 3D canvas takes every swipe to spin
  the suit, so there was no way to scroll past the hero.
- **The button:** a large round button at the bottom centre with a yellow ring
  and a soft yellow glow. Two chevrons inside drop and fade in a loop, the
  second a beat behind the first. Tapping it smooth-scrolls to the race
  section.
- **Placement:**
  - On phones it's 64px and sits just above the visitor ticker and the
    profile badge, which fill the bottom row.
  - On larger screens it's 56px and sits in the bottom-centre gap between
    them.
  - A small "drag to spin" label sits above it. This replaces the old
    "drag to spin · scroll ↓" hint.
- **Behaviour:**
  - It hides while a slot card or the slot list is open, so it never covers
    them.
  - Visitors whose device asks for reduced motion get still arrows and an
    instant jump instead of a smooth scroll.
- **Tested** in a 375×812 phone viewport, where a tap landed the race section
  at the top of the screen, and at a desktop size.
- Files: `components/Studio.tsx`, `app/globals.css` (arrow animation).

### Profile photo, and a yellow / white / black palette
- **Profile photo:** added the athlete's photo as
  `public/media/photos/avatar.webp`. The badge at the bottom right, which
  links to the Instagram handle, picks it up automatically instead of the "PG"
  initials.
- **Palette:** the UI now uses only yellow, white, black and neutral greys
  between them.
  - `--accent` is yellow `#ffd400`: the subtitle, links, the visitor-ticker
    dot, required-field marks, and the admin and lab buttons.
  - **Tiers are a yellow ramp** instead of lime / cyan / indigo / slate: Title
    `#ffd400`, Prime `#ffe14d`, Core `#ffeb85`, Support `#fff3b8`. This covers
    the slot patches on the suit, slot cards, the slot list, the tiers section
    and the claim buttons. Taken slots are white.
  - **Patches on the suit:** borders and labels are now black, because white
    disappears on yellow and on the white fabric. The fill is more opaque so
    the paler tiers still show against the white top.
  - The amber "Draft content" chip and the admin warning are yellow.
  - Red error messages in the enquiry form, the admin pages and the 3D error
    fallback are yellow.
  - The admin slot editor's lime highlight is yellow.
  - Blue-tinted dark panel backgrounds and patch label colours are neutral
    black.
  - The text greys are pure neutral (`#a3a3a3`, `#666666`) instead of slightly
    cool.
  - Checked in the browser: after a reload, no element on the page uses any
    other colour.
- **Not changed:** a sponsor's own brand colour, set per slot in
  `/admin/slots`, still shows behind their logo once a slot is sold.
- Files: `app/globals.css`, `lib/tierColors.ts`, `lib/slotTexture.ts`,
  `components/Studio.tsx`, `components/panels/*`,
  `components/sections/DocumentarySection.tsx`,
  `components/suit/three/CanvasBoundary.tsx`, `app/admin/*`,
  `app/lab/AnchorAuthor.tsx`.

### Arches get a black frame; the pedestal glows more
- **Arches:** each arch is now a solid black frame with depth, following the
  octagon outline. The band width and depth scale with the arch.
  - Two yellow neon tubes run along its outer and inner edges, on the face
    towards the suit.
  - Both tubes are now the same thickness. Before, the inner one was thinner.
  - The inner outline is an exact parallel offset of the outer one, so the two
    tubes stay evenly spaced round the cut corners.
  - All six frames are drawn as one mesh.
- **Pedestal:**
  - The light pad is about 1.8× brighter.
  - The lip round its edge and the ring on the floor are brighter and slightly
    thicker.
  - A haze of yellow light now rises from the pad's rim and fades out just
    below the hem of the suit, so it never tints the suit.
  - The warm pool on the floor is stronger.
- File: `components/suit/three/Chamber3D.tsx`.

### Yellow neon hall with an octagon arch tunnel
The room was restyled after a second reference image. The suit, its slot
patches and its lighting were not touched. No logos from the reference were
used.
- **Theme colour:** yellow `#ffd400`, exported as `NEON` from `Chamber3D.tsx`.
  The arches, floor seams, pedestal, block edges, floor glow and video frame
  all use it, so changing that one value recolours the room.
- **Octagon arch tunnel:** six nested arches with cut corners, each drawn as
  two parallel solid neon tubes.
  - The first arch stands in front of the video and frames the suit and
    pedestal. The rest recede to about z = −16, getting smaller and dimmer.
  - Their feet sink into the floor.
  - Their posts sit well inside the camera's circle, so the camera passes
    beside them and never through them.
  - These replace the white square frames.
- **Blocks:** the same layout plus four more pillars and columns at the back,
  now dark charcoal. Faces turned towards the tunnel get a faint baked yellow
  wash, as if lit by the arches.
- **Glowing edges kept:** the pulsing, scanning edges stay but are now yellow,
  and a little dimmer so they trace the blocks without competing with the
  arches.
- **Floor:** darker tiles, slightly smaller at 1.1 units, with amber seams and
  a warm radial pool of light around the pedestal.
- **Pedestal:** a taller charcoal drum. Its top is a glowing yellow light pad,
  brighter in the centre, with a bright lip and a ring on the floor around it.
  The contact shadow now sits on the pad.
- **Brightness:** the first pass bloomed far too much and washed the room
  yellow. Every emissive value was turned down, and the bloom setting itself
  was left alone so the slot patches glow exactly as before.
- **Video frame:** yellow.
- Files: `components/suit/three/Chamber3D.tsx` (rewritten), `Stage3D.tsx`
  (contact shadow height), `VideoPanel.tsx` (frame colour).

### Animated neon edges on the blocks
- Every block, column and tunnel frame now has a glowing white outline along
  its edges. Cylinders only get their top and bottom rims.
- **Animation:**
  - **Breathe:** each block pulses slowly with its own timing, so the pulse
    ripples round the room instead of every block flashing together.
  - **Scan:** a band of light rises from the floor to above the tallest
    pillar about every 8 seconds, brightening each edge as it passes.
- The edges are always bright enough to glow under the existing bloom, so
  they read as neon even at the dimmest point of the pulse.
- Visitors whose system asks for reduced motion get a still glow with no
  animation.
- All the edges are drawn as one line mesh with a small custom shader, which
  also fades them into the fog. The block faces are pushed back slightly so
  the lines always draw on top at the corners.
- File: `components/suit/three/Chamber3D.tsx`.

### New environment: a white-box gallery instead of the neon tunnel
The room around the suit was rebuilt to match the reference image. The suit
model and its slot patches were not touched.
- **Floor:** dark charcoal tiles (1.3 units square) with thick glowing white
  seams. The suit stands in the middle of a tile. This replaces the thin grid.
- **Blocks:** light-grey pillars, stepped plinths, a long low bench, stacked
  cubes and two cylinder columns, placed irregularly all the way round. The
  room looks finished from every angle you can rotate to. Replaces the dark
  monoliths.
- **Frame tunnel:** six nested square white frames behind the video screen,
  offset to the right so they recede beside it. Replaces the octagon arches and
  floor light strips.
- **Pedestal:** a low raised white disc under the suit with a glowing ring
  around it. The contact shadow now sits on top of the disc.
- **Sky and fog:** dark charcoal `#111113`, with the fog pushed back (22–60) so
  distant blocks stay light. The colour behind the video is now neutral.
- **How the blocks are lit:** the blocks, frames and disc use unlit materials
  with their shading baked into vertex colours (bright tops, a key light from
  the front-left, darker bases). Real lights in three.js shine on everything,
  so this keeps the suit's lighting exactly as before. Their brightness is set
  so the existing bloom only makes the floor seams and the ring glow.
- **Camera clearance:** blocks near the suit stay more than about 7.2 units
  away, the camera's orbit radius, so the camera never passes through them.
  The `/lab` and `/admin/slots` tools can still zoom out further than that.
- **Performance:** all the blocks and frames are merged into one mesh and all
  the floor seams into another.
- Files: `components/suit/three/Chamber3D.tsx` (rewritten), `Stage3D.tsx`
  (background, fog, contact shadow), `VideoPanel.tsx` (colour behind video).

### Camera no longer snaps back after closing a slot
- **The bug:** after you closed a slot card, the camera spent about two seconds
  easing back to the start view. Dragging during that time got pulled back
  every frame, so the suit snapped to the front view.
- **Now:** grabbing the suit while the camera is moving stops it fighting you
  for the angle. It still finishes zooming back out and re-centring, since the
  mouse wheel can't zoom on the page anymore.
- **Second fix:** a drag that started and ended on the suit was treated as a
  click. Clicking the suit closes the card, so orbiting while a card was open
  shut it and sent the camera home. Releasing after a drag on the suit or on a
  slot no longer counts as a click.
- Files: `components/suit/three/CameraRig.tsx`, `Stage3D.tsx`,
  `SlotDecal3D.tsx`.

### Scrolling works past the suit
- The mouse wheel no longer zooms the 3D suit on the main page, so scrolling
  over it now moves down to the race, reach, film, tiers and FAQ sections.
- Dragging still spins the suit, and clicking a slot still moves the camera
  onto it.
- `/lab` and `/admin/slots` keep wheel zoom, since nothing scrolls below them.
- File: `components/suit/three/Stage3D.tsx` (`enableZoom={Boolean(onPlace)}`).

### On-screen UI is white / neutral
- Text, borders, panels, buttons and the page background no longer have a blue
  tint. Text is neutral grey, borders are translucent white, and panels and the
  background are near-black.
- New `--accent: #ffffff` colour in `app/globals.css`. The places that used the
  Prime tier's cyan as a general highlight now use it instead:
  - the "Founder · Hybrid Athlete" subtitle
  - links and buttons
  - the visitor-ticker dot and the badge initials
  - the required-field marks in the enquiry form
  - the admin and lab buttons
- Cyan tints written directly into Tailwind class names (hovers, table rows,
  price boxes, section backgrounds) are now white or neutral.
- Slot patches keep their tier colours, so the Prime tier is still cyan.
- Files: `app/globals.css`, `components/Studio.tsx`, `components/panels/*`,
  `components/sections/*`, `app/admin/*`, `app/lab/AnchorAuthor.tsx`.

### Neon room is white instead of cyan
- The arches, floor lines, grid, pedestal rings and the frame around the video
  are white. The dimmer shade (grid, light under the suit) is grey `#6e7378`.
- The side lights and the light under the suit are white, so the suit is no
  longer tinted blue.
- The 3D background and fog are neutral black `#050506`.
- Files: `components/suit/three/Chamber3D.tsx`, `VideoPanel.tsx`,
  `Stage3D.tsx`.
