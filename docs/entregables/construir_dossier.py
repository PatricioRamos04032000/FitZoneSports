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
    return (
        f"![{titulo}](figuras/{slug}.png)\n\n"
        f"*{titulo}.* Fuente editable: `docs/diagramas/fuentes/{fuente}`. "
        f"Exportación: `docs/diagramas/img/{slug}.svg`.\n\n"
    )


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
    return """## 8. Planificación

Este capítulo está leído al 19 de noviembre de 2026, para el dossier. C-38 cerró C-20 el 18/11 reescribiendo `docs/planificacion/S8_Planificacion_Completa_C20.md` con ocho sprints y la matriz única RF-01 a RF-14, RN-01 a RN-03 y RNF-01 a RNF-04. El paquete de seguimiento que se sube aparte es `docs/planificacion/PROGV-2026-TIF-Equipo03-Planificacion.md`.

Las fuentes de lo que sigue son el plan de cierre del 6 al 19 de noviembre, el plan de las semanas 1 y 2 (28 de agosto, estados alineados al tablero el 11 de noviembre), el plan de S5 a S7 y las actas del 2 de septiembre, del 13 de octubre y del 21 de octubre. Las horas de cada sesión están en las bitácoras de la sección 9.

### 8.1 Alcance

Entra el portal web con cuatro roles: gerente, administrador de sede, socio y cliente externo. Entran el registro y el perfil, la membresía con catálogo y renovación cobrada, el acceso multi-sede con QR rotativo, el aforo de la sede, la agenda de clases, la inscripción, la lista de espera, la grilla de canchas, el precio compuesto, el mantenimiento, la pasarela simulada y el PDF de comprobante. Entran también los ADR, los catorce diagramas, los tres manuales, las cuatro bitácoras y este dossier.

Queda afuera la app móvil, la cámara y el DNI en el acceso, MercadoPago real, el alta de administradores de sede, Storybook y la reescritura de la historia del repositorio. El dashboard del gerente entró en C-39: `GET /reportes/resumen` y la pantalla `/dashboard`, solo lectura. La foto de perfil está en el enunciado de RF-01 y quedó fuera de este corte: el alta pide los datos de la persona y no la imagen.

### 8.2 Supuestos y restricciones

Se da por existente un proyecto de Supabase con las claves fuera del repositorio. La pasarela de RF-13 es un simulacro. El comprobante de RF-14 es un PDF de la cadena, no un comprobante fiscal.

La entrega cierra el 19 de noviembre de 2026 a las 18:00. El equipo es de cuatro personas. El tag anotado de esa entrega se llama `v1.0-entrega` y lo crea C-26. El hash de la portada lo sustituye esa misma tarjeta, al imprimir.

### 8.3 Equipo y horas comprometidas

| Integrante | Rol | Piso del plan del 28/08 | Techo del cierre, 6 al 19/11 |
|------------|-----|-------------------------|------------------------------|
| Patricio Ramos | P1. Arquitectura, documentación y backend | 4 h por semana | 8 a 10 h por semana |
| Bruno Nicolás Conti | P2. Backend | 4 h por semana. La semana 2 estimó 7 h | 4 a 6 h por semana |
| Lucas Coquet | P3. Frontend | 4 h por semana. La semana 2 estimó 4,5 h | 8 a 10 h por semana |
| Matias Goncevat | P4. Planificación, CI, seed y Docker | 4 h por semana | 4 a 6 h por semana |

El plan del 28 de agosto compromete 16 h semanales de equipo, a 4 h por persona. El plan de cierre estima 48 a 64 h de equipo en las dos semanas finales. Las horas de la semana 2 son las que ese plan estimó junto a las tareas, y esas tareas figuran finalizadas. Las horas sesión por sesión están en cada bitácora. Varias de las primeras semanas están marcadas ahí como estimación reconstruida.

### 8.4 Estructura de desglose

El trabajo quedó partido en las unidades del cursado y, desde el 6 de noviembre, en los tres tramos del plan de cierre. Cada tarea de esos planes tiene responsable y una estimación en horas. Los identificadores S1 a S7 viven en los planes de semanas. Los identificadores C-01 a C-41 viven en el plan de cierre. La sección 11 lista el estado de esas tarjetas C.

| Épica | Qué cubre | Dónde está el desglose |
|-------|-----------|------------------------|
| Unidad I | C4, ADR, roles, monorepo | Plan de semanas 1 y 2, tareas S1 |
| Unidad II | Nest, React, Supabase, membresías y clases iniciales | Tareas S2 y S3 de esos planes |
| Unidad III | Precio, Observer, Repository, reglas y API de canchas | Actas del 13 y del 21 de octubre, tareas S4 y S5 |
| Unidad IV | Portal conectado a la API | Plan S5–S7 y tarjetas C-01, C-03, C-11 |
| Unidad V | Pruebas, CI, Docker, seed | ADR-008, ADR-009 y tarjetas C-07, C-08, C-10, C-35 |
| Cierre | Manuales, dossier, tag, lo que sigue abierto | Plan de cierre, tramos T1, T2 y T3 |

### 8.5 Cronograma

Las bitácoras a veces rotulan la misma semana con dos números de sprint, porque el registro se armó por sesión. La tabla toma el foco que domina cada número y la semana que esas entradas citan.

| Sprint | Semanas citadas | Objetivo que las entradas registran | Entregable que quedó |
|--------|-----------------|-------------------------------------|----------------------|
| 1 | 24/08 y 31/08 | Unidad I: enunciado, C4, ADR, roles, reunión del 02/09 | Plan del 28/08 y acta del 02/09 |
| 2 | 31/08 al 28/09 | Scaffold de Nest y React, Auth, `GET /sedes`, Swagger | Tareas S2 en finalizado |
| 3 | 28/09 al 05/10 | Membresías y clases iniciales | Módulos y migraciones de ese tramo |
| 4 | 05/10 al 19/10 | Precio, Observer y pantallas con datos fijos | Acta del 13/10 |
| 5 | 19/10 al 05/11 | Reglas de canchas y API de reservas | Acta del 21/10. Período S5–S7: 27/10 al 16/11 |
| 6 | 26/10 al 17/11 | Login, perfil, canchas, clases, QR y acceso en la UI | Plan S5–S7, actualizado el 11/11 y el 13/11 |
| 7 | 02/11 al 09/11 | Cola de la sede y demo de canchas | C-01 cerrado el 13/11 |
| 8 | 09/11 al 19/11 | ADR alineados, diagramas, manuales, Decorator, gestión en pantalla y medición | C-14 el 09/11, C-28 a C-34, README el 17/11, C-35 a C-41 el 18/11. El tag queda en C-26 |

Dentro de los sprints 7 y 8, el plan de cierre parte el tramo final así:

| Tramo | Fechas | Foco |
|-------|--------|------|
| T1 | 6 al 8/11 | Demo operable: grilla, pago, membresía, teléfono, decisión de RNF-01 |
| T2 | 9 al 15/11 | ADR, diagramas, manuales, bitácoras, Docker y seed |
| T3 | 16 al 19/11 | Defectos del guion, tag, dossier y Moodle |

La capacidad comprometida del tramo final es la de la tabla 8.3. Antes de eso, el piso es 4 h por persona por semana.

### 8.6 Trazabilidad

La descripción de cada requisito es la del enunciado del trabajo integrador. El estado es el del repositorio al 19 de noviembre de 2026.

| Requisito | Qué pide | Dónde está | Prueba o evidencia | Estado |
|-----------|----------|------------|--------------------|--------|
| RF-01 | Registro y perfil | `POST /auth/register`, perfil propio | `auth.service.spec` del registro. El panorama del 13/10 lo da por demostrable | Demostrable. La foto queda fuera de este corte |
| RF-02 | Planes, estados y renovación | Catálogo, `renovar_membresia`, pasarela simulada. Tarjeta C-30 | Cierre de C-30 en el plan de cierre | Alta y renovación cobrada cerradas. C-02, la membresía visible en el perfil, sigue en desarrollo en ese plan |
| RF-03 | Acceso en otra sede de la cadena | El check-in no ata al socio a su sede de origen | Manual de usuario, sección de acceso | Demostrable con membresía activa |
| RF-04 | QR que rota y validación de la membresía | Código de un minuto y check-in en la API | ADR-007 y manual de usuario | Demostrable |
| RF-05 | Aforo de la sede | Pantalla Acceso, ocupación sobre el máximo | Captura del manual de usuario | Demostrable |
| RF-06 | Agenda de clases | `POST /clases` y `PATCH /clases/:id`, pantalla del gerente. Tarjeta C-31 | Tests de rol citados en el cierre de C-31 | Cerrado |
| RF-07 | Inscripción hasta 48 h antes | Pantalla `/clases`. Tarjeta C-11 | Manual de usuario y bitácora de la tarjeta | Cerrado |
| RF-08 | Lista de espera y aviso | Observer al liberar un cupo | Diagrama de actividad y tests de clases | Cerrado |
| RF-09 | Alta de canchas y precio por hora | `/canchas/gestionar`. Tarjeta C-32 | E2E de alta citado en el cierre de C-32 | Cerrado |
| RF-10 | Grilla y bloqueo del turno | Reserva desde la UI. Tarjeta C-01 | Guion de demo y manual de usuario | Cerrado |
| RF-11 | Precio con descuento y hora pico | Cadena Decorator. Tarjeta C-28 | Tests unitarios de precios | Cerrado. El enunciado nombraba Strategy. El código compone las reglas con Decorator |
| RF-12 | Mantenimiento | Períodos que bloquean turnos futuros | Manual técnico | Cerrado. No cancela la reserva ya tomada |
| RF-13 | Pasarela simulada | Puerto `PasarelaPago` y el simulacro | ADR-010 | Cerrado como simulacro |
| RF-14 | Comprobante en PDF | PDF con cancha, horario y monto. Tarjeta C-04 | C-04 finalizada el 17/11 | Cerrado. No es factura fiscal |
| RN-01 | Una sola sede a la vez | Clave de `presencias` y check-out. Tarjeta C-33 | Manual de usuario y ADR-007 | Cerrado con conexión. Sin red, la cola se valida al sincronizar |
| RN-02 | Una sola reserva del turno | `FOR UPDATE` e índice único. ADR-004 | Job `sql-rn02`. La corrida local imprimió `OK 3` | C-41 cerrado. El unitario que traduce el choque a HTTP 409 se queda |
| RN-03 | El socio en mora paga como externo | El decorador de descuento exige socio activo | Manual técnico, sección 4.1 | Cerrado en el cálculo del precio |
| RNF-01 | Acceso con la conexión caída | Cola de la sede. ADR-003 y ADR-007. Tarjeta C-05 | Manual de usuario, pantalla Acceso | Cerrado para la sede. La app móvil queda fuera |
| RNF-02 | Token y nada de tarjeta | ADR-010 | El ADR y el comprobante sin datos de tarjeta | Cerrado |
| RNF-03 | Grilla apoyada en índices | Cuatro índices de la migración de canchas | El 18/11 la grilla de FitZone Central apareció en 786 ms | Índices presentes. No hay umbral nuevo |
| RNF-04 | Sede nueva sin detener el sistema | `POST /sedes` y `PATCH /sedes/:id`. Tarjeta C-29 | Tests de rol citados en el cierre de C-29 | Cerrado |

### 8.7 Seguimiento

El cuadro de horas es el de `docs/planificacion/PROGV-2026-TIF-Equipo03-Planificacion.md`. Trabajado es la suma de las marcas `· N h` de las cuatro bitácoras cuya fecha cae en el sprint. Las sesiones del 27/08 entran en el sprint 1. Las entradas del 18/11 que no traen horas no suman una cifra.

| Sprint | Comprometido | Completado | Trabajado (h) | Qué ocurrió |
|--------|--------------|------------|---------------|-------------|
| 1 | Arquitectura inicial, roles, monorepo, C4, ADR y reuniones | Acta del 02/09 y plan de las semanas 1 y 2 | 24 | S1-T16 sigue en por hacer. Incluye 8 h del 27/08 |
| 2 | Scaffolding Nest y React, Supabase, autenticación y esquema mínimo | Tareas S2 del plan, en finalizado | 0 | Ninguna bitácora marca horas entre el 7 y el 13/09 |
| 3 | Membresías y clases: SQL, Repository, guards y ventanas | Migraciones y LOG | 20 | No hay plan propio de S3 |
| 4 | Canchas, Strategy, Observer y correcciones de clases | Acta del 13/10 | 36 | El 13/10 las pantallas seguían con datos fijos y la API de canchas estaba en curso |
| 5 | Migración M4, login real, sesión, layout e infraestructura | Acta del 21/10 y plan S5–S7 | 18,5 | El 21/10 se cerraron las reglas de precio y de reserva |
| 6 | Perfil, pagos, APIs de canchas, cliente HTTP, CI y notificaciones | Plan S5–S7 y LOG | 60 | El plan no escribe un desvío solo de este sprint |
| 7 | Decorator, State, Facade, demo y cierres funcionales | C-01 cerró el 13/11. Plan de cierre C-01 a C-34 | 37,5 | C-01 cerró el 13/11. C-02 sigue en desarrollo |
| 8 | Congelamiento, Anexo G, tag, dossier y medición | C-24 y C-35 a C-41 cerrados. C-21 entregó el registro | 23 | El tag no existe y lo crea C-26. 16 h de Matias, 4 h de Bruno y 3 h de Lucas. Las entradas de Patricio del 18/11 no traen horas |

El compose, el seed de 25 sedes, el manual de instalación y el umbral de Jest están en el repositorio. Las filas C-07, C-10 y C-17 del plan de cierre siguen en por hacer.

### 8.8 Desvíos

La documentación de cierre y el cambio de Strategy a Decorator ocuparon el tramo del 9 al 17 de noviembre, encima de las pantallas de gestión. Varias tarjetas que el plan asignaba a Lucas las cerró Patricio: la pantalla de clases, el manual de usuario y la bitácora de Lucas. El estimado de 4 h semanales de agosto no alcanza para describir esa concentración de noviembre.

El riesgo de leer RNF-01 como una app del socio sin señal se materializó como discusión de alcance. Se absorbió el 6 de noviembre, con C-05: la demo muestra la cola de la sede, y la app móvil queda fuera. El mismo corte sacó MercadoPago real, la cámara del acceso y los reportes de toda la cadena. El 18/11 la matriz quedó en una fila por requisito. RN-03 es mora con tarifa externa. RNF-03 se midió en 786 ms.

Si el cuatrimestre empezara de nuevo, Docker, el seed de 25 sedes y el manual de operación entrarían junto con el primer arranque reproducible, y la matriz de requisitos se escribiría sobre el enunciado completo en lugar de esperar a C-38. Esa matriz es `docs/planificacion/S8_Planificacion_Completa_C20.md`.

### 8.9 Riesgos

| Riesgo | Qué ocurrió al 19/11/2026 |
|--------|---------------------------|
| La UI de canchas se queda en datos fijos | C-01 cerró el 13/11 con reserva y pago desde la pantalla |
| RNF-01 se interpreta como app móvil | La app quedó fuera. La sede encola el ingreso y la salida. C-05 |
| La documentación llega tarde | ADR, diagramas y los tres manuales están en el repo. C-38 reescribió la matriz el 18/11. La fila C-17 del plan sigue en por hacer |
| Una sola persona concentra Docker, seed y pruebas de cierre | El compose, el seed de 25 sedes, la medición de C-35 y el manual de instalación están en el repo. C-07, C-10 y C-17 siguen en por hacer en el plan |
| La no sobreventa se prueba tarde | C-41 corrió el SQL. La salida local fue `OK 3` |
| El tablero no se exporta | C-21 lo armó el 19/11: `docs/planificacion/PROGV-2026-TIF-Equipo03-Registro.xlsx` |
| El tag sale después de las 18:00 del 19/11 | El tag no existe. Lo crea C-26 |
"""


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


