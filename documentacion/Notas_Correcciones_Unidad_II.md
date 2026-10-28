# Correcciones pendientes — Unidad II

Notas de la revisión contra la clase de frameworks (Unidad II, clase 1). Cada ítem queda para corregir; todavía no está aplicado.

**Fuente de la clase:** `Unidad II - Clase 1 - Frameworks.pdf`, diapositivas 25, 26 y 27 (licencia y gobernanza, matriz ponderada, spike y ADR).

---

## 1. El ADR de frameworks no registra licencia, gobernanza, versión, EOL ni plan de actualización

**Estado:** pendiente de corregir  
**Dónde:** [ADR-003](./adr/ADR-003-stack-nestjs-react.md). El [stack](./Stack_Tecnologico_y_Herramientas.md) repite la elección y tampoco lo tiene. La plantilla del [índice de ADR](./ADR_Indice.md) no pide estos campos.

**Qué pide la clase.** En el ADR de selección conviene registrar explícitamente:

- la licencia;
- la entidad que gobierna el proyecto;
- la fecha de EOL de la versión adoptada;
- el plan de actualización.

Además, la decisión tiene que decir qué se elige y en qué versión exacta, y conviene una fecha de revisión atada al EOL de esa versión (diapositiva 27).

**Qué hay hoy.** El ADR-003 (aceptado, 2026-08-25) elige NestJS, React y TypeScript, y descarta Spring Boot, Vue, Express, Next.js y adelantar la app móvil. No nombra versión, licencia, entidad que gobierna, EOL ni plan de actualización.

La palabra "integridad" del ADR-002 es la consistencia de pagos y canchas, no la gobernanza de los frameworks. En la clase el término es **entidad que gobierna el proyecto**.

**Versiones que ya usa el código** (para completar el ADR; no están escritas ahí):

| Pieza | Dónde está declarada |
|-------|----------------------|
| NestJS 12 (`@nestjs/common` y el resto del paquete, `^12.0.1`) | `backend/package.json` |
| React 19 (`react` y `react-dom`, `^19.2.8`) | `frontend/package.json` |
| TypeScript 6 (`~6.0.2`, solo en el frontend) | `frontend/package.json` |

Al corregir, completar licencia, entidad que gobierna, EOL y plan de actualización de NestJS, React y TypeScript, y fijar la versión exacta más una fecha de revisión.

---

## 2. El ADR de frameworks no adjunta la matriz ponderada de alternativas

**Estado:** pendiente de corregir  
**Dónde:** [ADR-003](./adr/ADR-003-stack-nestjs-react.md), sección «Alternativas consideradas».

**Qué pide la clase.** Diapositiva 26: una matriz con pesos definidos antes de puntuar, escala 1–5, una columna por alternativa y el total ponderado. El ejemplo de la cátedra compara Spring Boot, Quarkus y NestJS. Diapositiva 27: las alternativas del ADR van con esa matriz adjunta. La matriz no decide sola; hace explícito el razonamiento.

**Qué hay hoy.** El ADR-003 nombra las alternativas en prosa y dice por qué se descartan: Spring Boot, Vue, Express, Next.js y adelantar la app móvil. No hay criterios, pesos ni puntajes. El documento de stack tampoco tiene la matriz.

---

## 3. El frontend no usa TanStack Query, y esa librería no cubre el estado de cliente

**Estado:** pendiente de corregir  
**Dónde:** `frontend/package.json` y las pantallas. La decisión de estado sigue abierta en [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) y en S4-T04 del [plan](./Plan_Trabajo_2_Semanas.md) (Zustand o Context, a cargo de Lucas, por hacer).

**Qué pide la clase.** TanStack Query es la caché del estado de servidor: catálogo, pedidos, perfil, lo que viene de la API ([clase 2, diapositiva 45](./Unidad_II_Clase_2_Datos_y_APIs.md); [clase 1, diapositivas 43, 47 y 48](./Unidad_II_Clase_1_Frameworks.md)). El estado de cliente es otra cosa: `useState` si lo usa un solo componente, la URL si tiene que sobrevivir a un refresh, Context si cambia poco, Zustand o Jotai si cambia seguido y lo consumen muchos. La clase pide no guardar la respuesta HTTP en el store global.

