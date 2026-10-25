---
name: vd-setup
description: Prepara un repositorio para el flujo de desarrollo vertical (vd). Analiza el proyecto para detectar frontend, backend, base de datos, herramienta de migraciones, comandos de pruebas, lint, build y arranque, convenciones de git y herramientas disponibles, y escribe el perfil .vd/project.yaml que usan todas las demás fases. Úsalo al empezar a usar el flujo vd en un proyecto, cuando falte .vd/project.yaml, cuando el stack del proyecto cambie o cuando el usuario pida configurar o revisar el perfil.
---

# vd-setup

Primer paso del flujo de desarrollo vertical en un repositorio. Ningún otro skill del
flujo asume un lenguaje o framework: todos leen `.vd/project.yaml`. Este skill lo crea a
partir de lo que encuentra en el repositorio y pregunta solo lo que no puede deducir.

Salidas:

- `.vd/project.yaml` (plantilla: [templates/project.yaml](templates/project.yaml)).
- `.vd/state.yaml` vacío (`{}`) si no existe.

## Proceso

### 1. Comprobar si ya existe

Si `.vd/project.yaml` existe, estás **revisando**: detecta de nuevo (paso 2), compara
con lo guardado y propone solo los cambios, sin borrar valores que haya completado el
usuario u otras fases. Aplica únicamente los que el usuario confirme.

### 2. Detectar

Explora el repositorio sin modificar nada. Lee archivos; no instales dependencias ni
ejecutes nada que cambie el estado.

**Estructura.** ¿Es un repositorio único o un monorepo? Busca carpetas típicas
(`frontend/`, `backend/`, `web/`, `api/`, `server/`, `client/`, `apps/*`, `packages/*`,
`services/*`) y los manifiestos de cada una.

**Stack por manifiesto.** Ejemplos, no una lista cerrada:

| Archivo | Indica |
|---|---|
| `package.json` | Node.js; framework por dependencias (react, next, vue, nuxt, angular, svelte, express, nest, fastify…); scripts |
| `pubspec.yaml` | Dart / Flutter |
| `pyproject.toml`, `requirements*.txt` | Python (django, fastapi, flask…) |
| `go.mod` | Go |
| `pom.xml`, `build.gradle*` | JVM (spring…) |
| `*.csproj`, `*.sln` | .NET |
| `Gemfile` | Ruby (rails…) |
| `composer.json` | PHP (laravel, symfony…) |
| `Cargo.toml` | Rust |

**Comandos.** Usa los que el proyecto ya define, por este orden: scripts del manifiesto
(`package.json`, `pyproject.toml`…), `Makefile`, `justfile`, `Taskfile.yml`, scripts en
`scripts/`, documentación (`README`, `CONTRIBUTING`) y configuración de CI
(`.github/workflows`, `.gitlab-ci.yml`), que muestra cómo se instala, prueba y construye
de verdad. Si no hay comando propio, usa el estándar del stack (p. ej. `go test ./...`,
`dotnet test`, `flutter test`). Incluye el directorio de trabajo si no es la raíz
(`cd web && npm test`).

**Base de datos.** Motor por `docker-compose*.yml`, variables de ejemplo (`.env.example`),
dependencias de drivers u ORM. Herramienta de migraciones por sus archivos (prisma,
drizzle, knex, typeorm, sequelize, alembic, migraciones de django, flyway, liquibase, EF
Core, rails, laravel, goose, golang-migrate, supabase…) y su carpeta de migraciones. Cómo
se levanta la base local (servicio de docker compose, base embebida, script).

**Git.** Rama por defecto (`git symbolic-ref refs/remotes/origin/HEAD` o la rama
actual), remoto (GitHub, GitLab u otro) y, si hay historial, el estilo de los mensajes
(`git log --oneline -20`).

**Herramientas.** Versión de Node.js (`node --version`; habilita el servidor de revisión
de wireframes, prototipos y QA) y PlantUML (comando `plantuml`, `PLANTUML_JAR` o el
`plantuml.jar` de la extensión de VS Code en `~/.vscode/extensions/jebbs.plantuml-*`).

### 3. Proyecto vacío o incompleto

Si el repositorio no tiene código, o falta una capa (p. ej. hay frontend pero no
backend), pregunta en **una sola ronda** qué stack quiere el usuario para cada capa que
falta, proponiendo una opción por defecto coherente con lo que ya exista. No generes el
esqueleto del proyecto aquí: anota la elección en el perfil (`framework`) y deja los
comandos en `null`; `/vd-backend` y `/vd-frontend` crearán la estructura mínima cuando
lleguen, siguiendo esa elección.

### 4. Escribir el perfil

1. Crea `.vd/project.yaml` desde la plantilla con lo detectado. Lo que no se pueda
   deducir queda en `null`: lo completará la fase que lo necesite.
2. Añade un comentario `# detectado: <archivo>` junto a los valores menos evidentes para
   que el usuario sepa de dónde salen.
3. Crea `.vd/state.yaml` con `{}` si no existe.

### 5. Confirmar

Muestra un resumen corto: capas detectadas con su framework, comandos por capa, base de
datos y migraciones, git y herramientas, y lo que quedó pendiente. Pide al usuario que
corrija lo que esté mal. Si el usuario quiere, ejecuta los comandos de `test` y `lint`
de cada capa para comprobar que funcionan (son de solo lectura en casi todos los
proyectos; si alguno no lo es, pregunta antes).

Termina indicando el siguiente paso: `/vd-requirements` para crear los requerimientos, o
`/vd-next` si ya existen.

## Reglas

- No instales dependencias, no generes código ni modifiques archivos del proyecto fuera
  de `.vd/`.
- No inventes comandos: si no hay evidencia, `null`.
- No guardes secretos en el perfil: solo nombres de variables de entorno, nunca valores.
