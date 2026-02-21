#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (13, 17, 23)
TEXT = (230, 237, 243)
MUTED = (139, 148, 158)
ACCENT = (247, 147, 26)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "og-image.png"
OUT.parent.mkdir(parents=True, exist_ok=True)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = []
    if bold:
        candidates.extend([
            "C:/Windows/Fonts/seguiemj.ttf",
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ])
    else:
        candidates.extend([
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ])
    candidates.extend([
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ])
    for fp in candidates:
        try:
            return ImageFont.truetype(fp, size=size)
        except Exception:
            continue
    return ImageFont.load_default()


img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img, "RGBA")

# Subtle watermark area
draw.ellipse((770, -120, 1460, 570), fill=(247, 147, 26, 34), outline=(247, 147, 26, 48), width=2)

brand_font = load_font(118, bold=True)
sub_font = load_font(42, bold=False)
mark_font = load_font(260, bold=True)

left_text = "aprende"
right_text = "BTC"
sub = "La guia mas completa de Bitcoin en espanol"

left_box = draw.textbbox((0, 0), left_text, font=brand_font)
right_box = draw.textbbox((0, 0), right_text, font=brand_font)
left_w = left_box[2] - left_box[0]
right_w = right_box[2] - right_box[0]
total_w = left_w + right_w

x = (W - total_w) // 2
y = 205

draw.text((x, y), left_text, font=brand_font, fill=TEXT)
draw.text((x + left_w, y), right_text, font=brand_font, fill=ACCENT)

draw.text((890, 55), "B", font=mark_font, fill=(247, 147, 26, 58))

sub_box = draw.textbbox((0, 0), sub, font=sub_font)
sub_w = sub_box[2] - sub_box[0]
draw.text(((W - sub_w) // 2, y + 155), sub, font=sub_font, fill=MUTED)

img.save(OUT, format="PNG", optimize=True)
print(f"OG image generated: {OUT}")
