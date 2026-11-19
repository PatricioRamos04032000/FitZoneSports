"""Arma el registro del tablero para C-21.

La primera hoja muestra, por tarjeta, el día de alta y el día de cierre.
Esas fechas salen de las acciones del export. No se completan con el plan
ni con la última actividad de la tarjeta.
"""

from __future__ import annotations

import json
import re
import zipfile
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
FUENTE = RAIZ / "documentacion" / "eBn68vRC - programacion5 (3).json"
SALIDA = AQUI / "PROGV-2026-TIF-Equipo03-Registro.xlsx"
ART = ZoneInfo("America/Argentina/Buenos_Aires")
LISTA_CERRADA = "finalizado"
ID_RE = re.compile(r"(C-\d+[a-d]?|S\d+-T\d+|P\d+\.\d+)")

PLANTILLA = {
    "asdfa",
    "Budget approval",
    "Campaign Proposal",
    "Curate customer list",
    "Edit email drafts",
    "Finalize Campaign Name: Teamwork Dream Work ✨",
    "Freelancer contracts",
    "How can I get access to the super secret document?",
    "https://trello.com/b/1x4Uql2u",
    "Legal review",
    "Looking for even more project management features?",
    'Project "Teamwork Dream Work" Launch Timeline',
    "Sketch site banner",
    'Sketch the "Teamy Dreamy" Font',
    "Social media assets",
    "Stakeholders",
    "Submit Q1 report",
    "Weekly Updates",
    "Who's the best person to fix my HTML snag?",
}

COLUMNAS = [
    "Identificador",
    "Fecha de creación",
    "Fecha de cierre",
    "Días abierta",
    "Origen de la creación",
    "Origen del cierre",
    "Nombre",
    "Lista al corte",
    "Archivada",
    "Responsables",
    "URL",
]

RELLENO_TITULO = PatternFill("solid", fgColor="1F4E79")
RELLENO_FECHA = PatternFill("solid", fgColor="B86E00")
RELLENO_FECHA_CELDA = PatternFill("solid", fgColor="FFF4D6")
RELLENO_VACIO = PatternFill("solid", fgColor="F4F4F5")
RELLENO_BAND = PatternFill("solid", fgColor="F7F9FC")
FUENTE_TITULO = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
FUENTE_NORMAL = Font(name="Calibri", size=11)
FUENTE_LINK = Font(name="Calibri", size=11, color="1D4E89", underline="single")
BORDE = Border(
    left=Side(style="thin", color="D0D5DD"),
    right=Side(style="thin", color="D0D5DD"),
    top=Side(style="thin", color="D0D5DD"),
    bottom=Side(style="thin", color="D0D5DD"),
)
CENTRO = Alignment(horizontal="center", vertical="center", wrap_text=True)
IZQUIERDA = Alignment(horizontal="left", vertical="center", wrap_text=True)
MESES = (
    "",
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
)


def dia_de(iso: str) -> date:
    momento = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return momento.astimezone(ART).date()


def dia_del_id(card_id: str) -> date:
    instante = datetime.fromtimestamp(int(card_id[:8], 16), tz=timezone.utc)
    return instante.astimezone(ART).date()


def es_plantilla(nombre: str) -> bool:
    limpio = nombre.strip()
    return limpio.startswith("Trello Tip") or limpio in PLANTILLA


def identificador(nombre: str) -> str:
    hallado = ID_RE.search(nombre)
    return hallado.group(1) if hallado else ""


def cargar() -> dict:
    if not FUENTE.exists():
        raise SystemExit(f"falta el export {FUENTE}")
    return json.loads(FUENTE.read_text(encoding="utf-8"))


