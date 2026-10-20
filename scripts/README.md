# Asset pipeline

> `cut-suit-views.py` fed the retired 2.5D viewer and is no longer part of the
> build. Kept because the cut-outs are still useful for press shots and decks.

Both scripts need Pillow and numpy (`pip3 install pillow numpy`).

## cut-suit-views.py

Cuts the four studio views out of a render collage and composites them onto one
shared 940 × 1380 canvas, so every view sits in the same coordinate space and
the slot quads in `content/slots.ts` stay valid across all of them.

```bash
python3 scripts/cut-suit-views.py "path/to/collage.png" public/suit
```

The `VIEWS` and `Y0/Y1` constants at the top are the crop windows for the
current collage. A different render needs them re-measured: threshold the image
against its own per-row background colour and look for the four columns of
content.

Background removal floods in from the border, keeps a soft alpha only in a thin
band hugging the subject, and forces the interior opaque. The band matters — the
first version kept soft alpha everywhere the image deviated from the sampled
background, which painted a faint grey haze box around the whole suit and
doubled the file size.

## make-og.py

Draws `public/og.jpg`, the social share image. Re-run it whenever the headline
or the prices change; it is a static file, not generated per request.

```bash
python3 scripts/make-og.py path/to/front.png public/og.jpg
```

It expects the suit on a transparent background. Note the rupee sign falls back
to Geneva — Arial on macOS has no U+20B9 and renders it as a tofu box.
