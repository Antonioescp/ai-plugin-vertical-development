# Flujo de trabajo: desarrollo vertical con skills

Diagramas:

- [flujo.puml](flujo.puml) — actividad completa, del backlog a la entrega.
- [estados-funcionalidad.puml](estados-funcionalidad.puml) — estados de cada funcionalidad.

## Qué entendemos por "vertical"

Cada funcionalidad del backlog (p. ej. *1. Registro de usuarios*) se lleva **de punta a
punta** antes de empezar la siguiente:

1. **Diseño de producto (UI/UX)**, en dos pasos iterativos:
   - **Wireframe HTML** (baja fidelidad, en gris): flujo, estructura de pantallas,
     estados y datos. Se itera hasta aprobar la estructura.
   - **Prototipo HTML navegable** (alta fidelidad) sobre el mismo HTML del wireframe,
     con estilo, validaciones y datos simulados. Se itera hasta aprobar la experiencia.
     Un cambio estructural en esta etapa regresa al wireframe.

   Ambos se revisan en el navegador con la misma **barra de revisión**: pantallas y
   estados, vista móvil y **modo comentario** para seleccionar un componente y dejarle un
   comentario. Los comentarios llegan al skill en `.vd/RF-NNN/review/comments.json` y el
   skill responde en el mismo archivo.
2. **Base de datos**: se modela solo la porción que esa funcionalidad necesita.
3. **Backend**: se implementa a partir del diseño UX y del modelo de datos.
4. **Frontend**: se implementan las pantallas aprobadas consumiendo el backend.
5. **Pruebas manuales**: el usuario prueba la funcionalidad completa.

Al terminar, la funcionalidad está completa y usable aunque falten otras en el backlog.

**Modo compacto.** Para requerimientos pequeños (sin cambios de esquema o con una sola
entidad nueva, pocas operaciones que siguen un patrón existente, sin datos sensibles),
`/vertical-dev:build` hace los pasos 2, 3 y 4 en una sola pasada: el modelo, el contrato
y el plan de pantallas se aprueban juntos en una única revisión y después se implementa
sin paradas. Produce los mismos artefactos y recorre las mismas fases, así que pruebas
manuales, entrega y correcciones funcionan igual. Las reglas de cada capa siguen siendo
las de `/vertical-dev:db`, `/vertical-dev:backend` y `/vertical-dev:frontend`.

## Principios

1. **Solo skills, sin agentes.** Cada fase es un skill (`/vd-*`) que se ejecuta en la
   sesión principal. No hay subagentes ni orquestador autónomo.
2. **El estado vive en archivos.** Cada skill lee lo que dejó la fase anterior en
   `.vd/` y escribe su propio resultado. El flujo se puede retomar en otra sesión.
3. **El diseño manda.** La UI/UX aprobada define qué datos se capturan y muestran; de ahí
   salen el modelo de datos y el contrato de API. No se modela nada que la UX no use.
4. **Puertas humanas.** El usuario aprueba el backlog, la UI/UX (iterando), el modelo de
   datos y el contrato de API (en modo compacto, juntos), y ejecuta las pruebas manuales.
5. **Los fallos regresan a su origen.** Un fallo en pruebas manuales se clasifica por fase
   y el trabajo se rehace desde esa fase hacia abajo.
6. **Agnóstico al stack.** Todo lo específico del proyecto (rutas, comandos) vive en
   `.vd/project.yaml`, que genera `/vertical-dev:setup`.

## Skills

