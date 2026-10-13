# Panorama del desarrollo — FitZone Sports

**Fecha:** 2026-10-13 · **Autor:** Patricio Ramos (P1)  
**Base:** rama `desarrollo` en `09ef4cf`, [consigna](./Trabajo_Integrador_FitZone_Sports.md), [funcionalidades por actor](./Funcionalidades_por_Actor.md), [ER propuesto](./Propuesta_ER_FitZone.md) y [notas de la clase de patrones](./Notas_UnidadIII_Clase1_vs_FitZone.md)  
**Relacionados:** [Estructura del backend](./Estructura_Backend.md) · [Correcciones S3-T03 / S3-T04](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md)

---

## 1. Resumen

| Área | Estado | Comentario |
|------|--------|------------|
| Arquitectura (Unidad I) | **Hecho** | C4, ADRs, monolito modular, BFF con Supabase |
| Base de datos | **~40 %** | Núcleo, membresías, clases y notificaciones. Faltan acceso (M2), canchas (M4) y pagos (M5) |
| Backend (Unidad II) | **~35 %** | Infraestructura sólida (auth, roles, Repository, Swagger, tests). De negocio: sedes, notificaciones y una primera versión de membresías y clases, que necesita correcciones |
| Patrones (Unidad III) | **~50 %** | Repository y Observer implementados y justificados; Strategy diseñado. Faltan analizar el resto de los patrones de la clase |
| Frontend (Unidad IV) | **~5 %** | 4 pantallas estáticas, sin conexión con la API |
| Testing y CI/CD (Unidad V) | **~15 %** | Tests unitarios y e2e del backend. Sin pipeline, sin Docker, sin tests de frontend |
| Móvil (Unidad VI) | **0 %** | Diferido por decisión del equipo |

Lo más urgente: **corregir la seguridad de Clases y Membresías**, **diseñar las tablas de Canchas (M4)**, que bloquean Strategy y la demo, y **conectar el frontend con la API**.

El guion del Demo Day es: *registrar socio → pagar membresía → reservar cancha de paddle → ver el QR en el móvil*. Hoy no se puede hacer ningún paso desde el frontend; desde la API, solo el login.

---

## 2. Estado por módulo

Leyenda: ✅ hecho · 🟡 parcial · ❌ falta

### Transversal (sedes, perfiles, autenticación)

| Funcionalidad | BD | Backend | Front |
|---------------|----|---------|-------|
| Login (BFF hacia Supabase Auth) | ✅ | ✅ `POST /auth/login` | 🟡 formulario sin conectar |
| Usuario y rol del token | ✅ | ✅ `GET /auth/me`, `@RequiereRol` | ❌ |
| Listar sedes | ✅ | ✅ `GET /sedes` | ❌ (el select es fijo) |
| Crear y editar sedes (A4, RNF-04) | ✅ | ❌ | ❌ |
| Reportes consolidados (A4) | — | ❌ | ❌ |
| Asignar administradores de sede (`admins_sede`) | ❌ | ❌ | ❌ |

### M1 — Usuarios y Membresías (RF-01 a RF-03)

| Funcionalidad | BD | Backend | Front |
|---------------|----|---------|-------|
| RF-01 Registro (DNI, contacto, foto; socio o externo) | ✅ `perfiles` | ❌ no hay `POST /auth/register` | ❌ |
| Ver y editar mi perfil | ✅ | ❌ no hay `GET/PATCH /perfiles/me` | 🟡 pantalla con datos fijos |
| Foto de perfil | ❌ (Supabase Storage sin configurar) | ❌ | ❌ |
| RF-02 Planes y precios | ✅ `planes_membresia` | ❌ | ❌ |
| RF-02 Membresía activa / vencida | ✅ | 🟡 sin login y con error de fecha | ❌ |
| RF-02 Alta y renovación | ✅ | 🟡 `POST /membresias` inseguro y no cierra la anterior | ❌ |
| RF-02 Renovación con pago | — | ❌ (depende de M5) | ❌ |
| RF-03 Acceso multi-sede | ✅ (la membresía no está atada a una sede) | — | — |
| Preferencias de notificación | ✅ | ✅ | ❌ |

