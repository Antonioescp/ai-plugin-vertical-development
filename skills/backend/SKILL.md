---
name: backend
description: Define el contrato de API e implementa el backend de un requerimiento (RF-NNN) cuyo modelo de datos ya está aprobado y migrado, siguiendo la arquitectura y el stack del proyecto, con pruebas automáticas que cubren los criterios de aceptación. Produce api.md y código con pruebas en verde. Úsalo cuando el usuario pida el backend, la API, los endpoints, servicios o la lógica de servidor de un requerimiento, o cuando /vertical-dev:db indique /vertical-dev:backend como siguiente paso.
---

# backend

Fase 3 del flujo de desarrollo vertical. A partir de lo que la UI hace (`ux.md`) y del
modelo aprobado (`db.md`), define el **contrato** que consumirá el frontend y lo
implementa en el backend del proyecto, con pruebas. Termina con todas las pruebas en
verde y el contrato documentado en `api.md`, la entrada de `/vertical-dev:frontend`.

## Entradas y salidas

Entradas:

- `docs/requirements/RF-NNN-<slug>.md`: criterios de aceptación y reglas de negocio.
- `.vd/RF-NNN/ux.md`: acciones, validaciones, mensajes de error y datos de cada pantalla.
- `.vd/RF-NNN/db.md` con `estado: aprobado` y su migración.
- `.vd/project.yaml`: `backend.paths` y `backend.commands` (test, lint, build, run).
- El código del backend existente: es la referencia de estilo y arquitectura.

Salidas:

- `.vd/RF-NNN/api.md` (plantilla: [templates/api.md](templates/api.md)).
- Código y pruebas en las rutas de backend del proyecto.

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga `fase: bd_modelada` en
   `.vd/state.yaml`).
2. Si `db.md` no está `aprobado`, detente y sugiere `/vertical-dev:db`.
3. Lee el requerimiento, `ux.md` (tablas de elementos, estados y acciones) y `db.md`.
4. Lee `api.md` de los requerimientos de los que depende, para reutilizar operaciones,
   formatos y códigos de error.
5. Si `.vd/RF-NNN/api.md` ya existe, estás **retomando o iterando**: continúa desde el
   paso que indique su `estado` (`en_revision` → paso 4, `aprobado` → paso 5).

### 2. Estudiar el backend existente

Antes de diseñar nada, entiende cómo está hecho el backend y **sigue sus patrones**:

- Estilo de API: REST, GraphQL, RPC, acciones de servidor, mensajes…
- Capas y carpetas: dónde van rutas o controladores, casos de uso o servicios,
  repositorios o acceso a datos, modelos, validación.
- Formato de errores, autenticación y autorización, configuración y secretos, logging,
  transacciones.
- Cómo se escriben las pruebas: framework, pruebas unitarias frente a integración, base
  de datos de pruebas, fixtures o factorías.

Busca una funcionalidad existente parecida y úsala como modelo. Si el backend **no
existe todavía**, o existe la infraestructura (servidor, rutas, errores) pero ninguna
funcionalidad que sirva de modelo, propón al usuario una estructura mínima coherente con el stack del
proyecto (capas, framework de pruebas, formato de errores) en una sola pregunta y
guárdala en `.vd/project.yaml`:

```yaml
backend:
  api_style: rest                 # rest | graphql | rpc | server-actions | ...
  error_format: "{ error: { code, message, fields } }"
  architecture: "rutas -> casos de uso -> repositorios"
```

### 3. Diseñar el contrato

Deriva las operaciones de `ux.md`:

- Cada fila de la tabla **Acciones** que cambia o consulta datos del servidor es una
  operación.
- Cada pantalla que **muestra** datos del servidor necesita una operación de lectura
  (con paginación, filtros y orden si la UI los tiene).

Para cada operación define en `api.md`:

- Identificación según el estilo del proyecto (p. ej. `POST /usuarios`, una mutación de
  GraphQL, un procedimiento RPC).
- Autenticación y autorización: quién puede llamarla.
- Entrada: campos, tipos y validaciones. Repite **todas** las validaciones de `ux.md`:
  el backend nunca confía en el frontend.
- Salidas: respuesta de éxito y cada error, con **código de error estable** (p. ej.
  `CORREO_YA_REGISTRADO`), estado HTTP o equivalente y el campo afectado si lo hay. Cada
  error se enlaza con el estado y el mensaje de `ux.md` que lo muestra; el texto final
  para el usuario lo pone el frontend. Si un error necesita datos que el formato común
  no tiene (p. ej. el registro existente en un duplicado), amplía el formato común para
  todo el proyecto y actualiza `backend.error_format` en `.vd/project.yaml`.
- Efectos: qué escribe en la base de datos, qué eventos, correos o tareas dispara.
- Idempotencia y concurrencia cuando aplique (dobles envíos, carreras sobre únicos).

