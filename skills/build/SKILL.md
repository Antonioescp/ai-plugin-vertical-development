---
name: build
description: Implementa de una sola pasada la base de datos, el backend y el frontend de un requerimiento pequeño (RF-NNN) con prototipo aprobado, con una única revisión del plan (modelo de datos, contrato de API y pantallas juntos) antes de programar. Produce los mismos artefactos que /vd:db, /vd:backend y /vd:frontend en versión breve, la migración y código con pruebas en verde. Úsalo cuando el usuario pida implementar un requerimiento completo o todo de una vez, en modo rápido o compacto, o cuando /vd:prototype lo proponga para un requerimiento pequeño. Para requerimientos grandes o delicados se usan las tres fases por separado.
---

# build

Atajo de las fases 2, 3 y 4 del flujo de desarrollo vertical. En un requerimiento
pequeño, recorrer `/vd:db` → `/vd:backend` → `/vd:frontend`
con dos revisiones y tres invocaciones pesa más que el propio cambio. Este skill hace las
tres capas en una sola pasada con **una única revisión**: el plan completo (modelo,
contrato y pantallas) se aprueba de una vez y después se implementa sin paradas.

Lo que se ahorra son invocaciones y puertas, no rigor: las reglas de diseño, seguridad,
pruebas primero y verificación de los skills separados se aplican igual.

Los artefactos (`db.md`, `api.md`, `frontend.md`) y las fases de `.vd/state.yaml` son los
mismos que en el flujo separado, así que `/vd:qa`, `/vd:ship`,
`/vd:next` y los skills separados funcionan igual después.

## Cuándo usarlo

El requerimiento es pequeño si cumple **todo**:

- **Base de datos**: sin cambios, o como mucho una entidad nueva o columnas añadidas
  compatibles con lo existente. Sin migraciones de datos ni cambios incompatibles.
- **API**: pocas operaciones (orientativo: hasta tres) que siguen un patrón que ya
  existe en el backend.
- **Frontend**: pocas pantallas, o cambios sobre pantallas existentes, con componentes
  que ya existen o casi.
- **Seguridad**: sin datos sensibles nuevos (credenciales, pagos, datos personales
  delicados) ni cambios de autenticación o autorización.
- **Modelos a seguir**: el backend y el frontend ya tienen una funcionalidad parecida
  que copiar. El primer requerimiento de un proyecto, que fija estructura y patrones, va
  por los skills separados.

Si no lo cumple, dilo, indica qué criterio falla y propone `/vd:db RF-NNN`. Si
el usuario prefiere seguir en modo compacto, respétalo y anótalo en las decisiones de
`api.md`.

Si durante el trabajo crece (aparece otra entidad, una decisión de seguridad o un cambio
incompatible), detente, explícalo y continúa con el skill separado de la capa en la que
estés: los artefactos y el estado ya son compatibles.

## Reglas de cada capa

Este skill no repite las reglas de cada capa: léelas en los skills separados antes de
empezar la parte correspondiente y aplícalas.

- [../db/SKILL.md](../db/SKILL.md): pasos 2, 3 y 6 (inventario, diseño del modelo,
  migración y verificación) y sus Reglas.
- [../backend/SKILL.md](../backend/SKILL.md): pasos 2, 3, 5, 6 y 7 (patrones,
  contrato, pruebas, implementación y verificación), "Procesos en segundo plano" y sus
  Reglas.
- [../frontend/SKILL.md](../frontend/SKILL.md): pasos 2 a 7 (patrones, kit visual,
  plan, pruebas, implementación y verificación) y sus Reglas.

## Entradas y salidas

Entradas: las de los tres skills. El requerimiento, `.vd/RF-NNN/ux.md` con `prototipo:
aprobado`, `.vd/RF-NNN/prototype/`, el esquema actual y `.vd/db/modelo.puml`, el backend
y el frontend existentes, `.vd/design/tokens.css` y `.vd/project.yaml`.

Salidas:

```
.vd/RF-NNN/
  db.md          # plantilla ../db/templates/db.md
  db.puml        # plantilla ../db/templates/db.puml, solo si cambia el esquema
  api.md         # plantilla ../backend/templates/api.md
  frontend.md    # plantilla ../frontend/templates/frontend.md
.vd/db/modelo.puml             # si cambia el esquema
<database.migrations_dir>/     # migración, si cambia el esquema
<código y pruebas de backend y frontend>
```

Los documentos van en **versión breve**: omite las secciones que no aplican en vez de
rellenarlas. Conserva siempre las que leen otros skills: inventario de datos de `db.md`,
trazabilidad, errores, "Migración" e "Implementación" (archivos tocados y verificación) e
historial. Si no cambia el esquema, `db.md` lleva el inventario y "Sin cambios de
esquema".

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga
   `fase: prototipo_aprobado` en `.vd/state.yaml`).
2. Si ya tiene `modo: compacto` en `.vd/state.yaml`, estás **retomando**: continúa
   según la fase (`implementacion_en_revision` → paso 3, `bd_modelada` → paso 5,
   `backend_listo` → paso 6).