### M2 — Gimnasio y Acceso (RF-04, RF-05, RN-01, RNF-01)

| Funcionalidad | BD | Backend | Front |
|---------------|----|---------|-------|
| RF-04 QR dinámico (TOTP) | ❌ `totp_seeds` | ❌ | ❌ |
| Validación de ingreso en recepción | ❌ `check_ins` | ❌ | ❌ |
| RN-01 Una sede a la vez | ❌ `presencias` | ❌ | ❌ |
| RF-05 Aforo en tiempo real | 🟡 `sedes.aforo_max` | ❌ | ❌ |
| RNF-01 Acceso sin internet | — | ❌ | ❌ |

**Bloqueado por decisiones:** salida explícita o por tiempo en `presencias` (consultar al docente), TOTP de 30 o 60 s, cómo llegan las semillas a la sede. Ver [Propuesta RN-01](./Propuesta_RN01_Presencia_Una_Sede.md) y [Decisiones pendientes §8](./Decisiones_Pendientes_y_Cosas_a_Definir.md).

### M3 — Clases Grupales (RF-06 a RF-08)

| Funcionalidad | BD | Backend | Front |
|---------------|----|---------|-------|
| RF-06 Crear y editar clases (admin) | ✅ | ❌ | ❌ |
| Listar clases con cupo | ✅ vista `clases_con_cupo` | 🟡 sin login | ❌ |
| RF-07 Reservar | ✅ `inscribir_en_clase` | 🟡 perfil tomado del body, sin control de membresía (RN-03) | ❌ |
| RF-07 Reservar hasta 48 h antes (D5) | — | ❌ (falta decidir cómo se interpreta) | ❌ |
| RF-07 Cancelar (tardía con menos de 2 h, D6) | ✅ | 🟡 la hora la manda el cliente | ❌ |
| RF-08 Anotarse en la lista de espera | ✅ | ❌ | ❌ |
| RF-08 Aviso al liberarse un lugar (Observer) | ✅ | 🟡 el Observer está, pero Clases no lo llama | ❌ |
| RF-08 Confirmar el lugar | ✅ `confirmar_lugar_espera` | ❌ | ❌ |
| Mis notificaciones | ✅ | ✅ | ❌ |

### M4 — Canchas (RF-09 a RF-12, RN-02)

| Funcionalidad | BD | Backend | Front |
|---------------|----|---------|-------|
| RF-09 Alta de canchas con precio por hora | ❌ `canchas` | ❌ | ❌ |
| RF-10 Grilla de disponibilidad | ❌ `reservas_cancha` | ❌ | 🟡 pantalla con datos fijos |
| RF-10 / RN-02 Reservar sin sobreventa | ❌ (índice único o función con bloqueo) | ❌ | ❌ |
| RF-11 Precio dinámico (Strategy) | ❌ `configuracion_pico`, `configuracion_cadena` | ❌ S4-T01 | ❌ |
| RF-12 Mantenimiento | ❌ | ❌ | ❌ |
| RNF-03 Disponibilidad rápida (índices) | ❌ | — | — |

Las reglas de precio ya están decididas en parte ([S4-T09](./Propuesta_Reglas_Negocio_S4-T09.md), P3 y P8). Falta cerrar P1, P2 y P4 a P7.

### M5 — Pagos y Facturación (RF-13, RF-14, RNF-02)

| Funcionalidad | BD | Backend | Front |
|---------------|----|---------|-------|
| RF-13 Pasarela simulada (estilo MercadoPago) | ❌ `pagos` | ❌ | ❌ |
| RNF-02 Guardar solo el token de la pasarela | ❌ | ❌ | ❌ |
| RF-14 Comprobante PDF | ❌ | ❌ (falta elegir librería) | ❌ |

---

## 3. Base de datos

