/**
 * Seed de carga de prueba (C-08, Anexo G).
 * Crea >= 25 sedes, 1 cancha mínima y 1 clase mínima por sede, y perfiles con
 * los 4 roles (gerente, admin_sede, socio, externo). Idempotente.
 *
 * Requiere: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_PASSWORD
 * Uso: npm run seed:entrega  (desde backend/)
 */
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

loadDotenv({ path: resolve(__dirname, '../.env') });

const CANTIDAD_SEDES = 25;

type RolSeed = 'gerente' | 'admin_sede' | 'socio' | 'externo';

type UsuarioSeed = {
  email: string;
  rol: RolSeed;
  dni: string;
  nombre: string;
  apellido: string;
};

const USUARIOS: UsuarioSeed[] = [
  { email: 'gerente@fitzone.com', rol: 'gerente', dni: '20000001', nombre: 'Gerente', apellido: 'Demo' },
  { email: 'admin.central@fitzone.com', rol: 'admin_sede', dni: '20000002', nombre: 'Admin', apellido: 'Central' },
  { email: 'socio@fitzone.com', rol: 'socio', dni: '30000001', nombre: 'Socio', apellido: 'Demo' },
  { email: 'externo@fitzone.com', rol: 'externo', dni: '30000002', nombre: 'Externo', apellido: 'Demo' },
];

const SEDES_BASE = [
  { nombre: 'FitZone Central', direccion: 'Av. Demo 100', aforo_max: 80 },
  { nombre: 'FitZone Norte', direccion: 'Calle Norte 50', aforo_max: 60 },
  { nombre: 'FitZone Oeste', direccion: 'Av. Oeste 300', aforo_max: 50 },
  { nombre: 'FitZone Sur', direccion: 'Av. Sur 200', aforo_max: 70 },
  { nombre: 'FitZone Este', direccion: 'Calle Este 400', aforo_max: 55 },
  { nombre: 'FitZone Microcentro', direccion: 'Av. Libertador 1500', aforo_max: 90 },
  { nombre: 'FitZone Palermo', direccion: 'Av. Santa Fe 3000', aforo_max: 65 },
  { nombre: 'FitZone Recoleta', direccion: 'Av. Alvear 1800', aforo_max: 45 },
  { nombre: 'FitZone Belgrano', direccion: 'Av. Cabildo 2100', aforo_max: 60 },
  { nombre: 'FitZone Nuñez', direccion: 'Av. Congreso 1200', aforo_max: 40 },
  { nombre: 'FitZone Colegiales', direccion: 'Av. Alvarez Jonte 3000', aforo_max: 35 },
  { nombre: 'FitZone Chacarita', direccion: 'Av. Dorrego 4500', aforo_max: 45 },
  { nombre: 'FitZone Villa Crespo', direccion: 'Av. Corrientes 5000', aforo_max: 50 },
  { nombre: 'FitZone Almagro', direccion: 'Av. Medrano 600', aforo_max: 40 },
  { nombre: 'FitZone Boedo', direccion: 'Av. San Juan 3500', aforo_max: 45 },
  { nombre: 'FitZone San Cristobal', direccion: 'Av. Independencia 3000', aforo_max: 35 },
  { nombre: 'FitZone San Telmo', direccion: 'Defensa 800', aforo_max: 30 },
  { nombre: 'FitZone Monserrat', direccion: 'Av. Rivadavia 900', aforo_max: 50 },
  { nombre: 'FitZone Retiro', direccion: 'Av. Ramos Mejia 1000', aforo_max: 55 },
  { nombre: 'FitZone Puerto Madero', direccion: 'Av. Azucena Villaflor 1000', aforo_max: 70 },
  { nombre: 'FitZone Barracas', direccion: 'Av. Montes de Oca 1500', aforo_max: 40 },
  { nombre: 'FitZone Parque Patricios', direccion: 'Av. Caseros 2500', aforo_max: 45 },
  { nombre: 'FitZone Liniers', direccion: 'Av. Rivadavia 10000', aforo_max: 40 },
  { nombre: 'FitZone Mataderos', direccion: 'Av. Lisandro de la Torre 3000', aforo_max: 35 },
  { nombre: 'FitZone Villa Lugano', direccion: 'Av. Escalada 3000', aforo_max: 40 },
];

