# vertical-dev

Skills de Claude Code para **desarrollo vertical**: cada requerimiento se lleva de punta a
punta (UI/UX → base de datos → backend → frontend → pruebas manuales → entrega) antes de
empezar el siguiente. Solo skills, sin agentes: el estado vive en archivos del proyecto
y cualquier sesión puede retomarlo. Agnóstico al stack.

Flujo completo, principios y diagramas: [docs/workflow/README.md](docs/workflow/README.md).

## Skills

| Skill | Para qué |
|---|---|
| [`vd-setup`](skills/vd-setup/SKILL.md) | Detecta el stack y crea `.vd/project.yaml` |
| [`vd-requirements`](skills/vd-requirements/SKILL.md) | Requerimientos verticales en `docs/requirements/` |
| [`vd-wireframe`](skills/vd-wireframe/SKILL.md) | Wireframes HTML de baja fidelidad con comentarios por componente |
| [`vd-prototype`](skills/vd-prototype/SKILL.md) | Prototipo HTML navegable de alta fidelidad |
| [`vd-db`](skills/vd-db/SKILL.md) | Modelo de datos mínimo y migración |
| [`vd-backend`](skills/vd-backend/SKILL.md) | Contrato de API e implementación con pruebas |
| [`vd-frontend`](skills/vd-frontend/SKILL.md) | Pantallas reales a partir del prototipo, con pruebas |
| [`vd-qa`](skills/vd-qa/SKILL.md) | Pruebas manuales guiadas y análisis de fallos |
| [`vd-ship`](skills/vd-ship/SKILL.md) | Commits, push y PR/MR |
| [`vd-next`](skills/vd-next/SKILL.md) | Dónde estamos y qué sigue |

## Instalación

Copia (o enlaza) **todas** las carpetas de `skills/` juntas, porque algunas se
referencian entre sí (p. ej. `vd-qa` usa el servidor de revisión de `vd-wireframe`):

- Para un proyecto: en `<proyecto>/.claude/skills/`.
- Para todos tus proyectos: en `~/.claude/skills/`.

```bash
cp -r skills/vd-* ~/.claude/skills/
```

Después, en el proyecto: `/vd-setup`, `/vd-requirements` y `/vd-next` para saber qué
sigue en cada momento.

## Requisitos opcionales

- **Node.js 18+**: servidor local de revisión (comentarios en wireframes y prototipos,
  página de pruebas manuales). Sin Node, los comentarios se exportan o se pegan en el
  chat.
- **PlantUML**: validar y renderizar los diagramas (flujo de pantallas, modelo de datos).
