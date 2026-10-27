/**
 * Seed mínimo de demo (S5).
 * Crea Auth users + sedes/perfiles/admins_sede/membresía/canchas de forma idempotente.
 *
 * Requiere: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_PASSWORD
 * Uso: npm run seed  (desde backend/)
 */
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

loadDotenv({ path: resolve(__dirname, '../.env') });

const SEDE_CENTRAL_ID = 'a1000000-0000-4000-8000-000000000001';
const SEDE_NORTE_ID = 'a1000000-0000-4000-8000-000000000002';
const CANCHA_PADDLE_ID = 'a3000000-0000-4000-8000-000000000001';
const CANCHA_FUTBOL_ID = 'a3000000-0000-4000-8000-000000000002';

type RolSeed = 'gerente' | 'admin_sede' | 'socio' | 'externo';

type UsuarioSeed = {
  email: string;
  rol: RolSeed;
  dni: string;
  nombre: string;
  apellido: string;
  sedeHomeId?: string;
};

const USUARIOS: UsuarioSeed[] = [
  {
    email: 'gerente@fitzone.com',
    rol: 'gerente',
    dni: '20000001',
    nombre: 'Gerente',
    apellido: 'Demo',
    sedeHomeId: SEDE_CENTRAL_ID,
  },
  {
    email: 'admin.central@fitzone.com',
    rol: 'admin_sede',
    dni: '20000002',
    nombre: 'Admin',
    apellido: 'Central',
    sedeHomeId: SEDE_CENTRAL_ID,
  },
  {
    email: 'socio@fitzone.com',
    rol: 'socio',
    dni: '30000001',
    nombre: 'Socio',
    apellido: 'Demo',
    sedeHomeId: SEDE_CENTRAL_ID,
  },
  {
    email: 'externo@fitzone.com',
    rol: 'externo',
    dni: '30000002',
    nombre: 'Externo',
    apellido: 'Demo',
  },
];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function mesVigente(): { desde: string; hasta: string } {
  const ahora = new Date();
  const y = ahora.getUTCFullYear();
  const m = ahora.getUTCMonth();
  const desde = new Date(Date.UTC(y, m, 1));
  const hasta = new Date(Date.UTC(y, m + 1, 0));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: iso(desde), hasta: iso(hasta) };
}

async function findUserIdByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<string | null> {
  const normalized = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`listUsers (página ${page}): ${error.message}`);
    }
    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) {
      return match.id;
    }
    if (data.users.length < perPage) {
      return null;
    }
    page += 1;
  }
}

async function ensureAuthUser(
  supabase: SupabaseClient,
  email: string,
  password: string,
): Promise<string> {
  const existingId = await findUserIdByEmail(supabase, email);
  if (existingId) {
    const { error } = await supabase.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
    });
    if (error) {
      throw new Error(`updateUserById(${email}): ${error.message}`);
    }
    console.log(`  Auth: reutilizado ${email}`);
    return existingId;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`createUser(${email}): ${error?.message ?? 'sin user'}`);
  }
  console.log(`  Auth: creado ${email}`);
  return data.user.id;
}