def indices(data: dict) -> tuple[dict[str, str], dict[str, str], dict[str, str], dict[str, str]]:
    listas = {lista["id"]: lista["name"] for lista in data["lists"]}
    personas = {miembro["id"]: miembro.get("fullName") or miembro.get("username") for miembro in data["members"]}
    altas: dict[str, str] = {}
    cierres: dict[str, str] = {}
    for accion in data["actions"]:
        datos = accion.get("data") or {}
        tarjeta = datos.get("card") or {}
        card_id = tarjeta.get("id")
        if not card_id or not accion.get("date"):
            continue
        if accion.get("type") == "createCard":
            previa = altas.get(card_id)
            if previa is None or accion["date"] < previa:
                altas[card_id] = accion["date"]
        if accion.get("type") == "updateCard":
            destino = (datos.get("listAfter") or {}).get("name")
            if destino == LISTA_CERRADA:
                previa = cierres.get(card_id)
                if previa is None or accion["date"] > previa:
                    cierres[card_id] = accion["date"]
    return listas, personas, altas, cierres


def fila(tarjeta: dict, listas: dict[str, str], personas: dict[str, str], altas: dict[str, str], cierres: dict[str, str]) -> dict:
    nombre = tarjeta["name"].replace("\n", " ").strip()
    alta_iso = altas.get(tarjeta["id"])
    if alta_iso:
        alta = dia_de(alta_iso)
        origen_alta = "acción"
    else:
        alta = dia_del_id(tarjeta["id"])
        origen_alta = "id de Trello"
    lista = listas[tarjeta["idList"]]
    cierre = None
    origen_cierre = ""
    if lista == LISTA_CERRADA:
        cierre_iso = cierres.get(tarjeta["id"])
        if cierre_iso:
            cierre = dia_de(cierre_iso)
            origen_cierre = "entrada a finalizado"
        else:
            origen_cierre = "en finalizado; la acción no está en el export"
    dias = (cierre - alta).days if cierre is not None else None
    nombres = [personas.get(miembro, "?") for miembro in tarjeta.get("idMembers") or []]
    return {
        "id": identificador(nombre),
        "alta": alta,
        "cierre": cierre,
        "dias": dias,
        "origen_alta": origen_alta,
        "origen_cierre": origen_cierre,
        "nombre": nombre,
        "lista": lista,
        "archivada": "sí" if tarjeta.get("closed") else "no",
        "responsables": ", ".join(nombres),
        "url": tarjeta.get("shortUrl") or tarjeta.get("url") or "",
    }


def aplicar_encabezado(hoja, anchos: list[int]) -> None:
    for indice, ancho in enumerate(anchos, start=1):
        celda = hoja.cell(1, indice)
        es_fecha = indice in (2, 3)
        celda.fill = RELLENO_FECHA if es_fecha else RELLENO_TITULO
        celda.font = FUENTE_TITULO
        celda.alignment = CENTRO
        celda.border = BORDE
        hoja.column_dimensions[get_column_letter(indice)].width = ancho
    hoja.row_dimensions[1].height = 30
    hoja.freeze_panes = "A2"
    hoja.page_setup.orientation = "landscape"
    hoja.page_setup.fitToPage = True
    hoja.page_setup.fitToWidth = 1
    hoja.page_setup.fitToHeight = 0
    hoja.page_setup.paperSize = hoja.PAPERSIZE_A4
    hoja.sheet_properties.pageSetUpPr.fitToPage = True
    hoja.page_setup.horizontalCentered = True
    hoja.oddHeader.left.text = "FitZone Sports · Equipo 03 · registro del tablero"
    hoja.oddFooter.center.text = "Página &P"
    hoja.print_title_rows = "1:1"
    hoja.auto_filter.ref = f"A1:{get_column_letter(len(COLUMNAS))}{max(hoja.max_row, 1)}"


def escribir_filas(hoja, filas: list[dict]) -> None:
    for columna, titulo in enumerate(COLUMNAS, start=1):
        hoja.cell(1, columna, titulo)
    for numero, item in enumerate(filas, start=2):
        valores = [
            item["id"],
            item["alta"],
            item["cierre"],
            item["dias"],
            item["origen_alta"],
            item["origen_cierre"],
            item["nombre"],
            item["lista"],
            item["archivada"],
            item["responsables"],
            item["url"],
        ]
        for columna, valor in enumerate(valores, start=1):
            if valor == "":
                valor = None
            celda = hoja.cell(numero, columna, valor)
            celda.font = FUENTE_NORMAL
            celda.border = BORDE
            celda.alignment = CENTRO if columna <= 6 or columna in (8, 9) else IZQUIERDA
            if columna in (2, 3):
                celda.number_format = "DD/MM/YYYY"
                celda.fill = RELLENO_FECHA_CELDA if valor else RELLENO_VACIO
            elif numero % 2 == 0:
                celda.fill = RELLENO_BAND
        if item["url"]:
            hoja.cell(numero, 11).hyperlink = item["url"]
            hoja.cell(numero, 11).font = FUENTE_LINK
        hoja.row_dimensions[numero].height = 32
    anchos = [16, 22, 22, 14, 28, 42, 72, 24, 12, 36, 34]
    aplicar_encabezado(hoja, anchos)
    hoja.auto_filter.ref = f"A1:K{hoja.max_row}"


