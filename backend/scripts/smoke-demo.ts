/**
 * Smoke test del guion demo (Unidad V).
 * Flujo crítico: login -> membresía -> reserva pendiente -> checkout simulado -> persistencia.
 * Ejecuta el flujo directamente contra el módulo Nest (TestingModule).
 * Requiere: base de datos con seed ejecutado (npm run seed) y variables de entorno
 * SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_PASSWORD en backend/.env.
 * Uso: npm run smoke:demo  (desde backend/)
 */

import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { MembresiasController } from '../src/membresias/membresias.controller';
import { ReservasCanchaController } from '../src/canchas/reservas/reservas-cancha.controller';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

loadDotenv({ path: resolve(__dirname, '../.env') });

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'demo1234';
const SOCIO_EMAIL = 'socio@fitzone.com';
const CANCHA_PADDLE_ID = 'a3000000-0000-4000-8000-000000000001';

const manana = new Date();
manana.setDate(manana.getDate() + 1);
manana.setHours(19, 0, 0, 0);
const INICIO_TURNO = manana.toISOString();

let etapasOk = 0;
let etapasFail = 0;

function registrarEtapa(numero: number, nombre: string, ok: boolean, detalle?: string) {
  if (ok) {
    etapasOk += 1;
    console.log(`[SMOKE] Etapa ${numero} - ${nombre}: OK${detalle ? ` | ${detalle}` : ''}`);
  } else {
    etapasFail += 1;
    console.log(`[SMOKE] Etapa ${numero} - ${nombre}: FAIL${detalle ? ` | ${detalle}` : ''}`);
  }
}

