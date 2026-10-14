# Acta — Reunión de seguimiento (Semana 4)

**Fecha:** 2026-10-13 · 22:27 GMT-03  
**Participantes:** Patricio Ramos (P1), Bruno Conti (P2), Matias Goncevat (P4)  
**Ausente:** Lucas Coquet (P3); se le pasa la grabación y este resumen  
**Fuente:** transcripción automática `2026-10-13 22-27-53.txt` (tiene tramos ilegibles; se resumió lo que se entiende con claridad)  
**Referencias:** [Panorama del desarrollo](./Panorama_Desarrollo_2026-10-13.md) · [Correcciones S3-T03 / S3-T04](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md) · [Estructura del backend](./Estructura_Backend.md) · [Justificación de patrones](./Justificacion_Patrones_Unidad_III.md)

---

## 1. Con qué está cada uno

| Integrante | Terminó | Está con | Bloqueos |
|------------|---------|----------|----------|
| **Bruno (P2)** | S3-T03 Membresías y S3-T04 Clases (mergeadas en `desarrollo`). "Clases salió bastante sencillo" | **S4-T06** API de Canchas y **S4-T01** Strategy de precios. Revisar el documento de correcciones de Membresías y Clases durante la semana | Ninguno por ahora; considera que sus dos tareas no dependen de otras |
| **Matias (P4)** | Probó levantar el proyecto en local: el backend levantó; el frontend solo mostró la pantalla de bienvenida de Vite (tenía una versión vieja del repo) | Volver a bajar el repo y probar el frontend actual. **Documentar en el README cómo levantar el proyecto** (backend y frontend, sin credenciales). Prueba manual (login y listar sedes) con los resultados en `LOG.md`. Revisar tareas viejas del Trello que ya están hechas y cerrarlas | Ninguno. Consiguió una IA tipo Cursor gratuita para revisar el proyecto |
| **Patricio (P1)** | S4-T02 Observer, S4-T05 primera versión de la justificación de patrones, documentos de correcciones, estructura del backend y panorama | Completar S4-T05: analizar los patrones de la última clase (cargar la clase del jueves) y decidir cuáles se aplican y cuáles no, con su justificación. Cuentas de Vercel y Render cuando haga falta el deploy | Ninguno |
| **Lucas (P3)** | Router, layout, login, Mi Perfil y Canchas (pantallas con datos fijos) | Se encarga del `LOG.md`, que está incompleto: debería tener más reuniones registradas. Frontend: cada API debería tener su pantalla (listar, ver reservas, canchas, notificaciones) | — (no estuvo) |

---

## 2. Temas que se charlaron

### 2.1 Correcciones de Membresías y Clases

- Patricio le mostró a Bruno el documento [Correcciones S3-T03 / S3-T04](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md), armado al bajar los cambios: endpoints sin token, socio tomado del body o de la URL en lugar del token, posibilidad de cancelar la inscripción de otro, guards, tests.
- La idea es ir **punto por punto**. Mucho está hecho con IA: si algún punto genera dudas o no hace falta, se charla y se descarta.

### 2.2 Ramas y flujo de Git

- Hay unas 25 ramas: una por tarea, más algunas de correcciones y documentación sin tarea asociada. **Todas están mergeadas en `desarrollo`.**
- Flujo: al terminar una tarea se mergea a `desarrollo`. Antes, **actualizar la rama con `desarrollo`** para que no haya conflictos.
- `master` todavía no tiene nada del código; por ahora alcanza con `desarrollo` para que cada uno pruebe en local.

### 2.3 Credenciales y README

- Las credenciales (claves privadas) **nunca se suben al repo**; se comparten por Discord.
- El README tiene que explicar los pasos para levantar el proyecto ("corré este comando y ya lo podés usar"), no solo probarlo.

### 2.4 Tareas viejas del Trello

Varias se pueden dar por terminadas porque ya están hechas en el proyecto:

- Completar la tabla de integrantes.
- Checklist de cuentas: Supabase y GitHub listos. **Vercel y Render quedan pendientes**, a cargo de Patricio, para cuando se necesite la versión accesible desde cualquier lugar.
- `.env.example` sin valores secretos.
- Auth (ya se pudieron hacer pruebas).

