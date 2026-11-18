#!/usr/bin/env bash
# Corre canchas_m4.test.sql contra un PostgreSQL local vacío.
# NO ejecutar contra Supabase: el stub reemplaza auth.users.
#
# Variables de libpq: PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE
#
#   PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=postgres PGDATABASE=fz_test \
#     bash supabase/tests/run-canchas-m4.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

psql -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/00_fase_a_simulada.sql"

for f in "$ROOT"/supabase/migrations/*.sql; do
  psql -v ON_ERROR_STOP=1 -1 -f "$f"
done

psql -v ON_ERROR_STOP=1 -c "grant all on all tables in schema public to anon, authenticated, service_role; grant execute on all functions in schema public to service_role;"

LOG="$(mktemp)"
set +e
psql -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/canchas_m4.test.sql" >"$LOG" 2>&1
STATUS=$?
set -e
cat "$LOG"
if [ "$STATUS" -ne 0 ]; then
  exit "$STATUS"
fi
if ! grep -q 'OK 3' "$LOG"; then
  echo "FALLO: la salida no contiene OK 3" >&2
  exit 1
fi