**Qué hay hoy.** TypeScript es el lenguaje del front y del back. El recorrido de la diapositiva 45 no está: no hay tipos generados desde el OpenAPI (`openapi-typescript` u `orval`) ni `@tanstack/react-query`. No hay cliente HTTP. El único estado es `useState` en el formulario de login. Perfil y Canchas siguen con datos fijos. El stack menciona Zustand o Redux Toolkit para «estado global» y no separa estado de servidor y de cliente. Tampoco hay capa **ViewModel** (hooks por pantalla): quedó anotado como pendiente a futuro / a definir al implementar S3-T05 y S4-T12 en [Decisiones §4.2](./Decisiones_Pendientes_y_Cosas_a_Definir.md).

---

## 4. No hay N+1 por lazy/eager; la vista de cupos sí repite conteos por clase

**Estado:** anotado. No es el N+1 de un ORM. La vista `clases_con_cupo` conviene reescribirla con joins cuando el listado crezca.  
**Dónde:** [ADR-006](./adr/ADR-006-supabase-api-sin-orm.md). Consultas en `backend/src/**/**.repository.ts`. Vista en `supabase/migrations/20261005220000_membresias_clases.sql`.

**Qué pide la clase.** Diapositivas 17 y 18 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md): el N+1 aparece cuando un ORM carga la lista (1 consulta) y, al tocar una asociación lazy, dispara una consulta más por fila. Eager en todo lo reemplaza por consultas gigantes. La corrección es un join, un entity graph o una proyección, no «poner todo eager».

**Qué hay hoy.** No hay ORM, ni proxies, ni lazy ni eager. Cada caso de uso manda una sola consulta o un solo RPC: sedes, membresías, notificaciones, clases. Nest no recorre una lista y vuelve a consultar el detalle de cada fila.

Lo más parecido está en SQL, no en el ciclo de Java de la clase. `clases_con_cupo` es una sola vista, y por cada clase calcula tres subconsultas correlacionadas (`count` de inscriptos, de notificados vigentes y de la lista de espera). Con pocas filas no se nota. Con muchas clases de una sede, el costo crece con la cantidad de filas, que es el síntoma que describe la diapositiva 17. Un `LEFT JOIN` con `GROUP BY` lo deja en un solo plan.

