# Decisiones pendientes y cosas a definir — FitZone Sports

Documento de trabajo para el equipo: qué **ya está cerrado**, qué **falta decidir** y **cuándo conviene cerrarlo**, sin necesidad de conocer aún el detalle de implementación.

**Referencias:**

- [Trabajo Integrador](./Trabajo_Integrador_FitZone_Sports.md)
- [Stack tecnológico y herramientas](./Stack_Tecnologico_y_Herramientas.md)
- [Funcionalidades por actor](./Funcionalidades_por_Actor.md)
- [Índice de ADR](./ADR_Indice.md) (decisiones ya aceptadas)
- [Bitácora LOG.md](./LOG.md)

**Cómo usar este documento:** marcar `[x]` cuando el equipo cierre cada ítem y anotar la decisión en la columna o en una nota al pie. No hace falta decidir todo al inicio; varias cosas se resuelven en la unidad correspondiente del cronograma.

---

## 1. Ya está cerrado (no hace falta volver a debatirlo)

| Tema | Decisión |
|------|----------|
| Arquitectura | Monolito modular |
| Frontend web | React + TypeScript — **multi-rol (A1, A2, A3, A4)** |
| Canal principal | **Web** para todos los roles, incluido cliente externo |
| App móvil | **Diferida** a Unidad VI; baja prioridad para el MVP web; stack = **React Native** (acuerdo 2026-08-26) |
| Offline (alcance) | RNF-01 aplica al **control de acceso en sede** desde el diseño; no se limita a “mostrar QR en el celular” |
| Backend API | NestJS + TypeScript |
| Base de datos | PostgreSQL |
| Control de versiones | GitHub |
| Hosting frontend | Vercel |
| Hosting backend | Render |
| Hosting BD / Auth | **Supabase:** PostgreSQL + **Supabase Auth** (identidad/login). Nest **no** reemplaza Supabase Auth con auth casera |
| Autenticación | **BFF en NestJS:** el frontend habla solo con Nest; el módulo Auth de Nest actúa como **pasarela** hacia Supabase Auth (login, tokens). Roles/guards de dominio (A1–A4) en Nest |
| Acceso a datos (Supabase) | **API de Supabase** (cliente/SDK desde Nest). Decisión de equipo: **mantener API**; ORM (TypeORM/Prisma) descartado |
| Patrones a aplicar | Strategy (precios), Observer (lista de espera), Repository (datos). **Circuit Breaker** mencionado por el docente (ver §3.6) |

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
- [x] Bitácora `LOG.md` vive en `documentacion/` (ver [LOG.md](./LOG.md))

### 2.3 Cuentas y accesos

- [ ] Organización o cuenta GitHub del equipo
- [ ] Quién crea y administra el proyecto en Vercel
- [ ] Quién crea y administra el servicio en Render
- [ ] Quién crea el proyecto en Supabase y comparte la URL de conexión (sin subir secretos al repo)
- [ ] Cómo se comparten secrets (mensaje privado / gestor de passwords; **nunca** en commits)

---

## 3. Backend (NestJS) — qué falta definir

### 3.1 Acceso a datos en Supabase

**Cerrado por feedback del docente (2026-08-28):**

El docente planteó **dos opciones** para persistir/consultar datos en Supabase:

| Opción | Descripción |
|--------|-------------|
| **A — ORM + entidades** | Nest se conecta a PostgreSQL vía `DATABASE_URL` con TypeORM/Prisma; mapeo de entidades y migraciones en el repo. |
| **B — API de Supabase** | Nest usa el **cliente/SDK de Supabase** (REST/PostgREST) para leer/escribir tablas; sin ORM clásico sobre la conexión directa. |

**Recomendación del docente:** opción **B — API de Supabase**.  
**Decisión del equipo:** **mantener API de Supabase** (opción B). Opción A (ORM) descartada.