3. Si `ux.md` no tiene `prototipo: aprobado`, detente y sugiere `/vd:prototype`.
4. Lee el requerimiento, `ux.md`, el prototipo (`index.html`, `app.js`, `data.js`), el
   esquema actual y el `api.md` de los requerimientos de los que depende.
5. Estudia el backend y el frontend existentes y elige en cada uno la funcionalidad
   parecida que servirá de modelo.
6. Comprueba los criterios de "Cuándo usarlo".
7. Para los valores que falten en `.vd/project.yaml` (`database.conventions`, comandos
   de migración, `backend.api_style`, `backend.error_format`, `frontend.styling`,
   `frontend.test_id_attribute`), dedúcelos del proyecto. Lo que no puedas deducir lo
   preguntas **junto con el plan** en el paso 3, no en una pregunta por capa.

### 2. Diseñar el plan

Diseña las tres capas de una vez, con las reglas de cada skill:

1. **Modelo**: inventario de datos de `ux.md` y entidades nuevas o modificadas. Escribe
   `db.md` (`estado: en_revision`) y, si cambia el esquema, `db.puml`.
2. **Contrato**: operaciones derivadas de `ux.md` con entrada, validaciones, errores con
   código estable, efectos y trazabilidad. Escribe `api.md` (`estado: en_revision`).
3. **Frontend**: pantallas → rutas, elementos → componentes, acciones → operaciones y
   códigos de error → mensajes. Escribe `frontend.md` (`estado: en_progreso`).

Actualiza `.vd/state.yaml`:

```yaml
RF-NNN:
  fase: implementacion_en_revision
  modo: compacto
  iteracion: 1
```

### 3. Revisar el plan

Es la **única puerta** antes de programar. Presenta en un solo mensaje breve:

- **Datos**: entidades o columnas nuevas (o "sin cambios de esquema"), restricciones,
  índices y borrados relevantes.
- **Operaciones**: identificación, quién puede llamarlas y errores con su mensaje de
  `ux.md`.
- **Frontend**: rutas y componentes nuevos frente a reutilizados.
- Dependencias nuevas, valores del perfil que hay que confirmar y preguntas abiertas.

Pide aprobación del **plan completo**. Con cada ronda de feedback actualiza los
documentos afectados y su historial e incrementa `iteracion`. Si el feedback implica un
dato o un comportamiento que la UI no tiene, no lo añadas aquí: es un cambio de UX
(`/vd:wireframe`) o de requerimiento (`/vd:requirements`).

Al aprobar, marca `estado: aprobado` en `db.md` y en `api.md` y guarda en
`.vd/project.yaml` los valores del perfil confirmados.

### 4. Base de datos

Si cambia el esquema, genera y verifica la migración como en el paso 6 de
`/vd:db` (solo contra bases locales o de desarrollo), anótala en `db.md` e
integra la porción en `.vd/db/modelo.puml`. Si no cambia, anótalo en `db.md`.

Actualiza `.vd/state.yaml` con `fase: bd_modelada` e `iteracion: 0`.

### 5. Backend

Pruebas primero, implementación y verificación como en los pasos 5 a 7 de
`/vd:backend`. La prueba del recorrido contra la API local puede hacerse en el
paso 6, junto con la del frontend, para levantar el entorno una sola vez.

Marca `estado: implementado` en `api.md` con los archivos tocados y el resultado, y
actualiza `.vd/state.yaml` con `fase: backend_listo`.

### 6. Frontend

Kit visual, pruebas primero, implementación y verificación en la app como en los pasos 3
y 5 a 7 de `/vd:frontend`, incluida la comparación con el prototipo. Al
terminar, detén los servidores y comprueba que los puertos quedaron libres.

Marca `estado: implementado` en `frontend.md` con los archivos tocados y el resultado
(y en `api.md` el de la prueba contra la API local si se hizo aquí), y actualiza
`.vd/state.yaml` con `fase: frontend_listo`.

No des el skill por terminado con pruebas en rojo o con el recorrido principal roto.

### 7. Cerrar

1. Resume al usuario: migración, operaciones, pantallas, pruebas añadidas, dependencias
   nuevas y cómo levantar la app para verlo.
2. Indica el siguiente paso: `/vd:qa RF-NNN`, o `/vd:qa-auto RF-NNN`
   si el usuario prefiere que Claude ejecute las pruebas.

## Cambios posteriores

Los fallos que encuentre `/vd:qa` se corrigen con el skill separado de la capa
que los originó (`/vd:db`, `/vd:backend` o `/vd:frontend`),
como en el flujo normal.

## Reglas

- Escribe la documentación en el idioma del usuario; el código sigue las convenciones
  del proyecto.
- No generes la migración ni escribas código sin la aprobación explícita del plan.
- Nunca ejecutes migraciones, borrados ni cambios de datos contra bases que no sean
  locales o de desarrollo.
- No cambies el diseño aprobado: un cambio visual o de comportamiento vuelve a
  `/vd:prototype` (o a `/vd:wireframe` si es estructural).
- El modo compacto no se salta las pruebas, la verificación ni la revisión del plan.
- No hagas commits: eso es `/vd:ship`.
