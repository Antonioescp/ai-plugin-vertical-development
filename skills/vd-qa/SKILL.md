---
name: vd-qa
description: Prepara y conduce las pruebas manuales de un requerimiento (RF-NNN) ya implementado en backend y frontend. Genera el plan de pruebas desde los criterios de aceptación y los estados de ux.md, prepara el entorno local, ofrece una página donde el usuario marca cada caso como pasa, falla o bloqueado con sus notas, analiza los fallos y los devuelve a la fase que los originó. Úsalo cuando el usuario pida probar, hacer QA, pruebas manuales o de aceptación de un requerimiento, cuando diga que terminó de probar, o cuando /vd-frontend indique /vd-qa como siguiente paso.
---

# vd-qa

Fase 5 del flujo de desarrollo vertical. El usuario prueba la funcionalidad completa en
la app real, en local. Este skill prepara las pruebas, recoge los resultados y, si algo
falla, encuentra la causa y devuelve el trabajo a la fase correcta. La funcionalidad
solo queda aceptada cuando todos los casos pasan.

## Entradas y salidas

Entradas:

- `docs/requirements/RF-NNN-<slug>.md`: criterios de aceptación.
- `.vd/RF-NNN/ux.md`: pantallas, estados, mensajes y `data-id`.
- `.vd/RF-NNN/api.md` y `frontend.md` (`estado: implementado`).
- `.vd/project.yaml`: comandos para levantar backend, frontend y migraciones.

Salidas:

```
.vd/design/qa.html          # página de ejecución de pruebas (plantilla: templates/design/qa.html)
.vd/RF-NNN/
  qa.md                     # cobertura, rondas e incidencias (plantilla: templates/qa.md)
  qa/plan.json              # casos de prueba (plantilla: templates/plan.json)
  qa/results.json           # resultados que marca el usuario, por ronda
```

La página de pruebas necesita el servidor de revisión `.vd/design/review-server.mjs`
con el endpoint `/__qa`. Si el del proyecto no lo tiene (es anterior), actualízalo desde
[../vd-wireframe/templates/design/review-server.mjs](../vd-wireframe/templates/design/review-server.mjs).

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga
   `fase: frontend_listo` o `en_pruebas` en `.vd/state.yaml`).
2. Si `frontend.md` no está `implementado`, detente y sugiere `/vd-frontend`.
3. Si `.vd/RF-NNN/qa/results.json` ya existe, estás en una **ronda en curso o
   posterior**: si el usuario dice que terminó de probar, ve al paso 6; si vuelves de
   corregir fallos, ve al paso 8.

### 2. Escribir el plan

Crea `qa/plan.json` desde [templates/plan.json](templates/plan.json):

- **Al menos un caso por criterio de aceptación**, con el ID del criterio en `criterio`.
- Un caso por cada **estado de `ux.md`** que no quede cubierto (cada validación con su
  mensaje, error del sistema, estados vacíos).
- Casos **exploratorios** relevantes para la funcionalidad: móvil si está en
  `ux.platforms`, uso solo con teclado, doble envío, recargar o volver atrás a mitad del
  flujo, datos límite (textos largos, caracteres especiales).

Reglas de redacción, porque los ejecuta una persona:

- Pasos concretos y numerados, con los nombres visibles de pantallas y botones en
  negrita (`**Crear cuenta**`) tal como aparecen en la app.
- Datos exactos a usar en `datos`; si un caso necesita datos previos (p. ej. un correo
  ya registrado), indícalo en `precondiciones`.
- Resultados esperados **observables**: qué se ve, con los textos exactos de `ux.md`.
- Un caso por comportamiento: casos cortos, fáciles de marcar como pasa o falla.
- Cada caso debe poder ejecutarse solo, en cualquier orden. Si dos casos crean datos,
  usa datos distintos (p. ej. `toni.qa1@…`, `toni.qa2@…`).

Crea `qa.md` desde [templates/qa.md](templates/qa.md) con la tabla de cobertura.

### 3. Preparar el entorno

**Solo en local.**

1. Aplica las migraciones pendientes en la base de datos local.
2. Crea los datos que piden las precondiciones con el mecanismo del proyecto (seeds,
   fixtures, scripts o la propia API) y anótalo en "Datos de prueba preparados".
3. Levanta backend y frontend (`backend.commands.run`, `frontend.commands.run`) en
   segundo plano y comprueba que responden. Pon la URL de inicio en `entorno.url` del
   plan y lo que el usuario deba saber en `entorno.notas`.
4. Copia [templates/design/qa.html](templates/design/qa.html) a `.vd/design/qa.html` si
   no existe y arranca `node .vd/design/review-server.mjs` si no está corriendo.
5. Si tienes navegador, haz un recorrido rápido del caso principal para no entregarle al
   usuario un entorno roto.

