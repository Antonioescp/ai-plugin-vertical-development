---
name: vd-next
description: Indica en qué punto está el flujo de desarrollo vertical (vd) y cuál es el siguiente skill a ejecutar, leyendo .vd/state.yaml, el backlog de docs/requirements/ y los artefactos de cada requerimiento. Detecta trabajo pendiente del usuario (comentarios sin atender, pruebas sin marcar, aprobaciones) e inconsistencias. Úsalo cuando el usuario pregunte qué sigue, en qué va el proyecto o un requerimiento, cómo retomar el trabajo en una sesión nueva, o pida continuar el flujo.
---

# vd-next

Brújula del flujo de desarrollo vertical. No hace trabajo de ninguna fase: lee el estado
y dice qué toca y por qué. Como el estado vive en archivos, sirve para retomar el
trabajo en cualquier sesión.

## Qué leer

1. `.vd/project.yaml`. Si no existe, el siguiente paso es `/vd-setup` y no hace falta
   leer nada más.
2. `docs/requirements/README.md`: orden del backlog y estado de cada requerimiento.
3. `.vd/state.yaml`: fase de cada requerimiento en desarrollo.

   ```yaml
   RF-001:
     fase: backend_listo
     iteracion: 3
   ```

4. Para los requerimientos con fase, el frontmatter de sus artefactos en `.vd/RF-NNN/`
   (`ux.md`, `db.md`, `api.md`, `frontend.md`, `qa.md`) y, según la fase,
   `review/comments.json` y `qa/results.json`.

## Decidir el siguiente paso

| Situación | Siguiente paso |
|---|---|
| Sin `.vd/project.yaml` | `/vd-setup` |
| Sin requerimientos, o ninguno `aprobado` ni en desarrollo | `/vd-requirements` |
| Requerimiento `aprobado` sin fase (el primero del backlog) | `/vd-wireframe RF-NNN` |
| `fase: pendiente` (QA encontró un fallo de requerimiento) | `/vd-requirements` para corregirlo y después `/vd-wireframe` |
| `wireframes_en_revision` | `/vd-wireframe RF-NNN`: revisar comentarios o esperar aprobación |
| `wireframes_aprobados` | `/vd-prototype RF-NNN` |
| `prototipo_en_revision` | `/vd-prototype RF-NNN`: revisar comentarios o esperar aprobación |
| `prototipo_aprobado` | `/vd-db RF-NNN` |
| `bd_en_revision` | `/vd-db RF-NNN`: esperar aprobación del modelo o generar la migración |
| `bd_modelada` | `/vd-backend RF-NNN` (si `api.md` está `en_revision`, falta aprobar el contrato) |
| `backend_listo` | `/vd-frontend RF-NNN` |
| `frontend_listo` | `/vd-qa RF-NNN` |
| `en_pruebas` | el usuario prueba en `design/qa.html`; si ya terminó, `/vd-qa RF-NNN` analiza |
| `aceptada` | `/vd-ship RF-NNN` |
| `entregada` | siguiente requerimiento `aprobado` del backlog, o `/vd-requirements` |

Prioridad cuando hay varios requerimientos con fase: primero el que está más avanzado
sin entregar; el flujo vertical termina uno antes de empezar otro. Si hay más de uno en
desarrollo, señálalo: es una desviación del flujo que el usuario debería conocer.

## Qué más revisar

**Pendiente del usuario.** Es lo primero que hay que decirle, porque bloquea el avance:

- Comentarios abiertos sin respuesta en `review/comments.json` de la fase actual
  (`fase: "wireframe"` o `"prototipo"`): cuántos y en qué pantallas. Si tienen
  `respuesta`, el skill ya los atendió y el usuario debe revisarlos.
- Casos `pendiente` en la última ronda de `qa/results.json`.
- Aprobaciones esperadas: `ux.md` en revisión, `db.md` o `api.md` en `en_revision`.
- Preguntas abiertas en el requerimiento o en los artefactos de la fase actual.

**Inconsistencias.** Señálalas sin corregirlas; el skill de la fase correspondiente las
resolverá:

- La fase no coincide con los artefactos (p. ej. `fase: backend_listo` sin `api.md`
  `implementado`).
- El estado del requerimiento en su archivo no coincide con el índice.
- Un requerimiento `entregado` sin `entrega:` o con fase distinta de `entregada`.
- Cambios sin commit en el repositorio que no pertenecen al requerimiento en curso.

## Responder

Responde en pocas líneas, en el idioma del usuario:

1. **Dónde estamos**: requerimiento en curso, fase y una frase de contexto.
2. **Pendiente del usuario**, si lo hay.
3. **Siguiente paso**: el skill a ejecutar con su argumento y qué hará.
4. **Inconsistencias**, si las hay.
5. Opcionalmente, el progreso del backlog (p. ej. "2 de 7 entregados").

Si el usuario pidió **continuar** (no solo preguntar), carga el skill indicado y sigue
sus instrucciones en esta misma sesión.

## Reglas

- Solo lectura: no modifiques archivos ni el estado.
- No adivines: si un dato no está en los archivos, dilo.
