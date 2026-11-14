#!/usr/bin/env python3
"""Export uml-clases-dominio.drawio → stacked SVG (no draw.io CLI)."""
from __future__ import annotations

import html
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DRAWIO = ROOT / "docs" / "diagramas" / "fuentes" / "uml-clases-dominio.drawio"
OUT = ROOT / "docs" / "diagramas" / "img" / "uml-clases-dominio.svg"

PAGE_GAP = 48
MARGIN = 24


def parse_style(s: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for part in (s or "").split(";"):
        if not part or "=" not in part:
            continue
        k, v = part.split("=", 1)
        out[k] = v
    return out


def unescape_value(v: str) -> str:
    # draw.io stores HTML escaped once (or twice for << >>)
    prev = None
    while prev != v:
        prev = v
        v = html.unescape(v)
    return v


def html_to_lines(value: str) -> list[tuple[str, str]]:
    """Return list of (kind, text) where kind is 'title'|'stereo'|'body'|'hr'|'plain'."""
    raw = unescape_value(value or "")
    # <<stereo>> looks like HTML tags; protect before stripping.
    raw = re.sub(r"<<([^<>]+)>>", r"⟦\1⟧", raw)
    if "<" not in raw and "⟦" not in raw:
        return [("plain", raw.strip())] if raw.strip() else []

    def restore(t: str) -> str:
        return re.sub(r"⟦([^⟧]+)⟧", r"<<\1>>", t)

    lines: list[tuple[str, str]] = []
    parts = re.split(r"<hr[^>]*/?>", raw, flags=re.I)
    for i, part in enumerate(parts):
        paras = re.findall(r"<p[^>]*>(.*?)</p>", part, flags=re.I | re.S)
        if not paras:
            paras = [part]
        chunks: list[str] = []
        for para in paras:
            chunks.extend(re.split(r"<br\s*/?>", para, flags=re.I))
        for chunk in chunks:
            has_b = bool(re.search(r"<b[\s>]", chunk, flags=re.I))
            has_i = bool(re.search(r"<i[\s>]", chunk, flags=re.I))
            text = restore(re.sub(r"<[^>]+>", " ", chunk))
            text = re.sub(r"\s+", " ", text).strip()
            if not text:
                continue
            if has_i and text.startswith("<<"):
                lines.append(("stereo", text))
            elif has_b:
                lines.append(("title", text))
            else:
                lines.append(("body", text))
        if i < len(parts) - 1:
            lines.append(("hr", ""))
    return lines


def geom(cell: ET.Element) -> tuple[float, float, float, float] | None:
    g = cell.find("mxGeometry")
    if g is None:
        return None
    try:
        return (
            float(g.get("x") or 0),
            float(g.get("y") or 0),
            float(g.get("width") or 0),
            float(g.get("height") or 0),
        )
    except ValueError:
        return None


def center(box: tuple[float, float, float, float]) -> tuple[float, float]:
    x, y, w, h = box
    return x + w / 2, y + h / 2


def edge_points(
    src: tuple[float, float, float, float],
    tgt: tuple[float, float, float, float],
) -> tuple[float, float, float, float]:
    sx, sy = center(src)
    tx, ty = center(tgt)
    # clip toward target box mid-edge roughly
    dx, dy = tx - sx, ty - sy
    if abs(dx) + abs(dy) < 1e-6:
        return sx, sy, tx, ty

    def clip_from(box, outward_x, outward_y):
        x, y, w, h = box
        cx, cy = center(box)
        # intersect with box border toward (outward)
        if abs(outward_x) * h > abs(outward_y) * w:
            # hit left/right
            if outward_x > 0:
                return x + w, cy + (outward_y / outward_x) * (w / 2)
            return x, cy + (outward_y / (-outward_x)) * (w / 2)
        if outward_y > 0:
            return cx + (outward_x / outward_y) * (h / 2), y + h
        return cx + (outward_x / (-outward_y)) * (h / 2), y

    x1, y1 = clip_from(src, dx, dy)
    x2, y2 = clip_from(tgt, -dx, -dy)
    return x1, y1, x2, y2


def esc(t: str) -> str:
    return html.escape(t, quote=True)


def render_page(diagram: ET.Element, y_offset: float) -> tuple[str, float, float]:
    model = diagram.find("mxGraphModel")
    assert model is not None
    page_w = float(model.get("pageWidth") or 2000)
    page_h = float(model.get("pageHeight") or 900)
    root = model.find("root")
    assert root is not None

    cells = {c.get("id"): c for c in root.findall("mxCell") if c.get("id")}
    boxes: dict[str, tuple[float, float, float, float]] = {}
    for cid, cell in cells.items():
        if cell.get("vertex") == "1":
            g = geom(cell)
            if g:
                boxes[cid] = g

    parts: list[str] = []
    name = diagram.get("name") or ""
    parts.append(
        f'<text x="{MARGIN}" y="{y_offset + 18}" font-size="16" font-weight="700" fill="#222">{esc(name)}</text>'
    )
    content_oy = y_offset + 28

    # vertices first (zones under classes: draw zones then classes by fill/type)
    zone_cells = []
    class_cells = []
    text_cells = []
    for cid, cell in cells.items():
        if cell.get("vertex") != "1" or cid not in boxes:
            continue
        style = parse_style(cell.get("style") or "")
        shape = style.get("shape", "")
        if shape == "umlClass":
            class_cells.append(cell)
        elif style.get("strokeColor") == "none" or style.get("fillColor") == "none":
            text_cells.append(cell)
        else:
            zone_cells.append(cell)

    for cell in zone_cells:
        x, y, w, h = boxes[cell.get("id")]
        style = parse_style(cell.get("style") or "")
        fill = style.get("fillColor", "#f7f9fc")
        stroke = style.get("strokeColor", "#999")
        dashed = ' stroke-dasharray="4 3"' if style.get("dashed") == "1" else ""
        parts.append(
            f'<rect x="{x}" y="{content_oy + y}" width="{w}" height="{h}" '
            f'fill="{fill}" stroke="{stroke}"{dashed} fill-opacity="0.9"/>'
        )
        title = unescape_value(cell.get("value") or "").strip()
        if title:
            parts.append(
                f'<text x="{x + w/2}" y="{content_oy + y + 22}" text-anchor="middle" '
                f'font-size="13" font-weight="700" fill="#333">{esc(title)}</text>'
            )

    for cell in class_cells:
        cid = cell.get("id")
        x, y, w, h = boxes[cid]
        style = parse_style(cell.get("style") or "")
        fill = style.get("fillColor", "#fff")
        stroke = style.get("strokeColor", "#666")
        fs = int(float(style.get("fontSize") or 11))
        parts.append(
            f'<rect x="{x}" y="{content_oy + y}" width="{w}" height="{h}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="1.2"/>'
        )
        lines = html_to_lines(cell.get("value") or "")
        ty = content_oy + y + 16
        for kind, text in lines:
            if kind == "hr":
                parts.append(
                    f'<line x1="{x}" y1="{ty - 4}" x2="{x + w}" y2="{ty - 4}" '
                    f'stroke="{stroke}" stroke-width="1"/>'
                )
                ty += 4
                continue
            if kind == "stereo":
                parts.append(
                    f'<text x="{x + w/2}" y="{ty}" text-anchor="middle" font-size="{fs - 1}" '
                    f'font-style="italic" fill="#333">{esc(text)}</text>'
                )
            elif kind == "title":
                parts.append(
                    f'<text x="{x + w/2}" y="{ty}" text-anchor="middle" font-size="{fs + 1}" '
                    f'font-weight="700" fill="#333">{esc(text)}</text>'
                )
            else:
                parts.append(
                    f'<text x="{x + 8}" y="{ty}" font-size="{fs}" fill="#333">{esc(text)}</text>'
                )
            ty += fs + 5

    for cell in text_cells:
        x, y, w, h = boxes[cell.get("id")]
        style = parse_style(cell.get("style") or "")
        fs = int(float(style.get("fontSize") or 12))
        bold = ' font-weight="700"' if "1" in (style.get("fontStyle") or "") else ""
        text = unescape_value(cell.get("value") or "").strip()
        if not text:
            continue
        # wrap-ish: single line for footer
        parts.append(
            f'<text x="{x}" y="{content_oy + y + h/2 + fs/3}" font-size="{fs}" fill="#333"{bold}>{esc(text)}</text>'
        )

    # edges
    for cell in cells.values():
        if cell.get("edge") != "1":
            continue
        style = parse_style(cell.get("style") or "")
        src_id = cell.get("source")
        tgt_id = cell.get("target")
        if not src_id or not tgt_id or src_id not in boxes or tgt_id not in boxes:
            # fallback absolute points
            g = cell.find("mxGeometry")
            if g is None:
                continue
            sp = g.find("mxPoint[@as='sourcePoint']")
            tp = g.find("mxPoint[@as='targetPoint']")
            if sp is None or tp is None:
                continue
            x1, y1 = float(sp.get("x") or 0), float(sp.get("y") or 0)
            x2, y2 = float(tp.get("x") or 0), float(tp.get("y") or 0)
        else:
            x1, y1, x2, y2 = edge_points(boxes[src_id], boxes[tgt_id])

        y1 += content_oy
        y2 += content_oy
        dashed = ' stroke-dasharray="5 3"' if style.get("dashed") == "1" else ""
        end = style.get("endArrow", "open")
        end_fill = style.get("endFill", "1")
        if end == "block" and end_fill == "0":
            marker = "url(#hollow)"
        elif end == "none":
            marker = ""
        else:
            marker = "url(#arrow)"
        marker_attr = f' marker-end="{marker}"' if marker else ""
        parts.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="#222" stroke-width="1.6"{dashed}{marker_attr}/>'
        )
        label = unescape_value(cell.get("value") or "").strip()
        if label:
            mx, my = (x1 + x2) / 2, (y1 + y2) / 2
            tw = max(28, len(label) * 6.2)
            parts.append(
                f'<rect x="{mx - tw/2}" y="{my - 9}" width="{tw}" height="14" fill="#fff" fill-opacity="0.9"/>'
            )
            parts.append(
                f'<text x="{mx}" y="{my + 2}" text-anchor="middle" font-size="10" '
                f'fill="#222" font-weight="600">{esc(label)}</text>'
            )

    return "\n".join(parts), page_w, page_h + 28


