# Correcciones: módulos de Membresías y Clases (S3-T03 / S3-T04)

**Para:** Bruno Conti (P2)  
**De:** Patricio Ramos (P1)  
**Fecha:** 2026-10-13  
**Revisado:** PR #22 (`S3-T03yT04-membresias-clases`), ya mergeado en `desarrollo`

---

## Resumen

La estructura está bien: cada módulo tiene repositorio sobre `SupabaseRepository`, el servicio traduce los errores `P0001` de las funciones SQL a 404/409 como pide la guía, y las reservas pasan por las funciones RPC (sin sobreventa). Compila, pasa el lint y no rompe ningún test.

Lo que falta es, sobre todo, **seguridad**: hoy cualquiera, sin iniciar sesión, puede inscribir o cancelar a otra persona, ver todas las membresías y crear membresías. Además, la lista de espera no le avisa a nadie (RF-08).

| # | Prioridad | Problema | Archivo |
|---|-----------|----------|---------|
| 1 | **Alta** | Ningún endpoint pide token ni rol | `clases.controller.ts`, `membresias.controller.ts` |
| 2 | **Alta** | El socio sale del body o de la URL, no del token | `clases.controller.ts`, `membresias.controller.ts` |
| 3 | **Alta** | Se puede cancelar la inscripción de otro | `clases.service.ts` |
| 4 | **Alta** | El cliente manda la hora de inicio y decide si la cancelación es tardía (D6) | `clases.controller.ts` |
| 5 | **Alta** | `POST /membresias` acepta cualquier campo del body | `membresias.service.ts` |
| 6 | **Alta** | Cancelar no notifica a la lista de espera (RF-08) | `clases.service.ts` |
| 7 | Media | Inscribir no controla que el socio tenga membresía activa (RN-03) | `clases.service.ts` |
| 8 | Media | Renovar una membresía falla si ya hay una activa (D1) | `membresias.service.ts` |
| 9 | Media | La membresía figura vencida todo su último día | `membresias.service.ts` |
| 10 | Media | `crear` saltea el repositorio | `membresias.service.ts` |
| 11 | Media | Errores de datos que terminan en 500 | ambos |
| 12 | Baja | Faltan endpoints de lista de espera | `clases` |
| 13 | Baja | Sin tests | ambos |

---

## 1. Ningún endpoint pide token ni rol

`ClasesController` y `MembresiasController` no tienen guard. El guard de roles ya está en `desarrollo` (ver `backend/src/auth/roles.decorator.ts`): `@RequiereRol(...)` valida el token **y** el rol de `perfiles.rol`, y lo documenta en Swagger.

```ts
// clases.module.ts y membresias.module.ts
imports: [AuthModule],
```

Roles propuestos (confirmar con el equipo; `recepcionista` se va a renombrar a `admin_sede`, ver S4-T09):

| Endpoint | Roles |
|----------|-------|
| `GET /clases?sedeId=` | cualquier usuario logueado (`@UseGuards(JwtAuthGuard)`) |
| `POST /clases/inscripciones` | `socio` |
| `DELETE /clases/inscripciones/:id` | `socio` (la suya), `recepcionista`, `gerente` |
| `GET /membresias` (todas) | `recepcionista`, `gerente` |
| `GET /membresias/mia` | `socio` |
| `POST /membresias` | `recepcionista`, `gerente` |

## 2. El socio sale del body o de la URL, no del token

- `POST /clases/inscripciones` recibe `perfilId` en el body: se puede inscribir a cualquiera.
- `GET /membresias/activas/:perfilId` deja ver la membresía de cualquiera.

El usuario logueado se obtiene con `@CurrentUser()`; nunca del body ni de la URL:

```ts
@Post('inscripciones')
@RequiereRol('socio')
inscribir(@Body('claseId', ParseUUIDPipe) claseId: string, @CurrentUser() user: AuthUserDto) {
  return this.clasesService.inscribir(claseId, user.id);
}

@Get('mia')
@RequiereRol('socio')
miMembresia(@CurrentUser() user: AuthUserDto) {
  return this.membresiasService.findActivaPorPerfil(user.id);
}
```

Si recepción necesita ver la de un socio, que sea otro endpoint con `@RequiereRol('recepcionista', 'gerente')`.

## 3. Se puede cancelar la inscripción de otro

La función `cancelar_inscripcion` no sabe quién llama (la ejecuta el backend con `service_role`). El control de dueño lo tiene que hacer Nest: buscar la inscripción y comparar `perfil_id` con el usuario del token. Ver el código propuesto en el punto 4.

## 4. El cliente decide si la cancelación es tardía (D6)

