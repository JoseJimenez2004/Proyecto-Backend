#!/usr/bin/env bash
# Detiene los microservicios de este proyecto iniciados con iniciar-backend.sh
# (también los que quedaron huérfanos de ejecuciones anteriores).
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="0.1.0-SNAPSHOT"
SILENCIOSO="${1:-}"

decir() { [ "$SILENCIOSO" = "--silencioso" ] || echo "$@"; }

# 1) Por PID registrado
for archivo in "$RAIZ"/logs/*.pid; do
  [ -e "$archivo" ] || continue
  pid="$(cat "$archivo")"
  servicio="$(basename "$archivo" .pid)"
  if kill "$pid" 2>/dev/null; then
    decir "Detenido $servicio (PID $pid)"
  fi
  rm -f "$archivo"
done

# 2) Cualquier jar de este proyecto que siga vivo (p. ej. de una ejecución anterior)
patron="$RAIZ/backend/.*/target/.*-$VERSION\.jar"
if pgrep -f "$patron" >/dev/null 2>&1; then
  pkill -f "$patron" || true
  decir "Detenidos procesos restantes del proyecto"
fi

# 3) Esperar a que liberen los puertos
for _ in $(seq 1 20); do
  pgrep -f "$patron" >/dev/null 2>&1 || break
  sleep 0.5
done

decir "Backend detenido."
