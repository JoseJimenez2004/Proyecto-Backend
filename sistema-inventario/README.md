# Sistema de Inventario y Gestión de Equipo de Cómputo (ESCOM)

Proyecto final de *Web client and backend development frameworks* (7CM2).
Arquitectura de **microservicios** con **Java 21 + Spring Boot 4** y frontend en **Angular 22**.

> **Estado:** primera iteración. La base de datos todavía es **H2 en memoria**: se crea al arrancar cada
> servicio con los datos de prueba del Avance 1 y **se borra al detenerlo**. El cambio a **PostgreSQL**
> está en "Pendientes".

---

## Índice

1. [Comandos rápidos](#1-comandos-rápidos)
2. [Arquitectura](#2-arquitectura)
3. [Requisitos e instalación (Ubuntu)](#3-requisitos-e-instalación-ubuntu)
4. [Compilar el backend](#4-compilar-el-backend)
5. [Ejecutar el backend](#5-ejecutar-el-backend)
6. [Ejecutar el frontend](#6-ejecutar-el-frontend)
7. [Verificar que todo funciona](#7-verificar-que-todo-funciona)
8. [Probar la API con curl](#8-probar-la-api-con-curl)
9. [Detener el sistema](#9-detener-el-sistema)
10. [Solución de problemas](#10-solución-de-problemas)
11. [Endpoints](#11-endpoints)
12. [Estructura del proyecto](#12-estructura-del-proyecto)
13. [Decisiones de diseño](#13-decisiones-de-diseño)
14. [Pendientes](#14-pendientes)

---

## 1. Comandos rápidos

Si ya tienes Java 21, Maven y Node 22.22+ instalados:

```bash
# Desde la carpeta sistema-inventario/

# Terminal 1: backend completo (compila y levanta los 5 servicios)
./scripts/iniciar-backend.sh

# Terminal 2: frontend
cd frontend
npm install        # solo la primera vez
npm start
```

Abre **http://localhost:4200** y entra con **`admin` / `Admin123!`**.

Para detener el backend: `./scripts/detener-backend.sh`. Para detener el frontend: `Ctrl + C`.

---

## 2. Arquitectura

```
                     ┌──────────────────────┐
  Angular 22  ─────► │  api-gateway  :8080  │  (Spring Cloud Gateway: enrutamiento y CORS)
  (ng serve :4200)   └──────────┬───────────┘
                                │ lb://nombre-servicio (resuelto con Eureka)
        ┌───────────────────────┼─────────────────────────┐
        ▼                       ▼                         ▼
┌──────────────────┐  ┌───────────────────────┐  ┌─────────────────────────┐
│ auth-service     │  │ catalogos-service     │◄─┤ inventario-service      │
│ :8081            │  │ :8082                 │  │ :8083                   │
│ usuario, rol     │  │ edificio_campus       │  │ computadora             │
│ emite el JWT     │  │ distribuidor          │  │ (siguiente: software,   │
│                  │  │ categoria_software    │  │  instalaciones,         │
│                  │  │ departamento          │  │  mantenimiento,         │
│                  │  │ experto_soporte       │  │  reportes)              │
│                  │  │ sistema_operativo     │  │                         │
└──────────────────┘  └───────────────────────┘  └─────────────────────────┘
      BD auth              BD catalogos               BD inventario

                     ┌──────────────────────────┐
                     │ discovery-server :8761   │  (Eureka: registro de servicios)
                     └──────────────────────────┘
```

| Módulo | Puerto | Responsabilidad |
|---|---|---|
| `discovery-server` | 8761 | Registro Eureka. Panel en http://localhost:8761 |
| `api-gateway` | 8080 | Entrada única: `/api/auth/**`, `/api/catalogos/**`, `/api/inventario/**` |
| `auth-service` | 8081 | Usuarios, roles, login y emisión del JWT |
| `catalogos-service` | 8082 | Los 6 catálogos del Avance 1 (CRUD completo) |
| `inventario-service` | 8083 | Computadoras (CRUD y búsqueda paginada) |
| `common` | — | Librería compartida: seguridad JWT y manejo de errores |
| `frontend` | 4200 | Aplicación Angular |

### Versiones

| Componente | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.8 |
| Spring Cloud | 2025.1.3 (Oakwood) |
| Angular | 22 (requiere Node 22.22+ y TypeScript 6.0) |
| Maven | 3.6.3 mínimo, 3.9+ recomendado |

---

## 3. Requisitos e instalación (Ubuntu)

### 3.1 Java 21

```bash
java -version            # debe decir 21
javac -version           # debe decir 21
echo $JAVA_HOME          # debe apuntar al JDK 21
```

Si no está instalado:

```bash
sudo apt update
sudo apt install -y openjdk-21-jdk
```

Si tienes varias versiones de Java, selecciona la 21:

```bash
sudo update-alternatives --config java
sudo update-alternatives --config javac
```

Configura `JAVA_HOME` (agrega estas líneas al final de `~/.bashrc`):

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH="$JAVA_HOME/bin:$PATH"
```

Y recarga la terminal:

```bash
source ~/.bashrc
```

### 3.2 Maven

```bash
mvn -v                   # debe mostrar Maven 3.6.3 o superior y "Java version: 21"
```

Si no está instalado:

```bash
sudo apt install -y maven
```

> Si `mvn -v` muestra una versión de Java distinta de 21, revisa `JAVA_HOME` (paso 3.1).
> También puedes usar el Maven que trae IntelliJ IDEA.

### 3.3 Node.js 22.22 o superior

Angular 22 **no funciona con Node 20 o anterior**.

```bash
node -v                  # debe ser v22.22.0 o superior (o v24.x)
npm -v
```

Si no lo tienes o es más viejo, instálalo con **nvm**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node -v
```

### 3.4 curl (para el script y las pruebas)

```bash
sudo apt install -y curl
```

---

## 4. Compilar el backend

```bash
cd backend
mvn clean install
```

- Descarga las dependencias (la primera vez tarda varios minutos).
- Compila los 6 módulos y ejecuta las pruebas.
- Al terminar debe decir **`BUILD SUCCESS`** y dejar un `.jar` en cada `*/target/`.

Para compilar más rápido sin ejecutar pruebas:

```bash
mvn clean install -DskipTests
```

Para compilar un solo servicio (y `common`, del que depende):

```bash
mvn -pl inventario-service -am install -DskipTests
```

---

## 5. Ejecutar el backend

**El orden importa:** primero Eureka, después los servicios y al final el gateway.

### Opción A: con el script (recomendada)

Desde la carpeta `sistema-inventario/`:

```bash
chmod +x scripts/*.sh          # solo la primera vez
./scripts/iniciar-backend.sh
```

El script compila sin pruebas, levanta los 5 servicios en segundo plano y espera a que respondan.
Los logs quedan en `logs/<servicio>.log`:

```bash
tail -f logs/inventario-service.log        # ver el log de un servicio en vivo
```

### Opción B: cada servicio en su propia terminal

Útil para ver los logs de cada uno. Primero compila (paso 4), luego, **desde `backend/`**, abre
5 terminales y ejecuta uno por terminal, en este orden:

```bash
# Terminal 1: espera a ver "Started DiscoveryServerApplication"
mvn -pl discovery-server spring-boot:run

# Terminales 2, 3 y 4
mvn -pl auth-service spring-boot:run
mvn -pl catalogos-service spring-boot:run
mvn -pl inventario-service spring-boot:run

# Terminal 5: al final
mvn -pl api-gateway spring-boot:run
```

### Opción C: con los .jar ya compilados

```bash
cd backend
java -jar discovery-server/target/discovery-server-0.1.0-SNAPSHOT.jar
java -jar auth-service/target/auth-service-0.1.0-SNAPSHOT.jar
java -jar catalogos-service/target/catalogos-service-0.1.0-SNAPSHOT.jar
java -jar inventario-service/target/inventario-service-0.1.0-SNAPSHOT.jar
java -jar api-gateway/target/api-gateway-0.1.0-SNAPSHOT.jar
```

### Opción D: desde IntelliJ IDEA

1. `File > Open` y elige la carpeta `backend/` (se detecta como proyecto Maven).
2. `File > Project Structure > Project SDK`: elige Java 21.
3. Ejecuta con el botón ▶ la clase `*Application` de cada módulo, en el orden de la opción B.

### Variables de entorno opcionales

| Variable | Valor por defecto | Para qué |
|---|---|---|
| `JWT_SECRET` | secreto de desarrollo | Llave del JWT. Debe ser **igual** en auth, catalogos e inventario (mínimo 32 caracteres) |
| `EUREKA_URL` | `http://localhost:8761/eureka` | Dirección de Eureka |
| `FRONTEND_URL` | `http://localhost:4200` | Origen permitido por CORS en el gateway |

Ejemplo:

```bash
export JWT_SECRET="mi-secreto-largo-de-al-menos-32-caracteres-123"
./scripts/iniciar-backend.sh
```

---

## 6. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install          # solo la primera vez (o cuando cambie package.json)
npm start            # equivale a: npx ng serve
```

Abre **http://localhost:4200**.

En desarrollo, las llamadas a `/api/...` se redirigen al gateway (`localhost:8080`) mediante
`proxy.conf.json`, así que el backend debe estar levantado.

Para generar la versión de producción:

```bash
npm run build        # resultado en frontend/dist/
```

### Usuarios de prueba

| Usuario | Contraseña | Rol | Puede |
|---|---|---|---|
| `admin` | `Admin123!` | ADMIN | Todo: catálogos, equipos, usuarios |
| `soporte` | `Soporte123!` | SOPORTE | Registrar y editar computadoras |
| `consulta` | `Consulta123!` | CONSULTA | Solo consultar |

---

## 7. Verificar que todo funciona

1. **Eureka**: abre http://localhost:8761. En *Instances currently registered* deben aparecer
   `API-GATEWAY`, `AUTH-SERVICE`, `CATALOGOS-SERVICE` e `INVENTARIO-SERVICE`.
   El registro tarda **unos 30 segundos** después de que arrancan.
2. **Salud de cada servicio**:
   ```bash
   curl localhost:8081/actuator/health    # {"status":"UP"}
   curl localhost:8082/actuator/health
   curl localhost:8083/actuator/health
   curl localhost:8080/actuator/health
   ```
3. **Frontend**: entra con `admin`. En *Inicio* deben verse 3 computadoras y 3 edificios
   (los datos de prueba del Avance 1).

---

## 8. Probar la API con curl

Todo pasa por el gateway (puerto 8080).

```bash
# 1) Login: obtener el token
TOKEN=$(curl -s -X POST localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin123!"}' \
  | sed -E 's/.*"token":"([^"]+)".*/\1/')
echo $TOKEN

# 2) Mi usuario
curl -s localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"

# 3) Catálogos
curl -s localhost:8080/api/catalogos/edificios -H "Authorization: Bearer $TOKEN"
curl -s localhost:8080/api/catalogos/expertos -H "Authorization: Bearer $TOKEN"

# 4) Computadoras (búsqueda paginada con filtros)
curl -s "localhost:8080/api/inventario/computadoras?estado=Activo&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"

# 5) Crear una computadora (valida edificio y distribuidor contra catalogos-service)
curl -s -X POST localhost:8080/api/inventario/computadoras \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{
    "numInventario": "ESCOM-00200", "numeroSerie": "SN-TEST-001",
    "marca": "Dell", "modelo": "Latitude 5440", "tipoEquipo": "Portatil",
    "fechaCompra": "2026-01-15", "costoAdquisicion": 18500.00,
    "fechaFinGarantia": "2029-01-15", "estado": "Activo",
    "idEdificio": 2, "idDistribuidor": 1
  }'

# 6) Error esperado: edificio inexistente -> 409 "No existe el edificio con id 99"
curl -s -X POST localhost:8080/api/inventario/computadoras \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"numInventario":"X-1","numeroSerie":"X-1","marca":"X","modelo":"X","tipoEquipo":"Servidor",
       "fechaCompra":"2026-01-01","costoAdquisicion":1,"estado":"Activo","idEdificio":99,"idDistribuidor":1}'

# 7) Sin token -> 401
curl -i localhost:8080/api/catalogos/edificios
```

---

## 9. Detener el sistema

| Cómo lo iniciaste | Cómo detenerlo |
|---|---|
| Script | `./scripts/detener-backend.sh` |
| Terminales / `java -jar` | `Ctrl + C` en cada terminal |
| Frontend | `Ctrl + C` en la terminal de `npm start` |

Si quedó algún proceso colgado:

```bash
pkill -f 'SNAPSHOT.jar'           # procesos iniciados con java -jar o el script
pkill -f 'spring-boot:run'        # procesos iniciados con Maven
```

> Como la base es H2 en memoria, **al detener un servicio se pierden los cambios** y al volver a
> arrancarlo se cargan otra vez los datos de prueba.

---

## 10. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `release version 21 not supported` / `invalid target release: 21` | Maven usa otro JDK | Revisa `mvn -v` y `JAVA_HOME` (paso 3.1) |
| `Port 8080 was already in use` | Otro proceso usa el puerto | `sudo lsof -i :8080` y luego `kill <PID>`, o `./scripts/detener-backend.sh` |
| El gateway responde **503** al principio | Los servicios aún no se registran en Eureka | Espera ~30 s y revisa http://localhost:8761 |
| **503** "catalogos-service no responde" al guardar una computadora | `catalogos-service` está apagado | Levántalo y espera a que aparezca en Eureka |
| **401** en todas las peticiones | Token vencido o `JWT_SECRET` distinto entre servicios | Vuelve a iniciar sesión; usa el mismo `JWT_SECRET` en todos |
| **403** | El rol no tiene permiso | Usa `admin` para modificar catálogos |
| En Angular: "No se pudo conectar con el servidor" | El gateway no está levantado | Inicia el backend (paso 5) |
| `npm install` falla con `EBADENGINE` o error de TypeScript | Node demasiado viejo | `node -v` debe ser ≥ 22.22 (paso 3.3) |
| `ng: command not found` | No se instaló el CLI global | No hace falta: usa `npm start` o `npx ng serve` |
| `BUILD FAILURE` en un módulo | Error de compilación | Ejecuta `mvn clean install -e` y revisa el primer error |
| Los datos que capturé desaparecieron | H2 es en memoria | Es normal en esta etapa; se resolverá con PostgreSQL |

---

## 11. Endpoints

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

## 12. Estructura del proyecto

```
sistema-inventario/
├── README.md
├── scripts/
│   ├── iniciar-backend.sh
│   └── detener-backend.sh
├── backend/
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
│               ├── application.yml
│               └── data.sql         # datos de prueba del Avance 1
└── frontend/
    ├── package.json
    ├── angular.json
    ├── proxy.conf.json              # /api -> localhost:8080
    └── src/app/
        ├── core/                    # auth, interceptor, guards, servicios HTTP, modelos
        ├── layout/                  # barra superior
        └── pages/                   # login, inicio, edificios, computadoras
```

---

## 13. Decisiones de diseño

- **Una base de datos por microservicio.** Las llaves foráneas que cruzan servicios
  (`computadora → edificio_campus`, `computadora → distribuidor`) se guardan como **id** y se validan
  **llamando al otro servicio** (`inventario-service/.../cliente/CatalogosClient.java`).
  Las relaciones dentro de un mismo servicio (`experto_soporte → departamento`) sí son llaves foráneas reales.
- **Agrupación por contexto:** computadora, software, instalaciones y mantenimiento irán en
  `inventario-service`, para que las consultas del Avance 1 sigan siendo un `JOIN` en una sola base.
- **JWT HS256** firmado por `auth-service` y validado en **cada** servicio, así que llamar directo
  a un puerto sin pasar por el gateway también exige token.
- **Roles** `ADMIN`, `SOPORTE`, `CONSULTA` aplicados con `@PreAuthorize`. Los guards de Angular solo
  ocultan pantallas; la seguridad real está en el backend.
- **DTOs (records) y Bean Validation** que replican los `CHECK` del script del Avance 1.
  Las entidades nunca se devuelven directamente.

### Frontend

- Componentes *standalone*, `signal()` para el estado y *control flow* `@if / @for`.
- `core/auth.interceptor.ts` agrega el `Bearer` y cierra sesión ante un 401.
- `core/auth.guard.ts`: `authGuard` (sesión) y `rolGuard('ADMIN', ...)`.
- Los demás catálogos se construyen copiando el patrón de `pages/edificios/`.

---

## 14. Pendientes

1. **PostgreSQL + Flyway**: una base por servicio, migrar el script del Avance 1 a `V1__esquema.sql`
   y cambiar `ddl-auto` a `validate`. El "único SO principal por equipo" se resuelve con un índice
   único parcial (`CREATE UNIQUE INDEX ... ON instalacion_so(id_computadora) WHERE es_principal`).
2. **inventario-service**: `software`, `instalacion_software` e `instalacion_so` (llaves compuestas
   con `@EmbeddedId` + `@MapsId`), `mantenimiento` y los **reportes** (licencias vencidas, gasto fuera
   de garantía, arranque dual, etc.).
3. **Redundancia controlada de `distribuidor`** (`monto_total_compra`, `numero_total_pedidos`): decidir
   si inventario la actualiza al dar de alta un equipo o se calcula bajo demanda.
4. **Borrado de catálogos en uso**: consultar a inventario antes de borrar un edificio o distribuidor,
   o usar solo baja lógica (`activo = false`).
5. Pantallas de Angular para los demás catálogos y para usuarios.
6. Documentación OpenAPI (springdoc) y pruebas de integración con Testcontainers.
