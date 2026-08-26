# ADR-004 — Hosting: Vercel + Render + Supabase

| Campo | Valor |
|-------|-------|
| **ID** | ADR-004 |
| **Título** | Desplegar front en Vercel, API en Render y PostgreSQL en Supabase |
| **Estado** | Aceptada |
| **Fecha** | 2026-08-25 |
| **Decisores** | Equipo FitZone Sports (P1–P4) |
| **Relacionado** | [ADR-002](./ADR-002-postgresql.md) · [ADR-003](./ADR-003-stack-nestjs-react.md) · [Stack](../Stack_Tecnologico_y_Herramientas.md) |

---

## Contexto

Además del control de versiones en **GitHub**, el equipo necesita entornos de **desarrollo compartido** y **demo** sin administrar servidores propios:

- Frontend React (build estático o SPA).
- Backend NestJS (proceso Node 24/7 o bajo demanda).
- PostgreSQL accesible desde local y desde la API en la nube.
- Presupuesto académico (tier gratuito / student-friendly).
- Integración futura con CI/CD (Unidad V).

## Decisión

| Capa | Servicio | Uso |
|------|----------|-----|
| Código | **GitHub** | Repo, PRs, (luego) GitHub Actions |
| Frontend | **Vercel** | Deploy del React; previews por PR |
| Backend | **Render** | Web Service NestJS |
| Base de datos | **Supabase** | PostgreSQL administrado |

**Límite de alcance de Supabase:** se usa como **host de PostgreSQL** (connection string). La lógica de negocio, auth de dominio y patrones GoF viven en **NestJS**, no se reemplazan por Supabase Auth/Realtime como backend principal.

Desarrollo local: Nest y React en `localhost`; BD preferentemente el mismo proyecto Supabase de desarrollo (PostgreSQL local/Docker opcional más adelante).

## Alternativas consideradas

| Alternativa | Motivo de descarte (ahora) |
|-------------|----------------------------|
| **Todo en un VPS** (DigitalOcean, etc.) | Más ops (Nginx, SSL, backups) para el equipo |
| **Heroku / Railway para API+DB** | Válidos; se elige la combinación Vercel+Render+Supabase ya acordada por el equipo |
| **AWS/GCP completo** | Exceso de complejidad para el cuatrimestre |
| **Supabase como BaaS completo** (sin Nest) | Choca con ADR-001/003 y entregables de frameworks backend |
| **Frontend solo en Render** | Vercel es más ergonómico para React/SPA y previews |

## Consecuencias

### Positivas

- Cada contenedor C4 tiene un destino de deploy claro.
- Secretos (`DATABASE_URL`, `JWT_SECRET`, `VITE_API_URL`) por plataforma, no en el repo.
- Facilita Demo Day con URLs públicas.
- Encaja con pipeline: push a GitHub → build/test → deploy.

### Negativas / trade-offs

- Cold starts / límites del free tier (sobre todo Render) pueden afectar demos; hay que calentar el servicio antes de presentar.
- Tres consolas de cloud además de GitHub.
- CORS y variables de entorno deben configurarse con cuidado entre Vercel y Render.
- Dependencia de red hacia Supabase desde el backend local.

### Impacto en el diseño

- Vista de despliegue del documento C4.
- Checklist de variables en [Decisiones pendientes](../Decisiones_Pendientes_y_Cosas_a_Definir.md).
- CI/CD (Unidad V) se engancha a GitHub y, opcionalmente, a deploys automáticos.

---

## Seguridad (mínimo acordado)

- No commitear `.env` ni connection strings.
- Rotar secrets si se filtran en un PR.
- En pasarela mock: solo persistir **token**, nunca PAN/CVV (RNF-02).