Quedan: la prueba manual (login y listar sedes, anotando resultados en `LOG.md`) y las reuniones de seguimiento.

### 2.5 Demo interna

Probablemente no se haga una demo formal. Alcanza con que se pruebe y se vea funcionando; cada uno va probando por su cuenta lo que hace en backend o frontend.

### 2.6 Desarrollo con IA

Para que una IA ayude de verdad, tiene que tener acceso al proyecto y poder hacer cambios (integrada en el editor, como Cursor o una extensión de VS Code). Con una guía genérica y pasándole archivos sueltos es mucho más difícil.

### 2.7 Patrones de diseño (S4-T05)

Patricio recorrió la [justificación de patrones](./Justificacion_Patrones_Unidad_III.md):

- **Repository** (implementado): capa entre los servicios y Supabase; centraliza errores y log. Faltan repositorios para los módulos que vienen.
- **Observer** (implementado): lista de espera con `@nestjs/event-emitter`. Se comentó el criterio del profesor: **si una librería ya resuelve el patrón, se usa la librería**; escribir el patrón a mano solo se justifica si necesitamos algo que la librería no da.
- **Strategy** (diseñado, falta implementar en S4-T01, Bruno): precio estándar, descuento de socio (15 % por defecto, uno para toda la cadena) y recargo de horario pico (configurable por sede). Un socio con cuota vencida paga como externo. Descuento y recargo se combinan: el servicio aplica en orden todas las estrategias que correspondan.
- **Faltan analizar** los patrones que el profesor mencionó en la última clase (unos ocho): ver cuáles aplicamos, dónde, y cuáles no y por qué. Patricio invita al resto a ver esa clase también, para no tener una sola mirada.

### 2.8 Panorama del proyecto

Patricio presentó el [panorama](./Panorama_Desarrollo_2026-10-13.md) y la [estructura del backend](./Estructura_Backend.md) (esta última útil para Matias):

- Arquitectura: hecha, pero el C4 y los ADR hay que **actualizarlos** a medida que se agregan cosas.
- Base de datos: faltan tablas de los módulos que no se hicieron.
- Frontend: ~5 %, solo cuatro pantallas. Cada API debería tener su pantalla.
- Tests: no preocupa tanto; las ramas nuevas ya salen con tests. Falta la parte de frontend.
- **Móvil: no es prioridad** mientras no esté terminada la aplicación web.
- Prioridad inmediata: corregir la seguridad de Clases y Membresías.

### 2.9 Mensajes de commit

Al hacer push, dejar un **comentario descriptivo de una o dos líneas** de lo que se hizo. Si el profesor pide el detalle de qué hizo cada uno, se puede armar a partir de esos mensajes.

### 2.10 Cierre

- Quedan pocas tareas de esta etapa; después hay que planificar la semana siguiente (lo haría Lucas o Matias, con la documentación que ya hay de lo que falta).
- Repasar la teoría: quien no estuvo en las clases o tiene dudas, que lea o pida que se lo expliquen.
- Comunicación por Discord y WhatsApp.

---

## 3. Próximos pasos

| Responsable | Acción |
|-------------|--------|
| Bruno (P2) | S4-T06 API de Canchas · S4-T01 Strategy · revisar correcciones de Membresías y Clases |
| Matias (P4) | Probar el frontend con el repo actualizado · README con los pasos para levantar el proyecto · prueba manual en `LOG.md` · cerrar tareas viejas ya hechas en Trello |
| Patricio (P1) | Analizar los patrones de la última clase y completar S4-T05 · cuentas Vercel y Render cuando haga falta · pasarle la grabación y este resumen a Lucas |
| Lucas (P3) | Completar `LOG.md` con las reuniones · avanzar pantallas conectadas a la API |
| Lucas o Matias | Planificar la semana siguiente |
| Todos | Mensajes de commit descriptivos · actualizar la rama con `desarrollo` antes de mergear · repasar teoría de patrones |

---

*Acta · Reunión 2026-10-13 · FitZone Sports · Programación V · UNER*