| Tabla / objeto | Módulo | Estado | Dónde está |
|----------------|--------|--------|------------|
| `sedes`, `perfiles`, `membresias` y enums | Núcleo / M1 | En Supabase | **Sin migración en el repo** (solo una simulación en `supabase/tests/00_fase_a_simulada.sql`) |
| `planes_membresia` | M1 | ✅ | `20261005220000_membresias_clases.sql` |
| `clases`, `inscripciones_clase`, `lista_espera`, vista y funciones | M3 | ✅ | `20261005220000_membresias_clases.sql` |
| `notificaciones`, `perfiles.notificar_por_email` | M3 | ✅ | `20261006190000_notificaciones.sql` |
| `renovar_membresia` (función) | M1 | ❌ | Propuesta en el doc de correcciones, punto 8 |
| `canchas`, `reservas_cancha` | M4 | ❌ | ER propuesto y S4-T09 |
| `configuracion_pico`, `configuracion_cadena` | M4 | ❌ | S4-T09 (P3 y P8 decididos) |
| `admins_sede` | Transversal | ❌ | S4-T09 |
| Renombrar el rol `recepcionista` a `admin_sede` | Transversal | ❌ | Decidido en S4-T09 |
| `presencias`, `check_ins`, `totp_seeds` | M2 | ❌ | ER propuesto; faltan decisiones |
| `pagos` | M5 | ❌ | ER propuesto |

**Recomendación:** exportar el esquema real de la Fase A como migración (`supabase/migrations/2026090x_fase_a.sql`). Hoy, si hubiera que recrear la base, no hay script para las tres tablas principales.

---

## 4. Backend

El detalle está en [Estructura_Backend.md](./Estructura_Backend.md). Resumen:

- **Sólido:** login BFF, verificación de JWT, guard de roles, Repository con manejo de errores centralizado, Observer con eventos del framework, Swagger, CORS, 63 tests.
- **A corregir:** Clases y Membresías (13 puntos en el [doc de correcciones](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md); 6 de prioridad alta, sobre todo seguridad).
- **Faltan endpoints:**
  - **Transversal:** registro, perfil propio, ABM de sedes.
  - **M3:** ABM de clases, lista de espera (anotarse, confirmar, retirarse).
  - **M4, M5, M2 y reportes:** todo.
- **Mejoras generales:** `ValidationPipe` global, activar la regla `no-explicit-any`, README propio.

---

## 5. Frontend

**Hoy:** React 19 + Vite + `react-router-dom`. 4 pantallas (`Home`, `Login`, `Perfil`, `Canchas`) con datos fijos y un `Layout` que solo envuelve `Home`.

| Falta | Detalle | Tarea |
|-------|---------|-------|
| Capa de servicios (cliente de la API) | Un módulo `api/` con la URL base (`VITE_API_URL`), que agregue el token en `Authorization` y maneje 401 | Unidad IV, semana 10 |
| Login real | Llamar a `POST /auth/login`, guardar el token y redirigir. **Hoy el formulario imprime la contraseña en la consola: hay que sacarlo** | S3-T05 |
| Estado global | Usuario, token y rol (Zustand o Context) | S4-T04 |
| Rutas protegidas por rol | Redirigir al login sin token; menú distinto por rol | — |
| Atomic Design | Átomos, moléculas y organismos reutilizables (botón, input, tarjeta de clase o cancha, tabla) | Unidad IV, semana 8 |
| Componentes documentados | Entregable de la Unidad IV (15 %): por ejemplo con Storybook | Unidad IV |
| Estilos | No hay sistema de estilos definido | — |
| Tests | Ninguno | Unidad V |

**Pantallas necesarias por rol** (según [Funcionalidades por actor](./Funcionalidades_por_Actor.md)):

| Rol | Pantallas |
|-----|-----------|
| Todos | Login, registro, mi perfil, notificaciones |
| Socio (A1) | Mi membresía y renovación, clases (listar, reservar, cancelar, lista de espera, confirmar lugar), canchas (grilla, reservar con precio), pago, comprobantes, QR |
| Externo (A2) | Canchas, pago, comprobantes |
| Admin de sede (A3) | Validar ingreso (QR), aforo en tiempo real, agenda de clases de su sede, mantenimiento de canchas, configuración de horario pico |
| Gerente (A4) | Sedes, canchas y precios, descuento de socio, administradores de sede, reportes consolidados |

