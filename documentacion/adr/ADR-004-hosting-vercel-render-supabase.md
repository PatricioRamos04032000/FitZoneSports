# ADR-004: Despliegue en Vercel, Render y Supabase

Estado: Aceptado  
Fecha: 2026-08-25

## Contexto

Además del control de versiones en GitHub, el equipo necesita entornos de desarrollo compartido y demo sin administrar servidores propios. Hay que hospedar un frontend React (SPA), un backend NestJS (proceso Node) y una base PostgreSQL accesible desde local y desde la API en la nube.

El presupuesto es académico (tier gratuito o student-friendly) y en la Unidad V habrá que integrar CI/CD. Varios proveedores cloud ofrecen hosting para front, API y base por separado; hay que elegir una combinación que el equipo pueda operar con poco overhead. Las decisiones de autenticación y acceso a datos (ADR-005 y ADR-006) dependen de dónde se hospede Supabase, pero este ADR trata solo del despliegue por capa.

## Decisión

Vamos a desplegar el proyecto así: GitHub para código y pull requests (luego GitHub Actions); Vercel para el frontend React con previews por PR; Render como Web Service de la API NestJS; Supabase para PostgreSQL administrado y Supabase Auth.

El frontend no llamará directo a Supabase; consumirá solo la API Nest (ADR-005). Nest accederá a tablas de dominio vía API de Supabase (ADR-006). La lógica de negocio (M1–M5) y los guards por rol A1–A4 viven en Nest.

En desarrollo local, Nest y React corren en `localhost`; la base preferentemente es el mismo proyecto Supabase de desarrollo. No commitearemos `.env` ni connection strings. En la pasarela de pago mock solo persistiremos el token de transacción, nunca PAN ni CVV (RNF-02).

## Consecuencias

Positivas: cada contenedor del diagrama C4 tiene un destino de deploy claro; facilita el Demo Day con URLs públicas; encaja con un pipeline push a GitHub → build/test → deploy; los secretos quedan fuera del repositorio.

Negativas: los cold starts y límites del free tier (sobre todo en Render) pueden afectar las demos y conviene calentar el servicio antes de presentar; hay tres consolas de cloud además de GitHub; CORS y variables de entorno deben configurarse con cuidado entre Vercel y Render; el backend local depende de red hacia Supabase.

## Alternativas consideradas

(a) Todo en un VPS (DigitalOcean, etc.): descartado por el mayor trabajo de operaciones (Nginx, SSL, backups) para el tamaño del equipo.

(b) Heroku o Railway para API y base de datos: descartados como combinación principal; son válidos, pero el equipo ya acordó Vercel + Render + Supabase.

(c) AWS o GCP completos: descartados por exceso de complejidad para el cuatrimestre.

(d) Supabase como BaaS completo sin Nest: descartado porque choca con ADR-001, ADR-003 y los entregables de frameworks backend del curso.

(e) Frontend solo en Render: descartado; Vercel es más ergonómico para React/SPA y previews por PR.
