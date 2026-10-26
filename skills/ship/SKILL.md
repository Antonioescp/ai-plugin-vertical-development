---
name: ship
description: Entrega un requerimiento (RF-NNN) aceptado en pruebas manuales. Hace una última verificación, separa los cambios del requerimiento, crea la rama y los commits siguiendo las convenciones del repositorio y, con confirmación del usuario, sube la rama y abre el PR o MR. Marca el requerimiento como entregado y propone el siguiente del backlog. Úsalo cuando el usuario pida entregar, publicar, hacer commit, push, PR o MR de un requerimiento, o cuando /vd:qa indique /vd:ship como siguiente paso.
---

# ship

Última fase del flujo de desarrollo vertical. Convierte el trabajo aceptado de un
requerimiento en una entrega revisable: rama, commits ordenados y PR o MR con todo el
contexto (requerimiento, diseño, contrato, pruebas y resultados de QA).

## Entradas y salidas

Entradas:

- `.vd/RF-NNN/qa.md` con `estado: aceptado` y `fase: aceptada` en `.vd/state.yaml`.
- `.vd/RF-NNN/db.md`, `api.md` y `frontend.md`: archivos tocados en cada capa.
- `.vd/project.yaml`: comandos y sección `git`.
- El historial de git: convenciones de ramas y mensajes.

Salidas: rama y commits; con confirmación, push y PR o MR (plantilla de descripción:
[templates/pr.md](templates/pr.md)); requerimiento en estado `entregado`.

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga `fase: aceptada`).
2. Si `qa.md` no está `aceptado`, detente y sugiere `/vd:qa`. Nada se entrega sin
   pruebas manuales aceptadas.
3. Revisa la sección `git` de `.vd/project.yaml`. Lo que falte, dedúcelo del repositorio
   (`git remote -v`, rama por defecto, `git log` reciente) y confirma con el usuario
   **en una sola pregunta** lo que no puedas deducir. Guárdalo:

   ```yaml
   git:
     base_branch: main
     branch_pattern: "vd/{id}-{slug}"     # p. ej. vd/RF-001-registro-de-usuarios
     commit_style: conventional            # conventional | libre (según el historial)
     commits: por_capa                     # por_capa | uno
     delivery: pr                          # pr (GitHub) | mr (GitLab) | push | local
     version_vd: true                      # si .vd/ se versiona con el código
   ```

   - `commits: por_capa` separa diseño, base de datos, backend y frontend en commits
     distintos para facilitar la revisión; `uno` hace un único commit.
   - `delivery` según el remoto: `pr` para GitHub, `mr` para GitLab, `push` si solo se
     sube la rama, `local` si no hay remoto o el usuario no quiere subir nada.
   - Si `version_vd` es `false`, asegúrate de que `.vd/` está en `.gitignore`
     (los requerimientos en `docs/requirements/` se versionan siempre).

### 2. Verificación final

1. Ejecuta los comandos `test`, `lint` y `build` de backend y frontend. Si algo falla,
   **no entregues**: identifica el origen y devuélvelo a su fase como haría `/vd:qa`.
2. Comprueba que las migraciones del requerimiento están en el repositorio y que
   `db.md` las referencia.

### 3. Delimitar los cambios

1. Revisa `git status` y el diff completo.
2. Asigna cada archivo cambiado a una capa usando los archivos listados en `db.md`,
   `api.md` y `frontend.md` y las rutas de `.vd/project.yaml`:
   - **preparación** (si hay): lo que es del flujo pero no de este requerimiento, como
     `.vd/project.yaml`, el kit `.vd/design/` o requerimientos de otros RF del backlog;
   - **diseño**: el requerimiento entregado, el índice del backlog, `.vd/state.yaml`,
     `.vd/db/` y `.vd/RF-NNN/` (si `.vd/` se versiona);
   - **base de datos**: migraciones y modelos de datos;
   - **backend** y **frontend**: código, pruebas y dependencias de cada uno.
3. Si hay cambios que **no pertenecen** al requerimiento, no los incluyas: enuméralos y
   pregunta al usuario qué hacer con ellos.