**Dependencia:** la pantalla "Mi Perfil" necesita un endpoint que hoy no existe (`GET /perfiles/me`). `/auth/me` solo devuelve id, email y rol.

---

## 6. Testing, CI/CD y despliegue

| Ítem | Estado |
|------|--------|
| Tests unitarios y e2e del backend | ✅ 43 + 20 (sin Clases ni Membresías) |
| Tests de las funciones SQL | 🟡 `supabase/tests/membresias_clases.test.sql`, manual con un Postgres local |
| Colección Postman (S4-T07) | ❌ |
| Pipeline CI (GitHub Actions: lint, test, build) | ❌ no hay `.github/` |
| Reporte de cobertura (entregable Unidad V) | ❌ (existe `npm run test:cov`, falta publicarlo) |
| Docker | ❌ |
| Deploy en Render (backend) y Vercel (frontend) | ❌ sin configuración en el repo |
| Tests de frontend | ❌ |

---

## 7. Patrones de diseño

### 7.1 Implementados

| Patrón | Dónde | Estado |
|--------|-------|--------|
| **Repository** | Toda la capa de datos | ✅ justificado |
| **Observer** | Lista de espera, con `@nestjs/event-emitter` | ✅ justificado (con las tres decisiones de la diapositiva 37) |
| **Template Method** | `SupabaseRepository<T>` | ✅ mencionado |
| Inyección de dependencias, cadena de guards, decoradores, BFF | Todo el backend | ✅ mencionados |

### 7.2 Diseñado, falta implementar

| Patrón | Dónde | Pendiente |
|--------|-------|-----------|
| **Strategy** | Precio de canchas (RF-11), S4-T01 | Depende de las tablas de M4. Además, como descuento y recargo **se acumulan**, la clase dice que en rigor es una **cadena de decoradores** (diapositivas 26 y 35): hay que nombrarlo y justificarlo así en el documento |

### 7.3 Por analizar: patrones que el profesor ve en FitZone

Propuesta inicial para discutir en equipo. Cada uno aplicado o descartado tiene que quedar justificado en el documento de la Unidad III.

| Patrón | Caso en FitZone | Propuesta | Por qué | Cuándo |
|--------|-----------------|-----------|---------|--------|
| **Facade** | `reservar()` de canchas: disponibilidad, membresía, precio, pago, reserva y aviso | **Aplicar** | Es el caso de uso central del Demo Day y coordina varios módulos. Un `ReservasService.reservar()` que orquesta y oculta los subsistemas es natural | M4 |
| **Adapter** | Pasarela de pago (estilo MercadoPago) detrás de una interfaz propia | **Aplicar** | Es el uso de manual: una interfaz del dominio (`PasarelaPago`) y un adaptador del mock. Cambiar a MercadoPago real sería otro adaptador | M5 |
| **Builder** | Armar una reserva (cancha, horario, cliente, precio con detalle, pago) | **Evaluar** | El profesor lo llama "el creacional que casi seguro van a necesitar". Tiene sentido si la reserva junta muchos datos opcionales; si no, es una clase de más | M4 |
| **Chain of Responsibility** | Validaciones previas a reservar (membresía, mantenimiento, horario, ventana de 48 h), devolviendo todos los errores juntos | **Evaluar** | Ordena las validaciones que hoy se reparten entre SQL y servicio. Ya tenemos la versión con guards | M3 / M4 |
| **State** | Membresía (activa / vencida / suspendida), cancha (disponible / mantenimiento), reserva (pendiente de pago / confirmada / cancelada) | **Evaluar** (reserva) | En membresía y cancha las transiciones son pocas y un `if` alcanza. La reserva con pago tiene más estados y reglas por estado | M4 / M5 |
| **Template Method** | Comprobantes PDF: el flujo es igual, cambia el contenido (membresía o reserva) | **Aplicar** si hay dos tipos de comprobante | Ya lo usamos en Repository; acá encaja con RF-14 | M5 |
| **Factory Method** | Elegir el notificador según el canal | **Probablemente no** | El Observer con `@OnEvent` ya resuelve los canales: cada uno decide si actúa según la preferencia. Escribir por qué no hace falta | — |
| **Composite** | Árbol red → región → sede → espacio para reportes de ocupación | **Probablemente no** | No tenemos regiones; los reportes son por sede y total de la cadena. Justificar el descarte | Reportes |
| **Abstract Factory** | Familias de objetos (por país o por pasarela) | **Descartar** | El profesor pide descartarlo por escrito: hay una sola pasarela y un solo país | — |
| **Circuit Breaker** | Llamadas a la pasarela o a Supabase | **Evaluar** | Lo mencionó el docente (2026-08-28). El candidato natural es la pasarela simulada, que puede "fallar" a propósito para la demo | M5 |
| **Singleton** | Cliente de Supabase, configuración | **No escribirlo a mano** | Lo da el contenedor de Nest (los providers son únicos). La diapositiva 46 critica "un Singleton propio con contenedor IoC" | — |