def escribir_portada(hoja, data: dict, trabajo: list[dict], plantilla: list[dict]) -> None:
    fechas = [accion["date"] for accion in data["actions"] if accion.get("date")]
    corte = dia_de(data["dateLastActivity"])
    alta_accion = sum(1 for item in trabajo if item["origen_alta"] == "acción")
    alta_id = sum(1 for item in trabajo if item["origen_alta"] == "id de Trello")
    con_cierre = sum(1 for item in trabajo if item["cierre"] is not None)
    sin_cierre = len(trabajo) - con_cierre
    sin_accion = [item["nombre"] for item in trabajo if item["origen_cierre"].startswith("en finalizado")]
    lineas = [
        ("Equipo", "03 · FitZone Sports · Programación V · UNER · 2026"),
        ("Tablero", "Programacion5"),
        ("URL", data.get("url") or "https://trello.com/b/eBn68vRC/programacion5"),
        ("Export", FUENTE.name),
        ("Corte", corte.strftime("%d/%m/%Y")),
        ("Acciones en el export", str(len(data["actions"]))),
        ("Acción más vieja conservada", dia_de(min(fechas)).strftime("%d/%m/%Y") if fechas else ""),
        ("Tarjetas de trabajo", str(len(trabajo))),
        ("Con fecha de cierre", str(con_cierre)),
        ("Sin fecha de cierre", str(sin_cierre)),
        ("Alta tomada de la acción", str(alta_accion)),
        ("Alta tomada del id de Trello", str(alta_id)),
        ("Plantilla apartada", str(len(plantilla))),
    ]
    hoja["A1"] = "Registro del tablero"
    hoja["A1"].font = Font(name="Calibri", bold=True, size=18, color="1F4E79")
    hoja.merge_cells("A1:B1")
    hoja["A3"] = (
        "La hoja Altas y cierres está ordenada por la fecha de creación. "
        "Esas dos columnas son el registro: el día en que se creó la tarjeta y el día en que entró a finalizado. "
        "Una celda de cierre vacía significa que, en este corte, la tarjeta no estaba cerrada."
    )
    hoja["A3"].alignment = Alignment(wrap_text=True, vertical="center")
    hoja.merge_cells("A3:B3")
    hoja.row_dimensions[3].height = 48
    for numero, (etiqueta, valor) in enumerate(lineas, start=5):
        hoja.cell(numero, 1, etiqueta).font = Font(name="Calibri", bold=True, size=11)
        celda = hoja.cell(numero, 2, valor)
        celda.font = FUENTE_NORMAL
        if etiqueta == "URL":
            celda.hyperlink = valor
            celda.font = FUENTE_LINK
    nota = (
        "Trello exporta mil acciones. Las altas anteriores a la acción más vieja usan el día que trae el id de la tarjeta, "
        "y la columna Origen de la creación lo dice. "
    )
    if sin_accion:
        nota += (
            "Estas tarjetas están en finalizado y su movimiento ya no está en el export, así que el cierre queda vacío: "
            + "; ".join(sin_accion)
            + "."
        )
    hoja["A20"] = nota
    hoja["A20"].alignment = Alignment(wrap_text=True, vertical="top")
    hoja.merge_cells("A20:B22")
    hoja.column_dimensions["A"].width = 36
    hoja.column_dimensions["B"].width = 88
    hoja.page_setup.orientation = "landscape"
    hoja.page_setup.fitToPage = True
    hoja.page_setup.fitToWidth = 1
    hoja.page_setup.fitToHeight = 1
    hoja.sheet_properties.pageSetUpPr.fitToPage = True


