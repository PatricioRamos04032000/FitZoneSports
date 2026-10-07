# Justificación de patrones de diseño — Unidad III (S4-T05)

**Proyecto:** FitZone Sports · Programación V · UNER  
**Responsable:** Patricio Ramos (P1)  
**Fecha:** 2026-10-06  
**Entregable:** Unidad III — código refactorizado con patrones + justificación

| Patrón | Dónde | Requisito | Estado |
|--------|-------|-----------|--------|
| [Repository](#1-repository--acceso-a-datos) | Toda la capa de datos del backend | ADR-006 | **Implementado** (S3-T11) |
| [Observer](#2-observer--lista-de-espera-de-clases) | Clases / lista de espera | RF-08 | **Implementado** (S4-T02) |
| [Strategy](#3-strategy--precio-de-canchas) | Canchas / precios | RF-11, RN-03 | **Diseñado**, implementación en S4-T01 |

Cada sección sigue el mismo orden: problema, por qué este patrón, alternativas descartadas, estructura, dónde está en el código, consecuencias y cómo se prueba.

---

## 1. Repository — Acceso a datos

### Problema

El backend lee y escribe en Supabase (PostgreSQL) con el cliente `@supabase/supabase-js`, sin ORM (ADR-006). Si cada servicio usa el cliente directamente:

- La lógica de negocio queda mezclada con detalles de PostgREST (`.from().select().eq()`), nombres de tablas y formato de errores.
- Cada servicio maneja los errores de Supabase a su manera. Antes del refactor, `SedesService` los convertía en un 500 genérico y **se perdía la causa real**.
- Para testear un servicio hay que simular la API encadenada del cliente.
- Cambiar de motor o de cliente obliga a tocar toda la lógica de negocio.

### Por qué Repository

Repository pone una capa que se comporta como una colección de objetos del dominio (`findAll`, `findById`, `crear`, `marcarLeida`) y oculta cómo se obtienen. Los servicios dependen de esa capa, no de Supabase.

> Repository no es uno de los 23 patrones GoF: proviene de *Patterns of Enterprise Application Architecture* (Fowler) y de DDD. La cátedra lo incluye en la Unidad III y lo pide la consigna (`BookingRepository`).

### Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Cliente Supabase en cada servicio | Es el problema descripto arriba |
| ORM (TypeORM / Prisma) | Descartado en ADR-006: el equipo decidió usar la API de Supabase |
| Un repositorio por tabla sin base común | Repite el manejo de errores y el log en cada uno |

### Estructura

```mermaid
classDiagram
    class SupabaseRepository~T~ {
        <<abstract>>
        #table: string
        +findAll() T[]
        +findById(id) T
        #from()
        #rpc(fn, args)
        #unwrap(resultado, operacion)
    }
    class SedesRepository { table = "sedes" }
    class NotificacionesRepository {
        table = "notificaciones"
        +crear(nueva)
        +findByPerfil(perfilId)
        +marcarLeida(id, perfilId)
    }
    class PreferenciasRepository { table = "perfiles" }
    class PerfilesRolRepository { table = "perfiles" }
    class SedesService
    class RepositoryError
    class RepositoryErrorFilter

    SupabaseRepository <|-- SedesRepository
    SupabaseRepository <|-- NotificacionesRepository
    SupabaseRepository <|-- PreferenciasRepository
    SupabaseRepository <|-- PerfilesRolRepository
    SedesService --> SedesRepository
    SupabaseRepository ..> RepositoryError : lanza
    RepositoryErrorFilter ..> RepositoryError : responde 500
```

- `SupabaseRepository<T>` resuelve lo común: `findAll`, `findById`, llamadas RPC y `unwrap`, que registra el error real en el log y lanza `RepositoryError`.
- Cada repositorio concreto define su tabla y sus consultas propias. `findAll` está escrito una vez en la base y cada subclase solo aporta `table`, que es la idea del **Template Method** (GoF).
- `RepositoryErrorFilter` convierte un `RepositoryError` no tratado en un 500 genérico, sin exponer detalles de la base al cliente.
- Los errores de negocio de las funciones SQL (`raise exception 'CLASE_LLENA'`) llegan como `RepositoryError` con su código, y el servicio los traduce a 404 o 409.

### Dónde está

- Base: `backend/src/supabase/supabase.repository.ts`, `repository.error.ts`, `repository-error.filter.ts`
- Concretos: `sedes/sedes.repository.ts`, `notificaciones/notificaciones.repository.ts`, `notificaciones/preferencias.repository.ts`, `auth/perfiles-rol.repository.ts`
- Guía para el equipo: [Guia_Patron_Repository.md](./Guia_Patron_Repository.md)

### Consecuencias

| Positivas | Negativas |
|-----------|-----------|
| Los servicios no conocen Supabase: un servicio de 3 líneas como `SedesService` | Una capa más para cada tabla nueva |
| Manejo de errores y log en un solo lugar | Las consultas complejas igual exigen conocer PostgREST dentro del repositorio |
| Servicios testeables con un mock simple del repositorio | `findAll`/`findById` heredados pueden no tener sentido en todas las tablas |
| Cambiar de cliente o de motor afecta solo a los repositorios | |

### Cómo se prueba

- `supabase.repository.spec.ts`: consulta la tabla correcta, `findById` devuelve `null` si no existe, `rpc` pasa los argumentos y un error de Supabase se convierte en `RepositoryError` y queda en el log.
- `sedes.service.spec.ts`: el servicio se prueba con el repositorio simulado.
- `test/sedes.e2e-spec.ts`: un error de Supabase responde 500 sin exponer el mensaje original.

---

## 2. Observer — Lista de espera de clases

### Problema

RF-08: si una clase está llena, el socio se anota en la lista de espera y, **cuando se libera un lugar, se le notifica**. La decisión D7 agrega que el socio tiene un plazo para confirmar, sin inscripciones automáticas, así que el aviso es indispensable.

El equipo decidió avisar por varios canales: in-app siempre, log, y email simulado si el socio lo activó. Si el módulo de Clases llamara a cada canal:

- Clases dependería de notificaciones, preferencias de perfil, email y log, que no son su responsabilidad.
- Agregar un canal (push, email real) obligaría a modificar Clases.
- Un canal que falla (p. ej. Supabase no responde al guardar la notificación) podría romper la cancelación que liberó el lugar.

### Por qué Observer

Observer define una relación uno a muchos: cuando el **sujeto** cambia de estado, avisa a todos sus **observadores** sin conocer qué hace cada uno. Clases solo publica "se liberó un lugar"; los canales se suscriben.

NestJS ya trae este mecanismo: **`@nestjs/event-emitter`**, el equivalente al `ApplicationEventPublisher` de Spring que usa la clase como ejemplo de Observer (diapositiva 36). Lo usamos en lugar de escribir el patrón a mano.

### Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Llamar a cada canal desde `ClasesService` | Acoplamiento descripto arriba |
| Observer GoF escrito a mano (interfaces propias `Subject` / `Observer`) | Fue la **primera versión**. Se reemplazó porque la clase marca como mala práctica "un Observer a mano habiendo eventos de dominio" en el framework (diapositiva 46): la versión propia no aportaba nada que la librería no diera, y obligaba a suscribir los observadores a mano |
| Trigger en la base que inserte la notificación | Sirve para in-app, pero no para log ni email, y saca lógica de negocio del backend |
| Cola de mensajes (Redis, RabbitMQ) | Sobredimensionado para el alcance del proyecto |

### Estructura

```mermaid
classDiagram
    class EventEmitter2 {
        <<@nestjs/event-emitter>>
        +emit(nombre, evento)
    }
    class ListaEsperaPublisher {
        +notificarLugaresLiberados(clase, esperas)
    }
    class InAppObserver {
        +update(evento) «@OnEvent»
    }
    class LogObserver {
        +update(evento) «@OnEvent»
    }
    class EmailSimuladoObserver {
        +update(evento) «@OnEvent»
    }
    class ClasesService {
        <<S3-T04>>
    }

    ClasesService --> ListaEsperaPublisher : publica lugar liberado
    ListaEsperaPublisher --> EventEmitter2 : emit(LUGAR_LIBERADO)
    EventEmitter2 ..> InAppObserver : notifica
    EventEmitter2 ..> LogObserver : notifica
    EventEmitter2 ..> EmailSimuladoObserver : notifica
    InAppObserver --> NotificacionesRepository
    EmailSimuladoObserver --> PreferenciasRepository
```

| Rol GoF | En el código |
|---------|--------------|
| Subject / ConcreteSubject (lista de observadores y `notify`) | `EventEmitter2`, provisto por la librería |
| `attach` | El decorador `@OnEvent(LUGAR_LIBERADO)`: la librería registra el método al arrancar la app |
| `notify` | `ListaEsperaPublisher.notificarLugaresLiberados()`, que hace un `emit` por cada espera |
| ConcreteObserver | `InAppObserver`, `LogObserver`, `EmailSimuladoObserver` |
| Estado notificado | `LugarLiberadoEvent` (espera, socio, plazo, clase), publicado con el nombre `LUGAR_LIBERADO` |

- La base decide **a quién** notificar: las funciones `cancelar_inscripcion` y `procesar_lista_espera` devuelven las esperas que pasaron a `notificado`. El backend decide **cómo**: eso es el Observer.
- El nombre del evento es la constante `LUGAR_LIBERADO`: un texto mal escrito compila igual y nadie recibe el evento.

### Decisiones de la diapositiva 37

| Decisión | Qué hacemos |
|----------|-------------|
| ¿Antes o después del commit? | **Después.** El evento se publica cuando la función SQL ya terminó, así que nunca se avisa de un lugar que no quedó reservado. |
| ¿Mismo hilo o asíncrono? | **Asíncrono** (`@OnEvent(..., { async: true })`). `notificarLugaresLiberados` vuelve enseguida: la respuesta al socio que canceló no espera a Supabase ni al email. |
| ¿Qué pasa si se cae a mitad? | **Se acepta perder el aviso** (sin outbox, fuera de alcance). El lugar igual queda reservado en `lista_espera`; si el socio no confirma, vence el plazo y pasa al siguiente. Si un observador falla, la librería registra el error (`suppressErrors`, activo por defecto) y los demás se ejecutan igual. |

### Dónde está

- `backend/src/notificaciones/`: `lista-espera.publisher.ts`, `lugar-liberado.event.ts`, `observers/`, `notificaciones.module.ts`
- `EventEmitterModule.forRoot()` en `backend/src/app.module.ts`
- Diseño completo e integración con Clases: [Diseno_Observer_S4-T02_Notificaciones.md](./Diseno_Observer_S4-T02_Notificaciones.md)

### Consecuencias

| Positivas | Negativas |
|-----------|-----------|
| Agregar un canal = una clase nueva con `@OnEvent`; ni el publicador ni Clases cambian (principio abierto/cerrado) | El orden entre observadores no está garantizado |
| Clases no depende de notificaciones ni de preferencias, ni de una lista de observadores | El flujo es menos directo de seguir: hay que buscar quién escucha `LUGAR_LIBERADO` |
| Un canal que falla no afecta a los demás ni a la operación de negocio | Una falla de notificación queda solo en el log (no hay reintentos) |
| Código de infraestructura mantenido por NestJS, no por el equipo | El evento se identifica con un texto: el compilador no detecta un nombre mal escrito (se mitiga con la constante) |
| Cada observador se prueba por separado | Los tests tienen que esperar a que terminen los observadores asíncronos |

### Cómo se prueba

- `lista-espera.publisher.spec.ts`: con la librería real, cada espera llega como evento a los tres observadores; si uno falla, los demás se ejecutan, el error queda en el log y el publicador no falla.
- `observers/observers.spec.ts`: in-app guarda la notificación con los datos para confirmar; el email simulado respeta la preferencia del perfil.
- `test/notificaciones.e2e-spec.ts`: en la app completa, los observadores registrados con `@OnEvent` guardan la notificación.
- Prueba de punta a punta contra Supabase (2026-10-06, con la primera versión): clase llena, lista de espera, cancelación, notificación in-app y por email simulado, y confirmación del lugar.

---

## 3. Strategy — Precio de canchas

> **Estado:** diseño acordado en [S4-T09](./Propuesta_Reglas_Negocio_S4-T09.md). Implementación a cargo de Bruno Conti en S4-T01. Completar la sección "Dónde está" y "Cómo se prueba" al integrarla.

### Problema

RF-11: el precio de una cancha es el precio estándar, con **descuento de socio** y **recargo en horario pico**. Según S4-T09:

- El descuento de socio (15% por defecto) lo configura el Gerente Central para toda la cadena.
- El recargo, el horario y los días pico los configura cada sede.
- Un socio con cuota vencida paga como externo (RN-03).
- Descuento y recargo se combinan (P4).

Resolverlo con condicionales en el servicio de reservas (`if (esSocio) … if (esPico) …`) concentra todas las reglas en un método que crece con cada regla nueva (p. ej. feriados o promociones) y es difícil de testear por partes.

### Por qué Strategy

Strategy encapsula cada algoritmo de cálculo en una clase con una interfaz común (`PricingStrategy`), y el contexto los usa sin conocer sus detalles. La consigna lo pide explícitamente: `StandardPricing`, `MemberDiscountPricing` y `PeakHourPricing`.

Como las reglas se combinan (P4), el servicio de precios no elige **una** estrategia: aplica en orden **todas las que corresponden**, y cada una recibe el precio que dejó la anterior.

### Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Condicionales en el servicio | Descripto arriba |
| Elegir una sola estrategia por reserva | No permite combinar descuento y recargo (P4) |
| Precio calculado en SQL | Las reglas de negocio quedarían fuera del backend y del patrón pedido |

### Estructura (propuesta)

```mermaid
classDiagram
    class PricingStrategy {
        <<interface>>
        +aplica(ctx) boolean
        +calcular(precio, ctx) number
    }
    class StandardPricing
    class PeakHourPricing
    class MemberDiscountPricing
    class PreciosService {
        -estrategias: PricingStrategy[]
        +calcular(ctx) PrecioCalculado
    }
    class ContextoPrecio {
        precioBase
        inicio
        esSocioActivo
        descuentoSocioPct
        pico: ConfiguracionPico
    }

    PricingStrategy <|.. StandardPricing
    PricingStrategy <|.. PeakHourPricing
    PricingStrategy <|.. MemberDiscountPricing
    PreciosService o-- PricingStrategy
    PricingStrategy ..> ContextoPrecio
```

| Rol GoF | Clase |
|---------|-------|
| Strategy | `PricingStrategy` |
| ConcreteStrategy | `StandardPricing`, `PeakHourPricing`, `MemberDiscountPricing` |
| Context | `PreciosService` |

### Consecuencias esperadas

| Positivas | Negativas |
|-----------|-----------|
| Una regla nueva (p. ej. feriados) es una clase nueva, sin tocar las demás | Más clases que un método con condicionales |
| Cada regla se prueba sola con los casos de S4-T09 | El orden de aplicación importa si se suman reglas no multiplicativas |
| Los parámetros (porcentajes, horarios) vienen de la base, no del código | |

### Casos de prueba acordados (base $20.000, valores por defecto)

| Cliente | Turno | Precio |
|---------|-------|--------|
| Externo | 17:00 | $20.000 |
| Externo | 19:00 | $24.000 |
| Socio activo | 17:00 | $17.000 |
| Socio activo | 20:00 | $20.400 |
| Socio con cuota vencida | 19:00 | $24.000 |

---

## 4. Otros patrones presentes en el código

No son el foco de la Unidad III, pero aparecen y conviene nombrarlos en la defensa:

| Patrón | Dónde |
|--------|-------|
| **Template Method** (GoF) | `SupabaseRepository<T>`: `findAll`/`findById` en la base, cada subclase aporta la tabla |
| **Inyección de dependencias** | Todo el backend (NestJS): servicios, repositorios, observadores |
| **Cadena de guards** | `JwtAuthGuard` → `RolesGuard` (`@RequiereRol`): cada uno valida algo y corta la cadena si falla, en el espíritu de **Chain of Responsibility** |
| **Decorator** (de TypeScript, no el GoF) | `@RequiereRol`, `@CurrentUser`: agregan comportamiento declarativo a controllers |
| **BFF** (arquitectura) | El frontend solo habla con Nest; Nest es la única puerta a Supabase (ADR-005) |

**Circuit Breaker**, mencionado por el docente, no se aplicó todavía. El candidato natural es la pasarela de pago simulada (M5).
