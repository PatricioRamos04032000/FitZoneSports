/**
 * En Windows, fetch a Supabase a veces falla sin las CA del sistema
 * (UNABLE_TO_VERIFY_LEAF_SIGNATURE / "fetch failed").
 * Propaga --use-system-ca al proceso Nest (watch/fork).
 */
const { spawn } = require('child_process');

const flag = '--use-system-ca';
const prev = process.env.NODE_OPTIONS || '';
if (!prev.includes(flag)) {
  process.env.NODE_OPTIONS = prev ? `${prev} ${flag}` : flag;
}

const args = process.argv.slice(2);
const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  env: process.env,
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
