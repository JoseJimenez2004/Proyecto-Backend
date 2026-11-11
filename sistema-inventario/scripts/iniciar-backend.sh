#!/usr/bin/env bash
# Compila el backend y levanta los 5 microservicios en segundo plano.
#  - Detiene instancias anteriores de este proyecto.
#  - Verifica que los puertos estén libres ANTES de arrancar.
#  - Espera a que cada servicio responda "UP" en /actuator/health.
#    Si alguno falla, muestra las últimas líneas de su log y se detiene.
#
# Logs en ./logs/<servicio>.log   ·   Para detener: ./scripts/detener-backend.sh
# Puerto del gateway configurable:  GATEWAY_PORT=18095 ./scripts/iniciar-backend.sh
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="0.1.0-SNAPSHOT"
export GATEWAY_PORT="${GATEWAY_PORT:-18090}"
mkdir -p "$RAIZ/logs"

SERVICIOS=(
  "discovery-server:18761"
  "auth-service:18081"
  "catalogos-service:18082"
  "inventario-service:18083"
  "api-gateway:${GATEWAY_PORT}"
)

puerto_ocupado() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}

quien_usa() {
  if command -v ss >/dev/null; then
    ss -ltnp "sport = :$1" 2>/dev/null | tail -n +2 || true
  elif command -v lsof >/dev/null; then
    lsof -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null || true
  fi
}

# 1) Detener instancias anteriores de este proyecto
"$RAIZ/scripts/detener-backend.sh" --silencioso || true

# 2) Verificar puertos libres
ocupados=0
for entrada in "${SERVICIOS[@]}"; do
  servicio="${entrada%%:*}"; puerto="${entrada##*:}"
  if puerto_ocupado "$puerto"; then
    echo "✗ El puerto $puerto (para $servicio) ya está en uso por otro programa:"
    quien_usa "$puerto" | sed 's/^/    /'
    ocupados=1
  fi
done
if [ "$ocupados" -eq 1 ]; then
  echo
  echo "Libera esos puertos y vuelve a intentar. Opciones:"
  echo "  - Ver el proceso:   sudo ss -ltnp | grep <puerto>"
  echo "  - Detenerlo:        kill <PID>   (o, si es Apache: sudo systemctl stop apache2)"
  echo "  - Gateway en otro puerto:  GATEWAY_PORT=18095 ./scripts/iniciar-backend.sh"
  exit 1
fi

# 3) Compilar
echo "Compilando (mvn install, sin pruebas)..."
(cd "$RAIZ/backend" && mvn -q -DskipTests install)

# 4) Arrancar y esperar salud
iniciar() {
  local servicio="$1"
  nohup java -jar "$RAIZ/backend/$servicio/target/$servicio-$VERSION.jar" \
    > "$RAIZ/logs/$servicio.log" 2>&1 &
  echo "$!" > "$RAIZ/logs/$servicio.pid"
  echo "  → $servicio (PID $!)"
}

esperar_salud() {
  local servicio="$1" puerto="$2" pid intentos=120
  pid="$(cat "$RAIZ/logs/$servicio.pid")"
  while [ "$intentos" -gt 0 ]; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "✗ $servicio se detuvo al arrancar. Últimas líneas de logs/$servicio.log:"
      tail -n 25 "$RAIZ/logs/$servicio.log" | sed 's/^/    /'
      exit 1
    fi
    if curl -sf "http://localhost:$puerto/actuator/health" 2>/dev/null | grep -q '"UP"'; then
      echo "  ✓ $servicio listo en el puerto $puerto"
      return
    fi
    intentos=$((intentos - 1))
    sleep 1
  done
  echo "✗ $servicio no respondió en 2 minutos. Revisa logs/$servicio.log"
  exit 1
}

echo "Iniciando servicios:"
iniciar discovery-server
esperar_salud discovery-server 18761

for s in auth-service catalogos-service inventario-service; do iniciar "$s"; done
esperar_salud auth-service 18081
esperar_salud catalogos-service 18082
esperar_salud inventario-service 18083

iniciar api-gateway
esperar_salud api-gateway "$GATEWAY_PORT"

cat <<EOF

Listo.
  Eureka:      http://localhost:18761
  Gateway:     http://localhost:$GATEWAY_PORT
  Consola H2:  http://localhost:18081/h2-console  (auth)
               http://localhost:18082/h2-console  (catalogos)
               http://localhost:18083/h2-console  (inventario)

Espera ~30 s a que los servicios aparezcan registrados en Eureka antes de usar el frontend.
EOF
