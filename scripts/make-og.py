import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SUIT, OUT = sys.argv[1], sys.argv[2]
W, H = 1200, 630
VOID, HAZE = (3, 7, 13), (34, 211, 238)

img = Image.new("RGB", (W, H), VOID)
d = ImageDraw.Draw(img)

# chamber: vertical wash + laser grid fading out from centre
for y in range(H):
    t = y / H
    v = int(3 + 14 * (1 - abs(t - 0.45) * 2) ** 2)
    d.line([(0, y), (W, y)], fill=(v, v + 6, v + 14))

grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g = ImageDraw.Draw(grid)
for x in range(0, W, 72):
    g.line([(x, 0), (x, H)], fill=(*HAZE, 26))
for y in range(0, H, 72):
    g.line([(0, y), (W, y)], fill=(*HAZE, 20))
img = Image.alpha_composite(img.convert("RGBA"), grid)

# spotlight behind the suit
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse([700, 60, 1180, 600], fill=(*HAZE, 46))
img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(70)))

# the suit, right of centre
suit = Image.open(SUIT).convert("RGBA")
sh = 560
suit = suit.resize((int(suit.width * sh / suit.height), sh), Image.LANCZOS)
img.alpha_composite(suit, (W - suit.width - 110, (H - sh) // 2 + 20))

d = ImageDraw.Draw(img)
bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 72)
body = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 29)
mono = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)

d.text((88, 196), "Sponsor my", font=bold, fill=(230, 242, 251))
d.text((88, 272), "trisuit", font=bold, fill=(230, 242, 251))
for i, line in enumerate(
    ["14 places on the suit I will race an", "Ironman in — plus seven documentary", "episodes your brand is part of."]
):
    d.text((90, 374 + i * 40), line, font=body, fill=(138, 162, 184))
# Letter-spaced by hand (PIL has no tracking). Arial on this machine has no
# U+20B9, so the rupee sign falls back to Geneva, which does.
rupee = ImageFont.truetype("/System/Library/Fonts/Geneva.ttf", 22)
x = 90
for ch in "₹40,000 — ₹3,00,000 PER SLOT":
    f = rupee if ch == "₹" else mono
    d.text((x, 504 if ch != "₹" else 503), ch, font=f, fill=(217, 240, 60))
    x += d.textlength(ch, font=f) + 1.6

img.convert("RGB").save(OUT, quality=92)
print("wrote", OUT)