4. Revisa el diff en busca de secretos (claves, tokens, contraseñas, archivos `.env`),
   datos personales reales, archivos binarios grandes, artefactos de build, `console.log`
   o equivalentes de depuración. Si encuentras algo, detente y avisa.

### 4. Actualizar el estado

Antes de hacer commit, para que quede incluido:

1. Requerimiento: `estado: entregado` en su archivo y en `docs/requirements/README.md`.
   Con `delivery: local` o `push`, añade ya `entrega: "local: rama <rama>"` (o
   `"push: <remoto>/<rama>"`); con `pr` o `mr`, el enlace se añade en el paso 7.
2. `.vd/state.yaml`: `fase: entregada`.

### 5. Rama y commits

1. Si estás en `base_branch`, crea la rama del requerimiento con `branch_pattern`
   llevándote los cambios (`git switch -c <rama>`). Si ya estás en una rama del
   requerimiento, úsala. No reescribas commits ya publicados.
2. Crea los commits con el estilo de `commit_style` y el ID del requerimiento en el
   mensaje. Con `commits: por_capa`, en este orden y solo los que tengan cambios:

   | Commit | Contenido | Ejemplo (conventional) |
   |---|---|---|
   | preparación | perfil, kit de diseño, otros requerimientos | `chore: perfil vd y backlog` |
   | diseño | requerimiento, UX, wireframe, prototipo, modelo, contrato, QA | `docs(RF-001): requerimiento y diseño de registro de usuarios` |
   | base de datos | migración y modelos | `feat(RF-001): migración de usuarios` |
   | backend | código y pruebas del backend | `feat(RF-001): API de registro de usuarios` |
   | frontend | código y pruebas del frontend | `feat(RF-001): pantallas de registro de usuarios` |

   Añade a los commits las líneas de atribución que pidan las instrucciones del entorno
   o del proyecto.
3. Respeta los hooks del repositorio: nunca uses `--no-verify`. Si un hook falla,
   corrige la causa y crea el commit de nuevo.

### 6. Confirmar antes de publicar

Subir la rama y abrir un PR o MR es visible para otros. Muestra al usuario:

- rama y commits creados;
- título y descripción del PR o MR, generados desde [templates/pr.md](templates/pr.md);
- a dónde se va a subir (remoto y rama base).

**Espera su confirmación explícita.** Con `delivery: local`, no hay nada que confirmar:
ve al paso 8.

### 7. Publicar

Con la confirmación del usuario:

1. `git push -u <remoto> <rama>`. Nunca `--force` sobre ramas compartidas.
2. Según `delivery`:
   - `pr`: `gh pr create --base <base_branch> --title … --body-file …` si `gh` está
     instalado y autenticado.
   - `mr`: `glab mr create --target-branch <base_branch> --title … --description …` si
     `glab` está instalado y autenticado.
   - Si la herramienta no está disponible, da al usuario el enlace para crearlo desde la
     web y la descripción lista para pegar.
3. No hagas merge ni actives auto-merge salvo que el usuario lo pida.
4. Anota el enlace del PR o MR en el frontmatter del requerimiento (`entrega: <url>`) y
   en "Resultado final" de `qa.md`; si eso genera cambios, inclúyelos en un commit
   adicional de documentación y súbelo.

### 8. Cerrar

1. Resume al usuario: rama, commits, enlace del PR o MR (o que quedó en local).
2. Propón el siguiente requerimiento: el primero `aprobado` del backlog
   (`/vd:wireframe RF-NNN`), o `/vd:requirements` si no queda ninguno aprobado.

## Reglas

- Escribe en el idioma del usuario; los mensajes de commit siguen las convenciones del
  repositorio.
- No entregues sin QA aceptado ni con pruebas en rojo.
- No publiques (push, PR, MR) sin confirmación explícita del usuario en esta entrega.
- No incluyas cambios ajenos al requerimiento ni secretos.
- Nunca `--no-verify`, `--force` sobre ramas compartidas ni merge sin que lo pida el
  usuario.