La [guía de la Data API](https://supabase.com/docs/guides/api) dice que cada request REST se resuelve en **una sola sentencia SQL**. Un `.select()` nuestro es un viaje, no N. El costo de los tres `count` queda adentro de esa sentencia, porque viven en la definición de la vista. El embed de relaciones (punto 5) es la forma documentada de traer el detalle en esa misma sentencia, en lugar de consultar fila por fila desde Nest.

---

## 5. Documentar cómo se cubren las cuatro responsabilidades del ORM sin usarlo

**Estado:** investigado en la documentación de Supabase (2026-10-21). Falta pasarlo al ADR-006.  
**Fuentes:** [Data REST API](https://supabase.com/docs/guides/api) · [Joins y tablas anidadas](https://supabase.com/docs/guides/database/joins-and-nesting) · [`select`](https://supabase.com/docs/reference/javascript/select) · [Generar tipos TypeScript](https://supabase.com/docs/guides/api/rest/generating-types)  
**Dónde:** [ADR-006](./adr/ADR-006-supabase-api-sin-orm.md) dice que no hay ORM y que el tipado es con interfaces. No recorre las cuatro responsabilidades de la diapositiva 9 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué dice la documentación.** La Data API es PostgREST, una capa fina sobre Postgres. El esquema se refleja solo: al cambiar una tabla, la API cambia. Cada request se resuelve en una sola sentencia SQL. Las claves foráneas se detectan y se pueden anidar en el `select` (`instruments ( id, name )`), con semántica de left join; `!inner` pide inner join. También expone vistas y funciones. El cliente se puede usar desde el navegador; en FitZone no: el BFF (ADR-005) es la única puerta.

**Qué pide la clase y cómo queda con esa API.**

| Responsabilidad | Qué aporta Supabase | Qué hace el proyecto |
|-----------------|---------------------|----------------------|
| Mapeo | El JSON usa los nombres de columna. Una FK se puede pedir anidada. [`supabase gen types`](https://supabase.com/docs/guides/api/rest/generating-types) arma `Row`, `Insert` y `Update` desde el esquema, y `QueryData` tipa el `select` anidado. Una vista puede marcar columnas como nulas de más: se corrige con `MergeDeep` | Interfaces escritas a mano (`Clase`, `Sede`). `unwrap` castea el JSON. No generamos `database.types.ts` ni usamos `QueryData` |
| Gestión de identidad | No hay Identity Map ni sesión de objetos. La identidad es la clave primaria de la fila | Dos `findById` del mismo id son dos objetos. La identidad se compara por `id`. Un `Set` de JavaScript no lo hace solo: compara la referencia, así que las dos lecturas entran las dos. Si la fila no tuviera `id`, la convención pasa a otra clave única (`dni` en perfiles); sin ninguna clave, dos lecturas no se pueden reconocer como la misma fila |
| Persistencia transparente | No hay dirty checking. Crear, actualizar y borrar son requests distintos (`insert`, `update`, `delete`). Una función de Postgres se llama con `rpc` y corre en el servidor | Igual que la API: nada se guarda solo. `inscribir_en_clase` y `cancelar_inscripcion` concentran la escritura de varios pasos |
| Generación de consultas | `.select().eq().order()` es un request y, según la guía, una sentencia SQL. El embed de una FK entra en esa misma sentencia. La vista y el `rpc` también son un request cada uno | Los listados son un `select`. El cupo, la inscripción y la cancelación son SQL escrito en las migraciones |

Al corregir, dejar este cuadro en el ADR-006 citando la guía. El N+1 de la diapositiva 17 aparecería si Nest listara clases y después consultara cada inscripción: cada llamada sería otra sentencia. El embed, o la vista, lo evitan. La vista actual ya es una sola sentencia; el costo que queda es el de los tres `count` correlacionados adentro de esa sentencia.

---

## 6. El acceso a datos es Data Mapper, no Active Record

**Estado:** anotado para escribirlo en la justificación de Repository. El código ya está de ese lado.  
**Dónde:** [justificación, sección Repository](./Justificacion_Patrones_Unidad_III.md). Diapositiva 10 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué pide la clase.** Active Record: el objeto conoce su persistencia (`pedido.save()`). Data Mapper: una capa media entre el dominio y la base (`repo.findById`, y la capa es quien escribe). El dominio no sabe cómo se guarda.

**Qué hay hoy.** `Clase`, `Sede` y `Membresia` son interfaces sin métodos de persistencia. Quien lee y escribe es `SupabaseRepository` y cada repositorio de dominio (`findAll`, `findById`, `insert`, `update`, `rpc`). El servicio pide y no arma el `.from()`. Es el lado Data Mapper de la diapositiva. En el catálogo de Fowler esa capa está nombrada como Repository, que es el patrón que ya justifica S3-T11. No hay una clase Mapper separada del repositorio: las dos responsabilidades viven en `SupabaseRepository`.

---

## 7. No hay estrategia de herencia en la base

**Estado:** anotado. No hace falta elegir SINGLE_TABLE, JOINED ni TABLE_PER_CLASS.  
**Dónde:** migraciones en `supabase/migrations/` y `supabase/tests/00_fase_a_simulada.sql`. Diapositiva 16 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md): antes de mapear una jerarquía, preguntar si el polimorfismo hace falta en la persistencia o solo en el dominio.

**Qué hay hoy.** No hay tablas de subtipos ni columna discriminadora de una jerarquía JPA. Las variantes son un valor en la misma fila:

- `perfiles.rol` (`socio`, `externo`, `recepcionista`, `gerente`)
- `membresias.plan` y `membresias.estado`; `planes_membresia` guarda duración y precio de cada plan, no una subclase
- `clases.tipo` es texto; `clases.estado`, `inscripciones_clase.estado` y `lista_espera.estado` son enums
- `notificaciones` tiene `tipo_notificacion`

El `extends` de TypeScript no es esa herencia: los repositorios extienden `SupabaseRepository`, `ClaseConCupo` agrega columnas de la vista, y las estrategias de precio implementan una interfaz. Ese polimorfismo vive en el código, no en el esquema.

**Si hiciera falta persistir una jerarquía.** La Data API no elige `SINGLE_TABLE`, `JOINED` ni `TABLE_PER_CLASS`. PostgREST expone tablas, vistas y claves foráneas; la jerarquía hay que escribirla en SQL.

| Forma en SQL | Qué ve la API |
|--------------|----------------|
| Una tabla y una columna que dice la variante (enum o texto). Una vista por variante si hace falta filtrar | Un endpoint por tabla o vista. Es lo más cercano a `SINGLE_TABLE`, y es lo que ya hacen `rol`, `plan` y `estado` |
| Una tabla por tipo, unidas por clave primaria / foránea | El [embed de la FK](https://supabase.com/docs/guides/database/joins-and-nesting): `select('*, hijo(*)')`. Es lo más cercano a `JOINED`. La API no arma la jerarquía sola |
| Una tabla completa por tipo concreto, sin tabla padre, más una vista `UNION ALL` | Un endpoint por tabla y otro por la vista. Es lo más cercano a `TABLE_PER_CLASS`. La consulta polimórfica es la vista que escribimos |

Postgres tiene `INHERITS`, pero no reemplaza esas tres estrategias. Un `SELECT` del padre incluye las filas de los hijos; un `INSERT` entra solo en la tabla nombrada y no se reparte según el subtipo. Las claves primaria, única y foránea no se heredan. PostgREST, por eso, no detecta una FK declarada solo en el padre y responde `PGRST200` al intentar anidarla ([issue 3306](https://github.com/PostgREST/postgrest/issues/3306)). La [documentación de Postgres](https://www.postgresql.org/docs/current/ddl-inherit.html) describe esos límites.

---

## 8. El detalle de una entidad compuesta se pide en el select o se declara en SQL

**Estado:** anotado. Hoy no se usa.  
**Dónde:** los repositorios hacen `.select('*')` o leen la vista `clases_con_cupo` (solo conteos, no las filas hijas).

**Qué ofrece la API.** No hay un eager global. Cada request elige la forma, y sigue siendo una sola sentencia SQL.

- **Clave foránea, en el `select`.** PostgREST detecta la FK. Para una clase con sus inscripciones: `.from('clases').select('*, inscripciones_clase(id, perfil_id, estado)')`. Sin hijas, la lista viene `[]`. Guía: [joins y tablas anidadas](https://supabase.com/docs/guides/database/joins-and-nesting).
- **Vista.** La composición queda en SQL y el cliente hace `select('*')`. Es lo que ya hace `clases_con_cupo` para los conteos.
- **Relación calculada.** Si no hay FK (vista compleja, tabla foránea), una función `stable` que devuelve `setof` declara la relación y se embebe igual. Documentación: [computed relationships](https://docs.postgrest.org/en/stable/references/api/resource_embedding.html).

Pedir el padre y después cada hijo en un bucle vuelve al N+1 del punto 4.

**Cierre (2026-10-22).** Los puntos 4, 5, 7 y 8 se cierran sin un ORM dedicado. Lo único que un ORM aportaría y la Data API no tiene es un contexto de persistencia: Identity Map y dirty checking. El ADR-006 ya lo deja afuera. Las escrituras siguen siendo `insert`, `update`, `delete` o `rpc`.

| Punto | Sin ORM |
|-------|---------|
| 4. N+1 | No hay lazy. El costo de `clases_con_cupo` se reescribe en la vista, con `LEFT JOIN` y `GROUP BY` |
| 5. Mapeo | `supabase gen types` (`Row`, `Insert`, `Update`, `QueryData`) |
| 5. Identidad | La clave primaria. Dos lecturas son dos objetos; se comparan por `id` |
| 5. Persistencia transparente | No se busca. Cada escritura es un request |
| 5. Consultas | `.select()` / embed, vistas y `rpc`. Cada request es una sentencia |
| 7. Herencia | No hay jerarquía que mapear. Si aparece, es SQL: columna, tablas unidas por FK, o vista `UNION ALL` |
| 8. Detalle compuesto | Embed de la FK en el `select`, una vista, o una relación calculada |

---

## 9. La API responde JSON; la interfaz uniforme de la clase está a medias

**Estado:** pendiente de alinear con el checklist de la diapositiva 37 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).  
**Dónde:** controladores en `backend/src`. El filtro `RepositoryErrorFilter` arma el 500.

**Qué pide la clase.** La interfaz uniforme (diapositiva 23) es identificación por URI, manipulación por representaciones, mensajes autodescriptivos e hipermedia. «HTTP con JSON» no alcanza. El piso que pide el checklist es el nivel 2 de Richardson: verbos con su semántica, códigos de estado, `application/problem+json` y, si el recurso se edita desde más de un lugar, ETag. El nivel 3 (enlaces HAL) no es obligatorio.

**Qué hay hoy.** El cuerpo es JSON (`Content-Type: application/json`). No hay otra representación: ni `problem+json`, ni HAL, ni PDF. Swagger describe la API; no es parte de la respuesta de cada recurso.

- Hay recursos con verbo (`GET /sedes`, `POST /membresias`, `DELETE /clases/inscripciones/:id`, `PATCH /notificaciones/:id/leida`) y códigos de Nest (`400`, `401`, `404`, `409`).
- El alta no manda `201` con `Location`. El `POST /auth/login` queda en 201 porque Nest trata todo POST como creado. El `DELETE` de una inscripción responde 200, no 204.
- El error es `{ statusCode, message, error }`, el formato de Nest, no RFC 9457.
- No hay `_links`, ETag ni `Idempotency-Key`.
- Algunas rutas nombran la operación (`/auth/login`, `/membresias/activas/:perfilId`, `/:id/leida`).

---

## 10. De los cinco verbos de la clase faltan PUT y el conjunto completo en cada recurso

**Estado:** anotado. No hay que agregar verbos solo para completar la tabla.  
**Dónde:** controladores en `backend/src`. Diapositiva 26 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md): GET, POST, PUT, PATCH y DELETE, cada uno con su semántica.

**Qué hay hoy.**

| Verbo | Dónde aparece |
|-------|----------------|
| GET | `/`, `/health`, `/auth/me`, `/sedes`, `/membresias`, `/clases`, `/notificaciones` |
| POST | `/auth/login`, `/membresias`, `/clases/inscripciones` |
| PATCH | `/notificaciones/preferencias`, `/notificaciones/:id/leida` |
| DELETE | `/clases/inscripciones/:id` |
| PUT | En ningún controlador |

Ningún recurso tiene los cinco. Sedes es solo lectura. Membresías no se actualizan ni se borran por la API. Clases no tiene reemplazo ni modificación parcial. Notificaciones no se crean ni se borran por la API: las crea el observer. PUT (reemplazo total) no tiene un caso de uso todavía.

---

## 11. No hay un endpoint de líneas de detalle por entidad

**Estado:** anotado. Las filas hijas existen en SQL y no se listan por la API.  
**Dónde:** `backend/src/clases/clases.controller.ts`. Diapositiva 25 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md): si el detalle pertenece al padre, la ruta es `/clases/{id}/inscripciones`, no un listado suelto.

**Qué hay hoy.** `GET /clases?sedeId=` devuelve cada clase con `cupos_libres` y `en_espera`. No devuelve las inscripciones ni la lista de espera. Crear una inscripción es `POST /clases/inscripciones` con `claseId` en el cuerpo. Cancelarla es `DELETE /clases/inscripciones/:id`. No existe `GET /clases/:id/inscripciones` ni `GET /clases/:id/lista-espera`.

Membresías, sedes y notificaciones tampoco tienen un subrecurso de líneas. Una membresía es una fila. Las notificaciones se listan por usuario (`GET /notificaciones`), no como detalle de otra entidad. Canchas y comprobantes todavía no tienen API.

---

## 12. Los códigos HTTP salen de cada servicio; falta una sola capa que los unifique

**Estado:** pendiente. La capa ya tiene un lugar: el filtro global. Hoy no mapea códigos de negocio.  
**Dónde:** `backend/src/supabase/repository-error.filter.ts` (registrado en `supabase.module.ts`). Los servicios tiran `NotFoundException`, `ConflictException`, `BadRequestException` o un `Error` pelado. Diapositivas 28 y 29 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué hay hoy.** El éxito es el default de Nest: GET y PATCH y DELETE en 200, POST en 201. No hay `@HttpCode`, ni `Location`, ni 204. El 401 lo tiran `JwtAuthGuard` y el login. El 403 existe en `RolesGuard`, pero ningún endpoint usa `@RequiereRol`. Lo que no es una `HttpException` y tampoco un `RepositoryError` cae en el filtro por defecto de Nest (500). `RepositoryError` siempre es 500, aunque el SQL sea un duplicado.

**Formato a usar.** El de la diapositiva 29: RFC 9457 Problem Details, `Content-Type: application/problem+json`. El cliente decide por `type`. `title` y `detail` son para la persona. No se filtran stack traces ni SQL. Campos extra van en el mismo JSON.

```json
{
  "type": "https://fitzone.dev/errores/clase-llena",
  "title": "Clase llena",
  "status": 409,
  "detail": "La clase ya alcanzó su capacidad máxima",
  "instance": "/clases/inscripciones"
}
```

Hoy el cuerpo es el de Nest: `{ "statusCode", "message", "error" }` con `Content-Type: application/json`. El filtro global es el lugar para emitir Problem Details en todos los errores. Los controladores no arman el JSON. El éxito sigue aparte: 201 con `Location` en el alta, 204 en el DELETE.

---

## 13. De las cabeceras de la clase no implementamos ninguna

**Estado:** anotado.  
**Dónde:** no hay `@Header` ni `setHeader` en `backend/src`. CORS está en `backend/src/cors.ts`. El token entra por `Authorization` en `jwt-auth.guard.ts`. Diapositiva 30 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué hay hoy.**

| Cabecera de la clase | En la API |
|----------------------|-----------|
| Accept / Content-Type | No negociamos `Accept`. Express pone `Content-Type: application/json` al serializar |
| Location | No se envía en el 201 |
| ETag / If-None-Match | No lo diseñamos. Express, por defecto, puede poner un ETag débil del cuerpo (`W/"…"`). No está atado a una versión de la fila |
| ETag / If-Match | No. Nadie exige `If-Match` ni responde 412 |
| Cache-Control | No |
| Idempotency-Key | No |
| Retry-After | No |

Lo que sí circula: el cliente manda `Authorization: Bearer` en las rutas con `JwtAuthGuard`. `enableCors` responde `Access-Control-Allow-Origin` según `CORS_ORIGIN` (por defecto `http://localhost:5173`).

---

## 14. Los listados no paginan: ni offset ni cursor

**Estado:** anotado.  
**Dónde:** `GET /sedes`, `GET /membresias`, `GET /clases`, `GET /notificaciones`. Diapositiva 32 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué hay hoy.** Ningún endpoint acepta `page`, `size`, `limit`, `offset` ni `cursor`. La colección vuelve entera.

| Listado | Filtro | Orden |
|---------|--------|-------|
| `GET /sedes` | Ninguno | El de la base |
| `GET /membresias` | Ninguno | El de la base |
| `GET /clases?sedeId=` | `sedeId` obligatorio | `inicio`, fijo en el repositorio |
| `GET /notificaciones` | El usuario del token | `created_at` descendente, fijo en el repositorio |

No hay `?sort=` ni lista blanca de campos. El cliente no elige la página ni el cursor.

---

## 15. Cancelar no es un subrecurso

**Estado:** anotado.  
**Dónde:** `DELETE /clases/inscripciones/:id` en `backend/src/clases/clases.controller.ts`. La función `cancelar_inscripcion` actualiza la fila. Diapositiva 33 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué pide la clase.** Si la acción tiene motivo, autor y fecha, conviene `POST /inscripciones/{id}/cancelacion`: el hecho queda como recurso, consultable. La alternativa es un `PATCH` con el estado nuevo. Una operación larga usa `202` y `Location`.

**Qué hay hoy.** La ruta es un `DELETE`. En SQL la fila no se borra: pasa a `estado = 'cancelada'`, con `cancelada_en` y `cancelacion_tardia`. El cliente manda `inicioClase` en el cuerpo del DELETE para que Nest calcule si fue tardía. No hay una fila «cancelación» ni `POST .../cancelacion`. No hay API de reservas de cancha, así que esa cancelación tampoco existe. `confirmar_lugar_espera` está en SQL y no tiene ruta.

---

## 16. La API no tiene estrategia de versionado

**Estado:** anotado. Hay que elegir una antes de que existan clientes que rompan.  
**Dónde:** las rutas son `/sedes`, `/clases`, `/membresias`, `/notificaciones`, `/auth`. `backend/src/swagger.ts` pone `setVersion('0.0.1')`. Diapositiva 34 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué pide la clase.** Una de cuatro: por URI (`/v2/pedidos`), por cabecera (`X-API-Version`), por media type (`Accept: application/vnd.tienda.v2+json`) o por query (`?version=2`). Agregar un campo opcional no obliga a versionar. Cambiar un tipo o quitar un campo sí. La versión del documento OpenAPI no es la versión de la API.

**Qué hay hoy.** Ninguna de las cuatro. No hay prefijo `/v1` ni `enableVersioning`. El `0.0.1` de Swagger es la versión del documento. `/auth/v1` y `/rest/v1` son de Supabase, no de nuestra API.

---

## 17. De los seis puntos de seguridad de la API, pocos están cerrados

**Estado:** anotado.  
**Dónde:** diapositiva 35 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md). Guards en `backend/src/auth`. CORS en `backend/src/cors.ts`.

| Punto | Qué hay |
|-------|---------|
| Transporte | La contraseña va en el cuerpo del `POST /auth/login`, no en la URI. La app no fuerza TLS ni manda HSTS: eso quedaría en el hosting |
| Autenticación | El login delega en Supabase Auth y devuelve el JWT. `JwtAuthGuard` lo valida. No hay endpoint de refresh. El guard solo está en `/auth/me` y `/notificaciones` |
| Autorización | `RolesGuard` no se usa. En notificaciones el perfil sale del token. En clases y membresías el `perfilId` lo manda el cliente: se puede operar sobre otro usuario |
| Validación | No hay `ValidationPipe` global. `POST /membresias` copia el cuerpo a la fila. `LoginDto` solo documenta Swagger; no valida el tipo |
| Límites | No hay rate limit, ni `429`, ni tope de filas en los listados. El tamaño del cuerpo es el default de Express |
| Exposición | CORS por origen (`CORS_ORIGIN`, default `http://localhost:5173`). `RepositoryError` responde un mensaje genérico. `POST /membresias` arma el 500 con el texto de la base. Varios `select('*')` devuelven la fila completa |

---

## 18. El OpenAPI no sigue las prácticas de `components` y `$ref`

**Estado:** anotado.  
**Dónde:** DTOs con `@ApiProperty` y `@ApiOkResponse({ type })`. No hay un `openapi.yaml` escrito a mano. Diapositiva 42 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué pide la clase.** Un esquema por concepto, reutilizado con `$ref`. `readOnly` / `writeOnly` para separar lo que se lee de lo que se envía. Restricciones reales (`enum`, `minimum`, `pattern`). Un ejemplo por operación. Una respuesta de error compartida por todas las operaciones.

**Qué hay hoy.** Nest arma un componente cuando un controlador cita una clase. `NotificacionDto` y `PreferenciasNotificacionDto` se reutilizan en más de una ruta, así que ahí el documento sale con `$ref`. `MeResponseDto` extiende `AuthUserDto`.

No está cubierto:

- Clases y membresías no declaran esquema: la respuesta no entra a `components`.
- `LoginResponseDto.user` y `NotificacionDto.datos` son `additionalProperties: true`, no un esquema del dominio.
- No hay `readOnly` ni `writeOnly`. El mismo `PreferenciasNotificacionDto` sirve para leer y para escribir.
- Hay `enum` en `tipo` y en `rol`, y `format: uuid`. No hay `minimum` ni `pattern`.
- No hay una respuesta `application/problem+json` en `components/responses` referenciada por todas las operaciones.

---

## 19. Para gobernar el contrato faltan el archivo publicado y los controles del pipeline

**Estado:** anotado. No se arma todavía.  
**Dónde:** Swagger se genera al levantar Nest (`/api/docs`). No hay `openapi.yaml` en el repo ni workflows en `.github`. Diapositiva 46 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md).

**Qué hay que tener.**

1. **Guía de estilo.** Nombres en plural, fechas ISO, error RFC 9457, forma de la paginación. Un documento corto del equipo.
2. **El contrato como archivo.** Exportar el OpenAPI que ya genera Nest y versionarlo. Hoy solo existe con el servidor prendido. Sin ese archivo no hay nada que lintar ni que comparar.
3. **Spectral.** Un `.spectral.yaml` con las reglas de la guía, corrido en cada pull request.
4. **Detección de cambios incompatibles.** Comparar el contrato del PR contra el de `desarrollo` (oasdiff u equivalente) y fallar el build si rompe. Rompe quitar un campo, cambiar un tipo o volver obligatorio un campo opcional. No rompe agregar un campo opcional, un endpoint o un valor de enum que el cliente ya tolera.
5. **Versión semántica del contrato**, distinta del `0.0.1` de Swagger y de la versión de la API (punto 16): mayor si rompe, menor si agrega, parche si corrige.
6. **Contract testing** (Pact). La diapositiva lo deja para la Unidad V. Hace falta un consumidor real; el front todavía no llama a la API.

El código sigue siendo la fuente mientras usemos code-first. La gobernanza mira el archivo exportado, no pide reescribir los controladores en YAML.

---

## 20. La grilla de canchas no existe; Prototype no es la solución elegida

**Estado:** anotado.  
**Dónde:** `frontend/src/pages/Canchas/Canchas.tsx`. La decisión de la grilla está en la [justificación de State](./Justificacion_Patrones_Unidad_III.md). La clase de patrones nombra Prototype para «generar la grilla semanal copiando la plantilla de la semana tipo».

**Qué hay hoy.** La pantalla no es una grilla de la semana. Tiene dos listas fijas (sede y una hora) y tres canchas con texto escrito a mano: Disponible, Ocupada y Mantenimiento. No llama a la API. No hay tablas de canchas ni de reservas.

**Qué quedó decidido.** Cada celda sale de una consulta que cruza, para esa cancha y esa hora, las reservas confirmadas y los bloqueos de mantenimiento. Los turnos son de 60 minutos en hora en punto (propuesta P2). No se clona un objeto «semana tipo».

---

## 21. El balanceador de carga queda fuera del proyecto

**Estado:** anotado. No es una corrección de código.  
**Dónde:** diapositiva 23 de la [clase 2](./Unidad_II_Clase_2_Datos_y_APIs.md), restricción «sistema en capas». Despliegue en [ADR-004](./adr/ADR-004-hosting-vercel-render-supabase.md).

**Qué dice la clase.** El cliente no distingue si habla con el servidor, con un proxy, con un balanceador o con un gateway. El balanceador reparte las peticiones entre varias copias del mismo servicio. Para que eso funcione, cada petición tiene que traer todo lo que hace falta (restricción «sin estado»): el JWT, no una sesión guardada en la memoria de una instancia.

**Qué hay en FitZone.** No hay balanceador en el repositorio: no hay Nginx, ni `Dockerfile`, ni varias instancias declaradas. El ADR-004 deja un solo proceso Nest en Render, el front en Vercel y la base en Supabase, y descarta un VPS propio donde el equipo administraría Nginx. Lo que sí prepara la app es el requisito: la identidad viaja en el JWT de Supabase, así que cualquier copia de Nest podría atender el request. Hoy hay una sola copia. Si más adelante Render levanta más de una, el reparto lo hace la plataforma, no un módulo del backend.

---

## 22. Hay controller y service en los módulos de negocio; el dominio no es una capa propia

**Estado:** anotado.  
**Dónde:** diapositiva 30 de la [clase 1](./Unidad_II_Clase_1_Frameworks.md). La estructura que usa el repo está en [Estructura del backend](./Estructura_Backend.md), sección 3.

**Qué pide la clase.** El recorrido de una petición separa infraestructura (servidor HTTP, filtros, router, binding, serialización) de lo propio: el controlador traduce el pedido al lenguaje del dominio, el servicio de aplicación orquesta el caso de uso, y el repositorio accede a los datos. Esa frontera tiene que verse en el código.

**Qué hay hoy.** Cada módulo de negocio es una carpeta Nest con controller, service y repository. El «modelo» es una interfaz con la forma de la fila (`sede.model.ts`, `clase.model.ts`, `membresia.model.ts`, `notificacion.model.ts`). No hay una carpeta `domain` ni entidades con comportamiento, salvo el cálculo de precios.

| Módulo | Controller | Service | Modelo | Repository |
|--------|------------|---------|--------|------------|
| sedes | sí | sí | `Sede` | sí |
| clases | sí | sí | `Clase`, `InscripcionClase` | sí |
| membresias | sí | sí | `Membresia` | sí |
| notificaciones | sí | sí | `Notificacion` y el evento | sí |
| auth | `auth` y `me` | sí | solo el tipo `RolUsuario` | rol en `perfiles` |
| canchas/precios | no hay rutas | `PreciosService` | estrategias y `ContextoPrecio` | no: todavía no hay tablas |
| health | sí | no | no | no |

En clases y membresías la regla vive en la función SQL. El service traduce el código `P0001` a 404 o 409. El controller de membresías recibe `Partial<Membresia>`, la fila, y no un comando del caso de uso. Clases y membresías no tienen DTO. `health` responde desde el controller. El módulo de Supabase es infraestructura compartida.

---

## 23. Canchas y reservas no están en el código; el turno no es una clase

**Estado:** anotado. El modelo está decidido en documentos y todavía no hay tablas ni clases Nest.  
**Dónde:** [propuesta ER](./Propuesta_ER_FitZone.md) (entidades `canchas` y `reservas_cancha`). Reglas en [S4-T09](./Propuesta_Reglas_Negocio_S4-T09.md). Ciclo de la reserva en la [justificación de State](./Justificacion_Patrones_Unidad_III.md). La clase de patrones nombra «turnos» como ejemplo de entidad con ciclo de vida.

**Qué hay hoy.** No existe `create table` de canchas ni de reservas. En `backend/src` no hay `Turno`, ni `Reserva`, ni `Cancha`. Lo único de canchas es el cálculo de precio en memoria (`PreciosService`). La pantalla arma tres canchas con texto fijo.

**Cómo queda modelado.**

- **Cancha:** el recurso de una sede (tipo, nombre, `precio_hora`). El mantenimiento es un período desde–hasta sobre la cancha, no un estado de la reserva.
- **Turno:** no es una clase ni una fila. Es el hueco de 60 minutos en hora en punto de una cancha, identificado por `(cancha_id, inicio)`. La grilla lo calcula cruzando reservas confirmadas y bloqueos.
- **Reserva:** la fila de `reservas_cancha` que ocupa ese hueco. Guardar la reserva es insertar esa fila (precio incluido), no «aplicar una reserva» sobre un objeto turno. El ciclo pendiente de pago / confirmada / cancelada es State sobre `Reserva`.

El ER viejo todavía tiene `en_mantenimiento` booleano y la reserva solo en `confirmada|cancelada`, sin `precio` ni pendiente de pago. Esas dos cosas quedaron atrás de S4-T09 y de la justificación de State.
