---
requerimiento: RF-NNN
estado: en_pruebas       # en_pruebas | con_fallos | aceptado
ronda: 1
---

# Pruebas manuales — RF-NNN <Título del requerimiento>

Plan: [qa/plan.json](qa/plan.json) · Resultados: [qa/results.json](qa/results.json) ·
Ejecución: `http://127.0.0.1:4321/design/qa.html?rf=RF-NNN`

## Cobertura

| Criterio / estado de ux.md | Casos |
|---|---|
| CA-1 | QA-01 |
| CA-2 | QA-02 |
| P1 error-sistema | QA-0N |
| Exploratorio (móvil, teclado, doble envío, recarga) | QA-03 |

## Datos de prueba preparados

- <datos creados en la base local para las pruebas y cómo se crearon>

## Rondas

| Ronda | Casos ejecutados | Pasan | Fallan | Bloqueados | Resultado |
|---|---|---|---|---|---|
| 1 | todos | | | | |

## Incidencias

| ID | Caso | Ronda | Descripción | Causa encontrada | Origen | Vuelve a | Estado |
|---|---|---|---|---|---|---|---|
| INC-1 | QA-02 | 1 | <qué observó el usuario> | <causa raíz> | frontend | `/vd:frontend` | abierta |

**Origen** es una de: requerimiento, UI/UX estructura, UI/UX visual, base de datos,
backend, frontend, entorno (datos o configuración de pruebas).

## Resultado final

<Fecha de aceptación y observaciones, cuando todas las pruebas pasen.>