const TIPOS_CANCHA = ['paddle', 'futbol5', 'otro'] as const;
const TIPOS_CLASE = ['Spinning', 'Yoga', 'Funcional', 'Zumba', 'Pilates'] as const;

function uuidSede(i: number): string {
  const n = String(i).padStart(2, '0');
  return `a1000000-0000-4000-8000-0000000000${n}`;
}

function uuidCancha(i: number): string {
  const n = String(i).padStart(2, '0');
  return `a3000000-0000-4000-8000-0000000000${n}`;
}

function uuidClase(i: number): string {
  const n = String(i).padStart(2, '0');
  return `c1000000-0000-4000-8000-0000000000${n}`;
}

function uuidPerfil(i: number): string {
  const n = String(i).padStart(2, '0');
  return `a4000000-0000-4000-8000-0000000000${n}`;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function fail(table: string, error: { message: string } | null): void {
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

function hoyMasDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString();
}

function sumarHoras(iso: string, horas: number): string {
  const d = new Date(iso);
  d.setHours(d.getHours() + horas);
  return d.toISOString();
}

async function seedSedes(supabase: SupabaseClient): Promise<void> {
  const filas = SEDES_BASE.map((s, i) => ({
    id: uuidSede(i + 1),
    nombre: s.nombre,
    direccion: s.direccion,
    aforo_max: s.aforo_max,
    activa: true,
  }));

  const { error } = await supabase.from('sedes').upsert(filas, { onConflict: 'id' });
  fail('sedes', error);
  console.log(`  sedes: ${filas.length}`);
}

async function seedCanchas(supabase: SupabaseClient): Promise<void> {
  const filas = SEDES_BASE.map((_, i) => ({
    id: uuidCancha(i + 1),
    sede_id: uuidSede(i + 1),
    tipo: TIPOS_CANCHA[i % TIPOS_CANCHA.length],
    nombre: `Cancha ${i + 1}`,
    precio_hora: 15000 + i * 500,
    activa: true,
  }));

  const { error } = await supabase.from('canchas').upsert(filas, { onConflict: 'id' });
  fail('canchas', error);
  console.log(`  canchas: ${filas.length}`);
}

async function seedClases(supabase: SupabaseClient): Promise<void> {
  const filas = SEDES_BASE.map((_, i) => ({
    id: uuidClase(i + 1),
    sede_id: uuidSede(i + 1),
    tipo: TIPOS_CLASE[i % TIPOS_CLASE.length],
    instructor: `Instructor ${i + 1}`,
    inicio: hoyMasDias(1),
    fin: sumarHoras(hoyMasDias(1), 1),
    capacidad_max: 20,
    estado: 'programada',
  }));

  const { error } = await supabase.from('clases').upsert(filas, { onConflict: 'id' });
  fail('clases', error);
  console.log(`  clases: ${filas.length}`);
}

async function seedPerfiles(supabase: SupabaseClient): Promise<void> {
  const filas = USUARIOS.map((u, i) => ({
    id: uuidPerfil(i + 1),
    rol: u.rol,
    dni: u.dni,
    nombre: u.nombre,
    apellido: u.apellido,
    telefono: null,
    foto_url: null,
    sede_home_id: uuidSede(i + 1),
    notificar_por_email: true,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('perfiles').upsert(filas, { onConflict: 'dni', ignoreDuplicates: true });
  fail('perfiles', error);
  console.log(`  perfiles: ${filas.length} (roles: ${USUARIOS.map((u) => u.rol).join(', ')})`);
}

async function main(): Promise<void> {
  const url = requireEnv('SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const password = requireEnv('SEED_PASSWORD');

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  console.log('Seed entrega C-08 (>= 25 sedes)…');

  await seedSedes(supabase);
  await seedCanchas(supabase);
  await seedClases(supabase);
  await seedPerfiles(supabase);

  console.log('Listo.');
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Seed falló: ${message}`);
  process.exit(1);
});