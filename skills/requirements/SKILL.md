---
name: requirements
description: Crea, refina o divide requerimientos funcionales verticales en docs/requirements/ del proyecto. Úsalo cuando el usuario describa funcionalidades, un producto o un cambio que deba convertirse en requerimientos, cuando pida agregar, editar, priorizar o partir un requerimiento, o al iniciar el flujo de desarrollo vertical (vd) antes de /vertical-dev:wireframe.
---

# requirements

Convierte lo que describe el usuario en requerimientos funcionales **verticales**: cada
uno se puede diseñar (UI/UX), modelar (BD), implementar (backend y frontend) y probar
manualmente de punta a punta sin depender de requerimientos posteriores.

Este skill es la primera fase del flujo de desarrollo vertical. No diseña pantallas,
tablas ni endpoints: eso lo hacen las fases siguientes.

## Archivos

```
docs/requirements/
  README.md                       # índice priorizado (el backlog)
  RF-001-registro-de-usuarios.md  # un archivo por requerimiento
  RF-002-inicio-de-sesion.md
```

- Plantilla de requerimiento: [templates/requirement.md](templates/requirement.md)
- Plantilla del índice: [templates/index.md](templates/index.md)

## Modos

Detecta el modo por lo que pide el usuario:

- **Crear**: el usuario describe funcionalidades nuevas.
- **Refinar**: el usuario pide cambiar un requerimiento existente (`RF-xxx`).
- **Dividir**: un requerimiento es demasiado grande para ser vertical.
- **Priorizar**: el usuario quiere reordenar el backlog.

## Proceso

### 1. Leer el contexto

1. Si existe `docs/requirements/README.md`, léelo para conocer los IDs, el orden y los
   estados actuales. Si no existe, se creará desde la plantilla del índice.
2. Lee los requerimientos que estén relacionados con lo que pide el usuario para evitar
   duplicados y detectar dependencias.
3. El siguiente ID es el mayor `RF-NNN` existente + 1, con tres dígitos. Los IDs nunca se
   reutilizan, aunque un requerimiento se descarte.

### 2. Identificar funcionalidades

Separa la descripción del usuario en funcionalidades candidatas. Para cada una aplica la
**prueba de verticalidad**:

- ¿Un usuario puede completar una tarea con valor usando solo esta funcionalidad y las
  anteriores en el backlog?
- ¿Se puede probar manualmente de principio a fin?
- ¿Cabe en un ciclo razonable de UI/UX → BD → backend → frontend → pruebas?

Si es demasiado grande, propón dividirla por **flujo de usuario**, no por capa técnica.
Correcto: "Registro con correo" y "Registro con Google". Incorrecto: "Tabla de usuarios"
y "Pantalla de registro".

### 3. Aclarar dudas

Antes de escribir, identifica lo que falta para que los criterios de aceptación sean
verificables: actores, reglas de negocio, datos que se capturan o muestran, casos de error
y límites. Haz **como máximo 5 preguntas por ronda**, agrupadas y concretas, proponiendo
una respuesta por defecto en cada una. Las respuestas quedan en "Decisiones" del
requerimiento (y se reflejan en criterios y reglas). Lo que el usuario no sepa responder
queda en "Preguntas abiertas"; no bloquea su creación.

### 4. Escribir los requerimientos

Para cada funcionalidad crea `docs/requirements/RF-NNN-<slug>.md` desde la plantilla:

- `<slug>`: título en minúsculas, sin acentos, palabras separadas por guiones.
- **Historia de usuario**: "Como <actor>, quiero <acción>, para <beneficio>".
- **Criterios de aceptación** en Given/When/Then (Dado/Cuando/Entonces), incluyendo el
  caso feliz, validaciones y errores. Cada criterio debe poder probarse manualmente;
  `/vertical-dev:qa` los convertirá en el plan de pruebas.
- **Datos involucrados**: qué información captura o muestra el usuario, en lenguaje de
  negocio (p. ej. "correo electrónico, único"). No tablas, tipos ni columnas.
- **Fuera de alcance**: lo que explícitamente no incluye, sobre todo lo que se movió a
  otro requerimiento al dividir.
- `estado: borrador` en el frontmatter.

No incluyas decisiones técnicas (frameworks, tablas, endpoints, librerías). Si el usuario
las menciona como restricción real, anótalas en "Restricciones".

### 5. Actualizar el índice

Agrega o actualiza la fila de cada requerimiento en `docs/requirements/README.md`,
respetando la prioridad que indique el usuario. Si no indica ninguna, ordena por
dependencias: un requerimiento va después de los que necesita.

### 6. Confirmar

Muestra al usuario un resumen: IDs creados o cambiados, orden del backlog y preguntas
abiertas. Cuando el usuario apruebe un requerimiento, cambia su estado a `aprobado` en el
archivo y en el índice.

Termina indicando el siguiente paso: `/vertical-dev:wireframe RF-NNN` con el primer requerimiento
aprobado del backlog que siga pendiente.

## Estados

`borrador` → `aprobado` → `en_desarrollo` → `en_pruebas` → `entregado`, o `descartado`.

Este skill solo asigna `borrador`, `aprobado` y `descartado`. El resto los asignan las
fases siguientes.

## Reglas

- Escribe en el idioma en que habla el usuario.
- No borres requerimientos: márcalos `descartado` y explica el motivo en el archivo.
- Al refinar un requerimiento que ya está `en_desarrollo` o posterior, avisa al usuario
  qué fases podrían tener que rehacerse (wireframes, prototipo, BD, backend, frontend).
- Al dividir, el requerimiento original se marca `descartado` con un enlace a los nuevos.
