# vertical-dev

Skills de Claude Code para **desarrollo vertical**: cada requerimiento se lleva de punta a
punta (UI/UX → base de datos → backend → frontend → pruebas manuales → entrega) antes de
empezar el siguiente. Solo skills, sin agentes: el estado vive en archivos del proyecto
y cualquier sesión puede retomarlo. Agnóstico al stack.

Flujo completo, principios y diagramas: [docs/workflow/README.md](docs/workflow/README.md).

## Skills

| Skill | Para qué |
|---|---|
| [`setup`](skills/setup/SKILL.md) | Detecta el stack y crea `.vd/project.yaml` |
| [`requirements`](skills/requirements/SKILL.md) | Requerimientos verticales en `docs/requirements/` |
| [`wireframe`](skills/wireframe/SKILL.md) | Wireframes HTML de baja fidelidad con comentarios por componente |
| [`prototype`](skills/prototype/SKILL.md) | Prototipo HTML navegable de alta fidelidad |
| [`db`](skills/db/SKILL.md) | Modelo de datos mínimo y migración |
| [`backend`](skills/backend/SKILL.md) | Contrato de API e implementación con pruebas |
| [`frontend`](skills/frontend/SKILL.md) | Pantallas reales a partir del prototipo, con pruebas |
| [`build`](skills/build/SKILL.md) | Atajo para requerimientos pequeños: `db` + `backend` + `frontend` en una pasada con una sola revisión |
| [`qa`](skills/qa/SKILL.md) | Pruebas manuales guiadas y análisis de fallos |
| [`qa-run`](skills/qa-run/SKILL.md) | Claude ejecuta en la app los casos del plan de `qa` y marca resultados con evidencia |
| [`qa-auto`](skills/qa-auto/SKILL.md) | Atajo: `qa` + `qa-run` en una pasada; el usuario solo completa lo humano y confirma |
| [`build-qa`](skills/build-qa/SKILL.md) | Atajo de punta a punta: `build` + `qa-auto`, corrigiendo los fallos de implementación hasta la aceptación |
| [`ship`](skills/ship/SKILL.md) | Commits, push y PR/MR |
| [`next`](skills/next/SKILL.md) | Dónde estamos y qué sigue |

## Instalación

El repositorio es un plugin de Claude Code (`.claude-plugin/plugin.json`) y también su
propio marketplace (`.claude-plugin/marketplace.json`).

Desde GitHub, cuando el repositorio esté publicado:

```
/plugin install vertical-dev --marketplace <owner>/<repo>
```

Desde una copia local:

```
/plugin marketplace add C:\ruta\a\vertical-dev
/plugin install vertical-dev@vertical-dev
```

Para probar cambios sin instalar nada, arranca Claude Code con el plugin cargado desde
disco:

```bash
claude --plugin-dir /ruta/a/vertical-dev
```

Como plugin, los skills se invocan con el nombre del plugin delante:
`/vertical-dev:setup`, `/vertical-dev:requirements`, `/vertical-dev:next`… Claude también
los usa solo cuando la petición encaja con su descripción.

También funcionan sin plugin copiando **todas** las carpetas de `skills/` juntas (se
referencian entre sí) en `<proyecto>/.claude/skills/` o `~/.claude/skills/`. Así se
invocan sin prefijo (`/setup`, `/next`…), con el riesgo de chocar con otros skills de
nombre genérico; por eso se recomienda instalarlo como plugin.

Para validar el plugin tras un cambio:

```bash
claude plugin validate --strict .claude-plugin/plugin.json
claude plugin validate --strict .claude-plugin/marketplace.json
```

## Requisitos opcionales

- **Node.js 18+**: servidor local de revisión (comentarios en wireframes y prototipos,
  página de pruebas manuales). Sin Node, los comentarios se exportan o se pegan en el
  chat.
- **PlantUML**: validar y renderizar los diagramas (flujo de pantallas, modelo de datos).
