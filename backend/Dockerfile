# =============================================================================
# FitZone Sports — Backend (NestJS 12)
# Dockerfile multi-stage: build → run
#
# Node 22: @supabase/supabase-js y Nest lo piden. bookworm-slim evita
# fallos de npm vistos con la imagen alpine en este entorno.
# =============================================================================

# --- Stage 1: build ---------------------------------------------------------
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY certs ./certs

# Si hay un CA local (antivirus que intercepta HTTPS), Node lo usa para npm.
RUN set -eu; \
    if [ -s certs/extra-ca.crt ]; then \
      export NODE_EXTRA_CA_CERTS=/app/certs/extra-ca.crt; \
    fi; \
    npm ci

COPY . .
RUN npm run build

# --- Stage 2: runtime -------------------------------------------------------
FROM node:22-bookworm-slim AS run
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
# El seed corre con ts-node sobre estos scripts (npm run seed:entrega).
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/certs ./certs

RUN printf '%s\n' \
      '#!/bin/sh' \
      'if [ -s /app/certs/extra-ca.crt ]; then' \
      '  export NODE_EXTRA_CA_CERTS=/app/certs/extra-ca.crt' \
      'fi' \
      'exec "$@"' \
      > /usr/local/bin/docker-entrypoint.sh; \
    chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main"]