- [x] Adoptar **API de Supabase** como forma principal de acceso a datos desde Nest.
- [x] **No** usar ORM con mapeo de entidades (TypeORM/Prisma) como camino principal sobre `DATABASE_URL`.
- [x] El patrón **Repository** sigue aplicando: los repositorios en Nest encapsulan las llamadas al cliente Supabase; la lógica de negocio no queda en el front.

**Flujo de datos:** `React → Nest (BFF) → Supabase API` (tablas de dominio) y `Nest → Supabase Auth` (identidad).

Pendiente de detalle de implementación:

- [ ] Cliente en Nest: `@supabase/supabase-js` con `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (solo backend; nunca en el front)
- [ ] Esquema SQL / migraciones: ¿Supabase SQL editor + scripts versionados en el repo?
- [ ] Cómo modelar transacciones ACID (RN-02 reservas) vía API vs funciones SQL/RPC en Supabase
- [ ] Tipado de respuestas (interfaces/DTOs en Nest aunque no haya ORM)
- [ ] Row Level Security (RLS): ¿políticas en Supabase además de guards en Nest?

**Nota:** TypeORM vs Prisma queda **descartado** como decisión principal; si hace falta SQL puntual (seed, admin), evaluar scripts o RPC, no un ORM completo en runtime.

### 3.2 Autenticación y roles

**Cerrado por feedback del docente (2026-08-28) — patrón BFF + Supabase Auth:**

- [x] Usar **Supabase Auth** para identidad (registro, login, emisión/validación de tokens de sesión).
- [x] **NestJS como BFF (Backend for Frontend):** el frontend (web / luego móvil) **no** llama directo a Supabase Auth; habla **solo** con la API Nest.
- [x] El **módulo Auth de Nest** actúa como **pasarela** hacia Supabase Auth: recibe credenciales del cliente, delega login/signup/refresh a Supabase, devuelve al front el contrato unificado de la API.
- [x] **Roles de dominio (A1–A4)** y guards de endpoints de negocio viven en Nest (mapeo usuario Supabase ↔ rol FitZone en PostgreSQL).
- [x] La **lógica de negocio** (M1–M5) sigue en Nest; Supabase Auth no reemplaza el monolito.

**Flujo resumido:** `React → Nest (BFF) → Supabase Auth` (identidad) y `Nest → Supabase API` (datos de dominio).

Pendiente de detalle de implementación:

- [ ] Login: email/DNI + contraseña vía endpoint Nest que delega en Supabase Auth
- [ ] Roles exactos en el sistema (mapear a A1–A4) — ¿tabla `perfiles` / `user_roles` en PostgreSQL?
- [ ] Validación del JWT de Supabase en Nest (guard) antes de cada request protegido
- [ ] Qué endpoints son públicos y cuáles requieren rol
- [ ] Cómo se registra el primer gerente / seed de datos de demo
- [x] Documentar BFF en C4: `Frontend → Nest BFF → Supabase Auth` + `Nest → Supabase API`

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
| Socio en una sola sede (RN-01) | ¿Estado “dentro de sede” en BD? ¿Timeout de salida? ¿Cómo se comporta en offline? (ver §8) | Al implementar acceso |
| Mora (RN-03) | ¿El backend bloquea descuento o solo avisa? | Al implementar precios/pagos |
| QR dinámico (RF-04) | ¿TOTP por socio (ver §8.3)? ¿También se muestra en web? ¿Cómo se valida sin API? | Al implementar acceso |
| Lista de espera (RF-08) | ¿Notificación por email, in-app, o solo log en demo? | Al aplicar Observer |
| Pasarela mock (RF-13) | ¿Endpoint propio que simula MercadoPago? ¿Respuestas fijas? | Semana 4+ |
| PDF de comprobante (RF-14) | ¿Librería (p. ej. PDFKit) y dónde se guarda el archivo? | Al implementar pagos |

### 3.5 Documentación de API

- [ ] Swagger activado desde el inicio (entregable Unidad II)
- [ ] Convención de URLs (`/api/v1/...` o similar)
- [ ] Formato de errores JSON unificado

### 3.6 Resiliencia — Circuit Breaker (mencionado por el docente, 2026-08-28)

**Contexto:** con Nest como **BFF** hacia **Supabase Auth** y **Supabase API**, un fallo o lentitud prolongada de Supabase podría propagarse a toda la API (timeouts, hilos bloqueados, cascada de errores). El docente mencionó el patrón **Circuit Breaker** como mecanismo de resiliencia.

**Qué es (resumen):** patrón que **corta temporalmente** las llamadas a un servicio externo cuando detecta muchos fallos seguidos, para no seguir martillándolo ni colgar Nest. Luego **reintenta** de forma controlada.

| Estado | Comportamiento |
|--------|----------------|
| **Closed** | Llamadas normales a Supabase (Auth / API). |
| **Open** | Tras N fallos: Nest **no** llama a Supabase; responde rápido (ej. 503) o fallback acordado. |
| **Half-open** | Tras un timeout: deja pasar pocas llamadas de prueba; si OK → Closed; si fallan → Open. |

**Dónde aplicaría en FitZone:**

- Cliente Supabase (lectura/escritura de tablas).
- Pasarela hacia Supabase Auth (login / refresh), si aplica.
- Opcionalmente: pasarela de pago mock (RF-13), si se considera servicio externo inestable.

**No confundir con:**

- **Offline de sede (RNF-01 / TOTP):** problema de conectividad en el torno; el Circuit Breaker protege Nest cuando Supabase falla en la nube.
- **Retry simple:** reintentar siempre; el breaker **deja de llamar** cuando ya no tiene sentido.

**Pendiente (a definir al integrar Supabase en Unidad II+):**

- [ ] ¿Adoptamos Circuit Breaker en el cliente Supabase del BFF?
- [ ] Umbrales: cantidad de fallos, timeout por llamada, tiempo en estado Open.
- [ ] Respuesta al frontend cuando el circuito está abierto (mensaje claro vs error genérico).
- [ ] Librería en Node/Nest (ej. `opossum`, `cockatiel`) o implementación mínima propia.
- [ ] ¿Combinar con timeouts y retries limitados antes de abrir el circuito?
- [ ] Documentar en C4 / ADR si se implementa (patrón de resiliencia del BFF).

**Cuándo:** no bloquea el scaffolding inicial; evaluar al tener llamadas reales a Supabase desde Nest (Semanas 3–4 en adelante).

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

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (solo backend; nunca en el frontend)
- [ ] `DATABASE_URL` (opcional: scripts SQL / migraciones / admin; no como acceso principal en runtime)
- [ ] URL del frontend para CORS (`CORS_ORIGIN`)
- [ ] `PORT`
- [ ] `NODE_ENV`

**Frontend (Vercel / local):**

- [ ] `VITE_API_URL` (o el prefijo que use el bundler)

---

## 6. App móvil (Unidad VI) — diferida y de baja prioridad

**Cerrado a nivel de alcance de canal:** el MVP de M1–M5 sigue siendo **web**. La app móvil no es el canal principal.

**Cerrado (2026-08-26):** stack móvil = **React Native**.

Pendiente solo al llegar a Semanas 13–14 (lado **socio** — distinto del offline de sede; ver §8):

- [x] Framework: React Native
- [ ] Guardar el **seed TOTP** del socio en el dispositivo y generar el QR dinámico (ver §8.3)
- [ ] Cómo se entrega el instalable (APK para Android es lo más habitual)
- [ ] ¿Expo para acelerar el setup?

**Cuándo (app socio):** Semanas 13–14.  
**Importante:** el offline de **check-in en sucursal (RNF-01)** no espera a Unidad VI; ver sección 8.

---

## 7. Testing, CI/CD y calidad (Unidad V)

- [ ] Qué se testea primero (servicios de reserva y precios son buenos candidatos)
- [ ] Meta de cobertura (si la cátedra pide un %)
- [ ] Pipeline GitHub Actions: lint → test → build
- [ ] ¿Deploy automático a Render/Vercel en cada push a `main`, o deploy manual?
- [ ] Docker: solo local, solo CI, o también en Render

**Cuándo:** Semanas 11–12.

---

## 8. Offline y disponibilidad (RNF-01) — a definir en arquitectura (no solo Unidad VI)

### 8.1 Corrección respecto al C4 / docs anteriores

El enunciado marca el offline como **requisito crítico**:

- Control de acceso (QR de socio) debe funcionar si falla internet.
- **RNF-01:** 99.5% — los **tornos / control de acceso** deben operar aunque falle la conexión principal.

En el C4 y el stack se había dejado el offline casi solo en la **app móvil (Unidad VI)**. Eso es **insuficiente**: RNF-01 apunta al **acceso en sede**, no solo a “mostrar el QR en el celular”.

Hay **dos offlines distintos**:

| Lado | Qué debe funcionar sin internet | Prioridad |
|------|----------------------------------|-----------|
| **Sede (A3 / tornos / recepción)** | Validar ingreso y registrar check-in | **Alta — RNF-01** (diseño desde Unidad I / M2) |
| **Socio (app móvil)** | Mostrar QR aunque no haya red | Media — entregable Unidad VI |

El resto del sistema (reservas de canchas, clases, pagos, reportes, alta de sedes) **no** se pide offline → sigue online-first.

### 8.2 Enfoque de infraestructura por sede (a confirmar)

Patrón de **nodo de borde por sede**:

1. Cada sucursal mantiene material local para validar acceso (ver §8.3).
2. Con internet caída, la sede **sigue validando** ingresos y **guarda check-ins en cola local**.
3. Al volver la conectividad, **sincroniza** esos check-ins hacia la BD en la nube (API / PostgreSQL).

- [ ] ¿Aceptamos cache/cola local + sync como base operativa de RNF-01?
- [ ] ¿Dónde vive el nodo local? (app de recepción instalada en sede, servicio local, PWA, etc.)
- [ ] ¿Formato de la cola de check-ins? (entrada/salida, `sedeId`, timestamp, `socioId`, estado sync)

### 8.3 Opción candidata: QR dinámico tipo Authenticator (TOTP) — validación local

**Propuesta del equipo (2026-08-27, a confirmar):** cada socio tiene un **seed (secreto)** como en Google Authenticator. Un algoritmo dependiente del tiempo (TOTP / RFC 6238) genera un valor que cambia cada período (p. ej. 30 s o 60 s). El check-in usa ese código junto con datos de identificación (p. ej. `socioId`; el nombre solo para mostrar en UI, **no** como factor de seguridad).

#### Flujo propuesto

1. Al activar la membresía, el backend genera un `seed`, lo guarda (cifrado) y lo entrega a la app del socio.
2. La app del socio genera el QR cada período: payload con `socioId` + código TOTP (y opcionalmente nombre para display).
3. Cada sede, cuando hay red, baja un **paquete de acceso**: `{ socioId, seed (protegido), estado membresía, vigenteHasta, … }`.
4. **Offline:** recepción/torno escanea → recalcula TOTP con el seed local y el reloj → acepta/rechaza → registra check-in en cola local.
5. **Online:** sync de check-ins + refresh del paquete (revocaciones, vencidos).

#### Viabilidad

| Aspecto | Evaluación |
|---------|------------|
| Encaje con RF-04 (QR que cambia / evita captura) | Alto — caducidad natural del código |
| Encaje con RNF-01 (acceso sin internet) | Alto — la sede valida **sin** llamar a la API |
| Madurez técnica | Alta — estándar TOTP; librerías en Node / React Native |
| Alcance de “auth local” | Solo **check-in**; login web JWT y el resto del sistema siguen online |

#### Riesgos / decisiones abiertas

| Tema | Pregunta |
|------|----------|
| Período TOTP | ¿30 s o 60 s? ¿Ventana de aceptación ±1 período por desfase de reloj? |
| Contenido del QR | ¿Solo `socioId` + TOTP? ¿Payload firmado adicional? |
| Distribución de seeds a sedes | ¿Cómo se replican de forma segura? ¿Cifrado en reposo en el dispositivo de sede? |
| Revocación / mora (RN-03) | Offline puede aceptar un socio recién vencido hasta el próximo sync → ¿TTL de cache? ¿Lista de revocados? |
| RN-01 (una sola sede) | TOTP **no** lo resuelve solo; ¿consistencia eventual al sincronizar, documentada como limitación? |
| Emisión del seed | ¿Solo en app móvil o también en web del socio (Unidad IV) para demos tempranas? |

#### Checklist de cierre

- [ ] ¿Adoptamos TOTP por socio como mecanismo de QR dinámico (RF-04) + validación local (RNF-01)?
- [ ] Período y ventana de reloj
- [ ] Qué viaja en el QR vs qué se muestra en pantalla
- [ ] Política de sync / TTL / revocados
- [ ] Si se confirma: redactar ADR (p. ej. “Acceso offline con TOTP y nodo por sede”)

### 8.4 Qué NO hace falta offline

Explicitar para la defensa y para no overengineerar:

- [x] Reservas de canchas → online
- [x] Clases / lista de espera → online
- [x] Pagos / pasarela → online
- [x] Reportes de gerente / alta de sedes y precios → online
- [x] Login web multi-rol (JWT) → online (no es el mismo problema que el check-in TOTP)

### 8.5 Impacto en documentación y C4

Cuando se cierre el enfoque:

- [ ] Actualizar [C4_Arquitectura_FitZone.md](./C4_Arquitectura_FitZone.md): contenedor/componente de **acceso offline por sede** + generación TOTP
- [ ] Revisar [Stack_Tecnologico_y_Herramientas.md](./Stack_Tecnologico_y_Herramientas.md) y ADR-003 (hoy dicen que RNF-01 se resuelve en Unidad VI)
- [ ] Anotar la decisión en [LOG.md](./LOG.md) y, si aplica, un ADR nuevo

**Cuándo:** cerrar el **enfoque** en Semanas 1–2 (arquitectura); implementación al trabajar M2 (acceso); QR en celular del socio en Unidad VI (React Native).

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
| `LOG.md` del equipo | Todos | `documentacion/LOG.md` |
| Demo Day (guion 15 min) | Todos | Semana 16 |

- [ ] Plantilla de `LOG.md` por integrante (si la cátedra pide bitácora individual además de la grupal)
- [ ] Checklist del Demo Day (flujo web: alta → pago → reserva; QR; demo de acceso offline si está listo)

---

## 10. Prioridad sugerida: qué definir primero

Orden práctico si hoy “no sabemos cómo se va a hacer todo”:

1. **Ya:** monorepo vs multirepo, cuentas GitHub/Vercel/Render/Supabase, responsables P1–P4.
2. **Ya / Semanas 1–2:** enfoque RNF-01 (nodo por sede + TOTP + cola de check-ins + sync); actualizar C4.
3. **Semana 3:** cliente Supabase en Nest, esquema SQL, scaffolding NestJS, Swagger, `.env` de ejemplo.
4. **Semana 4:** primeras entidades + seed de sedes/usuarios.
5. **Al implementar M2:** validación QR/TOTP (online + offline), RN-01 eventual, aforo local.
6. **Semana 8:** estilos y Atomic Design en React.
7. **Semana 9–10:** estado global e integración real con la API.
8. **Semana 11–12:** tests y CI.
9. **Semana 13–14:** app React Native (seed TOTP + QR del socio visible offline).
10. **Cuando toque cada módulo:** concurrencia, mora, pasarela mock, PDF, notificaciones.

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
