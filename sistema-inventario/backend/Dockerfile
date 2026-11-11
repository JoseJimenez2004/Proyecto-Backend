# =====================================================================
# Dockerfile común para los 5 microservicios: genera UNA imagen por servicio
# según el argumento SERVICIO.
#
#   podman build --build-arg SERVICIO=auth-service -t localhost/inventario-auth-service ./backend
#
# compose.yaml lo usa 5 veces (discovery-server, api-gateway, auth-service,
# catalogos-service, inventario-service).
# =====================================================================
ARG JAVA_VERSION=21

# ---------- Etapa 1: compilar con Maven ----------
FROM docker.io/library/maven:3.9-eclipse-temurin-${JAVA_VERSION} AS compilacion
WORKDIR /src

# 1) Solo los pom.xml: descarga dependencias en una capa que se reutiliza entre
#    los 5 servicios y entre construcciones mientras no cambien los pom.
COPY pom.xml ./
COPY common/pom.xml common/
COPY discovery-server/pom.xml discovery-server/
COPY api-gateway/pom.xml api-gateway/
COPY auth-service/pom.xml auth-service/
COPY catalogos-service/pom.xml catalogos-service/
COPY inventario-service/pom.xml inventario-service/
RUN mvn -B -q -DskipTests -Dspring-boot.repackage.skip=true package || true

# 2) Código fuente y compilación SOLO del servicio pedido (y "common", del que depende)
COPY . .
ARG SERVICIO
RUN test -n "$SERVICIO" || (echo "Falta --build-arg SERVICIO=<modulo>" && exit 1) \
 && mvn -B -q -DskipTests -pl "$SERVICIO" -am package \
 && cp "$SERVICIO/target/$SERVICIO-0.1.0-SNAPSHOT.jar" /app.jar

# ---------- Etapa 2: solo el JRE y el jar ----------
FROM docker.io/library/eclipse-temurin:${JAVA_VERSION}-jre
ARG SERVICIO

# curl para el healthcheck de compose; usuario sin privilegios para ejecutar la app
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system app && useradd --system --gid app --home-dir /app app

WORKDIR /app
COPY --from=compilacion /app.jar /app/app.jar

# Valores por defecto; compose.yaml y .env los sobrescriben.
#   SERVER_PORT  -> Spring lo usa como server.port
#   JAVA_OPTS    -> opciones de la JVM (memoria, GC)
ENV SERVICIO=${SERVICIO} \
    TZ=America/Mexico_City \
    JAVA_OPTS="-Xms64m -Xmx384m -XX:+UseSerialGC"

LABEL org.opencontainers.image.title="inventario-${SERVICIO}" \
      org.opencontainers.image.description="Sistema de Inventario ESCOM - ${SERVICIO}"

USER app
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
