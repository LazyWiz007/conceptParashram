import sys, os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

VIEWS = [("front", 29, 457), ("three-quarter", 497, 832),
         ("side", 904, 1081), ("back", 1124, 1516)]
Y0, Y1 = 38, 728                 # common vertical window -> identical scale for all views
CANVAS_W, SCALE = 470, 2         # shared canvas; 940 x 1380 after upscale

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)
H, W, _ = a.shape
bg = np.concatenate([a[:, 0:4, :], a[:, W-4:W, :]], axis=1).mean(axis=1)
diff = np.abs(a - bg[:, None, :]).max(axis=2)

def fill_holes(binary):
    h, w = binary.shape
    padded = Image.new("L", (w + 2, h + 2), 255)
    padded.paste(Image.fromarray(((~binary).astype(np.uint8)) * 255, "L"), (1, 1))
    ImageDraw.floodfill(padded, (0, 0), 128, thresh=0)
    return ~(np.asarray(padded)[1:h+1, 1:w+1] == 128)

canvas_h = Y1 - Y0
for name, x0, x1 in VIEWS:
    d = diff[Y0:Y1, x0:x1]
    rgb = a[Y0:Y1, x0:x1].astype(np.uint8)

    hard = d > 16
    solid = fill_holes(hard)
    soft = np.clip((d - 7.0) / 15.0, 0.0, 1.0)
    # only keep soft alpha in a thin band hugging the subject; everything further
    # out is background gradient noise and was showing up as a grey haze box
    band = np.asarray(
        Image.fromarray((solid.astype(np.uint8)) * 255, "L").filter(ImageFilter.MaxFilter(7))
    ) > 127
    alpha = np.where(solid, 1.0, np.where(band, soft, 0.0))

    al = Image.fromarray((alpha * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.6))
    piece = Image.fromarray(rgb).convert("RGBA")
    piece.putalpha(al)

    # drop onto the shared canvas, horizontally centred on the subject's own bbox
    bb = piece.getbbox()
    piece = piece.crop((bb[0], 0, bb[2], canvas_h))
    canvas = Image.new("RGBA", (CANVAS_W, canvas_h), (0, 0, 0, 0))
    canvas.alpha_composite(piece, ((CANVAS_W - piece.width) // 2, 0))
    canvas = canvas.resize((CANVAS_W * SCALE, canvas_h * SCALE), Image.LANCZOS)

    canvas.save(os.path.join(OUT, f"{name}.webp"), "WEBP", quality=92, method=6)
    canvas.save(os.path.join(OUT, f"{name}.png"))
    print(f"{name:14s} {canvas.width}x{canvas.height}  subject_w={piece.width}")
