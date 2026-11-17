# =============================================================================
# FitZone Sports — Backend (NestJS 12)
# Dockerfile multi-stage: deps → build → run
# =============================================================================

# --- Stage 1: dependencias ---------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar solo los manifiestos para aprovechar caché de Docker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# --- Stage 2: build ---------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Instalar TODAS las dependencias (incluido dev) para poder compilar con Nest CLI
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 3: runtime -------------------------------------------------------
FROM node:20-alpine AS run
WORKDIR /app

# Solo artefactos necesarios para ejecutar
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

# El punto de entrada de NestJS queda en dist/main.js
CMD ["node", "dist/main"]