def main() -> None:
    tree = ET.parse(DRAWIO)
    root = tree.getroot()
    diagrams = root.findall("diagram")
    if not diagrams:
        raise SystemExit("no diagrams")

    bodies: list[str] = []
    max_w = 0.0
    y = MARGIN
    bodies.append(
        f'<text x="{MARGIN}" y="{y + 8}" font-size="20" font-weight="700" fill="#222">'
        f"FitZone — Diagrama de clases Nest (C-28.3)</text>"
    )
    bodies.append(
        f'<text x="{MARGIN}" y="{y + 28}" font-size="12" fill="#555">'
        f"Exportado desde uml-clases-dominio.drawio · Controllers · Services · DTOs · "
        f"Repositories · Decorator / Facade / State / Observer · 2026-11-13</text>"
    )
    y += 44

    for d in diagrams:
        body, pw, ph = render_page(d, y)
        bodies.append(body)
        max_w = max(max_w, pw)
        y += ph + PAGE_GAP

    width = int(max_w + MARGIN)
    height = int(y + MARGIN)
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}px" height="{height}px" viewBox="0 0 {width} {height}">',
        "<defs>",
        '<marker id="arrow" markerUnits="strokeWidth" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">',
        '<path d="M 0 0 L 10 5 L 0 10 z" fill="#222"/>',
        "</marker>",
        '<marker id="hollow" markerUnits="strokeWidth" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="8" markerHeight="8" orient="auto">',
        '<path d="M 1 1 L 11 6 L 1 11 z" fill="#ffffff" stroke="#222" stroke-width="1.2"/>',
        "</marker>",
        "</defs>",
        '<rect width="100%" height="100%" fill="#ffffff"/>',
        *bodies,
        f'<text x="{MARGIN}" y="{height - 28}" font-size="12" fill="#333">'
        f"Leyenda: naranja=Controller · azul=Service · verde=Repository · violeta=DTO · "
        f"gris=interface/abstract · Flecha llena=usa · triángulo hueco=herencia</text>",
        "</svg>",
        "",
    ]
    OUT.write_text("\n".join(svg), encoding="utf-8")
    print(f"wrote {OUT} ({width}x{height}, {len(diagrams)} pages)")


if __name__ == "__main__":
    main()
