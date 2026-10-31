/**
 * S6-T02 — Pendiente: ver qué devuelve Supabase ante email duplicado.
 *
 * Uso (cuando no haya rate limit de mails):
 *   cd backend
 *   set PROBE_EMAIL=tu@gmail.com
 *   npm run probe:signup-dup
 *
 * Imprime error.message / identities.length del 1.er y 2.do signUp.
 * No crea fila en perfiles. El 1.er intento puede dejar un user en Auth:
 * borrarlo a mano en Authentication → Users si no lo querés.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const email = (process.env.PROBE_EMAIL || '').trim().toLowerCase();
const password = process.env.PROBE_PASSWORD || 'Prueba12345';

if (!url || !anon) {
  console.error('Faltan SUPABASE_URL o SUPABASE_ANON_KEY');
  process.exit(1);
}
if (!email || !email.includes('@')) {
  console.error('Definí PROBE_EMAIL=tu@correo.com');
  process.exit(1);
}

const client = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

function resumen(label, result) {
  const { data, error } = result;
  console.log(
    label,
    JSON.stringify(
      {
        error: error
          ? { message: error.message, status: error.status, code: error.code }
          : null,
        userId: data.user?.id ?? null,
        identitiesLen: Array.isArray(data.user?.identities)
          ? data.user.identities.length
          : null,
        session: Boolean(data.session),
      },
      null,
      2,
    ),
  );
}

(async () => {
  console.log('Probe email:', email);
  resumen('intento 1', await client.auth.signUp({ email, password }));
  resumen('intento 2', await client.auth.signUp({ email, password }));
  console.log(
    'Interpretar: si intento 2 tiene identitiesLen===0 o error "already…", el AuthService mapea a 409.',
  );
})().catch((e) => {
  console.error(e.cause || e);
  process.exit(1);
});