Si no hay Node.js, entrega el plan en `qa.md` como lista de casos y pide al usuario que
responda en el chat con el resultado de cada uno.

### 4. Pasar a pruebas

1. Cambia el requerimiento a `estado: en_pruebas` en su archivo y en el índice
   `docs/requirements/README.md`, y `.vd/state.yaml` a `fase: en_pruebas`.
2. Da al usuario:
   - la URL de la página de pruebas: `http://127.0.0.1:4321/design/qa.html?rf=RF-NNN`;
   - la URL de la app;
   - cómo marcar: **Pasa**, **Falla** o **Bloqueado** (no pudo ejecutarlo), con una nota
     obligatoria en los dos últimos;
   - que te avise cuando termine.

### 5. Esperar

No marques resultados por el usuario. Las pruebas manuales las hace una persona.

### 6. Analizar los resultados

Lee la última ronda de `qa/results.json`. Para cada caso en `falla` o `bloqueado`:

1. **Reprodúcelo** en local si puedes (navegador, llamadas a la API local, logs del
   backend, consola del navegador, consulta a la base local).
2. Encuentra la **causa raíz** y clasifica el **origen**:

   | Origen | Ejemplo | Vuelve a | Fase en `state.yaml` |
   |---|---|---|---|
   | requerimiento | el comportamiento esperado estaba mal definido | `/vd-requirements` | `pendiente` |
   | UI/UX estructura | falta una pantalla, campo o estado | `/vd-wireframe` | `wireframes_en_revision` |
   | UI/UX visual | el diseño aprobado no se entiende o no gusta | `/vd-prototype` | `prototipo_en_revision` |
   | base de datos | falta una restricción o un dato | `/vd-db` | `prototipo_aprobado` |
   | backend | validación, error o regla mal implementada | `/vd-backend` | `bd_modelada` |
   | frontend | la app no hace lo que dice el prototipo o `api.md` | `/vd-frontend` | `backend_listo` |
   | entorno | datos de prueba o configuración local incorrectos | se corrige aquí | `en_pruebas` |

   Distingue "la implementación no cumple el diseño" (backend o frontend) de "el diseño
   aprobado no sirve" (UI/UX o requerimiento): en el segundo caso, confírmalo con el
   usuario antes de reabrir el diseño.
3. Registra cada fallo como incidencia en `qa.md` y actualiza la tabla de rondas.

Los casos `bloqueado` por el entorno se corrigen aquí y se repiten en la misma ronda.

### 7. Devolver el trabajo

Si hay incidencias que no son de entorno:

1. Cambia el requerimiento a `en_desarrollo` y `.vd/state.yaml` a la fase del **origen
   más temprano** de la tabla (si hay un fallo de BD y otro de frontend, se vuelve a BD;
   las fases siguientes se rehacen igualmente).
2. Pon `estado: con_fallos` en `qa.md`.
3. Explica al usuario las incidencias, su causa y el siguiente paso (p. ej.
   `/vd-backend RF-NNN`), recordando que cada skill corrige con una prueba que reproduce
   el fallo. Al terminar las correcciones se vuelve a `/vd-qa`.

### 8. Nueva ronda

Al volver tras las correcciones:

1. Comprueba que las fases corregidas están cerradas (`frontend.md` implementado y
   `fase: frontend_listo`).
2. Añade una ronda nueva en `qa/results.json`:

   ```json
   { "numero": 2, "inicio": "<fecha>", "casos": ["QA-02", "QA-05"], "resultados": {},
     "contexto": { "QA-02": "Se corrigió el mensaje de correo duplicado." } }
   ```

   `casos` incluye los que fallaron, los bloqueados y los que puedan verse afectados por
   las correcciones; si se cambió diseño, BD o contrato, **todos**. En `contexto` explica
   al usuario qué cambió en cada caso. Si hubo que añadir o cambiar casos (p. ej. por un
   cambio de requerimiento), actualiza antes `plan.json`.
3. Prepara el entorno (paso 3) y vuelve al paso 4.

### 9. Aceptar

Cuando todos los casos de la última ronda están en `pasa` y no hay incidencias abiertas:

1. Pon `estado: aceptado` en `qa.md` y completa "Resultado final".
2. Actualiza `.vd/state.yaml` con `fase: aceptada`. El requerimiento sigue
   `en_pruebas` hasta que `/vd-ship` lo entregue.
3. Detén los procesos que levantaste (servidores de app y de revisión).
4. Indica el siguiente paso: `/vd-ship RF-NNN`.

## Reglas

- Escribe en el idioma del usuario.
- Nunca marques casos como pasados en nombre del usuario ni des por aceptado algo sin
  resultados suyos.
- Nunca prepares datos ni levantes servicios contra entornos que no sean locales.
- No corrijas código de producto desde aquí: identifica el origen y devuelve el trabajo
  a su fase. Solo se corrige aquí lo que es de entorno de pruebas.