| Skill | Fase | Entrada | Salida |
|---|---|---|---|
| [`/vertical-dev:setup`](../../skills/setup/SKILL.md) | preparación | repo del proyecto | `.vd/project.yaml`, `.vd/state.yaml` |
| [`/vertical-dev:requirements`](../../skills/requirements/SKILL.md) | preparación | descripción del usuario | `docs/requirements/` |
| [`/vertical-dev:wireframe`](../../skills/wireframe/SKILL.md) | 1a. UI/UX | `RF-NNN` aprobado | `ux.md`, `flujo.puml`, `wireframe/` |
| [`/vertical-dev:prototype`](../../skills/prototype/SKILL.md) | 1b. UI/UX | `ux.md`, `wireframe/` | `prototype/` |
| [`/vertical-dev:db`](../../skills/db/SKILL.md) | 2. Base de datos | `ux.md`, esquema actual | `db.md`, `db.puml`, migración |
| [`/vertical-dev:backend`](../../skills/backend/SKILL.md) | 3. Backend | `ux.md`, `db.md`, backend existente | `api.md`, código, pruebas |
| [`/vertical-dev:frontend`](../../skills/frontend/SKILL.md) | 4. Frontend | prototipo, `ux.md`, `api.md`, frontend existente | `frontend.md`, código, pruebas |
| [`/vertical-dev:build`](../../skills/build/SKILL.md) | 2–4. Modo compacto | `ux.md`, prototipo, esquema, backend y frontend existentes | `db.md`, `api.md`, `frontend.md`, migración, código, pruebas |
| [`/vertical-dev:qa`](../../skills/qa/SKILL.md) | 5. Pruebas manuales | criterios, `ux.md`, app en local | `qa.md`, `qa/plan.json`, `qa/results.json` |
| [`/vertical-dev:ship`](../../skills/ship/SKILL.md) | entrega | `qa.md` aceptado | rama, commits, PR/MR |
| [`/vertical-dev:next`](../../skills/next/SKILL.md) | cualquiera | `.vd/state.yaml`, backlog, artefactos | siguiente skill y pendientes del usuario |

## Perfil de proyecto (`.vd/project.yaml`)

Lo crea `/vertical-dev:setup` detectando el stack del repositorio (manifiestos, scripts, CI,
docker compose, herramienta de migraciones, git) y preguntando solo lo que no puede
deducir. Los valores que una fase necesita y aún no existen (`null`) los completa esa
fase: `/vertical-dev:wireframe` las plataformas, `/vertical-dev:db` las convenciones de base de datos,
`/vertical-dev:backend` el estilo de API, `/vertical-dev:frontend` el sistema de estilos y `/vertical-dev:ship` la
configuración de git.

Estructura completa: [skills/setup/templates/project.yaml](../../skills/setup/templates/project.yaml).

## Estructura de archivos de trabajo

```
docs/requirements/      # versionado con el proyecto
  README.md             # índice priorizado = backlog, con estado general
  RF-NNN-<slug>.md      # historia, criterios de aceptación, datos, alcance
.vd/
  project.yaml          # perfil del proyecto
  state.yaml            # fase detallada de cada requerimiento en desarrollo
  design/               # compartido por todos los requerimientos
    proto.js            # navegación, barra de revisión y comentarios
    review-server.mjs   # node .vd/design/review-server.mjs → http://127.0.0.1:4321/
    wireframe.css       # estilo de baja fidelidad
    tokens.css          # identidad visual del prototipo
    components.css      # mismas clases que wireframe.css, con estilo real
    qa.html             # página para ejecutar y marcar las pruebas manuales
  db/
    modelo.puml         # ER global acumulado de los requerimientos aprobados
  RF-NNN/
    ux.md               # flujos, pantallas, estados, validaciones, data-id
    flujo.puml          # navegación entre pantallas
    wireframe/index.html
    prototype/          # index.html, app.js, data.js (datos simulados)
    review/comments.json  # comentarios del usuario y respuestas del skill
    db.md + db.puml     # modelo de la porción de BD
    api.md              # contrato de API
    frontend.md         # pantallas, componentes, errores y verificación
    qa.md               # cobertura, rondas e incidencias con su origen
    qa/plan.json        # casos de prueba manual
    qa/results.json     # resultados por ronda (los marca el usuario en design/qa.html)
```

## Dudas abiertas

- ¿Los artefactos de diseño (`ux.md`, wireframes, prototipo, `db.md`, `api.md`) deberían
  vivir también en `docs/` (p. ej. `docs/design/RF-NNN/`) en lugar de `.vd/`?
- ¿Importar requerimientos desde Jira o GitLab issues más adelante?
