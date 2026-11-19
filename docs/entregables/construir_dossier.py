"""Arma docs/entregables/dossier.md una vez. La impresión no vuelve a concatenar."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "entregables" / "dossier.md"
CIERRE = ROOT / "docs" / "planificacion" / "S8_Plan_Cierre_Entrega_6_19_Nov.md"

NOMBRES = {
    "C-01": "Canchas en la UI",
    "C-02": "Membresía visible en el perfil",
    "C-03": "Lectura en el teléfono",
    "C-04": "PDF comprobante",
    "C-05": "Decisión de RNF-01",
    "C-06": "Ensayo corto del guion",
    "C-07": "Docker Compose",
    "C-08": "Seed de 25 sedes",
    "C-09": "swagger.json",
    "C-10": "Suite y cobertura en el CI",
    "C-11": "Pantalla de clases",
    "C-12": "Notificaciones in-app",
    "C-13": "Estructura de docs/",
    "C-14": "Diez ADR",
    "C-15": "Catorce diagramas",
    "C-16": "Manual de usuario",
    "C-17": "Manual de instalación",
    "C-18": "Manual técnico",
    "C-19": "Bitácoras",
    "C-20": "Planificación",
    "C-21": "Registro del tablero",
    "C-22": "Recorrido del Anexo G",
    "C-23": "README de cinco pasos",
    "C-24": "Ensayo de cinco minutos",
    "C-25": "Dossier",
    "C-26": "Tag v1.0-entrega",
    "C-27": "Subida a Moodle",
    "C-28": "Precio con Decorator",
    "C-29": "Alta y edición de sedes",
    "C-30": "Renovación de membresía",
    "C-31": "Agenda de clases",
    "C-32": "Canchas en pantalla",
    "C-33": "Check-out desde Acceso",
    "C-34": "Contraste del aviso",
    "C-35": "Medir la cobertura",
    "C-36": "Archivo LICENSE",
    "C-37": "Ordenar la planificación",
    "C-38": "Reescribir la planificación",
    "C-39": "Dashboard del gerente",
    "C-40": "E2E con Playwright",
    "C-41": "SQL de RN-02 en el CI",
}


def demote(text: str, levels: int = 2) -> str:
    lines: list[str] = []
    fence = False
    for line in text.splitlines():
        if line.startswith("```"):
            fence = not fence
        if not fence:
            marcas = 0
            while marcas < len(line) and line[marcas] == "#":
                marcas += 1
            if 1 <= marcas <= 6 and marcas < len(line) and line[marcas].isspace():
                level = min(6, marcas + levels)
                line = ("#" * level) + line[marcas:]
        lines.append(line)
    return "\n".join(lines).strip() + "\n"


def incluir(rel: str) -> str:
    path = ROOT / rel
    cuerpo = demote(path.read_text(encoding="utf-8"))
    return f"Archivo de origen: `{rel}`.\n\n{cuerpo}\n"


def figura(slug: str, titulo: str, fuente: str) -> str:
    carpeta = ROOT / "docs" / "entregables" / "figuras"
    partes = [slug]
    numero = 2
    while (carpeta / f"{slug}-{numero}.png").exists():
        partes.append(f"{slug}-{numero}")
        numero += 1
    bloques: list[str] = []
    for indice, parte in enumerate(partes, start=1):
        rotulo = titulo if len(partes) == 1 else f"{titulo}, parte {indice} de {len(partes)}"
        bloques.append(f"![{rotulo}](figuras/{parte}.png)\n\n")
    pie = (
        f"*{titulo}.* Fuente editable: `docs/diagramas/fuentes/{fuente}`. "
        f"Exportación: `docs/diagramas/img/{slug}.svg`.\n\n"
    )
    return "".join(bloques) + pie


def estados_cierre() -> str:
    encontrados: dict[str, tuple[str, str]] = {}
    for line in CIERRE.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| C-"):
            continue
        cols = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cols) < 5:
            continue
        ident = cols[0]
        quien = cols[2].replace("**", "")
        estado = cols[4].replace("**", "")
        if ident == "C-06":
            quien = "Equipo"
        encontrados[ident] = (quien, estado)
    faltan = [k for k in NOMBRES if k not in encontrados]
    if faltan:
        raise SystemExit(f"faltan estados en el plan de cierre: {faltan}")
    filas = [
        "| ID | Tarea | Quién | Estado al 19/11/2026 |",
        "|----|-------|-------|----------------------|",
    ]
    for ident in sorted(NOMBRES, key=lambda s: int(s.split("-")[1])):
        quien, estado = encontrados[ident]
        filas.append(f"| {ident} | {NOMBRES[ident]} | {quien} | {estado} |")
    return "\n".join(filas) + "\n"


def portada() -> str:
    return """# Dossier — FitZone Sports — Equipo 03

