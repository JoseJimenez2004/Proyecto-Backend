#!/bin/sh
# Se ejecuta UNA sola vez, cuando el volumen de PostgreSQL está vacío.
# Crea una base por microservicio (patrón "database per service").
# La lista viene de la variable BASES_DATOS, separada por comas.
set -e

for base in $(echo "${BASES_DATOS}" | tr ',' ' '); do
  echo ">> Creando base de datos: ${base}"
  psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname postgres \
       -c "CREATE DATABASE \"${base}\";"
done
