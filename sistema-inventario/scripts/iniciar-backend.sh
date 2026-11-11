#!/usr/bin/env bash
# Compila el backend y levanta los 5 microservicios en segundo plano.
# Logs en ./logs/<servicio>.log   ·   Para detener: ./scripts/detener-backend.sh
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="0.1.0-SNAPSHOT"
mkdir -p "$RAIZ/logs"

echo "Compilando (mvn install, sin pruebas)..."
(cd "$RAIZ/backend" && mvn -q -DskipTests install)

iniciar() {
  local servicio="$1"
  nohup java -jar "$RAIZ/backend/$servicio/target/$servicio-$VERSION.jar" \
    > "$RAIZ/logs/$servicio.log" 2>&1 &
  echo "$!" > "$RAIZ/logs/$servicio.pid"
  echo "  $servicio  (PID $!)"
}

esperar_puerto() {
  local puerto="$1" intentos=60
  until curl -s -o /dev/null "http://localhost:$puerto/actuator/health" \
        || curl -s -o /dev/null "http://localhost:$puerto"; do
    intentos=$((intentos - 1))
    if [ "$intentos" -le 0 ]; then echo "  ...el puerto $puerto no respondió, revisa logs/"; return; fi
    sleep 1
  done
}

echo "Iniciando servicios:"
iniciar discovery-server
esperar_puerto 8761
iniciar auth-service
iniciar catalogos-service
iniciar inventario-service
esperar_puerto 8083
iniciar api-gateway
esperar_puerto 8080

echo
echo "Listo. Eureka: http://localhost:8761   Gateway: http://localhost:8080"
echo "Los servicios tardan unos segundos más en aparecer registrados en Eureka."
