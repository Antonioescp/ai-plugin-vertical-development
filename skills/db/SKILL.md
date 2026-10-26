---
name: db
description: Modela solo la porción de base de datos que necesita un requerimiento (RF-NNN) con prototipo aprobado, a partir de los datos que la UI captura y muestra en ux.md, y genera la migración con las herramientas del proyecto. Produce db.md (modelo, restricciones, índices, trazabilidad) y un diagrama ER en PlantUML. Úsalo cuando el usuario pida modelar datos, diseñar tablas o colecciones, el esquema o la migración de un requerimiento, o cuando /vd:prototype indique /vd:db como siguiente paso.
---

# db

Fase 2 del flujo de desarrollo vertical. Traduce los datos de la UI/UX aprobada en el
modelo de datos **mínimo** que el requerimiento necesita, sobre el esquema que ya existe,
y lo deja listo como migración. El modelo aprobado es la entrada de `/vd:backend`.

## Entradas y salidas

Entradas:

- `docs/requirements/RF-NNN-<slug>.md`: reglas de negocio y datos involucrados.
- `.vd/RF-NNN/ux.md` con `prototipo: aprobado`: tabla de elementos (`data-id`, dato,
  validación) y acciones.
- `.vd/RF-NNN/prototype/data.js`: ejemplos realistas de los datos.
- Esquema actual: migraciones o esquema del proyecto (`database.migrations_dir`) y el
  modelo global `.vd/db/modelo.puml`.
- `.vd/project.yaml`, sección `database`.

Salidas:

```
.vd/RF-NNN/
  db.md                    # modelo de la porción (plantilla: templates/db.md)
  db.puml                  # ER de la porción (plantilla: templates/db.puml)
.vd/db/
  modelo.puml              # ER global acumulado de todos los requerimientos aprobados
<database.migrations_dir>/ # migración generada con la herramienta del proyecto
```

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga
   `fase: prototipo_aprobado` en `.vd/state.yaml`).
2. Si `ux.md` no tiene `prototipo: aprobado`, detente y sugiere `/vd:prototype`.
3. Lee el requerimiento, `ux.md` y `data.js`.
4. Lee el **esquema actual**: migraciones existentes, archivos de esquema u ORM
   (modelos, entidades) en las rutas del proyecto, y `.vd/db/modelo.puml` si existe.
   El código del proyecto manda: si discrepa del modelo global, avisa y usa el código.
5. Lee los títulos del backlog (`docs/requirements/README.md`) para no tomar decisiones
   que bloqueen requerimientos ya conocidos. **No los modeles**: solo evita cerrarles el
   camino.
6. Revisa `database` en `.vd/project.yaml`:
   - Si falta `engine`, dedúcelo del proyecto (dependencias, configuración, docker
     compose) o pregunta.
   - Si faltan `conventions`, dedúcelas del esquema existente; si no hay esquema,
     propón y confirma con el usuario en una sola pregunta. Guárdalas:

     ```yaml
     database:
       engine: postgres
       conventions:
         naming: snake_case        # nombres de tablas y columnas
         tables: plural            # plural | singular
         primary_key: id uuid      # tipo y nombre de la clave primaria
         timestamps: [created_at, updated_at]
         soft_delete: none         # none | deleted_at
     ```

   - Si faltan los comandos `new_migration` y `migrate`, dedúcelos de la herramienta de
     migraciones del proyecto o pregunta.
7. Si `.vd/RF-NNN/db.md` ya existe, estás **iterando**: ve al paso 5.

### 2. Inventariar los datos

Recorre la tabla de elementos de `ux.md` y la sección "Datos involucrados" del
requerimiento. Para cada dato decide:

- **Se persiste** → a qué entidad y atributo va.
- **Se deriva** (calculado a partir de otros datos) → no se guarda; anota de dónde sale.
- **No se persiste** (p. ej. "confirmar contraseña", captchas, filtros de UI) → anótalo.
- **Ya existe** en el esquema → se reutiliza.

Todo dato persistido debe venir de la UI, de una regla de negocio o de un requisito de
sistema explícito (auditoría, seguridad). Si no, no se modela.

### 3. Diseñar el modelo

Para cada entidad nueva o modificada define:

- **Atributos**: nombre según convenciones, tipo lógico (texto, entero, decimal, fecha,
  fecha-hora, booleano, uuid, enum, json) y tipo físico del motor, nulabilidad, valor
  por defecto.
- **Restricciones**: clave primaria, únicos (indica si la unicidad ignora mayúsculas, p.
  ej. correos), checks que reflejen validaciones de `ux.md`, longitudes máximas.
- **Relaciones**: cardinalidad, clave foránea y comportamiento al borrar (restrict,
  cascade, set null) justificado.
- **Índices**: solo los que piden las consultas de la UI (búsquedas, filtros, orden de
  listas, búsquedas por clave natural) y las claves foráneas.
- **Datos sensibles**: contraseñas solo como hash; marca los datos personales (PII) y
  cualquier dato que requiera cifrado o retención especial.