`DELETE /clases/inscripciones/:id` recibe `inicioClase` en el body. Mandando una fecha falsa se evita la marca de cancelación tardía. (Además, un `DELETE` con body no lo soportan todos los clientes HTTP.)

La hora de inicio tiene que salir de la base. Con una sola consulta se resuelven los puntos 3, 4 y 6:

```ts
// clases.repository.ts
async findInscripcion(id: string): Promise<InscripcionConClase | null> {
  return this.unwrap<InscripcionConClase | null>(
    await this.client
      .from('inscripciones_clase')
      .select('id, perfil_id, estado, clase:clases(id, tipo, inicio)')
      .eq('id', id)
      .maybeSingle(),
    'findInscripcion',
  );
}

async cancelar(id: string, tardia: boolean, plazo: string): Promise<EsperaNotificada[]> {
  return this.rpc<EsperaNotificada[]>('cancelar_inscripcion', {
    p_inscripcion_id: id,
    p_cancelacion_tardia: tardia,
    p_plazo: plazo,
  });
}
```

```ts
// clases.controller.ts
@Delete('inscripciones/:id')
@RequiereRol('socio', 'recepcionista', 'gerente')
cancelar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUserDto, @Req() req: AuthenticatedRequest) {
  return this.clasesService.cancelar(id, user.id, req.rol);
}
```

```ts
// clases.service.ts
async cancelar(inscripcionId: string, perfilId: string, rol?: RolUsuario): Promise<void> {
  const inscripcion = await this.repository.findInscripcion(inscripcionId);
  if (!inscripcion || (rol === 'socio' && inscripcion.perfil_id !== perfilId)) {
    throw new NotFoundException('La inscripción no fue encontrada'); // 404 también si es de otro: no revela que existe
  }

  const tardia = Date.now() > new Date(inscripcion.clase.inicio).getTime() - DOS_HORAS_MS; // D6
  const notificados = await this.repository.cancelar(inscripcionId, tardia, PLAZO_CONFIRMACION);
  this.listaEspera.notificarLugaresLiberados(inscripcion.clase, notificados); // punto 6
}
```

## 5. `POST /membresias` acepta cualquier campo del body

`crear` hace `...membresiaData` con lo que llegue: se puede mandar `id`, `estado: 'activo'`, fechas o el `perfil_id` de otro. Además, si el `plan` no es válido, la membresía se crea con `vigente_hasta = hoy`.

- Recibir un DTO con solo lo necesario: `{ perfil_id, plan }`, validando que `plan` sea `mensual | trimestral | anual` (400 si no).
- Las fechas y el estado los pone el servicio.
- La duración sale de la tabla `planes_membresia.duracion_meses` (ya existe en Supabase), no de `if` en el código. Así, cambiar un plan no requiere tocar el backend.

## 6. Cancelar no notifica a la lista de espera (RF-08)

`cancelar_inscripcion` devuelve las filas de `lista_espera` que pasaron a `notificado`, pero el servicio las descarta. Sin esto, se reserva el lugar para el siguiente y **nadie le avisa**: el plazo vence solo.

```ts
// clases.module.ts
imports: [AuthModule, NotificacionesModule],

// clases.service.ts
constructor(
  private readonly repository: ClasesRepository,
  private readonly listaEspera: ListaEsperaPublisher,
) {}
```

Y llamar `this.listaEspera.notificarLugaresLiberados(clase, notificados)` después de `cancelar` (punto 4) y de `procesar_lista_espera` (punto 12). **Sin `await`**: los avisos corren aparte y no demoran la respuesta. Detalle en [Diseno_Observer_S4-T02_Notificaciones.md](./Diseno_Observer_S4-T02_Notificaciones.md), sección 3.

## 7. Inscribir no controla la membresía (RN-03)

Según el diseño (S3-T06, sección 5), "solo socios con membresía activa reservan clases" se valida en Nest. Antes de llamar a `inscribir_en_clase`, consultar la membresía activa del perfil y responder **403** si no tiene o está vencida. `MembresiasModule` puede exportar `MembresiasService` para usarlo desde Clases.

## 8. Renovar falla si ya hay una membresía activa (D1)

Hay un índice único: una sola membresía `activo` por perfil. Si el socio ya tiene una (aunque esté vencida por fecha), el insert falla con `23505` y la API responde 500. D1 dice que al renovar **se cierra la anterior**: pasarla a `vencido` antes de insertar la nueva.

Para evitar quedar a mitad de camino (cierra la vieja y falla la nueva), lo más seguro es una función SQL `renovar_membresia(perfil_id, plan)` que haga las dos cosas en una transacción, igual que las de clases. Si querés, la armo yo (es parte del diseño de base).

