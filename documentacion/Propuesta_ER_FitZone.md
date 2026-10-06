# Propuesta — Diagrama entidad-relación (ER)

**Estado:** propuesta (a revisar con el equipo / S1-T12)  
**Actualización 2026-10-05:** Fase A implementada en Supabase. Fase C (clases) y los ajustes de membresías están definidos e implementados en [Diseño BD S3-T06](./Diseno_BD_S3-T06_Membresias_Clases.md), que reemplaza a esta propuesta para esas tablas.  
**Fecha:** 2026-09-04  
**Alcance:** modelo de datos de dominio en PostgreSQL (Supabase)  
**Referencias:** [C4](./C4_Arquitectura_FitZone.md) · [ADR-002](./adr/ADR-002-postgresql.md) · [ADR-005](./adr/ADR-005-bff-supabase-auth.md) · [ADR-006](./adr/ADR-006-supabase-api-sin-orm.md) · [Acta 2026-09-02](./Acta_Reunion_2026-09-02_Semana1.md) · [Propuesta RN-01](./Propuesta_RN01_Presencia_Una_Sede.md) · [Inventario diagramas](./Propuesta_Inventario_Diagramas.md)

---

## 1. Criterios de diseño

| Criterio | Decisión |
|----------|----------|
| Motor | PostgreSQL en Supabase |
| Acceso runtime | API Supabase desde Nest (sin ORM) |
| Identidad | **Supabase Auth** (`auth.users`); no tabla propia de contraseñas |
| Roles A1–A4 | Campo `rol` en **`perfiles`** (acuerdo 2026-09-02) |
| Sedes demo | 2–3 filas (no 25) |
| Entrega | ER **vivo**: se amplía con el desarrollo; entrega formal al cierre |

**Fuera de este ER (por ahora):** tablas internas de Supabase Auth, Storage, Realtime.

---

## 2. Fases de modelado

| Fase | Tablas | Cuándo |
|------|--------|--------|
| **A — Núcleo (Semana 2)** | `sedes`, `perfiles`, `membresias` | Login BFF + `GET /sedes` + seed |
| **B — Acceso (M2)** | `presencias`, `check_ins` | RN-01, aforo; TOTP seed opcional |
| **C — Clases (M3)** | `clases`, `inscripciones_clase`, `lista_espera` | Cupos + Observer |
| **D — Canchas (M4)** | `canchas`, `reservas_cancha` | RN-02 (unique slot) |
| **E — Pagos (M5)** | `pagos` | Token pasarela (RNF-02) |

---

## 3. Diagrama ER — Fase A (núcleo mínimo)

Usar este diagrama para S1-T12 / S2-T02.

```mermaid
erDiagram
    AUTH_USERS ||--|| PERFILES : "1:1 (mismo UUID)"
    SEDES ||--o{ PERFILES : "sede_home opcional"
    PERFILES ||--o| MEMBRESIAS : "tiene (solo socio)"

    AUTH_USERS {
        uuid id PK "Supabase Auth — no gestionada por nosotros"
        string email
    }

    SEDES {
        uuid id PK
        string nombre
        string direccion
        int aforo_max
        boolean activa
        timestamptz created_at
    }

    PERFILES {
        uuid id PK "FK auth.users.id"
        string rol "socio|externo|recepcionista|gerente"
        string dni UK
        string nombre
        string apellido
        string telefono
        string foto_url
        uuid sede_home_id FK "nullable"
        timestamptz created_at
    }

    MEMBRESIAS {
        uuid id PK
        uuid perfil_id FK UK "1 membresía vigente por socio (simplificado)"
        string plan "mensual|trimestral|anual"
        string estado "activo|vencido|suspendido"
        date vigente_desde
        date vigente_hasta
        timestamptz created_at
    }
```

### Notas Fase A

- `PERFILES.id` = `auth.users.id` (UUID de Supabase). Tras login, Nest lee `sub` del JWT y busca el perfil.
- `rol`:
  - `socio` → A1 (puede tener `membresias`)
  - `externo` → A2 (sin membresía)
  - `recepcionista` → A3 (opcional: `sede_home_id` = sede donde opera)
  - `gerente` → A4
- Un socio con cuota vencida: `membresias.estado = vencido` (RN-03); el perfil sigue existiendo.
- Simplificación MVP: **una** fila de membresía por socio (`perfil_id` unique). Historial de renovaciones se puede agregar después (`membresia_periodos`).

