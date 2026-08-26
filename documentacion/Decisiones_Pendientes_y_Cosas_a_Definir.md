# Decisiones pendientes y cosas a definir — FitZone Sports

Documento de trabajo para el equipo: qué **ya está cerrado**, qué **falta decidir** y **cuándo conviene cerrarlo**, sin necesidad de conocer aún el detalle de implementación.

**Referencias:**

- [Trabajo Integrador](./Trabajo_Integrador_FitZone_Sports.md)
- [Stack tecnológico y herramientas](./Stack_Tecnologico_y_Herramientas.md)
- [Funcionalidades por actor](./Funcionalidades_por_Actor.md)
- [Índice de ADR](./ADR_Indice.md) (decisiones ya aceptadas)

**Cómo usar este documento:** marcar `[x]` cuando el equipo cierre cada ítem y anotar la decisión en la columna o en una nota al pie. No hace falta decidir todo al inicio; varias cosas se resuelven en la unidad correspondiente del cronograma.

---

## 1. Ya está cerrado (no hace falta volver a debatirlo)

| Tema | Decisión |
|------|----------|
| Arquitectura | Monolito modular |
| Frontend web | React + TypeScript — **multi-rol (A1, A2, A3, A4)** |
| Canal principal | **Web** para todos los roles, incluido cliente externo |
| App móvil | **Diferida** a Unidad VI; baja prioridad; no condiciona M1–M5 |
| Backend API | NestJS + TypeScript |
| Base de datos | PostgreSQL |
| Control de versiones | GitHub |
| Hosting frontend | Vercel |
| Hosting backend | Render |
| Hosting BD | Supabase (solo como PostgreSQL; la lógica va en NestJS) |
| Patrones a aplicar | Strategy (precios), Observer (lista de espera), Repository (datos) |

---

## 2. Organización del proyecto (definir temprano)

### 2.1 Estructura del repositorio

- [ ] **¿Un solo repo (monorepo) o dos/tres repos?**
  - **Monorepo:** carpetas `frontend/`, `backend/`, `documentacion/` en el mismo GitHub.
  - **Multirepo:** un repo para front, otro para back.
  - **Sugerencia:** monorepo (más simple para 4 personas y un Demo Day).
  - **Cuándo:** Semana 1–2, antes del scaffolding.

### 2.2 Nombres y convenciones

- [ ] Nombre del repositorio en GitHub
- [ ] Convención de ramas (`feature/...`, `fix/...`, solo `main`)
- [ ] Quién hace merge a `main` y si hace falta revisión de PR
- [ ] Formato de commits (mensaje libre o tipo `feat:`, `fix:`)
- [ ] Dónde vive la bitácora `LOG.md` (raíz o `documentacion/`)

### 2.3 Cuentas y accesos

- [ ] Organización o cuenta GitHub del equipo
- [ ] Quién crea y administra el proyecto en Vercel
- [ ] Quién crea y administra el servicio en Render
- [ ] Quién crea el proyecto en Supabase y comparte la URL de conexión (sin subir secretos al repo)
- [ ] Cómo se comparten secrets (mensaje privado / gestor de passwords; **nunca** en commits)

---

## 3. Backend (NestJS) — qué falta definir

### 3.1 ORM (acceso a la base de datos)

- [ ] **TypeORM vs Prisma**
  - Ambos sirven con NestJS + PostgreSQL.
  - TypeORM: muy usado en ejemplos NestJS; entities “clásicas”.
  - Prisma: schema declarativo y tipado fuerte; curva distinta.
  - **Cuándo:** Semana 3 (scaffolding).
  - **Importante:** elegir uno y no mezclar.

### 3.2 Autenticación y roles

- [ ] Login: email/DNI + contraseña, o solo email
- [ ] Roles exactos en el sistema (mapear a A1–A4)
- [ ] Tokens JWT: duración de sesión y renovación
- [ ] Qué endpoints son públicos y cuáles requieren rol
- [ ] Cómo se registra el primer gerente / seed de datos de demo

