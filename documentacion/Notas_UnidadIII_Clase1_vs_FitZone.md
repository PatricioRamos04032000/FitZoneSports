# Notas: Unidad III (patrones) frente a FitZone

**Autor:** Patricio Ramos (P1)  
**Para:** ajustar la [justificación de patrones (S4-T05)](./Justificacion_Patrones_Unidad_III.md)

**Fuentes:**
- Clase 1: [transcripción](./UnidadIII_Clase1_Patrones_de_Diseno.md) (PDF `UnidadIII_Clase1_Patrones_de_Diseño.pdf`) — anotada 2026-10-06
- Clase con ejemplos Java: [transcripción](./Patrones_Ejemplos_Java.md) (PDF `Patrones_Ejemplos_Java.pdf`) — anotada 2026-10-15

---

## 1. Puntos de la clase 1 que tocan lo ya hecho

| Tema | Qué dice el profesor | Impacto en FitZone |
|------|----------------------|--------------------|
| **Observer a mano** | En "Cuándo NO usar un patrón" pone como ejemplo "un Observer a mano habiendo eventos de dominio" en el framework. Contrapregunta: "¿qué me da mi versión que no me da la del framework?" (diap. 46) | **Resuelto:** la primera versión de S4-T02 tenía interfaces propias; se migró a `@nestjs/event-emitter` y la justificación explica por qué |
| **Strategy o Decorator** para el precio (RF-11) | Si las reglas son excluyentes, es Strategy. Si se **acumulan** sobre el mismo precio (descuento + recargo + IVA), en rigor es una cadena de decoradores. Acepta cualquiera de los dos nombres si la justificación lo explica (diap. 26 y 35) | **Resuelto (2026-10-15):** cada fórmula es Strategy; aplicarlas en orden es la cadena de políticas. Quedó en la §3 de la justificación |
| **Tres decisiones obligatorias del Observer** | Las pide "sí o sí" en el Trabajo Integrador (diap. 37): (1) ¿antes o después del commit?; (2) ¿mismo hilo u otro?; (3) ¿qué pasa si el proceso se cae entre el commit y el aviso? (bandeja de salida) | **Resuelto:** la justificación (sección Observer) y el diseño de S4-T02 responden las tres |

---

## 2. Listado sugerido — clase con ejemplos Java (2026-10-15)

Ocho patrones con demos en Java, “listos para llevar al proyecto”. Criterio de la clase: la defensa no es “qué patrones usaron”, sino **por qué este acá**, **qué pasa si dos lo hacen a la vez** y **qué hay que tocar para agregar uno nuevo**. Justificar un descarte también puntúa.

### 2.1 Los ocho del recorrido

| # | Patrón | Tipo | Ejemplo de la clase | En el proyecto (diap. 3) | Cuándo NO usarlo (diap. del patrón) |
|---|--------|------|---------------------|-------------------------|-------------------------------------|
| 1 | **Factory Method** | Creacional | Notificadores por canal (email, SMS, push) | Crear objetos según un tipo que llega como texto | Un solo canal a la vista; si solo cambian datos y no comportamiento, es una columna, no una subclase |
| 2 | **State** | Comportamiento | Documento borrador → revisión → publicado → archivado | Pedidos, turnos, tickets: entidades con ciclo de vida | Dos estados y una regla: un boolean se lee mejor; si los flujos se definen en runtime, van en una tabla |
| 3 | **Chain of Responsibility** | Comportamiento | Aprobación de compras por monto | Aprobaciones por nivel y filtros encadenados | Si solo cambia un número, alcanza una tabla; si la solicitud debe pasar por **todos** (validaciones), es un **pipeline**, no Chain clásico |
| 4 | **Strategy** | Comportamiento | Costo de envío intercambiable | Precios, tarifas y descuentos que cambian seguido | Una sola forma que nunca cambia; si las reglas **se combinan** (descuento + recargo), es una lista de políticas en orden |
| 5 | **Repository** | Aplicación | Biblioteca con préstamos simultáneos | Acceso a datos y dos usuarios sobre el mismo registro | No envolver Spring Data por envolver; el patrón no evita la carrera: la evita `@Version`, UNIQUE o un lock |
| 6 | **Adapter** | Estructural | Sensores ajenos (°F / XML → °C) | Pasarelas de pago y APIs externas | Si la API ajena ya habla tu idioma, el adaptador es una capa vacía; no poner reglas de negocio en el adaptador |
| 7 | **Observer** | Comportamiento | Estación meteorológica | Notificaciones, eventos de dominio y auditoría | Un único interesado fijo: llamada directa; **en Spring no a mano:** `ApplicationEventPublisher` + `@EventListener` |
| 8 | **Facade** | Estructural | Compra en tienda online (stock, envío, cobro, aviso) | El servicio que orquesta un caso de uso completo | Si solo reenvía a un único objeto, sobra; si crece hasta saber todo, es un God object: **una fachada por caso de uso** |

### 2.2 Cuatro más y dos advertencias (diap. 22)

