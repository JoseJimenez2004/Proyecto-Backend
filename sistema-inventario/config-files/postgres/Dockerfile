# =====================================================================
# Imagen de PostgreSQL del proyecto.
# El script que crea las bases se COPIA dentro de la imagen (no se monta como
# volumen): así no hay problemas de permisos con Podman sin root
# ("ls: can't open '/docker-entrypoint-initdb.d/': Permission denied").
# =====================================================================
ARG POSTGRES_VERSION=17
FROM docker.io/library/postgres:${POSTGRES_VERSION}-alpine

# Valores por defecto (compose.yaml / .env los pueden sobrescribir)
ENV TZ=America/Mexico_City \
    POSTGRES_DB=postgres \
    BASES_DATOS=inventario_auth,inventario_catalogos,inventario_equipos

COPY 01-crear-bases.sh /docker-entrypoint-initdb.d/01-crear-bases.sh
RUN chmod 755 /docker-entrypoint-initdb.d /docker-entrypoint-initdb.d/01-crear-bases.sh

EXPOSE 5432