### 3.3 Módulos y orden de implementación

El dominio está claro (M1–M5). Falta acordar **prioridad de entrega**:

- [ ] Orden sugerido a confirmar: Usuarios → Membresías → Canchas → Clases → Acceso/QR → Pagos
- [ ] Qué es MVP para la primera demo interna vs. Demo Day final
- [ ] Cómo se modelan las 25+ sedes (tabla `sedes` + datos de prueba)

### 3.4 Reglas difíciles (negocio técnico)

Estas no son “librerías”, pero hay que **acordar el enfoque** cuando se implemente:

| Tema | Pregunta a resolver | Cuándo |
|------|---------------------|--------|
| Concurrencia de canchas (RN-02) | ¿Transacción + unique constraint? ¿Lock? | Al implementar reservas |
| Socio en una sola sede (RN-01) | ¿Estado “dentro de sede” en BD? ¿Timeout de salida? | Al implementar acceso |
| Mora (RN-03) | ¿El backend bloquea descuento o solo avisa? | Al implementar precios/pagos |
| QR dinámico (RF-04) | ¿Se genera en backend? ¿También se muestra en web del socio? | Al implementar acceso (web primero) |
| Lista de espera (RF-08) | ¿Notificación por email, in-app, o solo log en demo? | Al aplicar Observer |
| Pasarela mock (RF-13) | ¿Endpoint propio que simula MercadoPago? ¿Respuestas fijas? | Semana 4+ |
| PDF de comprobante (RF-14) | ¿Librería (p. ej. PDFKit) y dónde se guarda el archivo? | Al implementar pagos |

### 3.5 Documentación de API

- [ ] Swagger activado desde el inicio (entregable Unidad II)
- [ ] Convención de URLs (`/api/v1/...` o similar)
- [ ] Formato de errores JSON unificado

---

## 4. Frontend web (React) — qué falta definir

### 4.1 Tooling

- [ ] Bundler: **Vite** (recomendado) u otro
- [ ] Estilos: Tailwind CSS vs CSS Modules vs otra opción
- [ ] Componentes UI: biblioteca (p. ej. MUI, shadcn) o componentes propios (Atomic Design)
- [ ] Cliente HTTP: `fetch` nativo vs axios
- [ ] Librería de formularios y validación (opcional)

### 4.2 Estado y pantallas

- [ ] Librería de estado global: Zustand vs Redux Toolkit vs Context puro
- [ ] Routing: React Router
- [ ] Pantallas mínimas por actor (**A1 socio, A2 externo, A3 recepcionista, A4 gerente**)
- [ ] Cómo se muestra el aforo en “tiempo real” (polling cada N segundos vs WebSocket — puede quedar polling para el MVP)

### 4.3 Experiencia y alcance web

- [x] **Canal:** la web cubre A1 y A2 (no solo admin); móvil no es el canal principal
- [ ] Diseño visual: ¿hay marca/colores definidos o se define en Unidad IV?
- [ ] Responsive: ¿prioridad desktop primero, con uso razonable en móvil navegador?

**Cuándo:** Semanas 8–10 (Unidad IV).

---

## 5. Base de datos y entornos

### 5.1 Entornos

- [ ] ¿Un solo proyecto Supabase para todo el cuatrimestre, o `dev` + `prod`?
- [ ] ¿PostgreSQL local opcional (Docker) además de Supabase?
- [ ] Migraciones: quién las escribe y en qué rama se aplican

### 5.2 Datos de prueba

- [ ] Cantidad de sedes de demo (ej. 3 en lugar de 25 reales)
- [ ] Usuarios seed: 1 gerente, 1 recepcionista, 2 socios, 1 externo
- [ ] Canchas y clases de ejemplo por sede
- [ ] Script o comando para cargar datos (`npm run seed`)

### 5.3 Variables de entorno (checklist, sin valores secretos)

Definir **nombres** de variables; los valores viven solo en Vercel / Render / local `.env` (gitignored).

**Backend (Render / local):**

- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `PORT`
- [ ] `CORS_ORIGIN` (URL del front en Vercel)
- [ ] `NODE_ENV`

**Frontend (Vercel / local):**

- [ ] `VITE_API_URL` (o el prefijo que use el bundler)

---

## 6. App móvil (Unidad VI) — diferida y de baja prioridad

**Cerrado a nivel de alcance:** no se trabaja móvil hasta el final del curso. No bloquea ni redefine el proyecto web.

Pendiente solo al llegar a Semanas 13–14:

- [ ] **React Native vs Flutter** (si se entrega algo móvil)
- [ ] Persistencia offline del QR (AsyncStorage, SQLite, etc.)
- [ ] Cómo se entrega el instalable (APK para Android es lo más habitual)
- [ ] ¿Expo (si React Native) para acelerar el setup?

**Cuándo:** Semanas 13–14 — sin anticipar esfuerzo relevante antes.

---

## 7. Testing, CI/CD y calidad (Unidad V)

- [ ] Qué se testea primero (servicios de reserva y precios son buenos candidatos)
- [ ] Meta de cobertura (si la cátedra pide un %)
- [ ] Pipeline GitHub Actions: lint → test → build
- [ ] ¿Deploy automático a Render/Vercel en cada push a `main`, o deploy manual?
- [ ] Docker: solo local, solo CI, o también en Render

**Cuándo:** Semanas 11–12.

---

## 8. Offline y disponibilidad (RNF-01)

Hasta Unidad VI el sistema asume **conectividad** (web + API + Supabase).

Alcance diferido:

- [x] Offline **no** es prioridad del MVP web
- [ ] En Unidad VI: ¿offline solo cache del QR en app móvil?
- [ ] ¿La pantalla del recepcionista queda siempre online (fuera de offline)?

**Nota:** documentar este alcance evita sorpresas en la defensa.

---

## 9. Entregables académicos (no olvidar)

Además del código, el plan pide:

| Entregable | ¿Quién lidera? | ¿Dónde vive? |
|------------|----------------|--------------|
| Diagramas C4 + ADR (PDF) | P1 | `documentacion/` |
| Backend + Swagger | P2 | repo `backend/` |
| Justificación de patrones | P1/P2 | docs + código |
| Frontend documentado | P3 | repo `frontend/` |
| Pipeline CI + cobertura | P4 | `.github/` + reporte |
| APK/IPA con QR offline | P4 | entrega Unidad VI |
| `LOG.md` por integrante | Todos | acordar ubicación |
| Demo Day (guion 15 min) | Todos | Semana 16 |

- [ ] Plantilla de `LOG.md`
- [ ] Checklist del Demo Day (flujo web: alta → pago → reserva; QR en web y/o móvil VI)

---

## 10. Prioridad sugerida: qué definir primero

Orden práctico si hoy “no sabemos cómo se va a hacer todo”:

1. **Ya:** monorepo vs multirepo, cuentas GitHub/Vercel/Render/Supabase, responsables P1–P4.
2. **Semana 3:** ORM, scaffolding NestJS, Swagger, `.env` de ejemplo.
3. **Semana 4:** primeras entidades + seed de sedes/usuarios.
4. **Semana 8:** estilos y Atomic Design en React.
5. **Semana 9–10:** estado global e integración real con la API.
6. **Semana 11–12:** tests y CI.
7. **Semana 13–14:** móvil solo si hace falta el entregable de Unidad VI (bajo esfuerzo relativo).
8. **Cuando toque cada módulo:** concurrencia, mora, pasarela mock, PDF, notificaciones.

---

## 11. Plantilla rápida para cerrar una decisión

Cuando el equipo elija algo, copiar esto al final del documento o al ADR:

```md
### Decisión: [título]
- Fecha:
- Responsable:
- Opciones evaluadas:
- Elegida:
- Motivo (1–2 líneas):
- Impacto (repos / hosting / docs a actualizar):
```

---

*Decisiones pendientes · FitZone Sports · Programación V · UNER*
