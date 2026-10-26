---
name: qa-auto
description: Hace de una sola pasada las pruebas manuales de un requerimiento (RF-NNN) ya implementado, con Claude como ejecutor. Escribe el plan, prepara el entorno local, ejecuta los casos en la app, analiza los fallos y los devuelve a su fase, o pide al usuario confirmar la aceptación. El usuario solo completa los casos que necesitan criterio humano. Combina /vertical-dev:qa y /vertical-dev:qa-run con los mismos artefactos. Úsalo cuando el usuario pida que Claude haga el QA completo, pruebe el requerimiento él mismo o todo de una vez, o cuando /vertical-dev:frontend o /vertical-dev:build lo propongan.
---

# qa-auto

Atajo de la fase 5 del flujo de desarrollo vertical. Une `/vertical-dev:qa` (plan,
entorno, análisis y aceptación) y `/vertical-dev:qa-run` (ejecución de los casos) en una
sola invocación. Ya no hay que preparar, avisar, esperar y volver: Claude prepara,
ejecuta y analiza seguido, y el usuario interviene solo en dos momentos:

- completar los casos que Claude deja `pendiente` porque necesitan criterio humano;
- confirmar la aceptación, o confirmar que un fallo es del diseño antes de reabrirlo.

Los artefactos (`qa.md`, `qa/plan.json`, `qa/results.json`, `qa/evidencia/`) y las fases
de `.vd/state.yaml` son los mismos, así que en cualquier momento se puede seguir con
`/vertical-dev:qa` o `/vertical-dev:qa-run` por separado.

## Reglas de cada parte

Este skill no repite las reglas: léelas en los skills separados y aplícalas.

- [../qa/SKILL.md](../qa/SKILL.md): pasos 2 (plan), 3 (entorno), 6 (análisis), 7
  (devolver el trabajo), 8 (nueva ronda) y 9 (aceptar), y sus Reglas.
- [../qa-run/SKILL.md](../qa-run/SKILL.md): pasos 2 a 4 (herramienta, entorno y
  ejecución de cada caso) y sus Reglas.

Si no hay herramienta para controlar la app (navegador, emulador o automatización), este
skill no aporta nada: dilo y sigue con `/vertical-dev:qa`, que deja las pruebas al
usuario.

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga
   `fase: frontend_listo` o `en_pruebas` en `.vd/state.yaml`).
2. Si `frontend.md` no está `implementado`, detente y sugiere `/vertical-dev:frontend`.
3. Comprueba que hay una herramienta para controlar la app (paso 2 de `qa-run`).
4. Si ya existe `qa/results.json`, estás **retomando**:
   - la última ronda tiene casos `pendiente` del usuario → paso 5;
   - vienes de corregir fallos (`fase: frontend_listo` y `qa.md` con `con_fallos`) →
     abre la ronda nueva como en el paso 8 de `qa` y sigue en el paso 3;
   - si no, ejecuta lo que quede de la ronda actual → paso 4.

### 2. Escribir el plan

Como en el paso 2 de `qa`: `qa/plan.json` y `qa.md`. Redáctalo igual que para una
persona, porque el usuario puede repetir cualquier caso a mano.

### 3. Preparar el entorno

Como en el paso 3 de `qa`, solo en local: migraciones, datos de prueba, app levantada,
`.vd/design/qa.html` actualizado y servidor de revisión en marcha. Pon el requerimiento
en `en_pruebas` (archivo, índice y `.vd/state.yaml`) como en el paso 4.1 de `qa`.

### 4. Ejecutar los casos

Como en los pasos 3 y 4 de `qa-run`: cada caso por la interfaz, con los datos exactos,
comprobando cada punto esperado, con captura y `"ejecutor": "agente"`, y escribiendo
cada resultado en cuanto termina.

### 5. Casos para el usuario

Si quedan casos `pendiente`, dale al usuario en un solo mensaje:

- la URL `http://127.0.0.1:4321/design/qa.html?rf=RF-NNN` y la de la app;
- la lista de pendientes con lo que falta comprobar en cada uno;
- un resumen de lo que ya ejecutaste (pasan, fallan, bloqueados).

Espera a que te avise. Si hay fallos, puedes adelantar su análisis (paso 6) mientras
tanto, pero no devuelvas el trabajo hasta tener la ronda completa.

### 6. Analizar los fallos

Como en el paso 6 de `qa`: reproduce cada `falla` o `bloqueado` con la evidencia,
encuentra la causa raíz y clasifica el origen. Los bloqueos de entorno se corrigen aquí y
el caso se vuelve a ejecutar en la misma ronda. Si el origen es el diseño o el
requerimiento, confírmalo con el usuario antes de reabrirlo.

### 7. Cerrar la ronda

- **Hay incidencias**: devuelve el trabajo como en el paso 7 de `qa`. Indica el skill
  que corrige y que, al terminar, `/vertical-dev:qa-auto RF-NNN` abre la ronda nueva y
  vuelve a ejecutar.
- **Todo pasa**: pide la confirmación de la aceptación como en el paso 9 de `qa`,
  diciendo qué casos comprobó Claude y cuáles el usuario. Con la confirmación, acepta y
  propone `/vertical-dev:ship RF-NNN`.

## Reglas

- Escribe en el idioma del usuario.
- Nunca prepares datos, levantes servicios ni ejecutes casos contra entornos que no sean
  locales.
- No aceptes el requerimiento sin la confirmación explícita del usuario ni marques como
  suyos resultados que ejecutó Claude.
- No corrijas código del producto: identifica el origen y devuelve el trabajo a su fase.
  Solo se corrige aquí lo que es de entorno de pruebas.
