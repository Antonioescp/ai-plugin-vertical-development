<!--
  Descripción del PR o MR de RF-NNN. Título sugerido:
  "RF-NNN: <Título del requerimiento>"
  Adapta el formato a la plantilla de PR del repositorio si existe.
-->

## RF-NNN — <Título del requerimiento>

<Historia de usuario del requerimiento, en una línea.>

Requerimiento: [`docs/requirements/RF-NNN-<slug>.md`](docs/requirements/RF-NNN-<slug>.md)

### Qué incluye

- **UI/UX**: <pantallas nuevas o modificadas>
- **Base de datos**: <tablas o colecciones nuevas o modificadas, migración>
- **Backend**: <operaciones de la API>
- **Frontend**: <rutas, pantallas y componentes>

### Criterios de aceptación

- [x] CA-1 — <título>
- [x] CA-2 — <título>

### Pruebas

- Automáticas: backend <N> pruebas, frontend <N> pruebas, todas en verde.
- Manuales: <N> casos en <N> rondas, todos aceptados ([`qa.md`](.vd/RF-NNN/qa.md)).

### Cómo probarlo

1. Aplica la migración: `<comando migrate>`.
2. Levanta backend y frontend: `<comandos run>`.
3. <Recorrido principal en pocos pasos.>

### Notas para revisar

- <decisiones relevantes, dependencias nuevas, riesgos, cambios en tablas existentes>

### Diseño

- UX: [`ux.md`](.vd/RF-NNN/ux.md) · Modelo: [`db.md`](.vd/RF-NNN/db.md) ·
  Contrato: [`api.md`](.vd/RF-NNN/api.md) · Frontend: [`frontend.md`](.vd/RF-NNN/frontend.md)
- Prototipo: `node .vd/design/review-server.mjs` → `/RF-NNN/prototype/`