---

## 8. Decisiones pendientes que bloquean trabajo

| Decisión | Bloquea | Quién |
|----------|---------|-------|
| S4-T09: P1, P2 y P4 a P7 (precio base, duración del turno, combinación de descuento y recargo, RN-03, precio fijo al reservar, redondeo) | Tablas de M4 y Strategy | Equipo |
| S4-T09: Q1 plazo para confirmar el lugar (propuesta 30 min), Q2 penalidad por cancelación tardía, Q4 precios de los planes | M3, M1 | Equipo |
| D5 / Q3: cómo se interpreta "reservar hasta 48 h antes" | M3 | Docente |
| Renombrar `recepcionista` a `admin_sede`; el gerente asigna administradores, crea sedes y ve reportes | Roles, M4 | Equipo |
| RN-01: salida explícita o por tiempo en `presencias` | M2 | Docente |
| QR: TOTP 30 o 60 s, contenido del QR, distribución de semillas | M2, móvil | Equipo |
| Pasarela simulada: endpoint propio, respuestas fijas o aleatorias | M5 | Equipo |
| Librería de PDF y dónde se guarda el comprobante | M5 | Equipo |
| Prefijo `/api` en las rutas | Front y deploy | P1 |

---

## 9. Próximos pasos sugeridos

| Prioridad | Tarea | Responsable sugerido | Depende de |
|-----------|-------|----------------------|------------|
| 1 | Correcciones de Clases y Membresías (puntos 1 a 6) | Bruno | — |
| 1 | Cerrar las decisiones de S4-T09 en reunión | Equipo | — |
| 1 | Login real, cliente de la API y estado global en el front | Lucas | — |
| 2 | Diseño y migración de M4: `canchas`, `reservas_cancha` (sin sobreventa), `configuracion_pico`, `configuracion_cadena`, `admins_sede` y renombre de rol | Patricio | S4-T09 |
| 2 | Migración de la Fase A al repo y función `renovar_membresia` | Patricio | — |
| 2 | Endpoints de registro y perfil propio (`/perfiles/me`) | Patricio o Bruno | — |
| 2 | Pipeline de CI (lint, test y build de backend y frontend) | Matias | — |
| 3 | API de Canchas (S4-T06) y Strategy (S4-T01) | Bruno | Migración M4 |
| 3 | Lista de espera: anotarse, confirmar, retirarse | Bruno | Correcciones |
| 3 | Atomic Design y pantallas de clases y canchas con datos reales | Lucas | Cliente de la API |
| 3 | Colección Postman y deploy en Render y Vercel | Matias | — |
| 4 | Analizar en equipo los patrones de la sección 7.3 y actualizar la justificación | Patricio + Bruno | — |
| 4 | Diseño de M5 (pagos, Adapter de la pasarela, comprobante PDF) | Patricio | M4 |
| 5 | M2 (acceso, QR, aforo) y móvil | Matias + Patricio | Decisiones RN-01 y TOTP |
