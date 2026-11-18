"""Imprime el PDF del dossier desde docs/entregables/dossier.md.

Sustituye {{TAG}}, {{HASH}} y {{HASH_LEYENDA}} solo en la copia que se imprime.
Si el tag v1.0-entrega existe, el hash es el de ese tag. Si no existe, el hash
es el de HEAD y la portada lo dice.
"""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

import markdown

EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
AQUI = Path(__file__).resolve().parent
DOSSIER = AQUI / "dossier.md"
PDF = AQUI / "PROGV-2026-TIF-Equipo03-Dossier.pdf"

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
h3 { font-size: 13pt; margin-top: 1.3em; }
img { max-width: 100%; height: auto; display: block; margin: 0.6em auto; }
table { border-collapse: collapse; width: 100%; margin: 0.6em 0 1em; font-size: 9pt; }
th, td { border: 1px solid #bbb; padding: 4px 6px; vertical-align: top; }
th { background: #f3f4f6; }
pre, code { font-family: Consolas, "Courier New", monospace; font-size: 8.5pt; }
pre { white-space: pre-wrap; word-break: break-word; background: #f6f6f6; padding: 8px; }
a { color: #1d4e89; word-break: break-all; }
"""


def git(*args: str) -> str | None:
    result = subprocess.run(
        ["git", *args],
        cwd=AQUI.parents[1],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return None
    valor = result.stdout.strip()
    return valor or None


def identidad() -> tuple[str, str, str]:
    tag = git("rev-parse", "--verify", "v1.0-entrega^{commit}")
    if tag is None:
        tag = git("rev-parse", "--verify", "v1.0-entrega")
    head = git("rev-parse", "HEAD")
    if head is None:
        raise SystemExit("git rev-parse HEAD no devolvió un hash")
    if tag:
        return (
            "v1.0-entrega",
            tag,
            "Hash de `git rev-parse v1.0-entrega`.",
        )
    return (
        "Pendiente. El tag anotado v1.0-entrega se crea en C-26, el día del congelamiento.",
        head,
        "Hash de `git rev-parse HEAD`: es el commit sobre el que se armó este PDF. "
        "El tag anotado v1.0-entrega se crea en C-26.",
    )


def a_html(texto: str) -> str:
    cuerpo = markdown.markdown(
        texto,
        extensions=["tables", "fenced_code", "sane_lists"],
    )
    figuras = (AQUI / "figuras").as_uri()
    cuerpo = cuerpo.replace('src="figuras/', f'src="{figuras}/')
    return (
        "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"utf-8\">"
        f"<title>Dossier FitZone Sports Equipo 03</title><style>{CSS}</style></head>"
        f"<body>{cuerpo}</body></html>"
    )


def imprimir(html_path: Path) -> None:
    if not EDGE.exists():
        raise SystemExit(f"no está Edge en {EDGE}")
    with tempfile.TemporaryDirectory(prefix="fz-dossier-") as profile:
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
    if not PDF.exists() or PDF.stat().st_size < 50_000:
        raise SystemExit(f"el PDF no se escribió: {PDF}")


def main() -> None:
    if not DOSSIER.exists():
        raise SystemExit(f"falta la base {DOSSIER}")
    tag, commit, leyenda = identidad()
    texto = DOSSIER.read_text(encoding="utf-8")
    for marca in ("{{TAG}}", "{{HASH}}", "{{HASH_LEYENDA}}"):
        if marca not in texto:
            raise SystemExit(f"el Markdown no tiene {marca}")
    texto = (
        texto.replace("{{TAG}}", tag)
        .replace("{{HASH}}", commit)
        .replace("{{HASH_LEYENDA}}", leyenda)
    )
    with tempfile.TemporaryDirectory(prefix="fz-html-") as carpeta:
        html_path = Path(carpeta) / "dossier.html"
        html_path.write_text(a_html(texto), encoding="utf-8")
        imprimir(html_path)
    print(f"{PDF} bytes={PDF.stat().st_size} hash={commit} tag={tag[:48]}")


if __name__ == "__main__":
    main()
