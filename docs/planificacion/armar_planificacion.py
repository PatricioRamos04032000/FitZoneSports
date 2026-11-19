"""Imprime el PDF del plan de proyecto desde el Markdown del Anexo H.

No sustituye tag ni hash. Esos datos son de la portada del dossier.
"""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

import markdown

EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
AQUI = Path(__file__).resolve().parent
FUENTE = AQUI / "PROGV-2026-TIF-Equipo03-Planificacion.md"
PDF = AQUI / "PROGV-2026-TIF-Equipo03-Planificacion.pdf"

CSS = """
@page { size: A4; margin: 14mm 12mm; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  font-family: "Segoe UI", Calibri, sans-serif;
  font-size: 11pt;
  line-height: 1.45;
  color: #1a1a1a;
}
h1 { font-size: 20pt; line-height: 1.25; }
h2 { break-before: page; font-size: 16pt; margin-top: 0; }
h2:first-of-type { break-before: auto; }
h3 { font-size: 13pt; margin-top: 1.3em; }
table { border-collapse: collapse; width: 100%; margin: 0.6em 0 1em; font-size: 9pt; }
th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; }
th { background: #f3f4f6; }
a { color: #1d4e89; word-break: break-all; }
"""


def a_html(texto: str) -> str:
    cuerpo = markdown.markdown(
        texto,
        extensions=["tables", "fenced_code", "sane_lists"],
    )
    return (
        "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"utf-8\">"
        f"<title>Plan de proyecto FitZone Sports Equipo 03</title>"
        f"<style>{CSS}</style></head><body>{cuerpo}</body></html>"
    )


def imprimir(html_path: Path) -> None:
    if not EDGE.exists():
        raise SystemExit(f"no está Edge en {EDGE}")
    with tempfile.TemporaryDirectory(prefix="fz-plan-") as profile:
        cmd = [
            str(EDGE),
            "--headless=new",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--user-data-dir={profile}",
            f"--print-to-pdf={PDF}",
            html_path.as_uri(),
        ]
        subprocess.run(cmd, check=True, timeout=180)
    if not PDF.exists() or PDF.stat().st_size < 8_000:
        raise SystemExit(f"el PDF no se escribió: {PDF}")


def main() -> None:
    if not FUENTE.exists():
        raise SystemExit(f"falta la base {FUENTE}")
    texto = FUENTE.read_text(encoding="utf-8")
    with tempfile.TemporaryDirectory(prefix="fz-plan-html-") as carpeta:
        html_path = Path(carpeta) / "planificacion.html"
        html_path.write_text(a_html(texto), encoding="utf-8")
        imprimir(html_path)
    print(f"{PDF} bytes={PDF.stat().st_size}")


if __name__ == "__main__":
    main()