| Patrón | Qué dice | Nota para FitZone |
|--------|----------|-------------------|
| **Builder** | Objetos con muchos campos opcionales (pedido, DTO de reporte, filtro). En el proyecto: Lombok `@Builder` o un record | Candidato al armar una Reserva |
| **Decorator** | Caché, log o reintentos alrededor de un repositorio o adaptador, sin tocarlos; se apilan en el orden que importa | También el matiz de precio: descuento + recargo acumulados |
| **Template Method** | Exportar reporte a CSV / PDF / Excel: mismo esqueleto, paso distinto por formato | Ya aparece en `SupabaseRepository`; candidato a comprobantes (RF-14) |
| **Command** | Acciones con deshacer, o tareas en cola para ejecutar / reintentar más tarde (p. ej. sin conexión) | Encaja con offline (Unidad VI), no con el MVP web |
| **Singleton** | **No escribirlo a mano.** Lo resuelve el contenedor (bean singleton por defecto) | Nest ya lo da; no armar `getInstance()` |
| **Abstract Factory** | **Solo si hay familias** de objetos que deben ir juntas. Sin familias, Factory Method alcanza | Descartar: una sola pasarela y un solo país |

### 2.3 Cómo se ve cada uno en un framework (diap. 21, Spring → Nest)

| Patrón | En Spring (clase) | Equivalente en FitZone / Nest |
|--------|-------------------|-------------------------------|
| Factory | `@Component` + `Map<String, Notificador>` | Registrar beans por canal, si se usa |
| State | Dominio puro; persistir el nombre del estado | Igual |
| Chain | Beans + `@Order` o `@Configuration` que arma la cadena | Guards o lista ordenada de validadores |
| Strategy | Cada estrategia `@Component` con nombre; el cotizador pide el `Map` | Providers Nest |
| Repository | Spring Data + `@Version` | `SupabaseRepository` + UNIQUE / funciones SQL con lock |
| Adapter | `@Component` por proveedor | Adaptador de pasarela mock |
| Observer | `ApplicationEventPublisher` + `@EventListener` | `@nestjs/event-emitter` + `@OnEvent` (**ya aplicado**) |
| Facade | `@Service` + `@Transactional` en el caso de uso | Un service por caso de uso (p. ej. `reservar`) |

### 2.4 Checklist de defensa (diap. 23)

Para cada patrón aplicado o descartado:
1. ¿Qué problema / cambio futuro absorbe?
2. ¿Qué archivos hay que tocar para agregar un caso nuevo?
3. ¿Qué pasa si dos usuarios lo hacen a la vez?
4. ¿Cómo se testea sin la base ni la API real?
5. ¿Qué alternativa se descartó, y por qué?
6. ¿Cuándo NO usarlo? (también es diseño)

Consigna de la clase: elegir **tres patrones** para defender en el ADR / justificación.

---

## 3. Listado de la clase 1 (referencia)

Lista más amplia que mencionó el profesor en la primera clase. Se mantiene como referencia; el listado operativo a cerrar es el de la sección 2.

| Patrón | Caso en FitZone según la clase 1 | Diap. |
|--------|----------------------------------|-------|
| **Strategy** | Precio de canchas (RF-11) | 32–35 |
| **Observer** | Aviso a la lista de espera al liberarse un cupo (RF-08) | 32, 36–37 |
| **Builder** | Armar una Reserva (muchos campos) | 13, 16 |
| **Factory Method** | Elegir el notificador según el canal del socio | 13–14 |
| **Adapter** | Pasarela de pago detrás de una interfaz del dominio | 24 |
| **Facade** | Caso de uso `reservar()` de canchas | 27 |
| **State** | Membresía, cancha, reserva | 40–41 |
| **Chain of Responsibility** | Validaciones previas a una reserva | 42 |
| **Template Method** | Emisión de comprobantes | 39 |
| **Composite** | Árbol red → región → sede → espacio (reportes) | 30 |
| **Abstract Factory** | Descartarlo y escribir por qué | 15 |

**Composite** no aparece en el recorrido de ocho de la clase con ejemplos Java; si no hay regiones en FitZone, sigue siendo candidato a descarte justificado.

---

## 4. Decisiones de patrón (borrador)

### 4.1 Factory Method para canales de notificación — **Descartado**

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

**Qué propone el profe:** Factory Method crea el notificador concreto a partir de un texto (`EMAIL`, `SMS`, `PUSH`, `WHATSAPP`): `fabrica.crear(canal).enviar(...)`. Sirve cuando el sistema elige **un** canal.

**Qué problema tenemos nosotros (RF-08):** al liberarse un lugar hay que avisar por **varios canales a la vez** (in-app siempre, log, email simulado si el socio lo activó). Mañana podrían sumarse SMS o WhatsApp como canales opcionales más, no como “elegir uno solo”.

**Por qué Observer ya lo resuelve:**
1. Un solo hecho de dominio (`lugar.liberado`) y varios interesados.
2. Cada canal es un observador con `@OnEvent`: decide solo si actúa (p. ej. email mira la preferencia).
3. Agregar SMS/WhatsApp = una clase nueva con `@OnEvent`; no se toca Clases ni el publicador (abierto/cerrado).
4. Coincide con la clase: en el framework no hacer Observer a mano; usamos `@nestjs/event-emitter`.

