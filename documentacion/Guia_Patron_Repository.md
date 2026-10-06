# Guía: patrón Repository sobre Supabase (S3-T11)

**Responsable:** Patricio Ramos (P1)  
**Fecha:** 2026-10-05  
**Relacionado:** [ADR-006](./adr/ADR-006-supabase-api-sin-orm.md), [Diseño BD S3-T06](./Diseno_BD_S3-T06_Membresias_Clases.md)

---

## 1. Regla

Solo los repositorios usan el cliente de Supabase. Controllers y services nunca llaman a `SupabaseService.getClient()`.

```
Controller → Service (reglas de negocio, errores HTTP) → Repository (Supabase API) → Postgres
```

## 2. Piezas (`backend/src/supabase/`)

| Archivo | Qué hace |
|---------|----------|
| `supabase.repository.ts` | Clase base `SupabaseRepository<T>`: `findAll()`, `findById(id)`, y para las subclases `from()`, `rpc(fn, args)` y `unwrap(resultado, operacion)` |
| `repository.error.ts` | `RepositoryError`: lo lanza `unwrap` cuando Supabase devuelve error. Trae `message`, `code` y `details` |
| `repository-error.filter.ts` | Filtro global: un `RepositoryError` que el servicio no tradujo se responde como **500 "Error al acceder a los datos"**. El error real queda en el log de la API, no en la respuesta |

## 3. Ejemplo mínimo: Sedes

```ts
// sede.model.ts — forma de la fila en la tabla
export interface Sede { id: string; nombre: string; /* ... */ }

// sedes.repository.ts
@Injectable()
export class SedesRepository extends SupabaseRepository<Sede> {
  protected readonly table = 'sedes';
}

// sedes.service.ts
constructor(private readonly sedesRepository: SedesRepository) {}
findAll() { return this.sedesRepository.findAll(); }

// sedes.module.ts
providers: [SedesService, SedesRepository]
```

`SupabaseModule` es global: no hay que importarlo en cada módulo.

## 4. Consultas propias y RPC: Clases

Las consultas específicas se agregan como métodos del repositorio, siempre pasando por `unwrap`:

```ts
@Injectable()
export class ClasesRepository extends SupabaseRepository<Clase> {
  protected readonly table = 'clases';

  async findConCupoPorSede(sedeId: string): Promise<ClaseConCupo[]> {
    return this.unwrap(
      await this.client.from('clases_con_cupo').select('*')
        .eq('sede_id', sedeId).order('inicio'),
      'findConCupoPorSede',
    );
  }

  inscribir(claseId: string, perfilId: string): Promise<Inscripcion> {
    return this.rpc('inscribir_en_clase', { p_clase_id: claseId, p_perfil_id: perfilId });
  }
}
```

> Los nombres de los parámetros RPC tienen que coincidir con los de la función SQL (ver la migración `20261005220000_membresias_clases.sql`).

## 5. Errores de negocio

Las funciones SQL hacen `raise exception 'CLASE_LLENA'`, etc. Llegan como `RepositoryError` con `code = 'P0001'` y `message = 'CLASE_LLENA'`. El **service** los traduce a HTTP; lo que no traduce termina en 500:

```ts
async inscribir(claseId: string, perfilId: string) {
  try {
    return await this.clasesRepository.inscribir(claseId, perfilId);
  } catch (e) {
    if (e instanceof RepositoryError && e.code === 'P0001') {
      switch (e.message) {
        case 'CLASE_NO_EXISTE': throw new NotFoundException('La clase no existe');
        case 'CLASE_LLENA':
        case 'HAY_LISTA_DE_ESPERA': throw new ConflictException(e.message);
      }
    }
    throw e;
  }
}
```

## 6. Tests

- **Service:** mockear el repositorio (`{ provide: ClasesRepository, useValue: { inscribir: jest.fn() } }`).
- **Repository:** mockear `SupabaseService` con un cliente falso (ver `sedes.repository.spec.ts` y `supabase.repository.spec.ts`).
- **e2e:** `overrideProvider(SupabaseService)` (ver `test/sedes.e2e-spec.ts`).
