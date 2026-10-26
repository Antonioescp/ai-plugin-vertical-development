---
name: build-qa
description: Lleva un requerimiento pequeño (RF-NNN) con prototipo aprobado hasta aceptado en una sola invocación. Implementa base de datos, backend y frontend como /vd:build, hace las pruebas manuales con Claude como ejecutor como /vd:qa-auto y corrige él mismo los fallos de implementación hasta que todo pasa. Solo se detiene para aprobar el plan, completar los casos que necesitan criterio humano, decidir sobre fallos del diseño aprobado y confirmar la aceptación. Úsalo cuando el usuario pida implementar y probar un requerimiento de punta a punta, todo de una vez o en piloto automático, o cuando /vd:prototype lo proponga.
---

# build-qa

Atajo de las fases 2 a 5 del flujo de desarrollo vertical: `/vd:build` seguido
de `/vd:qa-auto`, más un **bucle de corrección**. Si las pruebas encuentran un
fallo de implementación, lo corrige, vuelve a probar los casos afectados y repite hasta
que todo pasa, sin devolver el trabajo al usuario.

El usuario interviene solo en estos momentos:

1. aprobar el plan (modelo, contrato y pantallas), antes de escribir código;
2. completar los casos de prueba que necesitan criterio humano;
3. decidir cuando un fallo está en lo aprobado (diseño, requerimiento, modelo o
   contrato) y no en la implementación;
4. confirmar la aceptación.

Los artefactos y las fases de `.vd/state.yaml` son los del flujo normal, así que en
cualquier momento se puede seguir con los skills separados.

## Cuándo usarlo

Con los mismos criterios de "Cuándo usarlo" de [../build/SKILL.md](../build/SKILL.md):
requerimientos pequeños que siguen patrones existentes. También hace falta una
herramienta para controlar la app (paso 2 de [../qa-run/SKILL.md](../qa-run/SKILL.md));
sin ella, propón `/vd:build` y después `/vd:qa`.

## Reglas de cada parte

Este skill no repite las reglas: aplica las de los skills que combina y, en las
correcciones, las de la capa que corrige.

- [../build/SKILL.md](../build/SKILL.md): implementación de las tres capas, que a su vez
  remite a `db`, `backend` y `frontend`.
- [../qa-auto/SKILL.md](../qa-auto/SKILL.md): plan, entorno, ejecución y análisis, que a
  su vez remite a `qa` y `qa-run`.
- "Cambios posteriores" de [../db/SKILL.md](../db/SKILL.md),
  [../backend/SKILL.md](../backend/SKILL.md) y
  [../frontend/SKILL.md](../frontend/SKILL.md): cómo se corrige un fallo en cada capa.

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga
   `fase: prototipo_aprobado` en `.vd/state.yaml`).
2. Si ya tiene `modo: build-qa` en `.vd/state.yaml`, estás **retomando**: continúa
   según la fase (hasta `frontend_listo`, como el paso 1.2 de `build`; en `en_pruebas`,
   como el paso 1.4 de `qa-auto`; en una fase anterior por una corrección, en el paso 4).
3. Comprueba los criterios de "Cuándo usarlo".

### 2. Implementar

Sigue `/vd:build` de principio a fin, con `modo: build-qa` en lugar de
`modo: compacto` en `.vd/state.yaml`. Incluye su única puerta: la aprobación del plan
completo. Al terminar no te detengas: sigue en el paso 3.

### 3. Probar

Sigue `/vd:qa-auto` desde su paso 2: plan, entorno, ejecución de los casos,
casos para el usuario y análisis de los fallos. En lugar de su paso 7, ve al paso 4 si
hay incidencias o al paso 5 si todo pasa.

### 4. Corregir

Para cada incidencia, según su origen (tabla del paso 6 de `qa`):

| Origen | Qué hacer |
|---|---|
| entorno | se corrige como en `qa` y el caso se repite en la misma ronda |
| frontend, backend o base de datos, cuando la implementación **no cumple** lo aprobado | se corrige aquí |
| base de datos o contrato, cuando lo aprobado (`db.md`, `api.md`) **está mal o falta algo** | propón el cambio al usuario; con su aprobación, actualiza el documento y corrige aquí |
| UI/UX o requerimiento | detente: explícalo y devuelve el trabajo como en el paso 7 de `qa` |

Al corregir:

1. Registra la incidencia en `qa.md` con su causa y origen.
2. Corrige como indica "Cambios posteriores" de la capa: **primero la prueba
   automática que reproduce el fallo** (o, si no se puede, la verificación en la app
   documentada), después el arreglo.
3. Un fallo de base de datos se corrige con una migración nueva o, si la del
   requerimiento aún no se ha entregado, revirtiéndola, ajustándola y volviéndola a
   aplicar. Siempre en la base local y como indica `/vd:db`.
4. Actualiza el historial del documento de la capa (`db.md`, `api.md` o
   `frontend.md`) y la lista de archivos tocados.
5. Ejecuta las suites completas de backend y frontend, lint y build: sin regresiones.
6. Marca la incidencia como `corregida` en `qa.md`.

Corregidas las incidencias de la ronda, abre una ronda nueva como en el paso 8 de `qa`
(casos que fallaron y los que puedan verse afectados, con su `contexto`) y vuelve al
paso 3 desde la ejecución de los casos.

**Límite**: si tras tres rondas de corrección siguen apareciendo fallos, o un mismo
fallo reaparece después de corregirlo, detente. Resume al usuario qué falla, qué
intentaste y qué propones; no sigas corrigiendo a ciegas.

### 5. Aceptar

Cuando todos los casos de la última ronda pasan y no hay incidencias abiertas, pide la
confirmación de la aceptación como en el paso 9 de `qa`. Incluye en el resumen:

- qué se implementó (migración, operaciones, pantallas) y las dependencias nuevas;
- los casos que comprobó Claude y los que comprobó el usuario;
- las incidencias encontradas y cómo se corrigieron.

Con la confirmación, acepta, quita `modo: build-qa` de `.vd/state.yaml` y propone
`/vd:ship RF-NNN`.

## Reglas

- Escribe en el idioma del usuario; el código sigue las convenciones del proyecto.
- No escribas código sin la aprobación del plan ni aceptes el requerimiento sin la
  confirmación explícita del usuario.
- Corrige solo cuando la implementación no cumple lo aprobado. Cambiar lo aprobado
  (diseño, requerimiento, modelo o contrato) necesita al usuario.
- Cada corrección empieza por la prueba que reproduce el fallo y termina con las
  suites completas en verde.
- Nunca ejecutes migraciones, prepares datos, levantes servicios ni ejecutes casos
  contra entornos que no sean locales.
- No hagas commits: eso es `/vd:ship`.