def tablero(tabla: str) -> str:
    return (
        "## 11. Anexo: tablero del proyecto\n\n"
        "El tablero vivo es [Programacion5](https://trello.com/b/eBn68vRC/programacion5).\n\n"
        "El registro con fechas de alta y de cierre es `docs/planificacion/PROGV-2026-TIF-Equipo03-Registro.xlsx`, "
        "tarjeta C-21, armado el 19/11. Tiene las hojas Portada, Resumen y Altas y cierres. "
        "El link no reemplaza ese archivo.\n\n"
        "La tabla de abajo es el estado escrito en `docs/planificacion/S8_Plan_Cierre_Entrega_6_19_Nov.md` "
        "al 19 de noviembre de 2026. El nombre de la tarea es el de este dossier. Quién y el estado salen de ese plan.\n\n"
        + tabla
        + "\nC-19 está partida en el tablero: C-19a Patricio, C-19b Bruno y C-19c Lucas figuran finalizadas. "
        "C-19d, la de Matias, figura en desarrollo. Los cuatro textos están en la sección 9.\n\n"
        "C-25 figura en por hacer en ese plan porque el tag de la entrega todavía no existe. "
        "Este Markdown es la base del PDF. C-26 crea `v1.0-entrega`, completa el tag y el hash, e imprime.\n"
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
        tablero(estados_cierre()),
    ]
    texto = "\n".join(piezas).replace("\n\n\n", "\n\n")
    if "{{HASH}}" not in texto or "{{TAG}}" not in texto or "{{HASH_LEYENDA}}" not in texto:
        raise SystemExit("faltan las marcas de la portada")
    imagenes = re.findall(r"!\[[^\]]*\]\(figuras/([a-z0-9-]+)\.png\)", texto)
    if len(imagenes) != 14:
        raise SystemExit(f"se esperaban 14 figuras y hay {len(imagenes)}: {imagenes}")
    OUT.write_text(texto, encoding="utf-8")
    print(f"{OUT} lineas={texto.count(chr(10))+1} figuras={len(imagenes)}")


if __name__ == "__main__":
    main()