**Por qué Factory no conviene acá:**
1. Factory responde “¿qué **un** objeto creo según un tipo?”. Nosotros no elegimos un canal: repartimos el aviso a varios.
2. La diapositiva 6 dice no usarlo si hay un solo canal (o pocos fijos) y ninguno más a la vista: hoy no hay SMS/WhatsApp reales; el email es simulado.
3. Meter Factory ahora sería una capa más sin un `crear(canal)` que el negocio necesite.
4. Si más adelante el socio eligiera **un** canal principal externo, Factory podría vivir **dentro** de un observador de envío; el fan-out seguiría siendo Observer.

**Alternativa descartada:** `switch (canal)` en Clases o en un servicio de avisos → acopla el módulo de negocio a cada canal y obliga a tocarlo al agregar uno.

**Para la justificación (S4-T05):** quedó en la §4 de [Justificacion_Patrones_Unidad_III.md](./Justificacion_Patrones_Unidad_III.md).

### 4.2 State para la reserva de cancha — **Aplicar** (diseño)

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

State modela el ciclo de la **reserva**: pendiente de pago → confirmada → cancelada. Cada estado acepta o rechaza pagar y cancelar.

El mantenimiento **no** es un estado de la reserva: es un período (desde–hasta) de la cancha (RF-12). Disponible / reservada / mantenimiento en la grilla es una consulta que cruza reservas y bloqueos.

Quedó en la §5 de la justificación.

### 4.3 Chain of Responsibility — **Descartado**

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

No hay aprobaciones por monto. Las validaciones de una reserva son un pipeline (pasan todas), no “el primero que puede”. La autorización ya corta en cadena con `JwtAuthGuard` y `RolesGuard`; no se escribe una Chain propia.

Quedó en la §6 de la justificación.

### 4.4 Adapter para la pasarela — **Aplicar en M5** (diseño)

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

El proyecto se entrega con pasarela simulada y tiene que poder usar MercadoPago sin reescribir la reserva. `PasarelaPago` es la interfaz nuestra. El simulacro la implementa directo (no se lo envuelve: ya habla nuestro idioma). `AdaptadorMercadoPago` es el Adapter: traduce la API ajena.

Quedó en la §7 de la justificación.

### 4.5 Facade — **Aplicar en dos casos de uso** (diseño)

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

- `reservar()` de cancha: lock del turno, precio (Strategy), cobro (`PasarelaPago`) y State.
- Alta o `renovar()` de membresía: cerrar la anterior, cobrar el plan y activar solo si el pago aprueba.
- Inscripción a clase: queda afuera (una sola llamada SQL).

Quedó en la §8 de la justificación.

### 4.6 Builder — **Descartado** (tampoco se planifica)

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

La reserva, el filtro de la grilla y el comprobante no tienen combinaciones de campos opcionales. Los arma la fachada de una vez. Agregarlo después sería un refactor de ese único lugar, así que no se deja una clase preparada.

Quedó en la §9 de la justificación.

### 4.7 Decorator (GoF) — **Descartado**

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

No se implementa. El precio queda en la lista de Strategy. Candidato anotado, sin código: reintentos alrededor de `PasarelaPago` si MercadoPago falla por red (M5).

Quedó en la §10 de la justificación.

### 4.8 Template Method — **Ya aplicado**; comprobantes anotados

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

No se abre sección nueva. El esqueleto está en `SupabaseRepository`. El PDF de comprobante (cancha y membresía) queda para cuando existan los dos. Con uno solo, una función alcanza.

### 4.9 Command — **No implementado**; candidato a futuro

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

No se implementa porque no está definido el offline ni la app móvil. A futuro, la cola de check-in sin conexión (RNF-01, Unidad VI) es el caso. Quedó en la §11 de la justificación.

### 4.10 Singleton — **Descartado**

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

No se escribe `getInstance()`. Nest inyecta una sola instancia y los tests la reemplazan. Quedó en la §12 de la justificación.

### 4.11 Abstract Factory — **Descartado**

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

Una sola pasarela y un solo país. Las variaciones ya están en Adapter, Observer y Strategy. Quedó en la §13 de la justificación.

### 4.12 Composite — **Descartado**

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

No hay árbol red, región, sede y cancha. El total de la cadena es una consulta. Quedó en la §14 de la justificación.

### 4.13 Circuit Breaker — **Aplicar en M5** (solo MercadoPago)

**Fecha:** 2026-10-15 · **Decidido por:** Patricio (P1)

Envuelve la pasarela real. El simulacro y Supabase quedan afuera. Unos reintentos primero; si sigue fallando, se abre el circuito. Quedó en la §15 de la justificación.

---

## 5. Pendiente

Cerrar el resto patrón por patrón: **aplicamos / evaluamos / descartamos + por qué**, y actualizar [Justificacion_Patrones_Unidad_III.md](./Justificacion_Patrones_Unidad_III.md).
