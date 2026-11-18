# =============================================================================
# FitZone Sports — Frontend (React 19 + Vite)
# Dockerfile multi-stage: build con Vite, served con nginx
# =============================================================================

# --- Stage 1: build ---------------------------------------------------------
# bookworm-slim: node:22-alpine rompe `npm ci` ("Exit handler never called").
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY certs ./certs

# Si hay un CA local (antivirus que intercepta HTTPS), Node lo usa para npm.
RUN set -eu; \
    if [ -s certs/extra-ca.crt ]; then \
      export NODE_EXTRA_CA_CERTS=/app/certs/extra-ca.crt; \
    fi; \
    npm ci --ignore-scripts

COPY . .

# Vite congela estas variables en el build. El navegador habla con el
# backend publicado en el host, no con el nombre interno de la red Docker.
ARG VITE_API_URL=http://localhost:3000
ARG VITE_SUPABASE_URL=
ARG VITE_SUPABASE_PUBLISHABLE_KEY=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# --- Stage 2: runtime -------------------------------------------------------
FROM nginx:alpine AS run
WORKDIR /usr/share/nginx/html

# Copiar el build de Vite (genera ./dist)
COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /usr/share/nginx/html

# El host publica el puerto 80. Dentro de la imagen nginx no es root y escucha 8080.
USER nginx
EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]