def meses_del_rango(filas: list[dict]) -> list[tuple[int, int]]:
    dias = [item["alta"] for item in filas] + [item["cierre"] for item in filas if item["cierre"]]
    inicio = min(dias)
    fin = max(dias)
    cursor = date(inicio.year, inicio.month, 1)
    limite = date(fin.year, fin.month, 1)
    salida: list[tuple[int, int]] = []
    while cursor <= limite:
        salida.append((cursor.year, cursor.month))
        if cursor.month == 12:
            cursor = date(cursor.year + 1, 1, 1)
        else:
            cursor = date(cursor.year, cursor.month + 1, 1)
    return salida


def escribir_resumen(hoja, filas: list[dict]) -> None:
    hoja["A1"] = "Cuándo se crearon y cuándo se cerraron"
    hoja["A1"].font = Font(name="Calibri", bold=True, size=16, color="1F4E79")
    hoja.merge_cells("A1:C1")
    hoja["A3"] = "Mes"
    hoja["B3"] = "Altas"
    hoja["C3"] = "Cierres"
    for columna in range(1, 4):
        hoja.cell(3, columna).fill = RELLENO_FECHA if columna > 1 else RELLENO_TITULO
        hoja.cell(3, columna).font = FUENTE_TITULO
        hoja.cell(3, columna).alignment = CENTRO
    altas = Counter((item["alta"].year, item["alta"].month) for item in filas)
    cierres = Counter((item["cierre"].year, item["cierre"].month) for item in filas if item["cierre"])
    for offset, (anio, mes) in enumerate(meses_del_rango(filas)):
        fila_n = 4 + offset
        hoja.cell(fila_n, 1, f"{MESES[mes]} {anio}").font = FUENTE_NORMAL
        hoja.cell(fila_n, 2, altas[(anio, mes)]).font = FUENTE_NORMAL
        hoja.cell(fila_n, 3, cierres[(anio, mes)]).font = FUENTE_NORMAL
        for columna in range(1, 4):
            hoja.cell(fila_n, columna).border = BORDE
            hoja.cell(fila_n, columna).alignment = CENTRO
            if columna > 1:
                hoja.cell(fila_n, columna).fill = RELLENO_FECHA_CELDA
        hoja.row_dimensions[fila_n].height = 22
    ultima = 3 + len(meses_del_rango(filas))
    grafico = BarChart()
    grafico.type = "col"
    grafico.grouping = "clustered"
    grafico.title = "Altas y cierres por mes"
    grafico.y_axis.title = "Tarjetas"
    grafico.y_axis.majorGridlines = None
    datos = Reference(hoja, min_col=2, max_col=3, min_row=3, max_row=ultima)
    categorias = Reference(hoja, min_col=1, min_row=4, max_row=ultima)
    grafico.add_data(datos, from_rows=False, titles_from_data=True)
    grafico.set_categories(categorias)
    grafico.shape = 4
    grafico.legend.position = "b"
    grafico.dataLabels = DataLabelList()
    grafico.dataLabels.showVal = True
    grafico.y_axis.scaling.min = 0
    grafico.width = 18
    grafico.height = 8
    hoja.add_chart(grafico, "E3")

    inicio_listas = ultima + 3
    hoja.cell(inicio_listas, 1, "Lista al corte").font = FUENTE_TITULO
    hoja.cell(inicio_listas, 1).fill = RELLENO_TITULO
    hoja.cell(inicio_listas, 2, "Tarjetas").font = FUENTE_TITULO
    hoja.cell(inicio_listas, 2).fill = RELLENO_TITULO
    for offset, (lista, cantidad) in enumerate(sorted(Counter(item["lista"] for item in filas).items())):
        hoja.cell(inicio_listas + 1 + offset, 1, lista).font = FUENTE_NORMAL
        hoja.cell(inicio_listas + 1 + offset, 2, cantidad).font = FUENTE_NORMAL
        hoja.cell(inicio_listas + 1 + offset, 2).fill = RELLENO_FECHA_CELDA

    personas: Counter[str] = Counter()
    for item in filas:
        nombres = [nombre.strip() for nombre in item["responsables"].split(",") if nombre.strip()]
        if not nombres:
            personas["(sin asignar)"] += 1
        else:
            personas.update(nombres)
    inicio_personas = inicio_listas + 2 + len(Counter(item["lista"] for item in filas))
    hoja.cell(inicio_personas, 1, "Responsable").font = FUENTE_TITULO
    hoja.cell(inicio_personas, 1).fill = RELLENO_TITULO
    hoja.cell(inicio_personas, 2, "Tarjetas").font = FUENTE_TITULO
    hoja.cell(inicio_personas, 2).fill = RELLENO_TITULO
    for offset, (nombre, cantidad) in enumerate(personas.most_common()):
        hoja.cell(inicio_personas + 1 + offset, 1, nombre).font = FUENTE_NORMAL
        hoja.cell(inicio_personas + 1 + offset, 2, cantidad).font = FUENTE_NORMAL
        hoja.cell(inicio_personas + 1 + offset, 2).fill = RELLENO_FECHA_CELDA

    hoja.column_dimensions["A"].width = 42
    hoja.column_dimensions["B"].width = 16
    hoja.column_dimensions["C"].width = 16
    hoja.page_setup.orientation = "landscape"
    hoja.page_setup.fitToPage = True
    hoja.page_setup.fitToWidth = 1
    hoja.page_setup.fitToHeight = 1
    hoja.sheet_properties.pageSetUpPr.fitToPage = True
    hoja.oddHeader.left.text = "FitZone Sports · Equipo 03 · altas y cierres por mes"