function fail(table: string, error: { message: string } | null): void {
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

async function seedSedes(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.from('sedes').upsert(
    [
      {
        id: SEDE_CENTRAL_ID,
        nombre: 'FitZone Central',
        direccion: 'Av. Demo 100',
        aforo_max: 80,
        activa: true,
      },
      {
        id: SEDE_NORTE_ID,
        nombre: 'FitZone Norte',
        direccion: 'Calle Norte 50',
        aforo_max: 60,
        activa: true,
      },
    ],
    { onConflict: 'id' },
  );
  fail('sedes', error);
  console.log('  sedes: Central + Norte');
}

async function seedPerfiles(
  supabase: SupabaseClient,
  ids: Record<string, string>,
): Promise<void> {
  const rows = USUARIOS.map((u) => ({
    id: ids[u.email],
    rol: u.rol,
    dni: u.dni,
    nombre: u.nombre,
    apellido: u.apellido,
    sede_home_id: u.sedeHomeId ?? null,
  }));

  // Seed viejo puede tener el mismo DNI con otro auth.users id.
  const dnis = rows.map((r) => r.dni);
  const { data: existentes, error: qErr } = await supabase
    .from('perfiles')
    .select('id, dni')
    .in('dni', dnis);
  fail('perfiles (select dni)', qErr);

  const idsNuevos = new Set(rows.map((r) => r.id));
  const obsoletos = (existentes ?? [])
    .filter((p) => !idsNuevos.has(p.id))
    .map((p) => p.id);
  if (obsoletos.length > 0) {
    const { error: delErr } = await supabase.from('perfiles').delete().in('id', obsoletos);
    fail('perfiles (delete dni viejo)', delErr);
    console.log(`  perfiles: eliminados ${obsoletos.length} con DNI conflictivo`);
  }

  const { error } = await supabase.from('perfiles').upsert(rows, { onConflict: 'id' });
  fail('perfiles', error);
  console.log(`  perfiles: ${rows.length}`);
}

async function seedAdminSede(
  supabase: SupabaseClient,
  ids: Record<string, string>,
): Promise<void> {
  const adminId = ids['admin.central@fitzone.com'];
  const { error } = await supabase.from('admins_sede').upsert(
    { perfil_id: adminId, sede_id: SEDE_CENTRAL_ID },
    { onConflict: 'perfil_id,sede_id', ignoreDuplicates: true },
  );
  fail('admins_sede', error);
  console.log('  admins_sede: admin → Central');
}

async function seedMembresiaSocio(
  supabase: SupabaseClient,
  ids: Record<string, string>,
): Promise<void> {
  const socioId = ids['socio@fitzone.com'];
  const { data: activa, error: qErr } = await supabase
    .from('membresias')
    .select('id')
    .eq('perfil_id', socioId)
    .eq('estado', 'activo')
    .maybeSingle();
  fail('membresias (select)', qErr);

  if (activa) {
    console.log('  membresias: socio ya tiene activa (sin cambios)');
    return;
  }

  const { desde, hasta } = mesVigente();
  const { error } = await supabase.from('membresias').insert({
    perfil_id: socioId,
    plan: 'mensual',
    estado: 'activo',
    vigente_desde: desde,
    vigente_hasta: hasta,
  });
  fail('membresias (insert)', error);
  console.log(`  membresias: socio activo ${desde} → ${hasta}`);
}

async function seedCanchas(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.from('canchas').upsert(
    [
      {
        id: CANCHA_PADDLE_ID,
        sede_id: SEDE_CENTRAL_ID,
        tipo: 'paddle',
        nombre: 'Paddle 1',
        precio_hora: 20000,
        activa: true,
      },
      {
        id: CANCHA_FUTBOL_ID,
        sede_id: SEDE_NORTE_ID,
        tipo: 'futbol5',
        nombre: 'Fútbol 5 1',
        precio_hora: 25000,
        activa: true,
      },
    ],
    { onConflict: 'id' },
  );
  fail('canchas', error);
  console.log('  canchas: paddle (Central) + futbol5 (Norte)');
}

async function main(): Promise<void> {
  const url = requireEnv('SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const password = requireEnv('SEED_PASSWORD');

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  console.log('Seed demo S5…');

  await seedSedes(supabase);

  const ids: Record<string, string> = {};
  for (const u of USUARIOS) {
    ids[u.email] = await ensureAuthUser(supabase, u.email, password);
  }

  await seedPerfiles(supabase, ids);
  await seedAdminSede(supabase, ids);
  await seedMembresiaSocio(supabase, ids);
  await seedCanchas(supabase);

  console.log('Listo.');
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Seed falló: ${message}`);
  process.exit(1);
});
