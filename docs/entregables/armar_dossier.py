"""Imprime el PDF del dossier desde docs/entregables/dossier.md.

Sustituye {{TAG}}, {{HASH}} y {{HASH_LEYENDA}} solo en la copia que se imprime.
El hash es el de v1.0-entrega. Sin ese tag el script no escribe el PDF.

Con --claves completa las variables de entorno en una copia local que no se versiona.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import tempfile
from pathlib import Path

import markdown

EDGE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
AQUI = Path(__file__).resolve().parent
DOSSIER = AQUI / "dossier.md"
PDF = AQUI / "PROGV-2026-TIF-Equipo03-Dossier.pdf"
PDF_LOCAL = AQUI / "local" / "PROGV-2026-TIF-Equipo03-Dossier.pdf"

OBLIGATORIAS = (
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
)
PUBLICAS = {
    "POSTGRES_PASSWORD": "postgres",
    "SEED_PASSWORD": "fitzone-demo",
    "PORT": "3000",
    "APP_PUBLIC_URL": "http://localhost:3000",
    "CORS_ORIGIN": "http://localhost,http://localhost:5173,http://frontend:80",
    "VITE_API_URL": "http://localhost:3000",
}
OPCIONALES = (
    "TOTP_SEED_ENCRYPTION_KEY",
    "E2E_EMAIL",
    "E2E_PASSWORD",
    "E2E_BASE_URL",
    "CI",
)

CSS = """
@page { size: A4; margin: 14mm 12mm; }
@page banda { size: A4 landscape; margin: 12mm; }
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
.banda { page: banda; break-before: page; break-after: page; }
.banda img { max-width: 100%; max-height: 165mm; width: auto; height: auto; margin: 0 auto; }
.banda p { margin: 0.4em 0 0; font-size: 10pt; }
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
    commit = git("rev-parse", "--verify", "v1.0-entrega^{commit}")
    if commit is None:
        raise SystemExit(
            "falta el tag anotado v1.0-entrega; no se imprime el dossier"
        )
    return (
        "v1.0-entrega",
        commit,
        "Hash de `git rev-parse v1.0-entrega`.",
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


def aplicar_claves(texto: str) -> str:
    faltan = [nombre for nombre in OBLIGATORIAS if not os.environ.get(nombre)]
    if faltan:
        raise SystemExit("faltan claves para el PDF local: " + ", ".join(faltan))
    valores: dict[str, str] = {}
    for nombre in OBLIGATORIAS:
        valores[nombre] = os.environ[nombre]
    for nombre, publico in PUBLICAS.items():
        valores[nombre] = os.environ.get(nombre) or publico
    for nombre in OPCIONALES:
        valores[nombre] = os.environ.get(nombre, "")
    for nombre, valor in valores.items():
        marca = f"- `{nombre}`:"
        if marca not in texto:
            raise SystemExit(f"el Markdown no tiene la línea de {nombre}")
        texto = texto.replace(marca, f"- `{nombre}`: {valor}", 1)
    return texto


def imprimir(html_path: Path, destino: Path) -> None:
    if not EDGE.exists():
        raise SystemExit(f"no está Edge en {EDGE}")
    destino.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="fz-dossier-") as profile:
        cmd = [
            str(EDGE),
            "--headless=new",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--user-data-dir={profile}",
            f"--print-to-pdf={destino}",
            html_path.as_uri(),
        ]
        subprocess.run(cmd, check=True, timeout=180)
    if not destino.exists() or destino.stat().st_size < 50_000:
        raise SystemExit(f"el PDF no se escribió: {destino}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--claves",
        action="store_true",
        help="arma el PDF local con las variables de entorno; no pisa el del repositorio",
    )
    args = parser.parse_args()
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
    destino = PDF
    if args.claves:
        texto = aplicar_claves(texto)
        destino = PDF_LOCAL
    with tempfile.TemporaryDirectory(prefix="fz-html-") as carpeta:
        html_path = Path(carpeta) / "dossier.html"
        html_path.write_text(a_html(texto), encoding="utf-8")
        imprimir(html_path, destino)
    print(f"{destino} bytes={destino.stat().st_size} hash={commit} tag={tag}")


if __name__ == "__main__":
    main()