Reglas de diseño:

- Modela **solo** lo que este requerimiento necesita. Una tabla o columna "para el
  futuro" no entra.
- Los cambios sobre tablas existentes deben ser compatibles con lo ya entregado
  (columnas nuevas nulas o con valor por defecto, sin renombrados destructivos). Si un
  cambio rompe compatibilidad, explícalo y propón un plan de migración de datos.
- Las validaciones de la UI se repiten en la base de datos cuando protegen la integridad
  (obligatorio, único, rango); las puramente de formato, y las que dependen de la fecha
  actual o de otras filas (que muchos motores no admiten en un CHECK), pueden quedarse en
  el backend. Anota en `db.md` cuáles quedan fuera de la base y por qué.
- Comprueba que las restricciones funcionan con datos reales **en ese motor**:
  mayúsculas, acentos, espacios, collation. P. ej. `lower()` de SQLite solo convierte
  ASCII, así que un único "sin distinguir mayúsculas" sobre texto con acentos necesita
  una columna normalizada por el backend o una collation adecuada.
- Si el motor no es relacional (p. ej. documentos), modela colecciones, documentos
  embebidos frente a referencias e índices con el mismo rigor, y adapta el diagrama.

### 4. Escribir los artefactos

1. `.vd/RF-NNN/db.md` desde [templates/db.md](templates/db.md), incluida la
   **trazabilidad** `data-id` → entidad.atributo, con todos los elementos de datos de
   `ux.md`.
2. `.vd/RF-NNN/db.puml` desde [templates/db.puml](templates/db.puml): entidades nuevas,
   modificadas y las existentes con las que se relacionan, marcadas con sus estereotipos.
3. Si encuentras PlantUML (comando `plantuml`, `PLANTUML_JAR`, o el `plantuml.jar` de la
   extensión de VS Code en `~/.vscode/extensions/jebbs.plantuml-*`), valida y renderiza
   `db.puml` a SVG; corrige cualquier error de sintaxis.
4. Actualiza `.vd/state.yaml` con `fase: bd_en_revision`.

### 5. Revisar e iterar con el usuario

Presenta: entidades y relaciones (enlace al SVG o a `db.puml`), decisiones relevantes
(unicidades, borrados, índices, datos sensibles) y preguntas abiertas. Pide aprobación.

Con cada ronda de feedback actualiza `db.md` y `db.puml`, registra la ronda en el
historial de `db.md` e incrementa `iteracion` en `.vd/state.yaml`. Si el feedback
implica un dato que la UI no tiene, no lo añadas aquí: es un cambio de UX
(`/vd:wireframe`) o de requerimiento (`/vd:requirements`).

### 6. Generar la migración

Solo después de que el usuario **apruebe el modelo**:

1. Genera la migración con el comando `database.commands.new_migration` del proyecto, o
   escríbela a mano en `database.migrations_dir` siguiendo el formato de las existentes.
   Nombre descriptivo con el ID: p. ej. `rf_001_crear_usuarios`.
2. La migración debe ser **reversible** (subida y bajada) siempre que la herramienta lo
   permita. Si el comando del proyecto crea archivos vacíos o con un esqueleto,
   complétalos y comprueba que contienen el modelo entero **antes** de aplicarlos.
3. Si la herramienta del proyecto usa modelos u ORM como fuente del esquema, actualiza
   esos modelos y genera la migración a partir de ellos.
4. Verifica, **solo contra una base de datos local o de desarrollo**: aplica la migración,
   revierte y vuelve a aplicar. Antes de ejecutar comprueba a qué base apunta la
   configuración; si no es claramente local o de desarrollo, o no puedes saberlo, no
   ejecutes y pide al usuario que lo haga. Si no hay base de datos disponible, dilo y
   deja la verificación pendiente. Tras aplicar, prueba las restricciones clave
   insertando datos que deben fallar (duplicados con otra capitalización o acentos,
   valores fuera de rango, obligatorios vacíos) y bórralos después.
5. Anota en `db.md` el archivo de migración generado y el resultado de la verificación.

### 7. Cerrar la fase

1. Marca `estado: aprobado` en el frontmatter de `db.md`.
2. Integra la porción en `.vd/db/modelo.puml` (créalo desde
   [templates/db.puml](templates/db.puml) si no existe), sin estereotipos de cambio: las
   entidades nuevas se añaden y las modificadas reemplazan a su versión anterior.
3. Actualiza `.vd/state.yaml` con `fase: bd_modelada`.
4. Indica el siguiente paso: `/vd:backend RF-NNN`.

## Reglas

- Escribe en el idioma en que habla el usuario; los nombres del esquema siguen las
  convenciones del proyecto.
- Nunca ejecutes migraciones, borrados ni cambios de datos contra bases que no sean
  locales o de desarrollo.
- No generes la migración sin aprobación explícita del modelo.
- No implementes repositorios, endpoints ni lógica de negocio: eso es `/vd:backend`.