Completa la **trazabilidad**: cada criterio de aceptación apunta a la operación y a las
pruebas que lo verifican.

Si el contrato necesita datos que el modelo no tiene, **no cambies el esquema aquí**:
vuelve a `/vertical-dev:db`. Si necesita algo que la UI no contempla, vuelve a `/vertical-dev:wireframe` o
`/vertical-dev:requirements`.

### 4. Revisar el contrato

Presenta al usuario un resumen breve del contrato (operaciones, errores, decisiones de
seguridad) y pide aprobación antes de implementar. Con cada ronda de feedback actualiza
`api.md` y su historial. Al aprobar, marca `estado: aprobado` en `api.md`.

### 5. Escribir las pruebas primero

Con el framework y el estilo de pruebas del proyecto:

1. **Pruebas de API o integración** por operación: el caso feliz de cada criterio de
   aceptación, cada validación, cada código de error, la autorización y los efectos en
   la base de datos.
2. **Pruebas unitarias** de las reglas de negocio no triviales.
3. Ejecútalas (`backend.commands.test`) y comprueba que fallan por la razón esperada.

Nombra o etiqueta las pruebas con el ID del criterio (`CA-1`…) para mantener la
trazabilidad.

### 6. Implementar

Implementa capa por capa siguiendo la arquitectura del proyecto hasta que las pruebas
pasen. Además:

- **Seguridad**: contraseñas con un algoritmo de hash adaptativo (bcrypt, argon2,
  scrypt) a través de la librería que el proyecto ya use o la estándar del stack; nada
  de secretos en código ni en logs; consultas parametrizadas; autorización comprobada en
  el servidor; no revelar en los errores información que facilite ataques (p. ej.
  enumeración de usuarios) salvo que el requerimiento lo pida explícitamente, y en ese
  caso anótalo en `api.md`.
- **Integridad**: transacciones donde haya varias escrituras; errores de restricción de
  la base de datos (únicos, foráneas) traducidos a los códigos de error del contrato.
- **Dependencias**: añade librerías nuevas solo si son necesarias, con el gestor de
  paquetes del proyecto; menciónalas al usuario.
- Servicios externos (correo, pagos, almacenamiento): detrás de una interfaz con una
  implementación falsa para pruebas y desarrollo local, salvo que el proyecto ya tenga
  otra convención.

### 7. Verificar

1. Ejecuta `backend.commands.test` completo (no solo las pruebas nuevas): sin
   regresiones.
2. Ejecuta `backend.commands.lint` y `backend.commands.build` si existen.
3. Si hay `backend.commands.run` y una base local, levanta el backend y prueba el
   recorrido principal contra la API real. Nunca contra entornos que no sean locales.
   Para cuerpos con texto no ASCII usa un script (p. ej. `fetch` de Node) o un archivo
   (`curl --data-binary @cuerpo.json`): en Windows, los argumentos de `curl` no llegan
   en UTF-8 y corrompen acentos. Al terminar, detén el servidor y comprueba que el
   puerto quedó libre (ver "Procesos en segundo plano").
4. Revisa tu propio diff: conformidad con `api.md`, seguridad, código muerto, `TODO`,
   logs de depuración, nombres coherentes con el proyecto.

Si algo falla, corrígelo y repite. No des la fase por terminada con pruebas en rojo.

### 8. Cerrar la fase

1. En `api.md`: `estado: implementado`, lista de archivos tocados y resultado de la
   verificación.
2. Actualiza `.vd/state.yaml` con `fase: backend_listo`.
3. Resume al usuario qué se implementó, pruebas añadidas y dependencias nuevas.
4. Indica el siguiente paso: `/vertical-dev:frontend RF-NNN`.

## Cambios posteriores

Si `/vertical-dev:frontend` o `/vertical-dev:qa` piden cambios en el contrato o detectan fallos de backend,
vuelve a este skill: actualiza `api.md` (historial incluido), añade primero la prueba
que reproduce el fallo y después corrígelo.

## Procesos en segundo plano

Arranca el proceso real del servidor (p. ej. `node server.js`) y no un envoltorio como
`npm start` o `yarn dev` cuando puedas: en Windows, detener el envoltorio puede dejar
vivo el proceso hijo. Al detenerlo, comprueba que el puerto quedó libre; si sigue
ocupado, identifica el proceso que lo usa, confirma que es el que levantaste y detenlo.

## Reglas

- Escribe la documentación en el idioma del usuario; el código sigue las convenciones
  del proyecto.
- El contrato se deriva de la UI y del modelo aprobados; no añadas operaciones ni
  campos "por si acaso".
- No modifiques el esquema de base de datos fuera de `/vertical-dev:db`.
- No hagas commits: eso es `/vertical-dev:ship`.