Universidad Nacional de Entre Ríos — Facultad de Ciencias de la Administración

Licenciatura en Sistemas — Programación V — Año 2026

Trabajo Integrador Final — Caso «FitZone Sports»

**Equipo 03**

| Integrante | Legajo | Rol | Autor en Git | Usuario de GitHub |
|------------|--------|-----|--------------|-------------------|
| Patricio Ramos | legajo a completar | P1. Arquitectura, documentación y backend | Patricio Ramos | PatricioRamos04032000 |
| Bruno Nicolás Conti | legajo a completar | P2. Backend | bruno y Bruno Nicolás Conti | brunoc11 |
| Lucas Coquet | legajo a completar | P3. Frontend | LucasCoquet | LucasCoquet |
| Matias Goncevat | legajo a completar | P4. Planificación, CI, seed y Docker | MatiGoncevat | MatiGoncevat |

- **Fecha de armado:** 19 de noviembre de 2026.
- **Fecha de entrega prevista:** 19 de noviembre de 2026, 18:00 (hora de Argentina).
- **Repositorio:** https://github.com/PatricioRamos04032000/FitZoneSports
- **Tablero:** [Programacion5](https://trello.com/b/eBn68vRC/programacion5)
- **Tag:** {{TAG}}
- **Hash:** {{HASH}}

{{HASH_LEYENDA}}

C-26 sustituye el tag y el hash al imprimir el PDF, cuando exista `v1.0-entrega`. Esas tres marcas quedan literales en este Markdown.

El legajo de cada integrante no está en el repositorio. El campo queda escrito para completarlo antes de la subida a Moodle.

### Claves del proyecto para la cátedra

Estas líneas se completan a mano antes de Moodle. No van al repositorio: pegarlas acá y volver a correr `construir_dossier.py` borra lo escrito. `SEED_PASSWORD` de la plantilla Docker es `fitzone-demo` y está en el README.

- `SUPABASE_URL`:
- `SUPABASE_ANON_KEY`:
- `SUPABASE_SERVICE_ROLE_KEY`:
- `VITE_SUPABASE_PUBLISHABLE_KEY`:

### Índice

1. Resumen ejecutivo del sistema
2. Arquitectura: diagramas C4 de los niveles 1, 2 y 3
3. Registros de decisión arquitectónica
4. Modelado
5. Patrones de diseño aplicados y su justificación
6. Estrategia de pruebas y reporte de cobertura
7. Cumplimiento de los requisitos no funcionales
8. Planificación
9. Bitácoras individuales
10. Índice de los manuales
11. Anexo: tablero del proyecto
"""


def resumen() -> str:
    return """## 1. Resumen ejecutivo del sistema

FitZone Sports es el portal web de una cadena de gimnasios. El socio consulta su membresía, se anota a clases, reserva una cancha y muestra un código que rota para entrar a la sede. La recepción registra la entrada y la salida, y lee el aforo de su sede. El gerente crea sedes, arma la agenda de clases y administra las canchas y sus precios. El cliente externo reserva canchas pagando la tarifa de externo.

La entrega es una sola aplicación. El navegador corre React. La API es NestJS. Los datos y el login viven en Supabase, con PostgreSQL y Auth. Nest hace de pasarela: el navegador no habla con Auth ni escribe en la base. Los pagos de esta entrega pasan por una pasarela simulada. El comprobante que se descarga después de pagar es un PDF de FitZone, con la cancha, el horario y el monto. No es una factura fiscal.

El precio de una reserva sale de una cadena de decoradores. Adentro está la tarifa de la cancha. Encima, el recargo si el turno cae en la franja pico de la sede. Afuera, el descuento si el cliente es socio activo. Un socio con la cuota vencida no entra en ese descuento y paga como externo. Dos pedidos del mismo turno dejan una sola reserva: la base bloquea la cancha y un índice único impide la segunda fila. Si la recepción pierde la red, el ingreso y la salida quedan en el navegador y se confirman cuando la conexión vuelve.

Este dossier junta la arquitectura, las decisiones, los diagramas, los patrones, las pruebas, los requisitos no funcionales, la planificación leída al 19 de noviembre de 2026, las cuatro bitácoras y el índice de los manuales. El código todavía no está congelado. El tag y el hash de la portada los completa C-26.
"""


def c4() -> str:
    return (
        "## 2. Arquitectura: diagramas C4 de los niveles 1, 2 y 3\n\n"
        "El nivel 4, el de código, queda fuera de este dossier. Los lineamientos lo marcan opcional. "
        "La estructura del precio con Decorator se lee en el diagrama de clases de la sección 4 "
        "y en el manual técnico.\n\n"
        + figura(
            "c4-1-contexto",
            "C4-1. Contexto",
            "c4-1-contexto.mmd",
        )
        + "El contexto muestra al socio activo, al cliente externo, a la recepción o administración de sede "
        "y al gerente, y a la pasarela de pago como sistema externo.\n\n"
        + figura(
            "c4-2-contenedores",
            "C4-2. Contenedores",
            "c4-2-contenedores.mmd",
        )
        + figura(
            "c4-3-canchas",
            "C4-3. Componentes del módulo de canchas",
            "c4-3-canchas.mmd",
        )
        + "El módulo de canchas separa la reserva, el cálculo de precio, el repositorio y el bloqueo del turno.\n\n"
        + figura(
            "c4-3-acceso",
            "C4-3. Componentes del módulo de acceso",
            "c4-3-acceso.mmd",
        )
        + "El módulo de acceso incluye el camino del QR cuando la sede está sin conexión con el servidor central.\n"
    )


def adrs() -> str:
    partes = [
        "## 3. Registros de decisión arquitectónica\n\n",
        "Van los diez ADR obligatorios y ADR-011, que el desarrollo necesitó para dejar Supabase Auth detrás de Nest. "
        "Todos están en estado Aceptado. La numeración anterior al 9 de noviembre de 2026 quedó en "
        "`docs/adr/historial/` y no se reimprime acá.\n\n",
    ]
    for nombre in [
        "ADR-001-monolito-modular.md",
        "ADR-002-postgresql.md",
        "ADR-003-estrategia-offline-acceso.md",
        "ADR-004-concurrencia-reservas-canchas.md",
        "ADR-005-backend-nestjs-ioc-datos.md",
        "ADR-006-frontend-react-estado.md",
        "ADR-007-acceso-totp-cola-offline.md",
        "ADR-008-pruebas-cobertura.md",
        "ADR-009-despliegue-contenedores-reversion.md",
        "ADR-010-tokenizacion-medios-de-pago.md",
        "ADR-011-bff-supabase-auth.md",
    ]:
        partes.append(incluir(f"docs/adr/{nombre}"))
    return "".join(partes)


def modelado() -> str:
    bloques = [
        (
            "uml-clases-dominio",
            "Clases del dominio y de Nest",
            "uml-clases-dominio.drawio",
            "El diagrama muestra el Decorator de precio, el State de la reserva, el Observer de la lista de espera y el Repository.",
        ),
        (
            "sec-reserva-pago",
            "Secuencia. Reserva de cancha con pago",
            "sec-reserva-pago.mmd",
            "El camino va de la grilla al comprobante. El precio lo resuelve la cadena de decoradores antes de entrar a la base.",
        ),
        (
            "sec-reserva-concurrente",
            "Secuencia. Reserva concurrente",
            "sec-reserva-concurrente.mmd",
            "Dos actores piden el mismo turno. El bloqueo deja una sola confirmación y el otro recibe el rechazo.",
        ),
        (
            "sec-acceso-offline",
            "Secuencia. Validación de acceso con la sede sin red",
            "sec-acceso-offline.mmd",
            "El socio muestra el QR. Si la sede no llega al servidor, el movimiento queda en la cola y se sincroniza al reconectar.",
        ),
        (
            "est-membresia",
            "Estados de la membresía",
            "est-membresia.mmd",
            "Activo, Vencido y Suspendido. Suspendido está en el enum y esta entrega no lo asigna.",
        ),
        (
            "est-reserva",
            "Estados de la reserva",
            "est-reserva.mmd",
            "Pendiente de pago, confirmada y cancelada. Cancelar no devuelve el pago.",
        ),
        (
            "act-lista-espera",
            "Actividad. Lista de espera",
            "act-lista-espera.mmd",
            "Al liberarse un lugar, el publicador avisa a los observadores en el orden de la lista.",
        ),
        (
            "er-fisico",
            "DER físico",
            "er-fisico.drawio",
            "El índice único de reservas impide dos filas pendientes o confirmadas para la misma cancha y el mismo inicio.",
        ),
        (
            "dep-despliegue",
            "Despliegue",
            "dep-despliegue.drawio",
            "El navegador de la sede sigue encolando ingresos cuando no llega a la API. La base sigue siendo la fuente de verdad al reconectar.",
        ),
        (
            "pipe-ci",
            "Pipeline de integración",
            "pipe-ci.drawio",
            "El workflow de GitHub Actions corre sobre el pull request hacia `desarrollo`: checkout, Node 24, npm ci, oxlint, Jest con el umbral de cobertura y el build de Nest. El job `sql-rn02` corre el SQL de la no sobreventa.",
        ),
    ]
    texto = [
        "## 4. Modelado\n\n",
        "Cada figura es la captura del SVG que está en `docs/diagramas/img/`. "
        "La fuente editable sigue en `docs/diagramas/fuentes/`.\n\n",
    ]
    for slug, titulo, fuente, relato in bloques:
        texto.append(relato + "\n\n")
        texto.append(figura(slug, titulo, fuente))
    return "".join(texto)


def patrones() -> str:
    return """## 5. Patrones de diseño aplicados y su justificación

El detalle, con las rutas del código, está en el manual técnico, sección 4. Acá queda la justificación que esa sección sostiene. Los dos casos de extensión —sumar canchas de tenis y un recargo de fin de semana— se resuelven en ese mismo manual y se listan en la sección 10.

### Decorator — precio de la cancha

El enunciado pedía estrategias intercambiables para la tarifa, el descuento de socio y el recargo de hora pico. Esas tres reglas se acumulan sobre el mismo turno, así que el código las compone en lugar de elegir una sola con un `switch`.

`PricingComponent` declara `calcular`. `StandardPricing` arranca con el precio por hora de la cancha. `PricingDecorator` envuelve otro componente, delega el cálculo y, si la regla aplica, modifica el resultado. La cadena de esta entrega es `MemberDiscount(PeakHour(Standard))`: el recargo pisa la tarifa base y el descuento de socio activo se aplica sobre ese resultado. `PreciosService` redondea hacia arriba al peso.

Un socio con la cuota vencida no entra en el decorador de descuento y paga la tarifa de externo. Eso es RN-03. El deporte no participa: la misma cadena vale para paddle, fútbol 5 o un tipo que se sume después.

### Observer — lista de espera

Cuando se libera un cupo, `ListaEsperaPublisher` emite el evento y no conoce a quien escucha. Tres observadores se anotan al mismo evento: uno persiste el aviso para el portal, otro registra el mail simulado si el perfil lo tiene activado, y otro deja el evento en el log. El envío real de correo queda fuera de esta entrega. La pantalla de notificaciones muestra el aviso.

### Repository — persistencia

`SupabaseRepository` es la plantilla. Cada repositorio de dominio nombra su tabla y usa el cliente de Supabase desde esa capa. Lo que tiene que ser atómico —reservar una cancha, registrar un ingreso, inscribir a una clase— no es un `select` seguido de un `insert` en Nest: es una función SQL llamada por RPC.

### Facade y State

`ReservasCanchaService.reservar` es el caso de uso. Valida, pide el precio al servicio de precios, llama al RPC y devuelve la reserva en pendiente de pago. Quien reserva no habla por separado con el repositorio, con la cadena de precio y con la pasarela.

El ciclo de esa reserva es un State. `EstadoReserva` declara `pagar` y `cancelar`. Los estados concretos son pendiente de pago, confirmada y cancelada. Una reserva se reconstruye desde el valor guardado en la base. Un estado terminal rechaza la acción que no le corresponde.

El cobro entra por el puerto `PasarelaPago`. En esta entrega la implementación es el simulacro. La tarjeta no se guarda. Esa decisión está en ADR-010.
"""


def pruebas() -> str:
    return (
        "## 6. Estrategia de pruebas y reporte de cobertura\n\n"
        "La decisión está en ADR-008, copiado en la sección 3. El umbral de esta entrega es el 60 % de sentencias del backend, medido con `npm run test:cov` sobre el conjunto que declara `backend/jest.config.ts`.\n\n"
        "La pirámide que ese ADR fija tiene tres pisos. La base son los tests unitarios de servicios, guards, decoradores de precio, TOTP y la pasarela simulada. El medio son los tests HTTP con Supertest y el script SQL `supabase/tests/canchas_m4.test.sql`, que rechaza una segunda reserva del mismo turno. Desde C-41 el job `sql-rn02` lo ejecuta en CI y exige el aviso `OK 3`. La cima es el E2E de navegador de C-40: login, reserva, pago, consulta y comprobante. No entra en el 60 %.\n\n"
        "Medición de cierre, C-35, corrida del 18 de noviembre de 2026 en `backend/` con `npm run test:cov`. Es la cifra del README:\n\n"
        "| Dato | Resultado |\n"
        "|------|-----------|\n"
        "| Suites | 32, todas en verde |\n"
        "| Tests | 184, todos en verde |\n"
        "| Sentencias | 65,77 % |\n\n"
        "Esa corrida cubre los unitarios del conjunto `collectCoverageFrom`. `npm run test:e2e` del backend ejecuta los tests HTTP y no entra en el 65,77 %. En el frontend, `npm run test:e2e` corre el caso de C-40 y tampoco mueve ese porcentaje. ADR-008 deja el umbral en `coverageThreshold` de `backend/jest.config.ts` y el workflow corre `npm run test:cov`. La fila C-10 del plan de cierre sigue en por hacer.\n"
    )


def rnf() -> str:
    return """## 7. Cumplimiento de los requisitos no funcionales

### RNF-01 — El ingreso sigue cuando cae la conexión principal

ADR-003 fija la estrategia y ADR-007 fija qué guarda el navegador de la sede, cuándo lo envía y cómo se resuelve el choque al reconectar. La recepción acumula el check-in y el check-out en `localStorage` y los confirma contra la API cuando vuelve la red. Mientras no hay red no se validan la membresía, el código rotativo ni la regla de una sola sede. Esa validación ocurre en el servidor.

La lectura que pedía una app del socio capaz de mostrar un QR válido sin señal queda fuera de esta entrega, junto con el nodo local por sede y los tornos. C-05 cerró esa decisión por escrito. La evidencia de uso está en el manual de usuario, en la pantalla Acceso, y en la secuencia de la sección 4.

### RNF-02 — La tarjeta no se guarda

ADR-010 deja un token opaco de la pasarela simulada. La fila de pago guarda ese token, el monto y el vínculo con la reserva o la membresía. El comprobante PDF no imprime datos de tarjeta. MercadoPago real queda fuera de esta entrega.

### RNF-03 — La grilla de canchas se apoya en índices

`GET /canchas/disponibilidad` usa los índices de la migración de canchas: `canchas_sede`, `mantenimientos_cancha_rango`, `reservas_cancha_cancha_inicio` y `reservas_cancha_perfil`. La no sobreventa es otro índice, `reservas_cancha_sin_sobreventa`, y corresponde a RN-02. El 18/11, con el socio del seed y la sede FitZone Central, la grilla apareció en 786 ms. No hay umbral nuevo.

### RNF-04 — Una sede nueva es un dato

El gerente crea y edita sedes con `POST /sedes` y `PATCH /sedes/:id` sin detener la API. La baja es `activa = false`. C-29 cerró esa pantalla y los tests de rol. ADR-001, ADR-002 y ADR-009 ya habían dejado la sede como una fila, no como un despliegue nuevo. El alta no abre un servicio por sucursal.
"""


def planificacion() -> str:
    return (
        "## 8. Planificación\n\n"
        "Este capítulo es el plan de proyecto que se entrega, "
        "`docs/planificacion/PROGV-2026-TIF-Equipo03-Planificacion.md`.\n\n"
        + incluir("docs/planificacion/PROGV-2026-TIF-Equipo03-Planificacion.md").replace(
            "](./", "](../planificacion/"
        )
    )


def bitacoras() -> str:
    partes = [
        "## 9. Bitácoras individuales\n\n",
        "Cada integrante tiene su archivo. `docs/bitacoras/LOG.md` es la bitácora de equipo y no entra en esta sección. "
        "Al 19 de noviembre el plan de cierre marca C-19 como parcial: C-19a, C-19b y C-19c finalizadas, y C-19d en desarrollo. "
        "Los cuatro archivos están en el repositorio y se copian acá enteros, una vez.\n\n",
    ]
    for rel in [
        "docs/bitacoras/LOG-ramos.md",
        "docs/bitacoras/LOG-conti.md",
        "docs/bitacoras/LOG-coquet.md",
        "docs/bitacoras/LOG-goncevat.md",
    ]:
        partes.append(incluir(rel))
    return "".join(partes)


def manuales() -> str:
    return """## 10. Índice de los manuales entregados

Los tres manuales están en el repositorio. Este dossier no los reimprime.

| Manual | Ruta | Qué cubre |
|--------|------|-----------|
| Usuario | `docs/manuales/manual-usuario.md` | Socio, recepción y gerente, con las capturas del sistema. Tarjeta C-16, cerrada el 17/11 |
| Instalación y operación | `docs/manuales/manual-instalacion-operacion.md` | Requisitos, entorno, seed, arranque y contingencias. El archivo es del 17/11, de Matias. La tarjeta C-17 sigue en por hacer en el plan de cierre |
| Técnico | `docs/manuales/manual-tecnico.md` | Módulos, patrones y los dos casos de extensión: canchas de tenis y un decorador de recargo de fin de semana. Tarjeta C-18, cerrada |

El índice corto de la carpeta es `docs/manuales/README.md`.
"""


REGISTRO = ROOT / "docs" / "planificacion" / "PROGV-2026-TIF-Equipo03-Registro.xlsx"
COLUMNAS_ANEXO = (1, 2, 3, 7, 8, 10)


def _celda(valor: object) -> str:
    if valor is None:
        return ""
    if hasattr(valor, "strftime"):
        return valor.strftime("%d/%m/%Y")
    return str(valor).replace("|", "/").replace("\n", " ")


def tabla_registro() -> str:
    from openpyxl import load_workbook

    libro = load_workbook(REGISTRO, read_only=True, data_only=True)
    hoja = libro["Altas y cierres"]
    filas = list(hoja.iter_rows(values_only=True))
    libro.close()
    if not filas:
        raise SystemExit("la hoja Altas y cierres está vacía")
    encabezado = filas[0]
    titulos = [_celda(encabezado[i - 1]) for i in COLUMNAS_ANEXO]
    lineas = [
        "| " + " | ".join(titulos) + " |",
        "|" + "|".join("---" for _ in titulos) + "|",
    ]
    for fila in filas[1:]:
        if not fila or fila[0] in (None, ""):
            continue
        celdas = [_celda(fila[i - 1] if i - 1 < len(fila) else None) for i in COLUMNAS_ANEXO]
        lineas.append("| " + " | ".join(celdas) + " |")
    if len(lineas) < 3:
        raise SystemExit("el registro no tiene tarjetas")
    return "\n".join(lineas) + "\n"


def tablero(tabla: str) -> str:
    return (
        "## 11. Anexo: tablero del proyecto\n\n"
        "El tablero vivo es [Programacion5](https://trello.com/b/eBn68vRC/programacion5).\n\n"
        "La tabla es la hoja Altas y cierres de "
        "`docs/planificacion/PROGV-2026-TIF-Equipo03-Registro.xlsx`, "
        "tarjeta C-21, armado el 19/11. "
        "El origen de cada fecha y la URL de la tarjeta quedan en ese archivo.\n\n"
        + tabla
        + "\nC-25 y C-26 siguen abiertas: el tag `v1.0-entrega` todavía no existe "
        "y el PDF con ese hash se imprime después.\n"
    )


def main() -> None:
    piezas = [
        portada(),
        resumen(),
        c4(),
        adrs(),
        modelado(),
        patrones(),
        pruebas(),
        rnf(),
        planificacion(),
        bitacoras(),
        manuales(),
        tablero(tabla_registro()),
    ]
    texto = "\n".join(piezas).replace("\n\n\n", "\n\n")
    if "{{HASH}}" not in texto or "{{TAG}}" not in texto or "{{HASH_LEYENDA}}" not in texto:
        raise SystemExit("faltan las marcas de la portada")
    imagenes = re.findall(r"!\[[^\]]*\]\(figuras/([a-z0-9-]+)\.png\)", texto)
    bases = {
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
    }
    presentes = set()
    for nombre in imagenes:
        base = nombre
        for candidata in bases:
            if nombre == candidata or nombre.startswith(candidata + "-"):
                base = candidata
                break
        presentes.add(base)
    if presentes != bases:
        raise SystemExit(f"faltan figuras: {sorted(bases - presentes)}")
    OUT.write_text(texto, encoding="utf-8")
    print(f"{OUT} lineas={texto.count(chr(10))+1} figuras={len(imagenes)}")


if __name__ == "__main__":
    main()
