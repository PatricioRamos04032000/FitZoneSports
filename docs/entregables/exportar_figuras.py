"""Exporta las catorce figuras del dossier desde los SVG de docs/diagramas/img/."""

from __future__ import annotations

import re
import subprocess
import tempfile
from pathlib import Path

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


def viewbox(svg: Path) -> tuple[float, float]:
    head = svg.read_text(encoding="utf-8", errors="replace")[:8000]
    match = re.search(r'viewBox="([^"]+)"', head)
    if not match:
        raise SystemExit(f"sin viewBox: {svg.name}")
    parts = [float(n) for n in match.group(1).replace(",", " ").split()]
    if len(parts) != 4:
        raise SystemExit(f"viewBox inesperado en {svg.name}: {match.group(1)}")
    return parts[2], parts[3]


def window_for(width: float, height: float) -> tuple[int, int, int]:
    max_w, max_h = 1600, 2200
    scale = min(max_w / width, max_h / height, 2.0)
    if width < 900 and height < 1200:
        scale = 2.0
    win_w = max(400, int(round(width * scale)) + 16)
    win_h = max(300, int(round(height * scale)) + 16)
    device = 2 if win_w <= 1000 and win_h <= 1200 else 1
    return win_w, win_h, device


def export_one(name: str) -> None:
    svg = SRC / f"{name}.svg"
    png = OUT / f"{name}.png"
    win_w, win_h, device = window_for(*viewbox(svg))
    with tempfile.TemporaryDirectory(prefix="fz-edge-") as profile:
        cmd = [
            str(EDGE),
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--force-device-scale-factor={device}",
            f"--window-size={win_w},{win_h}",
            f"--user-data-dir={profile}",
            f"--screenshot={png}",
            str(svg),
        ]
        subprocess.run(cmd, check=True, timeout=60)
    if not png.exists() or png.stat().st_size < 2000:
        raise SystemExit(f"captura vacía: {png.name}")
    print(f"{png.name} {png.stat().st_size} {win_w}x{win_h} @{device}x")


def main() -> None:
    if not EDGE.exists():
        raise SystemExit(f"no está Edge en {EDGE}")
    OUT.mkdir(parents=True, exist_ok=True)
    for name in FIGURAS:
        export_one(name)


if __name__ == "__main__":
    main()
