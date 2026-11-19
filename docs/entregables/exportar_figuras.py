"""Exporta las catorce figuras del dossier desde los SVG de docs/diagramas/img/.

Secuencia de reserva con pago, clases del dominio y el DER se capturan enteros
y, si no entran en una hoja A4, se parten en bandas apiladas.
"""

from __future__ import annotations

import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "docs" / "diagramas" / "img"
OUT = ROOT / "docs" / "entregables" / "figuras"

FIGURAS = [
    "c4-1-contexto",
    "c4-2-contenedores",
    "c4-3-canchas",
    "c4-3-acceso",
    "uml-clases-dominio",
    "sec-reserva-pago",
    "sec-reserva-concurrente",
    "sec-acceso-offline",
    "est-membresia",
    "est-reserva",
    "act-lista-espera",
    "er-fisico",
    "dep-despliegue",
    "pipe-ci",
]

PARTIR = {"uml-clases-dominio", "sec-reserva-pago", "er-fisico"}
# Cada banda, al ocupar el ancho de la hoja, deja el texto legible.
ANCHO_BANDA = 1400
ALTO_SOBRE_ANCHO = 1.15


def viewbox(svg: Path) -> tuple[float, float]:
    head = svg.read_text(encoding="utf-8", errors="replace")[:20000]
    match = re.search(r'viewBox="([^"]+)"', head)
    if not match:
        raise SystemExit(f"sin viewBox: {svg.name}")
    parts = [float(n) for n in match.group(1).replace(",", " ").split()]
    if len(parts) != 4:
        raise SystemExit(f"viewBox inesperado en {svg.name}: {match.group(1)}")
    return parts[2], parts[3]


def window_for(width: float, height: float, completo: bool) -> tuple[int, int, int]:
    if completo:
        largo = max(width, height)
        scale = min(2400 / largo, 1.25)
        win_w = max(400, int(round(width * scale)) + 8)
        win_h = max(300, int(round(height * scale)) + 8)
        return win_w, win_h, 1
    max_w, max_h = 1600, 2200
    scale = min(max_w / width, max_h / height, 2.0)
    if width < 900 and height < 1200:
        scale = 2.0
    win_w = max(400, int(round(width * scale)) + 16)
    win_h = max(300, int(round(height * scale)) + 16)
    device = 2 if win_w <= 1000 and win_h <= 1200 else 1
    return win_w, win_h, device


def partir(png: Path) -> int:
    imagen = Image.open(png)
    ancho, alto = imagen.size
    tile_w = min(ancho, ANCHO_BANDA)
    tile_h = min(alto, max(1, int(tile_w * ALTO_SOBRE_ANCHO)))
    if ancho <= int(tile_w * 1.05) and alto <= int(tile_h * 1.05):
        for vieja in png.parent.glob(f"{png.stem}-*.png"):
            vieja.unlink()
        return 1
    partes = []
    y = 0
    while y < alto:
        y2 = min(alto, y + tile_h)
        x = 0
        while x < ancho:
            x2 = min(ancho, x + tile_w)
            partes.append(imagen.crop((x, y, x2, y2)))
            x = x2
        y = y2
    partes[0].save(png)
    for indice, parte in enumerate(partes[1:], start=2):
        parte.save(png.with_name(f"{png.stem}-{indice}.png"))
    for vieja in png.parent.glob(f"{png.stem}-*.png"):
        numero = vieja.stem.rsplit("-", 1)[-1]
        if numero.isdigit() and int(numero) > len(partes):
            vieja.unlink()
    return len(partes)


def export_one(name: str) -> None:
    svg = SRC / f"{name}.svg"
    png = OUT / f"{name}.png"
    completo = name in PARTIR
    win_w, win_h, device = window_for(*viewbox(svg), completo)
    with tempfile.TemporaryDirectory(prefix="fz-edge-") as profile:
        profile_path = Path(profile)
        if completo:
            html = profile_path / "figura.html"
            html.write_text(
                "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head>"
                f"<body style=\"margin:0\"><img src=\"{svg.as_uri()}\" "
                f"width=\"{win_w}\" height=\"{win_h}\"></body></html>",
                encoding="utf-8",
            )
            destino = html.as_uri()
        else:
            destino = str(svg)
        cmd = [
            str(EDGE),
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--force-device-scale-factor={device}",
            f"--window-size={win_w},{win_h}",
            f"--user-data-dir={profile}",
            f"--screenshot={png}",
            destino,
        ]
        subprocess.run(cmd, check=True, timeout=120)
    if not png.exists() or png.stat().st_size < 2000:
        raise SystemExit(f"captura vacía: {png.name}")
    bandas = partir(png) if name in PARTIR else 1
    print(f"{png.name} {png.stat().st_size} {win_w}x{win_h} @{device}x bandas={bandas}")


def main() -> None:
    if not EDGE.exists():
        raise SystemExit(f"no está Edge en {EDGE}")
    OUT.mkdir(parents=True, exist_ok=True)
    for name in FIGURAS:
        export_one(name)


if __name__ == "__main__":
    main()