def comprobar(trabajo: list[dict], plantilla: list[dict]) -> None:
    if not trabajo:
        raise SystemExit("no quedaron tarjetas de trabajo")
    nombres = {item["nombre"] for item in trabajo}
    if any(es_plantilla(nombre) for nombre in nombres):
        raise SystemExit("una tarjeta de plantilla entró en Altas y cierres")
    if any(item["alta"] is None for item in trabajo):
        raise SystemExit("hay una tarjeta sin fecha de creación")
    altas = [item["alta"] for item in trabajo]
    cierres = [item["cierre"] for item in trabajo if item["cierre"]]
    if min(altas).month != 8 or max(altas).month != 11:
        raise SystemExit(f"las altas no cubren agosto a noviembre: {min(altas)} {max(altas)}")
    if not any(dia.month == 9 for dia in cierres) or not any(dia.month == 11 for dia in cierres):
        raise SystemExit("los cierres no cubren septiembre y noviembre")
    c21 = next(item for item in trabajo if item["id"] == "C-21")
    if c21["cierre"] is not None or c21["lista"] == LISTA_CERRADA:
        raise SystemExit("C-21 figura cerrada y el export no la cerró")
    p11 = next(item for item in trabajo if item["nombre"].startswith("[P1.1]"))
    if p11["cierre"] is not None or "no está en el export" not in p11["origen_cierre"]:
        raise SystemExit("P1.1 no debía recibir un cierre inventado")
    if len(plantilla) < 10:
        raise SystemExit("la hoja de plantilla quedó casi vacía")


CELDA_INLINE = re.compile(
    r'<c ([^>]*?) t="inlineStr"><is><t(?: [^>]*)?>(.*?)</t></is></c>',
    re.DOTALL,
)


