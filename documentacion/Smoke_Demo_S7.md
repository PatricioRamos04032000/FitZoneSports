# Smoke del guion demo en LOG — Tarea S7-T11 (Unidad V)

**Proyecto:** FitZone Sports  
**Tarea:** S7-T11 — Smoke del guion demo en LOG  
**Unidad:** V — Testing y CI/CD  
**Estado:** ✅ Completo  
**Fecha:** 2026-10-31  
**Responsable:** Matias Goncevat (P4)

---

## 1. Objetivo

Verificar el flujo crítico del demo (login → membresía → reserva de cancha) y registrar el resultado (OK / FAIL) en el LOG del proyecto, asegurando que quede al menos un pase (reserva) registrado en la base de datos.

---

## 2. Qué se valida

| Etapa | Qué se valida | Endpoint / operación | Resultado esperado |
|-------|---------------|----------------------|-------------------|
| 1 — Login | Autenticación del socio con email + contraseña | `POST /auth/login` | 200 + `access_token` |
| 2 — Membresía activa | El socio tiene una membresía vigente y no vencida | `GET /membresias/activas/:perfilId` | 200 + `estado: activo` |
| 3 — Reserva + checkout | Hold pendiente, URL de pago y confirmación simulada | `POST /canchas/reservas` → `POST .../pagar` → confirmar | Reserva `confirmada` tras checkout |
| 4 — Persistencia | Reserva y pago en Supabase | `reservas_cancha` + `pagos` | Reserva confirmada + pago `aprobado` con token |

---

## 3. Archivos creados o modificados

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `backend/scripts/smoke-demo.ts` | Creado | Script de smoke test con las 4 etapas y logging OK/FAIL |
| `backend/package.json` | Editado | Agregado script `smoke:demo` |
| `backend/scripts/tsconfig.seed.json` | Editado | Agregado `rootDir` e `include` para `smoke-demo.ts` |
| `documentacion/LOG.md` | Editado | Entrada registrada con resultado de la corrida exitosa |
| `documentacion/Smoke_Demo_S7.md` | Creado | Este documento |

---

## 4. Cómo ejecutar el smoke test

### Prerrequisitos

1. **Variables de entorno** en `backend/.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `SEED_PASSWORD`

2. **Base de datos con seed ejecutado:**
   ```bash
   cd backend
   npm run seed
   ```

3. **Membresía del socio con vigencia futura:** Si la membresía del socio está vencida, actualizar `vigente_hasta` en la tabla `membresias` de Supabase a una fecha futura.

### Ejecución

```bash
cd backend
npm run smoke:demo
```

### Salida esperada (caso exitoso)

```
=== Smoke test demo: login -> membresía -> reserva ===

[SMOKE] Etapa 1 - Login: OK | token obtenido para perfil 076bfb09-f718-4124-aaad-8e70accd3ea3
[SMOKE] Etapa 2 - Membresía activa: OK | vigente hasta 2026-12-01
[SMOKE] Etapa 3 - Reserva de cancha: OK | reserva 368d82fe-67cf-4044-9646-22e15b2bd9c8 confirmada ($20400)
[SMOKE] Etapa 4 - Persistencia verificada: OK | reserva 368d82fe-67cf-4044-9646-22e15b2bd9c8 confirmada en BD

[SMOKE] Resultado global: OK (al menos 1 pase registrado)
```

### Salida esperada (caso fallido)

```
[SMOKE] Etapa 1 - Login: FAIL | Credenciales inválidas

[SMOKE] Resultado global: FAIL (etapa 1)
```

---

## 5. Registro en el LOG

El resultado de la corrida se registró en `documentacion/LOG.md` bajo la entrada `2026-10-31 — S7-T11: Smoke del guion demo en LOG`, con la tabla de etapas y el resultado global.

---

## 6. Criterios de cierre cumplidos

- [x] El script ejecuta las 4 etapas (login → membresía → reserva → persistencia).
- [x] Cada etapa imprime `OK` o `FAIL` claramente en consola.
- [x] Se registra al menos 1 reserva (pase) en la tabla `reservas_cancha` de Supabase.
- [x] El resultado quedó registrado en `documentacion/LOG.md`.
- [x] Existe documentación (`documentacion/Smoke_Demo_S7.md`) que explica cómo reproducir el smoke.

---

## 7. Notas

- El script usa `NestJS TestingModule` (`Test.createTestingModule`) para ejecutar el flujo directamente contra los controladores, sin requerir un servidor HTTP externo levantado por separado.
- La verificación de persistencia (Etapa 4) consulta directamente la tabla `reservas_cancha` de Supabase usando el cliente de service role.
- La reserva creada tiene estado `confirmada` (la pasarela stub siempre aprueba).