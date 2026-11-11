# =====================================================================
# Frontend Angular: se compila y se sirve con nginx.
# Se construye DESDE LA RAÍZ del proyecto (contexto ".") para poder copiar
# config-files/nginx/default.conf.template:
#
#   podman build -f frontend/Dockerfile -t localhost/inventario-frontend .
# =====================================================================
ARG NODE_VERSION=24

# ---------- Etapa 1: compilar Angular ----------
FROM docker.io/library/node:${NODE_VERSION}-bookworm-slim AS compilacion
WORKDIR /app

COPY frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

COPY frontend/ .
RUN npx ng build --configuration production

# ---------- Etapa 2: servir con nginx ----------
FROM docker.io/library/nginx:alpine

# Valores por defecto de la plantilla de nginx (compose.yaml / .env los sobrescriben).
# Al arrancar, nginx genera conf.d/default.conf reemplazando estas variables.
ENV PUERTO_FRONTEND=18200 \
    GATEWAY_URL=http://api-gateway:18090 \
    NGINX_ENVSUBST_FILTER="^(PUERTO_FRONTEND|GATEWAY_URL)$"

COPY config-files/nginx/default.conf.template /etc/nginx/templates/default.conf.template
RUN rm -f /etc/nginx/conf.d/default.conf \
 && chmod 644 /etc/nginx/templates/default.conf.template

COPY --from=compilacion /app/dist/inventario-escom-web/browser/ /usr/share/nginx/html/

EXPOSE 18200