## 9. La membresía figura vencida todo su último día

`vigente_hasta` es una fecha (`2026-10-31`). `new Date('2026-10-31')` es la medianoche UTC, o sea **el 30 a las 21:00 en Argentina**: desde ese momento la membresía ya figura vencida.

Comparar como fechas en la zona horaria de Argentina:

```ts
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date()); // "2026-10-13"
const vencida = membresia.vigente_hasta < hoy; // vigente todo el día 31
```

Lo mismo al crearla: guardar `vigente_desde` / `vigente_hasta` como `YYYY-MM-DD` de Argentina, no con `toISOString()` (que usa UTC y después de las 21:00 da el día siguiente).

Sugerencia (D3, "vencido se calcula en Nest"): en vez de un 404 "La membresía se encuentra vencida", devolver la membresía con `estado: 'vencido'` calculado. Al front le sirve para mostrar "Tu cuota venció el 31/10, renovala".

## 10. `crear` saltea el repositorio

`(this.repository as any).client.from('membresias').insert(...)` rompe el patrón Repository que estamos justificando en la Unidad III, y el `as any` apaga el chequeo de tipos. Además, `throw new Error(...)` no pasa por `RepositoryError`, así que el error real no queda en el log.

Mover el insert a `MembresiasRepository.crear(...)` con `this.unwrap(...)`, como en `NotificacionesRepository.crear` (ver [Guia_Patron_Repository.md](./Guia_Patron_Repository.md)).

## 11. Errores de datos que terminan en 500

| Caso | Hoy | Debería |
|------|-----|---------|
| `sedeId`, `claseId` o `:id` que no es UUID | 500 (Postgres `22P02`) | 400 con `ParseUUIDPipe` |
| Inscribirse dos veces en la misma clase | 500 (`23505`, índice único) | 409 "Ya estás inscripto en esta clase" |
| Membresía duplicada (punto 8) | 500 (`23505`) | Se evita renovando bien |

El `23505` llega como `RepositoryError` con `code === '23505'`; se traduce en el mismo `catch` donde ya manejás `P0001`.

## 12. Faltan endpoints de lista de espera

La base ya tiene todo (ver [Diseno_BD_S3-T06](./Diseno_BD_S3-T06_Membresias_Clases.md), sección 5), pero no hay endpoints para:

- **Anotarse** en la lista de espera cuando la clase está llena (`CLASE_LLENA` / `HAY_LISTA_DE_ESPERA`). Es un insert en `lista_espera`.
- **Confirmar** el lugar: `confirmar_lugar_espera(espera_id)`. Validar que la espera sea del usuario del token. El front lo va a llamar desde la notificación (trae `espera_id` en `datos`).
- **Retirarse** de la lista (estado `retirado`).
- **Procesar** la lista: llamar `procesar_lista_espera(clase_id, plazo)` antes de inscribir o confirmar, para resolver plazos vencidos, y publicar los notificados (punto 6).

Si no entran en esta tarea, anotarlos como tarea nueva.

## 13. Sin tests

Los otros módulos tienen tests de servicio con el repositorio simulado (ver `sedes.service.spec.ts`, `notificaciones.service.spec.ts`). Mínimo:

- Clases: traducción de cada error SQL a su código HTTP; cancelación tardía con más y menos de 2 h; un socio no puede cancelar la inscripción de otro; al cancelar se publican los notificados.
- Membresías: vencida el día siguiente a `vigente_hasta` y no el mismo día; plan inválido responde 400.
- e2e: los endpoints responden 401 sin token y 403 con el rol equivocado (ver `test/roles.e2e-spec.ts`).

---

## Detalles menores

- `PLAZO_CONFIRMACION = '30 minutes'` y las 2 h de D6: sacarlas a constantes del módulo. Los 30 min son una propuesta (S4-T09, Q1), todavía no está decidido.
- DTOs con `@ApiProperty` para que los endpoints aparezcan bien en Swagger (como `sede.dto.ts`); hoy el front no ve qué mandar ni qué recibe.
- Comentarios como `// Método POST para crear una nueva membresía` o `// El servicio le pide cosas al repositorio` repiten lo que dice el código; se pueden sacar.

## Cómo seguimos

Propongo una rama nueva desde `desarrollo` (p. ej. `S3-T03yT04-correcciones`) con los puntos de prioridad alta primero (1 a 6), y después el resto. Cualquier duda, me consultás; los puntos 8 (función SQL) y 12 (lista de espera) los podemos repartir.
