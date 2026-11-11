#!/usr/bin/env bash
# Detiene los microservicios iniciados con iniciar-backend.sh
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"

for archivo in "$RAIZ"/logs/*.pid; do
  [ -e "$archivo" ] || { echo "No hay servicios registrados en logs/"; exit 0; }
  pid="$(cat "$archivo")"
  servicio="$(basename "$archivo" .pid)"
  if kill "$pid" 2>/dev/null; then
    echo "Detenido $servicio (PID $pid)"
  fi
  rm -f "$archivo"
done
