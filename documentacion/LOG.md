# Bitácora del equipo — FitZone Sports

Registro de actividades, decisiones y estado del proyecto.  
Cada entrada puede vincular commits del repositorio cuando corresponda.

---

## 2026-08-31 — ADR dedicados: auth BFF y API Supabase sin ORM

**Tipo:** documentación / ADR  
**Participantes:** equipo (vía asistente de documentación)

### Cambios

- Creado [ADR-005](./adr/ADR-005-bff-supabase-auth.md) — BFF en NestJS + Supabase Auth (pasarela; roles A1–A4 en Nest).
- Creado [ADR-006](./adr/ADR-006-supabase-api-sin-orm.md) — acceso a datos vía API de Supabase; ORM descartado.
- Corregido [ADR-003](./adr/ADR-003-stack-nestjs-react.md): auth/datos referenciados a ADR-005/006; eliminado “acceso a datos” de decisiones hijas abiertas.
- Actualizados [ADR_Indice](./ADR_Indice.md), [ADR-002](./adr/ADR-002-postgresql.md), [ADR-004](./adr/ADR-004-hosting-vercel-render-supabase.md) y [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) con enlaces cruzados.
- Reformateados [ADR-001](./adr/ADR-001-monolito-modular.md) a [ADR-004](./adr/ADR-004-hosting-vercel-render-supabase.md) con la plantilla de cátedra (Contexto → Decisión → Consecuencias → Alternativas).
- Actualizado [ADR_Indice](./ADR_Indice.md): plantilla genérica de cátedra + ejemplo TiendaYa (pasarela de pago); ADR-001 a ADR-006 alineados al formato (Contexto neutral, `Estado:` / `Fecha:` sin negrita).

---

## 2026-08-28 — Exposición de avance al docente

**Tipo:** revisión / feedback docente  
**Participantes:** equipo + Prof. Lic. Aguirre, Juan José  
**Unidad / semana:** Unidad I (avance de arquitectura / documentación)

### Contexto

Se expuso el avance del trabajo integrador (documentación C4, ADR, stack). El docente aportó definiciones/correcciones de diseño.

### Feedback y definiciones registradas

| Tema | Definición |
|------|------------|
| Supabase Auth | **Sí** se usa **Supabase Auth** para identidad (login, tokens de sesión). |
| Patrón BFF | **NestJS como Backend for Frontend:** el frontend **no** habla directo con Supabase; solo consume la API Nest. |
| Módulo Auth en Nest | Actúa como **pasarela** hacia Supabase Auth: recibe login del cliente, delega en Supabase, expone un contrato unificado hacia el front. |
| Roles de negocio | Mapeo A1–A4 y guards de endpoints en Nest (sobre JWT de Supabase + datos vía Supabase API). |
| Lógica de negocio | Sigue en Nest (M1–M5); Supabase Auth no reemplaza el monolito. |
| Acceso a datos | **API de Supabase** (recomendado por el docente). **Decisión de equipo: mantener API**; ORM descartado. |

### Aclaración (misma fecha)

Se corrigió una interpretación errónea en docs previos: el docente **no** pidió auth 100 % casera en Nest; pidió **no saltarse el BFF** (el front no debe integrar Supabase Auth directo) y usar Nest como capa intermedia hacia Supabase Auth.

### Pendientes derivados

- [x] Decisión de equipo: **mantener API de Supabase** (no ORM).
- [ ] Terminar de alinear C4 residual / Demo Day con BFF + Supabase Auth + Supabase API.
- [ ] Al implementar Unidad II: módulo Auth Nest (pasarela Supabase Auth + guards de rol) y cliente Supabase para datos.
- [ ] Registrar más definiciones del docente en esta bitácora a medida que se anoten.

### Documentos relacionados

- [`Decisiones_Pendientes_y_Cosas_a_Definir.md`](./Decisiones_Pendientes_y_Cosas_a_Definir.md) (§3.1, §3.2)
- [`adr/ADR-005-bff-supabase-auth.md`](./adr/ADR-005-bff-supabase-auth.md)
- [`adr/ADR-006-supabase-api-sin-orm.md`](./adr/ADR-006-supabase-api-sin-orm.md)
- [`adr/ADR-004-hosting-vercel-render-supabase.md`](./adr/ADR-004-hosting-vercel-render-supabase.md)
- [`Stack_Tecnologico_y_Herramientas.md`](./Stack_Tecnologico_y_Herramientas.md)

### Commits vinculados

_Pendiente de commit al cerrar la documentación de esta sesión._

---

## 2026-08-26 — Reunión grupal: puesta en común

**Tipo:** reunión de equipo  
**Participantes:** grupo completo (4 integrantes)  
**Unidad / semana:** Unidad I (Semanas 1–2)

### Contexto

Reunión para alinear avances individuales y revisar el estado de la documentación de arquitectura generada hasta el momento.

### Acuerdos y decisiones

| Tema | Decisión |
|------|----------|
| Documentación C4 | El equipo considera que [`C4_Arquitectura_FitZone.md`](./C4_Arquitectura_FitZone.md) está **bien elaborada** como base del entregable de Unidad I. |
| Documentación ADR | Los ADR en [`adr/`](./adr/) y el [`ADR_Indice.md`](./ADR_Indice.md) fueron evaluados de forma **positiva** en conjunto. |
| Revisión anti-alucinaciones | **Cada integrante** debe revisar la documentación C4 y ADR para detectar posibles **alucinaciones o imprecisiones de la IA** (datos inventados, supuestos no acordados, inconsistencias con el enunciado). |
| Stack móvil | Se define **React Native** como tecnología de la aplicación móvil (Unidad VI). Cierra la alternativa Flutter que figuraba como TBD en la documentación previa. |

### Pendientes derivados

- [ ] Revisión individual de C4 y ADR por cada integrante; reportar hallazgos al grupo.
- [ ] Actualizar documentación de stack y ADR-003 cuando se formalice el cierre de React Native en los docs técnicos.
- [ ] Continuar con el plan de Unidad I (modelado C4 + ADR para entrega).

### Documentos relacionados

- [`C4_Arquitectura_FitZone.md`](./C4_Arquitectura_FitZone.md)
- [`ADR_Indice.md`](./ADR_Indice.md)
- [`Stack_Tecnologico_y_Herramientas.md`](./Stack_Tecnologico_y_Herramientas.md)
- [`Trabajo_Integrador_FitZone_Sports.md`](./Trabajo_Integrador_FitZone_Sports.md)

### Commits vinculados

_Sin commits asociados a esta entrada._

---

*FitZone Sports · Programación V · UNER*
