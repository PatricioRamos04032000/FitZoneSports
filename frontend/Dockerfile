# =============================================================================
# FitZone Sports — Frontend (React 19 + Vite)
# Dockerfile multi-stage: build con Vite, served con nginx
# =============================================================================

# --- Stage 1: build ---------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: runtime -------------------------------------------------------
FROM nginx:alpine AS run
WORKDIR /usr/share/nginx/html

# Copiar el build de Vite (genera ./dist)
COPY --from=build /app/dist .

# Exponer puerto 80 (nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]