# Propuesta — RN-01: una sede a la vez

**Para:** próxima reunión de equipo  
**Estado:** a decidir  
**Fecha del documento:** 2026-08-31  
**Relacionado:** Trabajo Integrador (RN-01) · [Decisiones pendientes §3.4 / §8](./Decisiones_Pendientes_y_Cosas_a_Definir.md) · [C4 Acceso](./C4_Arquitectura_FitZone.md) · ADR-001 / ADR-002 / ADR-006

---

## 1. Qué hay que decidir

**Regla (RN-01):** un socio con membresía no puede figurar “dentro” de dos sedes al mismo tiempo (evita compartición de credenciales).

Hay que acordar **dónde se garantiza** esa regla:

| Opción | Resumen |
|--------|---------|
| **A** | Solo en **lógica de negocio** (Nest — módulo Acceso) |
| **B** | En **base de datos** (constraint / unicidad de presencia) |
| **Híbrida** | Validación en Nest **+** unique de presencia en PostgreSQL |

Al cerrar, documentar en un **ADR-007** (plantilla de cátedra).

---

## 2. Aclaración importante (evitar mal diseño)

Hay que separar dos conceptos:

1. **Historial de check-ins** — muchas filas por socio (entrada/salida, auditoría).
2. **Presencia actual** — a lo sumo **una** sede por socio “dentro”.

Una **primary key en la tabla de historial** **no** alcanza para RN-01.  
Si se elige BD, el mecanismo correcto es algo tipo tabla `presencias` con `UNIQUE(socio_id)` (o unique parcial “estado = dentro”), no “PK mágica” en `check_ins`.

---

## 3. Opción A — Lógica de negocio (Nest)

### Cómo sería

1. Tabla de eventos `check_ins` (`socio_id`, `sede_id`, `tipo` entrada/salida, `timestamp`, …) **sin** unique que imponga una sola sede.
2. Al check-in (online), `AccesoService` en Nest:
   - Consulta si el socio ya tiene presencia abierta (última entrada sin salida, o flag `dentro`).
   - Si está en **otra** sede → rechaza (p. ej. 409 + mensaje de negocio).
   - Si no → registra entrada.
3. Al check-out (explícito o timeout) → cierra presencia.
4. Concurrencia: dos check-ins casi a la vez **pueden** colarse si no hay lock/transacción cuidadosa.

### Flujo

```
Recepcionista → Nest (AccesoService)
  → ¿socio ya “dentro” en otra sede?
  → sí: rechazar
  → no: insertar check-in + marcar presencia
  → Supabase API
```

### Pros

- Encaja con el curso: regla en el monolito (ADR-001).
- Fácil de explicar en demo (“el servicio de Acceso valida RN-01”).
- Flexible: timeouts, mensajes, mora (RN-03) en el mismo lugar.
- Offline (TOTP): la sede valida local; RN-01 fuerte recién al **sincronizar** (consistencia eventual).

### Contras

- Sin ayuda de BD, race conditions posibles.
- Hay que testear bien; la regla no “se cae sola” si alguien inserta mal.
- Offline: dos sedes sin red pueden aceptar al mismo socio; se detecta después.

---

## 4. Opción B — Base de datos (constraint)

### Cómo sería

| Tabla | Rol |
|-------|-----|
| `check_ins` | Historial (PK = `id`; muchas filas) |
| `presencias` | Estado actual: **una fila por socio “dentro”** |

Constraint ejemplo: `presencias (socio_id UNIQUE o PK, sede_id, desde, …)`  
o unique parcial: `UNIQUE (socio_id) WHERE estado = 'dentro'`.

Al check-in:

1. Nest intenta `INSERT` en `presencias`.
2. Si el socio ya está en otra sede → BD rechaza (unique violation).
3. Nest traduce el error a mensaje de negocio.
4. Al salir: `DELETE` / update que libere la fila.

### Flujo

```
Recepcionista → Nest
  → INSERT presencia (socio_id UNIQUE)
  → OK o error unique
  → Nest responde OK / “ya en otra sede”
```

### Pros

- Garantía fuerte **online**, también con dos requests concurrentes.
- Menos dependencia de no olvidar un `if` en el servicio.
- Parecido en espíritu a RN-02 (integridad en PostgreSQL).

### Contras

- Con API Supabase sin ORM (ADR-006): hay que manejar bien el error unique (y a veces RPC/transacción).
- Offline: el constraint **no aplica** en la cola local; al sync puede fallar el segundo INSERT → hay que definir resolución de conflictos.
- Menos flexible si mañana hay excepciones a la regla.
- PK mal puesta en `check_ins` **no** resuelve RN-01.

---

## 5. Comparación

| Criterio | A — Lógica Nest | B — Constraint BD |
|----------|-----------------|-------------------|
| Dónde vive la regla | `AccesoService` | Unique en `presencias` (+ Nest traduce error) |
| Concurrencia online | Débil sin lock | Fuerte |
| Offline (RNF-01 / TOTP) | Eventual al sync | Eventual al sync |
| Encaje curso / ADR-001 | Muy claro | También válido |
| Encaje ADR-006 | Select + insert simple | Un poco más frágil (errores PostgREST / RPC) |
| Riesgo de bug | Olvidar validar | Modelo mal diseñado |
| Demo al docente | “Regla en lógica” | “Integridad en BD” |

---

## 6. Recomendación del documento (a votar)

**Opción híbrida (recomendada):**

1. Modelo de **presencia** en BD con `UNIQUE(socio_id)` (red de seguridad online).
2. **Validación previa en Nest** (mensaje claro, Swagger, tests).
3. **Offline:** RN-01 best-effort / eventual hasta el sync; el constraint actúa al consolidar.

Si el equipo quiere una sola capa:

| Prioridad | Elegir |
|-----------|--------|
| Patrones + demo rápida + offline primero | **A — lógica** (aceptar race + conflicto en sync) |
| Integridad online fuerte (como RN-02) | **B — presencia + unique** (Nest como fachada) |

---

## 7. Agenda de la reunión (≈ 10–15 min)

### Preguntas a cerrar

1. ¿Checkout **explícito** o solo **timeout** (p. ej. 4–6 h)?
2. ¿Enfoque online: **híbrido**, **solo A** o **solo B**?
3. Offline / sync: si hay conflicto (mismo socio en dos sedes), ¿qué hacemos?
   - Rechazar el segundo y loguear  
   - Auto-cerrar la presencia vieja  
   - Otro  

### Resultado esperado

- [ ] Opción elegida: A / B / Híbrida  
- [ ] Checkout: explícito / timeout / ambos  
- [ ] Política de conflicto offline  
- [ ] Responsable de redactar **ADR-007**  
- [ ] Actualizar [Decisiones_Pendientes §3.4](./Decisiones_Pendientes_y_Cosas_a_Definir.md) (marcar RN-01 cerrada cuando corresponda)

---

## 8. Título tentativo del ADR (cuando se cierre)

- Híbrida: **ADR-007: Enforce RN-01 (una sede a la vez) con presencia en BD + validación en Nest**
- Solo lógica: **ADR-007: Enforce RN-01 en lógica de Acceso (Nest), sin unique de presencia**
- Solo BD: **ADR-007: Enforce RN-01 con tabla de presencia y UNIQUE(socio_id) en PostgreSQL**

---

*Documento de propuesta · FitZone Sports · Programación V · UNER*