---

## 4. Diagrama ER — Visión completa (Fases A–E)

Propuesta de dominio completo. Las tablas de fases B–E se implementan cuando toque cada módulo.

```mermaid
erDiagram
    AUTH_USERS ||--|| PERFILES : "1:1"
    SEDES ||--o{ PERFILES : "sede_home"
    PERFILES ||--o| MEMBRESIAS : "socio"
    PERFILES ||--o| TOTP_SEEDS : "QR dinamico"
    SEDES ||--o{ PRESENCIAS : "quien esta dentro"
    PERFILES ||--o| PRESENCIAS : "RN-01 unique perfil"
    SEDES ||--o{ CHECK_INS : "historial"
    PERFILES ||--o{ CHECK_INS : "historial"
    SEDES ||--o{ CANCHAS : "tiene"
    CANCHAS ||--o{ RESERVAS_CANCHA : "ocupa slot"
    PERFILES ||--o{ RESERVAS_CANCHA : "reserva"
    SEDES ||--o{ CLASES : "agenda"
    CLASES ||--o{ INSCRIPCIONES_CLASE : "cupo"
    CLASES ||--o{ LISTA_ESPERA : "observer"
    PERFILES ||--o{ INSCRIPCIONES_CLASE : "anota"
    PERFILES ||--o{ LISTA_ESPERA : "espera"
    PERFILES ||--o{ PAGOS : "paga"
    RESERVAS_CANCHA ||--o| PAGOS : "opcional"
    MEMBRESIAS ||--o| PAGOS : "renovacion"

    SEDES {
        uuid id PK
        string nombre
        int aforo_max
        boolean activa
    }

    PERFILES {
        uuid id PK
        string rol
        string dni UK
        uuid sede_home_id FK
    }

    MEMBRESIAS {
        uuid id PK
        uuid perfil_id FK
        string plan
        string estado
        date vigente_hasta
    }

    TOTP_SEEDS {
        uuid id PK
        uuid perfil_id FK UK
        text seed_cifrado
        boolean activo
    }

    PRESENCIAS {
        uuid perfil_id PK "UNIQUE — a lo sumo una sede"
        uuid sede_id FK
        timestamptz desde
    }

    CHECK_INS {
        uuid id PK
        uuid perfil_id FK
        uuid sede_id FK
        string tipo "entrada|salida"
        string origen "online|offline_sync"
        timestamptz ocurrio_en
        boolean sync_ok
    }

    CANCHAS {
        uuid id PK
        uuid sede_id FK
        string tipo "paddle|futbol5|otro"
        string nombre
        boolean en_mantenimiento
    }

    RESERVAS_CANCHA {
        uuid id PK
        uuid cancha_id FK
        uuid perfil_id FK
        timestamptz inicio
        timestamptz fin
        string estado "confirmada|cancelada"
    }

    CLASES {
        uuid id PK
        uuid sede_id FK
        string tipo
        string instructor
        timestamptz inicio
        int capacidad_max
    }

    INSCRIPCIONES_CLASE {
        uuid id PK
        uuid clase_id FK
        uuid perfil_id FK
        string estado "inscrito|cancelado"
    }

    LISTA_ESPERA {
        uuid id PK
        uuid clase_id FK
        uuid perfil_id FK
        int posicion
        timestamptz created_at
    }

    PAGOS {
        uuid id PK
        uuid perfil_id FK
        string concepto "membresia|reserva_cancha"
        numeric monto
        string token_pasarela
        string estado "aprobado|rechazado|pendiente"
        uuid reserva_cancha_id FK
        uuid membresia_id FK
    }
```

---

## 5. Diccionario de entidades (resumen)

