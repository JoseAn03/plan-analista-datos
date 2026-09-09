#!/usr/bin/env python3
"""Genera iconos PWA de ODEA: fondo oscuro cyberpunk, anillo neon cian, rayo dorado."""
from PIL import Image, ImageDraw, ImageFilter
import math

def make_icon(size, maskable=False):
    S = size
    img = Image.new("RGB", (S, S), "#05030a")
    # ---- Fondo: gradiente vertical sutil ----
    top = (13, 5, 26)      # #0d051a
    bottom = (5, 3, 10)    # #05030a
    grad = Image.new("RGB", (1, S))
    for y in range(S):
        t = y / S
        grad.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    grad = grad.resize((S, S))
    img.paste(grad)
    d = ImageDraw.Draw(img, "RGBA")

    # ---- Cuadricula sutil ----
    grid = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    step = max(16, S // 16)
    for x in range(0, S, step):
        gd.line([(x, 0), (x, S)], fill=(0, 229, 255, 8))
    for y in range(0, S, step):
        gd.line([(0, y), (S, y)], fill=(0, 229, 255, 8))
    img = Image.alpha_composite(img.convert("RGBA"), grid)
    d = ImageDraw.Draw(img, "RGBA")

    # ---- Glow radial central morado ----
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    c = S // 2
    for r in range(int(S * 0.55), 0, -3):
        a = int(28 * (1 - r / (S * 0.55)))
        gd.ellipse([c - r, c - r, c + r, c + r], fill=(96, 30, 160, a))
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.03))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img, "RGBA")

    # Margen de seguridad para maskable
    inner = S * (0.62 if maskable else 0.80)

    # ---- Anillo neon (doble) ----
    r1 = inner * 0.46
    r2 = r1 - S * 0.030
    ring_glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring_glow)
    rd.ellipse([c - r1, c - r1, c + r1, c + r1], outline=(0, 229, 255, 160), width=max(4, S // 45))
    ring_glow = ring_glow.filter(ImageFilter.GaussianBlur(S * 0.012))
    img = Image.alpha_composite(img, ring_glow)
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([c - r1, c - r1, c + r1, c + r1], outline=(0, 229, 255, 255), width=max(3, S // 64))
    d.ellipse([c - r2, c - r2, c + r2, c + r2], outline=(120, 250, 255, 180), width=max(2, S // 96))
    # Marcas HUD de nivel (ticks en 12/3/6/9h)
    for ang in (0, 90, 180, 270):
        a0 = math.radians(ang - 4); a1 = math.radians(ang + 4)
        x0 = c + (r1 + S * 0.02) * math.cos(a0); y0 = c + (r1 + S * 0.02) * math.sin(a0)
        x1 = c + (r1 + S * 0.02) * math.cos(a1); y1 = c + (r1 + S * 0.02) * math.sin(a1)
        d.line([(x0, y0), (x1, y1)], fill=(255, 255, 255, 220), width=max(3, S // 50))

    # ---- Rayo dorado central ----
    bolt = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bolt)
    w = S * 0.012
    bw = S * 0.075   # ancho medio del rayo
    cy = c - r2 * 0.82  # arriba del rayo
    by = c + r2 * 0.82  # abajo
    midx = c + r2 * 0.35
    midy = c - r2 * 0.12
    pts = [
        (c - bw * 0.55, cy), (midx - bw * 0.20, midy + r2 * 0.18),
        (c - bw * 0.15, midy + r2 * 0.18), (c + bw * 0.55, by),
        (c - bw * 0.30, by - r2 * 0.28), (c + bw * 0.22, by - r2 * 0.28),
    ]
    # Reordenar: simplifico dibujando como poligono tipo rayo zigzag
    zig = [
        (c - bw * 0.60, cy),                  # punta superior izquierda
        (c + bw * 0.25, cy),                  # punta superior derecha
        (c - bw * 0.10, midy + r2 * 0.22),    # codo
        (c + bw * 0.55, midy + r2 * 0.22),    # codo alto derecho
        (c - bw * 0.45, by),                  # punta inferior
        (c + bw * 0.18, by - r2 * 0.34),      # base derecha
        (c - bw * 0.30, by - r2 * 0.34),
    ]
    bd.polygon(zig, fill=(255, 214, 90, 255))
    bd.polygon(zig, fill=(255, 240, 170, 120))
    bolt = bolt.filter(ImageFilter.GaussianBlur(S * 0.006))
    img = Image.alpha_composite(img, bolt)
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon(zig, fill=(255, 205, 60, 255))
    # brillo central del rayo
    d.polygon([(x * 0.5 + c * 0.5, y * 0.5 + c * 0.5) for x, y in zig], fill=(255, 248, 215, 255))

    return img.convert("RGB")

for s in (512, 192, 180, 32):
    make_icon(s, maskable=False).save(f"icon-{s}.png", optimize=True)
make_icon(512, maskable=True).save("icon-maskable-512.png", optimize=True)
print("Iconos generados OK")
