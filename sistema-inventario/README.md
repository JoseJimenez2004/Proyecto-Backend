# Sistema de Inventario y Gestión de Equipo de Cómputo (ESCOM)

Proyecto final de *Web client and backend development frameworks* (7CM2).
Arquitectura de **microservicios** con **Java 21 + Spring Boot 4**, **PostgreSQL** y frontend en **Angular 22**.

Hay dos formas de ejecutarlo:

| Forma | Para qué | Necesitas |
|---|---|---|
| **Contenedores** (recomendada) | Probar el sistema completo, igual en cualquier máquina | `podman` y `podman-compose` |
| **Local** | Programar y depurar desde el IDE | Java 21, Maven, Node 22.22.3+ |

---

## Índice

1. [Inicio rápido con contenedores](#1-inicio-rápido-con-contenedores)
2. [Comandos del día a día](#2-comandos-del-día-a-día)
3. [Arquitectura](#3-arquitectura)
4. [Configuración: `config-files/`, `.env` y Dockerfiles](#4-configuración-config-files-env-y-dockerfiles)
5. [Base de datos](#5-base-de-datos)
6. [Probar la API con curl](#6-probar-la-api-con-curl)
7. [Modo local (sin contenedores)](#7-modo-local-sin-contenedores)
8. [Solución de problemas](#8-solución-de-problemas)
9. [Endpoints](#9-endpoints)
10. [Estructura del proyecto](#10-estructura-del-proyecto)
11. [Decisiones de diseño](#11-decisiones-de-diseño)
12. [Pendientes](#12-pendientes)

---

## 1. Inicio rápido con contenedores

### Paso 1. Instalar Podman y podman-compose (solo la primera vez)

```bash
sudo apt update
sudo apt install -y podman podman-compose curl
podman --version
podman-compose --version
```

> Se recomienda **podman-compose 1.1 o superior**, que respeta el orden de arranque por *healthchecks*.
> Si `apt` instala una versión anterior, instala la más reciente así:
> ```bash
> sudo apt install -y pipx && pipx ensurepath && source ~/.bashrc
> pipx install podman-compose
> ```
> Con versiones anteriores también funciona: los servicios se reinician solos hasta que PostgreSQL y Eureka están listos.

### Paso 2. Limpiar ejecuciones anteriores (solo si las hubo)

```bash
cd "~/Documents/Backen and Client/Proyecto-Backend/sistema-inventario"

./scripts/detener-backend.sh 2>/dev/null       # backend en modo local
podman pod rm -f proyecto-backend 2>/dev/null  # pod de la versión anterior con pod.sh
podman volume rm proyecto-backend-pgdata 2>/dev/null
# y Ctrl + C en cualquier terminal con "npm start"
```

### Paso 3. Crear el archivo de variables (opcional)

```bash
cp .env.example .env      # y edita .env si quieres cambiar puertos o contraseñas
```

Si no creas `.env`, se usan los valores por defecto (los mismos de `.env.example`).

### Paso 4. Construir y levantar los 7 contenedores

```bash
podman-compose up -d --build
```

La primera vez tarda varios minutos: descarga las imágenes base y compila cada microservicio y el frontend.

### Paso 5. Verificar y abrir

```bash
podman-compose ps          # todos deben estar "Up" y, tras ~1-2 min, "(healthy)"
```

Abre **http://localhost:18200** y entra con **`admin` / `Admin123!`**.

| Qué | Dirección |
|---|---|
| Aplicación (frontend) | http://localhost:18200 |
| API Gateway | http://localhost:18090 |
| Eureka (servicios registrados) | http://localhost:18761 |
| PostgreSQL | `localhost:15432` · usuario `inventario` · contraseña `inventario123` |

### Usuarios de prueba y qué ve cada rol

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin123!` | Administrador |
| `soporte` | `Soporte123!` | Soporte técnico |
| `consulta` | `Consulta123!` | Consulta |

| Pantalla / acción | Administrador | Soporte técnico | Consulta |
|---|:-:|:-:|:-:|
| Inicio con panel del rol y accesos rápidos | ✓ | ✓ | ✓ |
| Ver computadoras y catálogos | ✓ | ✓ | ✓ |
| Registrar y editar computadoras (menú *Registrar equipo*) | ✓ | ✓ | — |
| Eliminar computadoras | ✓ | — | — |
| Crear, editar y eliminar edificios | ✓ | — | — |
| **Usuarios** (menú *Administración*): alta, edición, rol, activar/desactivar | ✓ | — | — |

El menú lateral, el inicio y los botones cambian según el rol. Quien no puede modificar ve un aviso de
"modo consulta". La seguridad real la aplica el backend (`@PreAuthorize`): aunque alguien escriba la URL a mano,
el servidor responde 403.

---

## 2. Comandos del día a día

Todos se ejecutan desde la carpeta `sistema-inventario/`.

```bash
# Estado y logs
podman-compose ps                                    # estado de los contenedores
podman-compose logs -f auth-service                  # seguir el log de un servicio
podman-compose logs --tail 100 inventario-service    # últimas 100 líneas

# Después de cambiar código
podman-compose up -d --build                         # reconstruye lo que cambió y reinicia
podman-compose up -d --build catalogos-service       # reconstruir solo un servicio
podman-compose up -d --build frontend                # reconstruir solo el frontend

# Encender / apagar
podman-compose stop                                  # detener (conserva contenedores y datos)
podman-compose start                                 # volver a encender
podman-compose restart api-gateway                   # reiniciar un servicio
podman-compose down                                  # borrar contenedores (la base se conserva)
podman-compose down -v                               # borrar contenedores Y la base (empezar de cero)

# Entrar a un contenedor
podman exec -it inventario-postgres psql -U inventario -d inventario_catalogos
podman exec -it inventario-auth-service sh

# Imágenes del proyecto
podman images | grep inventario
```

Nombres de los servicios: `postgres`, `discovery-server`, `auth-service`, `catalogos-service`,
`inventario-service`, `api-gateway`, `frontend`.

> Con Podman 4.7 o superior también puedes escribir `podman compose` (con espacio) en lugar de `podman-compose`.

---

## 3. Arquitectura

**Un contenedor por microservicio**, más uno para el frontend y otro para la base de datos (7 en total).
Cada uno tiene su propia imagen.

```
                       ┌─────────────────────────────┐
  Navegador ─────────► │ frontend :18200             │  nginx + Angular
                       │ (reenvía /api/ al gateway)  │
                       └──────────────┬──────────────┘
                                      ▼
                       ┌─────────────────────────────┐
                       │ api-gateway :18090          │  Spring Cloud Gateway
                       └──────────────┬──────────────┘
                                      │ lb://servicio (Eureka)
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌───────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│ auth-service      │   │ catalogos-service     │◄──┤ inventario-service    │
│ :18081            │   │ :18082                │   │ :18083                │
│ usuarios y roles  │   │ edificios, expertos,  │   │ computadoras          │
│ emite el JWT      │   │ distribuidores, SO... │   │ (valida edificio y    │
│                   │   │                       │   │  distribuidor)        │
└─────────┬─────────┘   └───────────┬───────────┘   └───────────┬───────────┘
          ▼                         ▼                           ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │ postgres :5432  (en tu máquina :15432)                            │
  │   inventario_auth  ·  inventario_catalogos  ·  inventario_equipos │
  └───────────────────────────────────────────────────────────────────┘

                       ┌─────────────────────────────┐
                       │ discovery-server :18761     │  Eureka: registro de servicios
                       └─────────────────────────────┘
```

| Servicio (compose) | Contenedor | Imagen | Puerto |
|---|---|---|---|
| `postgres` | `inventario-postgres` | `inventario-postgres` | 15432 → 5432 |
| `discovery-server` | `inventario-discovery-server` | `inventario-discovery-server` | 18761 |
| `auth-service` | `inventario-auth-service` | `inventario-auth-service` | 18081 |
| `catalogos-service` | `inventario-catalogos-service` | `inventario-catalogos-service` | 18082 |
| `inventario-service` | `inventario-inventario-service` | `inventario-inventario-service` | 18083 |
| `api-gateway` | `inventario-api-gateway` | `inventario-api-gateway` | 18090 |
| `frontend` | `inventario-frontend` | `inventario-frontend` | 18200 |

Los puertos están en el rango **18xxx** para no chocar con otros programas (Apache, Tomcat, XAMPP, otros
proyectos que usan 8080/8081...).

**Orden de arranque** (lo controla `compose.yaml` con `depends_on` y *healthchecks*):
`postgres` → `discovery-server` → `auth`, `catalogos`, `inventario` → `api-gateway` → `frontend`.

### Versiones

| Componente | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.8 |
| Spring Cloud | 2025.1.3 (Oakwood) |
| PostgreSQL | 17 |
| Angular | 22 (TypeScript 6.0, Node 22.22.3+) |

---

## 4. Configuración: `config-files/`, `.env` y Dockerfiles

### 4.1 Dónde vive cada configuración

| Qué | Dónde |
|---|---|
| Puertos, contraseñas, secreto JWT, memoria de la JVM | **`.env`** (a partir de `.env.example`) |
| Qué contenedores hay y cómo se conectan | **`compose.yaml`** |
| Configuración de PostgreSQL (imagen + script que crea las bases) | **`config-files/postgres/`** |
| Configuración de nginx (plantilla con variables) | **`config-files/nginx/`** |
| Valores por defecto de cada microservicio | `backend/<servicio>/src/main/resources/application.yml` |
| Ajustes para PostgreSQL (perfil `postgres`) | `backend/<servicio>/src/main/resources/application-postgres.yml` |
| Esquema y datos de prueba (Flyway) | `backend/<servicio>/src/main/resources/db/migration/` |

> Los `application.yml` se quedan dentro de cada servicio a propósito: así el servicio arranca igual en el IDE,
> en las pruebas y en el contenedor. Todo lo que cambia entre entornos se **sobrescribe con variables de entorno**
> (por ejemplo `DB_HOST`, `JWT_SECRET`, `SERVER_PORT`), que vienen de `.env` a través de `compose.yaml`.

### 4.2 Variables de `.env`

| Variable | Por defecto | Uso |
|---|---|---|
| `PUERTO_FRONTEND` | `18200` | Puerto de la aplicación web |
| `PUERTO_GATEWAY` | `18090` | Puerto del api-gateway |
| `PUERTO_EUREKA` | `18761` | Puerto de Eureka |
| `PUERTO_AUTH` / `PUERTO_CATALOGOS` / `PUERTO_INVENTARIO` | `18081` / `18082` / `18083` | Puertos de los microservicios |
| `PUERTO_POSTGRES` | `15432` | Puerto de PostgreSQL **en tu máquina** (dentro del contenedor es 5432) |
| `DB_USER` / `DB_PASSWORD` | `inventario` / `inventario123` | Credenciales de PostgreSQL (solo se aplican al crear el volumen) |
| `JWT_SECRET` | (valor de desarrollo) | Secreto compartido del JWT, mínimo 32 caracteres |
| `JAVA_OPTS` | `-Xms64m -Xmx384m -XX:+UseSerialGC` | Memoria de cada JVM |
| `JAVA_VERSION` / `NODE_VERSION` / `POSTGRES_VERSION` | `21` / `24` / `17` | Versiones de las imágenes base (argumentos de construcción) |

`.env` **no se sube a Git** (está en `.gitignore`); `.env.example` sí.

### 4.3 Dockerfiles: `ARG` y `ENV`

- **`ARG`**: solo existe al **construir** la imagen. Se usa para versiones (`JAVA_VERSION`, `NODE_VERSION`,
  `POSTGRES_VERSION`) y para elegir el microservicio (`SERVICIO`).
- **`ENV`**: valores por defecto **al ejecutar** el contenedor (`SERVER_PORT`, `JAVA_OPTS`, `TZ`, `GATEWAY_URL`...).
  `compose.yaml` los sobrescribe.
- **Nunca** se ponen contraseñas en un Dockerfile (quedarían grabadas en la imagen): llegan en tiempo de
  ejecución desde `.env`.

| Dockerfile | Contexto | Genera |
|---|---|---|
| `backend/Dockerfile` | `./backend` | Una imagen por microservicio con `--build-arg SERVICIO=<modulo>`. Compila con Maven solo ese módulo (y `common`) y la imagen final lleva solo el JRE y el `.jar`, ejecutado con un usuario sin privilegios. |
| `frontend/Dockerfile` | `.` (raíz) | Compila Angular y lo sirve con nginx. Usa `config-files/nginx/default.conf.template`, donde `${PUERTO_FRONTEND}` y `${GATEWAY_URL}` se reemplazan al arrancar. |
| `config-files/postgres/Dockerfile` | `./config-files/postgres` | PostgreSQL 17 con `01-crear-bases.sh`, que crea las bases listadas en `BASES_DATOS` la primera vez. |

Construir una imagen a mano (sin compose):

```bash
podman build --build-arg SERVICIO=auth-service -t localhost/inventario-auth-service ./backend
podman build -f frontend/Dockerfile -t localhost/inventario-frontend .
podman build -t localhost/inventario-postgres ./config-files/postgres
```

---

## 5. Base de datos

### 5.1 Una base por microservicio

| Base | Servicio | Tablas |
|---|---|---|
| `inventario_auth` | auth-service | `rol`, `usuario`, `usuario_rol` |
| `inventario_catalogos` | catalogos-service | `edificio_campus`, `distribuidor`, `categoria_software`, `departamento`, `experto_soporte`, `sistema_operativo` |
| `inventario_equipos` | inventario-service | `computadora` (siguientes: `software`, `instalacion_software`, `instalacion_so`, `mantenimiento`) |

Las tablas las crea **Flyway** al arrancar cada servicio:

- `V1__esquema_*.sql`: tablas con los `CHECK`, llaves únicas y foráneas del Avance 1, adaptadas a PostgreSQL.
- `V2__datos_prueba.sql`: los datos de prueba del Avance 1.

Hibernate solo **valida** que las entidades coincidan con las tablas (`ddl-auto: validate`).
Los usuarios de prueba los crea `auth-service` al arrancar, con las contraseñas cifradas con BCrypt.

Los datos viven en el volumen `pgdata` y **se conservan** entre reinicios. `podman-compose down -v` los borra.

### 5.2 Conectarse

**Desde la terminal**, sin instalar nada:

```bash
podman exec -it inventario-postgres psql -U inventario -d inventario_catalogos
```

```sql
\l                                -- listar bases
\dt                               -- listar tablas
SELECT * FROM edificio_campus;
SELECT e.num_empleado, e.primer_nombre, d.nombre AS departamento
  FROM experto_soporte e JOIN departamento d ON d.id_departamento = e.id_departamento;
\c inventario_equipos             -- cambiar de base
SELECT num_inventario, marca, modelo, fecha_fin_garantia FROM computadora
 WHERE fecha_fin_garantia < CURRENT_DATE;   -- equipos fuera de garantía
\c inventario_auth
SELECT u.username, r.nombre FROM usuario u
  JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario JOIN rol r ON r.id_rol = ur.id_rol;
\q                                -- salir
```

**Desde DBeaver o pgAdmin:**

| Dato | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `15432` |
| Usuario / contraseña | `inventario` / `inventario123` |
| Bases | `inventario_auth`, `inventario_catalogos`, `inventario_equipos` |

### 5.3 Cambios al esquema

No edites un `V1__` o `V2__` que ya se aplicó (Flyway detecta el cambio y el servicio no arranca).
Crea una migración nueva, por ejemplo `V3__software.sql`, en `db/migration/` del servicio correspondiente.

---

## 6. Probar la API con curl

Todo pasa por el gateway (puerto 18090):

```bash
# 1) Login: obtener el token
TOKEN=$(curl -s -X POST localhost:18090/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin123!"}' \
  | sed -E 's/.*"token":"([^"]+)".*/\1/')
echo $TOKEN

# 2) Mi usuario
curl -s localhost:18090/api/auth/me -H "Authorization: Bearer $TOKEN"

# 3) Catálogos
curl -s localhost:18090/api/catalogos/edificios -H "Authorization: Bearer $TOKEN"
curl -s localhost:18090/api/catalogos/expertos  -H "Authorization: Bearer $TOKEN"

# 4) Computadoras (búsqueda paginada con filtros)
curl -s "localhost:18090/api/inventario/computadoras?estado=Activo&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"

# 5) Crear una computadora (valida edificio y distribuidor contra catalogos-service)
curl -s -X POST localhost:18090/api/inventario/computadoras \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{
    "numInventario": "ESCOM-00200", "numeroSerie": "SN-TEST-001",
    "marca": "Dell", "modelo": "Latitude 5440", "tipoEquipo": "Portatil",
    "fechaCompra": "2026-01-15", "costoAdquisicion": 18500.00,
    "fechaFinGarantia": "2029-01-15", "estado": "Activo",
    "idEdificio": 2, "idDistribuidor": 1
  }'

# 6) Error esperado: edificio inexistente -> 409 "No existe el edificio con id 99"
curl -s -X POST localhost:18090/api/inventario/computadoras \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"numInventario":"X-1","numeroSerie":"X-1","marca":"X","modelo":"X","tipoEquipo":"Servidor",
       "fechaCompra":"2026-01-01","costoAdquisicion":1,"estado":"Activo","idEdificio":99,"idDistribuidor":1}'

# 7) Sin token -> 401
curl -i localhost:18090/api/catalogos/edificios

# Salud de cada servicio
for p in 18761 18081 18082 18083 18090; do echo -n "$p: "; curl -s localhost:$p/actuator/health; echo; done
```

---

## 7. Modo local (sin contenedores)

Útil para programar: cada servicio corre con Maven y usa una base **H2 en memoria** (se borra al detenerlo).

> No uses el modo local y los contenedores a la vez: ocupan los mismos puertos.
> Detén los contenedores con `podman-compose stop`.

### 7.1 Requisitos

```bash
# Java 21
sudo apt install -y openjdk-21-jdk
java -version                         # debe decir 21
# Si tienes varias versiones:
sudo update-alternatives --config java
# JAVA_HOME (agregar al final de ~/.bashrc y luego: source ~/.bashrc)
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"

# Maven
sudo apt install -y maven
mvn -v                                # debe mostrar "Java version: 21"

# Node.js 22.22.3+ con nvm (Angular 22 no funciona con Node 20)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22 && nvm use 22 && nvm alias default 22
node -v                               # v22.22.3 o mayor
```

### 7.2 Ejecutar

```bash
cd "~/Documents/Backen and Client/Proyecto-Backend/sistema-inventario"

# Terminal 1: backend (compila y levanta los 5 servicios en orden, con H2)
./scripts/iniciar-backend.sh
tail -f logs/auth-service.log         # ver el log de un servicio
./scripts/detener-backend.sh          # detener

# Terminal 2: frontend
cd frontend
npm install                           # solo la primera vez
npm start                             # http://localhost:18200
```

Otras formas de arrancar el backend:

```bash
cd backend
mvn clean install                         # compilar todo y ejecutar pruebas
mvn -pl discovery-server spring-boot:run  # cada servicio en su terminal, en este orden:
mvn -pl auth-service spring-boot:run      #   discovery-server, auth, catalogos,
mvn -pl catalogos-service spring-boot:run #   inventario y al final api-gateway
mvn -pl inventario-service spring-boot:run
mvn -pl api-gateway spring-boot:run
```

En IntelliJ: abre la carpeta `backend/` como proyecto Maven (SDK 21) y ejecuta la clase `*Application` de cada
módulo en el mismo orden.

### 7.3 Consola H2 (solo modo local)

| Servicio | Consola | JDBC URL |
|---|---|---|
| auth-service | http://localhost:18081/h2-console | `jdbc:h2:mem:auth` |
| catalogos-service | http://localhost:18082/h2-console | `jdbc:h2:mem:catalogos` |
| inventario-service | http://localhost:18083/h2-console | `jdbc:h2:mem:inventario` |

Usuario `sa`, contraseña vacía.

---

## 8. Solución de problemas

### 8.1 Contenedores

| Síntoma | Causa / solución |
|---|---|
| `ls: can't open '/docker-entrypoint-initdb.d/': Permission denied` | Pasaba con la versión anterior (`pod.sh`), que montaba una carpeta de tu disco en PostgreSQL y Podman sin root no la podía leer. **Ya corregido:** el script de bases se copia dentro de la imagen (`config-files/postgres/Dockerfile`). Si quedó un pod viejo: `podman pod rm -f proyecto-backend` |
| `address already in use` / `port is already allocated` | Un puerto está ocupado (¿el pod viejo o el modo local?): `podman pod rm -f proyecto-backend`, `./scripts/detener-backend.sh`, o `sudo ss -ltnp \| grep <puerto>`. También puedes cambiar el puerto en `.env` |
| Un servicio se reinicia una y otra vez | `podman-compose logs --tail 100 <servicio>` muestra el error |
| `UnknownHostException: postgres` o `discovery-server` | Falta el DNS de redes de Podman: `sudo apt install -y aardvark-dns` (Podman 4+) o `golang-github-containernetworking-plugin-dnsname` (Podman 3). Luego `podman-compose down && podman-compose up -d` |
| `password authentication failed` | Cambiaste `DB_PASSWORD` con una base ya creada. Para empezar de cero: `podman-compose down -v && podman-compose up -d` |
| Flyway: `Validate failed: Migration checksum mismatch` | Se editó una migración ya aplicada. Crea `V3__...sql` o borra la base con `podman-compose down -v` |
| El login responde **503** al principio | Los servicios aún no se registran en Eureka (~30 s). Revisa http://localhost:18761 |
| Login funciona pero catálogos/computadoras dan **503** ("Un servicio no está disponible") | `catalogos-service` o `inventario-service` no arrancó. Pasaba por `defer-datasource-initialization` junto con Flyway (dependencia circular); **ya corregido** en `application-postgres.yml`. Reconstruye: `podman-compose up -d --build catalogos-service inventario-service`. Revisa con `podman-compose logs --tail 100 catalogos-service` |
| Avisos `can't raise ambient capability CAP_...` al construir | Normales con Podman sin root; se pueden ignorar |
| `short-name ... did not resolve` | Las imágenes ya usan el nombre completo (`docker.io/library/...`); actualiza Podman si persiste |
| Construir parece congelado en `mvn ... package` | Maven corre en modo silencioso (`-q`); la primera vez tarda varios minutos |

### 8.2 Modo local

| Síntoma | Causa / solución |
|---|---|
| `Port XXXX was already in use` / `La dirección ya se está usando` | `./scripts/detener-backend.sh`; si sigue: `sudo ss -ltnp \| grep <puerto>` y `kill <PID>` |
| `invalid target release: 21` | Maven usa otro JDK: revisa `mvn -v` y `JAVA_HOME` |
| `npm install` con avisos `EBADENGINE` | Node es muy viejo: `node -v` debe ser ≥ 22.22.3 (ver 7.1) |
| `Port 18200 is already in use` al hacer `npm start` | Quedó otro `ng serve` abierto: ciérralo con `Ctrl + C` |
| Login responde **404** con `Server: Apache` en DevTools | La petición no llegó al gateway sino a otro servidor. Por eso los puertos del proyecto están en el rango 18xxx |
| **401** en todas las peticiones | Token vencido o `JWT_SECRET` distinto entre servicios: vuelve a iniciar sesión |
| **403** | El rol no tiene permiso: usa `admin` para modificar catálogos |

---

## 9. Endpoints

| Método | Ruta | Rol |
|---|---|---|
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | autenticado |
| GET / POST / PUT | `/api/auth/usuarios[/{id}]` | ADMIN |
| GET | `/api/catalogos/edificios[/{id}]` | autenticado |
| GET | `/api/catalogos/distribuidores[/{id}]` | autenticado |
| GET | `/api/catalogos/categorias-software[/{id}]` | autenticado |
| GET | `/api/catalogos/departamentos[/{id}]` | autenticado |
| GET | `/api/catalogos/expertos[/{id}]` | autenticado |
| GET | `/api/catalogos/sistemas-operativos[/{id}]` | autenticado |
| POST / PUT / DELETE | cualquiera de las rutas de catálogos | ADMIN |
| GET | `/api/inventario/computadoras?q=&estado=&idEdificio=&page=&size=&sort=` | autenticado |
| GET | `/api/inventario/computadoras/{id}` | autenticado |
| POST / PUT | `/api/inventario/computadoras[/{id}]` | ADMIN, SOPORTE |
| DELETE | `/api/inventario/computadoras/{id}` | ADMIN |

Formato de error (RFC 9457):

```json
{ "status": 409, "title": "Regla de negocio", "detail": "Ya existe un espacio con la clave LAB-C1" }
{ "status": 400, "title": "Datos inválidos", "detail": "Revisa los campos marcados",
  "errores": { "clave": "La clave es obligatoria" } }
```

| Código | Significado |
|---|---|
| 400 | Datos inválidos (validación) |
| 401 | Sin token o credenciales incorrectas |
| 403 | El rol no tiene permiso |
| 404 | El registro no existe |
| 409 | Regla de negocio o integridad (duplicado, registro en uso) |
| 503 | Un servicio del que se depende no responde |

---

## 10. Estructura del proyecto

```
sistema-inventario/
├── compose.yaml                     # los 7 contenedores
├── .env.example                     # variables (copiar a .env)
├── .dockerignore                    # exclusiones al construir el frontend (contexto raíz)
├── README.md
├── config-files/
│   ├── postgres/
│   │   ├── Dockerfile               # imagen de PostgreSQL del proyecto
│   │   └── 01-crear-bases.sh        # crea las bases de BASES_DATOS (primera vez)
│   └── nginx/
│       └── default.conf.template    # nginx del frontend (${PUERTO_FRONTEND}, ${GATEWAY_URL})
├── scripts/                         # modo local (H2)
│   ├── iniciar-backend.sh
│   └── detener-backend.sh
├── backend/
│   ├── Dockerfile                   # una imagen por microservicio (ARG SERVICIO)
│   ├── pom.xml                      # POM padre (versiones de Boot y Cloud)
│   ├── common/                      # seguridad JWT + manejo de errores
│   ├── discovery-server/            # Eureka
│   ├── api-gateway/                 # Spring Cloud Gateway
│   ├── auth-service/
│   ├── catalogos-service/
│   └── inventario-service/
│       └── src/main/
│           ├── java/mx/ipn/escom/inventario/inventario/
│           │   ├── dominio/         # entidades JPA
│           │   ├── repositorio/     # Spring Data
│           │   ├── dto/             # records de entrada y salida
│           │   ├── servicio/        # reglas de negocio
│           │   ├── web/             # controladores REST
│           │   └── cliente/         # llamadas a otros microservicios
│           └── resources/
│               ├── application.yml           # valores por defecto (H2)
│               ├── application-postgres.yml  # perfil postgres (contenedores)
│               ├── data.sql                  # datos de prueba para H2
│               └── db/migration/             # Flyway: V1 esquema, V2 datos
└── frontend/
    ├── Dockerfile                   # compila Angular y lo sirve con nginx
    ├── package.json
    ├── angular.json
    ├── proxy.conf.json              # /api -> localhost:18090 (solo ng serve, modo local)
    └── src/app/
        ├── core/                    # auth, interceptor, guards, servicios HTTP, modelos
        ├── layout/                  # menú lateral (shell)
        ├── shared/                  # componentes reutilizables (íconos SVG)
        └── pages/                   # login, inicio, edificios, computadoras, usuarios
```

---

## 11. Decisiones de diseño

- **Una base de datos por microservicio.** Las relaciones que cruzan servicios (`computadora → edificio_campus`,
  `computadora → distribuidor`) se guardan como **id** y se validan **llamando al otro servicio**
  (`inventario-service/.../cliente/CatalogosClient.java`). Dentro de un mismo servicio
  (`experto_soporte → departamento`) sí hay llaves foráneas reales.
- **Agrupación por contexto:** computadora, software, instalaciones y mantenimiento irán en `inventario-service`,
  para que las consultas del Avance 1 sigan siendo un `JOIN` en una sola base.
- **JWT HS256** firmado por `auth-service` y validado en **cada** servicio, así que llamar directo a un puerto
  sin pasar por el gateway también exige token.
- **Roles** `ADMIN`, `SOPORTE`, `CONSULTA` aplicados con `@PreAuthorize`. Los guards de Angular solo ocultan
  pantallas; la seguridad real está en el backend.
- **DTOs (records) y Bean Validation** que replican los `CHECK` del Avance 1. Las entidades nunca se devuelven
  directamente. Errores uniformes con `ProblemDetail`.
- **Contenedores:** una imagen por servicio, configuración por variables de entorno, sin secretos en las imágenes,
  la configuración de infraestructura copiada en la imagen (sin montar carpetas) y el JRE ejecutado con un usuario
  sin privilegios.
- **Frontend:** componentes *standalone*, `signal()` para el estado y *control flow* `@if / @for`.
  `core/auth.interceptor.ts` agrega el `Bearer` y cierra sesión ante un 401. Los demás catálogos se construyen
  copiando el patrón de `pages/edificios/`.

---

## 12. Pendientes

1. **inventario-service**: `software`, `instalacion_software` e `instalacion_so` (llaves compuestas con
   `@EmbeddedId` + `@MapsId`), `mantenimiento` y los **reportes** (licencias vencidas, gasto fuera de garantía,
   arranque dual, etc.). El "único SO principal por equipo" se resolverá con un índice único parcial:
   `CREATE UNIQUE INDEX ... ON instalacion_so(id_computadora) WHERE es_principal`.
2. **Redundancia controlada de `distribuidor`** (`monto_total_compra`, `numero_total_pedidos`): decidir si
   inventario la actualiza al dar de alta un equipo o se calcula bajo demanda.
3. **Borrado de catálogos en uso**: consultar a inventario antes de borrar un edificio o distribuidor, o usar solo
   baja lógica (`activo = false`).
4. Pantallas de Angular para los demás catálogos (distribuidores, expertos, departamentos, categorías, SO).
5. Documentación OpenAPI (springdoc) y pruebas de integración con Testcontainers.