| Entidad | Módulo | Descripción |
|---------|--------|-------------|
| `sedes` | transversal | Sucursales; aforo máximo (RF-05) |
| `perfiles` | M1 | Usuario de negocio + `rol` A1–A4 |
| `membresias` | M1 | Plan y estado del socio (RF-02, RN-03) |
| `totp_seeds` | M2 / VI | Secreto QR dinámico (propuesto; pendiente docente) |
| `presencias` | M2 | Estado “dentro” — **UNIQUE(perfil_id)** → RN-01 online |
| `check_ins` | M2 | Historial entrada/salida (+ sync offline) |
| `canchas` | M4 | Recurso físico por sede; flag mantenimiento (RF-12) |
| `reservas_cancha` | M4 | Turno; constraint unique (cancha + inicio) → RN-02 |
| `clases` | M3 | Agenda (RF-06) |
| `inscripciones_clase` | M3 | Cupo (RF-07) |
| `lista_espera` | M3 | Observer (RF-08) |
| `pagos` | M5 | Solo **token** de pasarela (RNF-02); sin PAN/CVV |

---

## 6. Constraints de negocio (BD)

| Regla | Implementación sugerida |
|-------|-------------------------|
| RN-01 (una sede a la vez) | `presencias.perfil_id` **PRIMARY KEY** o UNIQUE + validación en Nest (híbrido) |
| RN-02 (sin sobreventa cancha) | `UNIQUE (cancha_id, inicio)` en `reservas_cancha` donde estado = confirmada (unique parcial o lógica + unique) |
| Un perfil ↔ un auth user | `perfiles.id` = `auth.users.id` |
| DNI único | `UNIQUE (dni)` en `perfiles` |
| Inscripción única a clase | `UNIQUE (clase_id, perfil_id)` en `inscripciones_clase` |
| Lista espera única | `UNIQUE (clase_id, perfil_id)` en `lista_espera` |

Checkout / timeout de presencia: pendiente de consulta al docente (ver [Propuesta RN-01](./Propuesta_RN01_Presencia_Una_Sede.md)).

---

## 7. SQL de arranque sugerido (Fase A)

Orientativo para S1-T12 / S2-T02 (ajustar tipos con Bruno):

```sql
-- sedes
create table public.sedes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  aforo_max int not null default 50,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

-- perfiles (id = auth.users.id)
create type public.rol_usuario as enum (
  'socio', 'externo', 'recepcionista', 'gerente'
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null,
  dni text not null unique,
  nombre text not null,
  apellido text,
  telefono text,
  foto_url text,
  sede_home_id uuid references public.sedes (id),
  created_at timestamptz not null default now()
);

create type public.plan_membresia as enum ('mensual', 'trimestral', 'anual');
create type public.estado_membresia as enum ('activo', 'vencido', 'suspendido');

create table public.membresias (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null unique references public.perfiles (id) on delete cascade,
  plan public.plan_membresia not null,
  estado public.estado_membresia not null default 'activo',
  vigente_desde date not null,
  vigente_hasta date not null,
  created_at timestamptz not null default now()
);
```

Seed sugerido: 2–3 sedes + 1 perfil `gerente` (creado vía Auth + fila en `perfiles`).

---

## 8. Relación con Nest (BFF)

```
Login:  React → Nest AuthModule → Supabase Auth → JWT
Guard:  Nest valida JWT (sub) → lee perfiles.rol → autoriza endpoint
Datos:  Nest Repository → Supabase API → tablas public.*
```

Endpoints públicos típicos: `POST /auth/login`, `POST /auth/register`, `GET /health`.  
Protegidos: `GET /sedes`, resto de M1–M5.

---

## 9. Preguntas abiertas (para cerrar con el equipo)

| # | Pregunta | Impacto |
|---|----------|---------|
| 1 | ¿Historial de membresías (varias filas) o una sola fila actualizada? | Tabla `membresias` |
| 2 | ¿Recepcionista atado a una sola `sede_home` o a varias sedes? | Tabla puente `recepcionista_sedes` |
| 3 | ¿Checkout explícito, timeout, o ambos en `presencias`? | Consultar docente |
| 4 | ¿`totp_seeds` en Fase B o solo en Unidad VI? | Pendiente validación TOTP |
| 5 | ¿Precio de cancha por sede en tabla `tarifas` o hardcode Strategy en Nest al inicio? | M4 / M5 |

---

## 10. Próximos pasos

1. Revisar esta propuesta en equipo (P1 + P2 Bruno / S1-T12).
2. Cerrar Fase A y pasar el SQL a scripts en el repo + Supabase.
3. Dibujar/exportar el Mermaid Fase A para el paquete de arquitectura.
4. Ampliar el ER al implementar M2–M5 (no inventar tablas antes de tiempo).

---

*Propuesta ER · FitZone Sports · Programación V · UNER*