def a_cadenas_compartidas(ruta: Path) -> None:
    """Pasa el texto a la tabla de cadenas compartidas.

    El visor del editor no muestra el texto incrustado que escribe openpyxl,
    y la hoja parece vacía aunque las filas estén.
    """
    with zipfile.ZipFile(ruta) as origen:
        partes = {nombre: origen.read(nombre) for nombre in origen.namelist()}
    tabla: dict[str, int] = {}
    orden: list[str] = []
    usos = 0

    def cambiar(coincidencia: re.Match[str]) -> str:
        nonlocal usos
        texto = coincidencia.group(2)
        if texto not in tabla:
            tabla[texto] = len(orden)
            orden.append(texto)
        usos += 1
        return f'<c {coincidencia.group(1)} t="s"><v>{tabla[texto]}</v></c>'

    for nombre in list(partes):
        if not nombre.startswith("xl/worksheets/sheet") or not nombre.endswith(".xml"):
            continue
        texto = partes[nombre].decode("utf-8")
        nuevo = CELDA_INLINE.sub(cambiar, texto)
        nuevo = re.sub(r'\s+t="inlineStr"(?= />)', "", nuevo)
        if 't="inlineStr"' in nuevo:
            raise SystemExit(f"quedó texto incrustado en {nombre}")
        partes[nombre] = nuevo.encode("utf-8")
    if not orden:
        raise SystemExit("el libro no tenía texto para mostrar")

    filas = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{usos}" uniqueCount="{len(orden)}">',
    ]
    for texto in orden:
        espacio = ' xml:space="preserve"' if texto[:1].isspace() or texto[-1:].isspace() else ""
        filas.append(f"<si><t{espacio}>{texto}</t></si>")
    filas.append("</sst>")
    partes["xl/sharedStrings.xml"] = "\n".join(filas).encode("utf-8")

    tipos = partes["[Content_Types].xml"].decode("utf-8")
    marca = '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
    if marca not in tipos:
        tipos = tipos.replace("</Types>", marca + "</Types>")
        partes["[Content_Types].xml"] = tipos.encode("utf-8")

    rels = partes["xl/_rels/workbook.xml.rels"].decode("utf-8")
    if "sharedStrings" not in rels:
        ids = [int(valor) for valor in re.findall(r'Id="rId(\d+)"', rels)]
        siguiente = max(ids, default=0) + 1
        relacion = (
            f'<Relationship Id="rId{siguiente}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" '
            'Target="sharedStrings.xml"/>'
        )
        rels = rels.replace("</Relationships>", relacion + "</Relationships>")
        partes["xl/_rels/workbook.xml.rels"] = rels.encode("utf-8")

    temporal = ruta.with_suffix(".tmp.xlsx")
    with zipfile.ZipFile(temporal, "w", compression=zipfile.ZIP_DEFLATED) as destino:
        for nombre, contenido in partes.items():
            destino.writestr(nombre, contenido)
    temporal.replace(ruta)


def main() -> None:
    data = cargar()
    listas, personas, altas, cierres = indices(data)
    trabajo: list[dict] = []
    plantilla: list[dict] = []
    for tarjeta in data["cards"]:
        item = fila(tarjeta, listas, personas, altas, cierres)
        if es_plantilla(item["nombre"]):
            plantilla.append(item)
        else:
            trabajo.append(item)
    trabajo.sort(key=lambda item: (item["alta"], item["id"], item["nombre"]))
    plantilla.sort(key=lambda item: (item["alta"], item["nombre"]))
    comprobar(trabajo, plantilla)

    libro = Workbook()
    altas_hoja = libro.active
    altas_hoja.title = "Altas y cierres"
    resumen = libro.create_sheet("Resumen")
    portada = libro.create_sheet("Portada")
    plantilla_hoja = libro.create_sheet("Plantilla")
    escribir_filas(altas_hoja, trabajo)
    escribir_resumen(resumen, trabajo)
    escribir_portada(portada, data, trabajo, plantilla)
    escribir_filas(plantilla_hoja, plantilla)
    altas_hoja.sheet_properties.tabColor = "B86E00"
    resumen.sheet_properties.tabColor = "1F4E79"
    plantilla_hoja.sheet_properties.tabColor = "98A2B3"
    libro.active = altas_hoja
    libro.properties.title = "PROGV-2026-TIF-Equipo03-Registro"
    libro.properties.subject = "Registro del tablero FitZone Sports, equipo 03"
    libro.properties.creator = "Equipo 03"
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    libro.save(SALIDA)
    a_cadenas_compartidas(SALIDA)
    print(
        f"{SALIDA} trabajo={len(trabajo)} plantilla={len(plantilla)} "
        f"cierres={sum(1 for item in trabajo if item['cierre'])} "
        f"altas_id={sum(1 for item in trabajo if item['origen_alta'] == 'id de Trello')}"
    )


if __name__ == "__main__":
    main()