async function main(): Promise<void> {
  console.log('=== Smoke test demo: login -> membresía -> reserva ===');
  console.log('');

  let moduleFixture: TestingModule;

  try {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  } catch (err: any) {
    registrarEtapa(0, 'Inicialización del módulo Nest', false, err?.message ?? String(err));
    console.log('');
    console.log('[SMOKE] Resultado global: FAIL (no se pudo inicializar Nest)');
    process.exit(1);
    return;
  }

  const authController = moduleFixture.get(AuthController);
  const membresiasController = moduleFixture.get(MembresiasController);
  const reservasController = moduleFixture.get(ReservasCanchaController);
  const supabaseService = moduleFixture.get(SupabaseService);
  const supabase: SupabaseClient = supabaseService.getClient();

  /* Etapa 1 — Login */
  let accessToken: string;
  let perfilId: string;

  try {
    const loginResult = await authController.login({
      email: SOCIO_EMAIL,
      password: SEED_PASSWORD,
    } as any);

    if (loginResult?.access_token) {
      accessToken = loginResult.access_token;
      perfilId = loginResult.user?.id ?? 'desconocido';
      registrarEtapa(1, 'Login', true, `token obtenido para perfil ${perfilId}`);
    } else {
      registrarEtapa(1, 'Login', false, 'no se devolvió access_token');
      console.log('');
      console.log('[SMOKE] Resultado global: FAIL (etapa 1)');
      process.exit(1);
      return;
    }
  } catch (err: any) {
    registrarEtapa(1, 'Login', false, err?.message ?? String(err));
    console.log('');
    console.log('[SMOKE] Resultado global: FAIL (etapa 1)');
    process.exit(1);
    return;
  }

  /* Etapa 2 — Membresía activa */
  let membresia: any;

  try {
    membresia = await membresiasController.findActivaPorPerfil(perfilId);

    if (membresia?.estado === 'activo') {
      const vigenteHasta = membresia.vigente_hasta ?? 'sin fecha';
      registrarEtapa(2, 'Membresía activa', true, `vigente hasta ${vigenteHasta}`);
    } else {
      registrarEtapa(2, 'Membresía activa', false, `estado=${membresia?.estado ?? 'sin estado'}`);
      console.log('');
      console.log('[SMOKE] Resultado global: FAIL (etapa 2)');
      process.exit(1);
      return;
    }
  } catch (err: any) {
    registrarEtapa(2, 'Membresía activa', false, err?.message ?? String(err));
    console.log('');
    console.log('[SMOKE] Resultado global: FAIL (etapa 2)');
    process.exit(1);
    return;
  }

  /* Etapa 3 — Reserva pendiente + iniciar pago (checkout simulado) */
  let reserva: any;
  let pagoId: string | undefined;

  try {
    reserva = await reservasController.reservar(
      { id: perfilId } as any,
      { canchaId: CANCHA_PADDLE_ID, inicio: INICIO_TURNO },
    );

    if (!reserva?.id || reserva.estado !== 'pendiente') {
      registrarEtapa(3, 'Reserva pendiente', false, `estado=${reserva?.estado ?? 'sin estado'}`);
      console.log('');
      console.log('[SMOKE] Resultado global: FAIL (etapa 3)');
      process.exit(1);
      return;
    }

    const pago = await reservasController.iniciarPago(
      { id: perfilId } as any,
      reserva.id,
    );

    if (!pago?.pagoId || !pago?.checkoutUrl) {
      registrarEtapa(3, 'Reserva pendiente + pagar', false, 'sin checkoutUrl');
      console.log('');
      console.log('[SMOKE] Resultado global: FAIL (etapa 3)');
      process.exit(1);
      return;
    }

    pagoId = pago.pagoId;

    // Simula el POST del checkout HTML (tarjeta de prueba OK) sin abrir el navegador.
    const { PasarelaSimulada } = await import('../src/pagos/pasarela-simulada');
    const { ReservasCanchaService } = await import(
      '../src/canchas/reservas/reservas-cancha.service'
    );
    const pasarela = moduleFixture.get(PasarelaSimulada);
    const reservasService = moduleFixture.get(ReservasCanchaService);

    await pasarela.confirmarPago(pago.pagoId, {
      aprobado: true,
      token: `sim-smoke-${reserva.id}`,
    });
    const confirmada = await reservasService.aplicarResultadoPago(reserva.id, true);

    if (confirmada.estado === 'confirmada') {
      registrarEtapa(
        3,
        'Reserva + checkout simulado',
        true,
        `reserva ${reserva.id} confirmada ($${confirmada.precio}); checkout ${pago.checkoutUrl}`,
      );
    } else {
      registrarEtapa(3, 'Reserva + checkout simulado', false, `estado=${confirmada.estado}`);
      console.log('');
      console.log('[SMOKE] Resultado global: FAIL (etapa 3)');
      process.exit(1);
      return;
    }
  } catch (err: any) {
    registrarEtapa(3, 'Reserva + checkout simulado', false, err?.message ?? String(err));
    console.log('');
    console.log('[SMOKE] Resultado global: FAIL (etapa 3)');
    process.exit(1);
    return;
  }

  /* Etapa 4 — Verificación de persistencia (reserva + pago) */
  try {
    const { data, error } = await supabase
      .from('reservas_cancha')
      .select('id, estado, perfil_id, cancha_id, inicio')
      .eq('id', reserva.id)
      .maybeSingle();

    if (error) {
      registrarEtapa(4, 'Persistencia verificada', false, `error BD: ${error.message}`);
      console.log('');
      console.log('[SMOKE] Resultado global: FAIL (etapa 4)');
      process.exit(1);
      return;
    }

    const { data: pagoFila, error: pagoError } = await supabase
      .from('pagos')
      .select('id, estado, token_pasarela, reserva_cancha_id')
      .eq('id', pagoId!)
      .maybeSingle();

    if (pagoError) {
      registrarEtapa(4, 'Persistencia verificada', false, `error pagos: ${pagoError.message}`);
      console.log('');
      console.log('[SMOKE] Resultado global: FAIL (etapa 4)');
      process.exit(1);
      return;
    }

    if (
      data?.estado === 'confirmada' &&
      pagoFila?.estado === 'aprobado' &&
      pagoFila.token_pasarela
    ) {
      registrarEtapa(
        4,
        'Persistencia verificada',
        true,
        `reserva confirmada + pago ${pagoFila.id} con token`,
      );
      console.log('');
      console.log('[SMOKE] Resultado global: OK (al menos 1 pase registrado)');
      process.exit(0);
      return;
    }

    registrarEtapa(
      4,
      'Persistencia verificada',
      false,
      `reserva=${data?.estado} pago=${pagoFila?.estado}`,
    );
    console.log('');
    console.log('[SMOKE] Resultado global: FAIL (etapa 4)');
    process.exit(1);
  } catch (err: any) {
    registrarEtapa(4, 'Persistencia verificada', false, err?.message ?? String(err));
    console.log('');
    console.log('[SMOKE] Resultado global: FAIL (etapa 4)');
    process.exit(1);
    return;
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[SMOKE] Error inesperado: ${message}`);
  process.exit(1);
});