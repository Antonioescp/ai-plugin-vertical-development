---
name: wireframe
description: Diseña e itera wireframes HTML de baja fidelidad para un requerimiento aprobado (RF-NNN) de docs/requirements/, junto con el documento de UX (flujo de pantallas, estados, validaciones y datos). El usuario los revisa en el navegador y deja comentarios sobre componentes concretos. Úsalo cuando el usuario pida wireframes, bocetos, la estructura de pantallas o el diseño UI/UX de un requerimiento, cuando pida revisar o atender comentarios de un wireframe, o cuando /vd:requirements indique /vd:wireframe como siguiente paso.
---

# wireframe

Fase 1a del flujo de desarrollo vertical. A partir de un requerimiento aprobado define
**qué pantallas hay, qué contienen, cómo se navega entre ellas y en qué estados pueden
estar**, en baja fidelidad para que cambiar sea barato. El estilo visual se decide
después en `/vd:prototype`, sobre el mismo HTML.

## Entradas y salidas

Entrada: `docs/requirements/RF-NNN-<slug>.md` con `estado: aprobado` o `en_desarrollo`.

Salidas:

```
.vd/design/                  # runtime compartido (lo instala este skill la primera vez)
  proto.js                   # navegación, barra de revisión y comentarios
  wireframe.css              # estilo de baja fidelidad
  review-server.mjs          # servidor local que guarda los comentarios
.vd/RF-NNN/
  ux.md                      # documento de UX (plantilla: templates/ux.md)
  flujo.puml                 # navegación entre pantallas (plantilla: templates/flujo.puml)
  wireframe/index.html       # todas las pantallas y estados (plantilla: templates/wireframe/)
  review/comments.json       # comentarios del usuario (los escribe la barra de revisión)
```

## Cómo funciona el wireframe

- HTML plano con [templates/design/wireframe.css](templates/design/wireframe.css): gris,
  sin colores ni imágenes reales. Usa **las mismas clases** que el kit del prototipo
  (`card`, `field`, `btn`, `alert`…), así `/vd:prototype` parte de este mismo HTML.
- Cada pantalla es un `<section data-screen="P1" data-title="…" data-states="…">`; los
  elementos de un estado concreto llevan `data-show-in="…"`; la URL `#P1/estado` muestra
  esa pantalla en ese estado.
- **Cada componente de `ux.md` lleva `data-id="P1.<elemento>"`** (p. ej. `P1.correo`,
  `P1.crear-cuenta`). Es lo que el usuario selecciona al comentar y lo que tú recibes en
  los comentarios. Usa los mismos nombres en `ux.md`.
- Las acciones son enlaces a la pantalla de destino (`href="#P2/exito"`). No hay lógica:
  validaciones y simulaciones llegan con el prototipo.
- [templates/design/proto.js](templates/design/proto.js) añade la **barra de revisión**
  (botón ◧ o tecla `?`): lista pantallas y estados, cambia a vista móvil y activa el
  **modo comentario** (tecla `C`): el usuario pasa el ratón, ve resaltado el componente
  con su `data-id`, hace clic y escribe el comentario. Los componentes con comentarios
  abiertos muestran un marcador con el número de comentarios.

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento: el `RF-NNN` que indique el usuario o, si no indica
   ninguno, el primer requerimiento `aprobado` del índice `docs/requirements/README.md`.
2. Si el requerimiento está en `borrador`, detente y sugiere `/vd:requirements`.
3. Lee el requerimiento completo y los requerimientos de los que depende
   (`depende_de`), con sus `ux.md` si existen, para reutilizar pantallas y patrones.
4. Lee `.vd/project.yaml`. Si no define `ux.platforms`, pregunta una sola vez para qué
   plataformas se diseña (web escritorio, web móvil, app móvil, escritorio) y guárdalo.
5. Si el proyecto ya tiene frontend, revisa sus pantallas (`frontend.paths`) para
   respetar la navegación y el layout actuales.
6. Si `.vd/RF-NNN/wireframe/` ya existe, estás **iterando**: ve al paso 6.

### 2. Instalar el runtime

Si falta `.vd/design/proto.js`, `wireframe.css` o `review-server.mjs`, cópialos desde
[templates/design/](templates/design/). Si ya existen, no los sobrescribas.

### 3. Derivar pantallas y estados

A partir de los criterios de aceptación identifica:

- **Pantallas** (`P1`, `P2`, …) y modales (`M1`, …). Usa las mínimas necesarias.
- **Estados** de cada pantalla. Considera siempre: inicial/vacío, cargando, error de
  validación, error del sistema y éxito. Omite los que no apliquen y dilo en `ux.md`.
- **Navegación**: cómo se llega a cada pantalla y a dónde se va tras cada acción.
- **Componentes y datos**: cada dato de "Datos involucrados" aparece en algún componente,
  con su validación y su mensaje de error.

Construye la **trazabilidad**: cada criterio de aceptación (`CA-n`) apunta a la pantalla
y el estado que lo cumplen. Si algo no está en el requerimiento, pregúntalo en vez de
inventarlo.

### 4. Escribir los artefactos

1. `ux.md` desde [templates/ux.md](templates/ux.md).
2. `flujo.puml` desde [templates/flujo.puml](templates/flujo.puml).
3. `wireframe/index.html` desde [templates/wireframe/index.html](templates/wireframe/index.html)
   (trae un ejemplo que debes reemplazar), con `data-rf="RF-NNN"` en `<body>`.

Reglas:

- Baja fidelidad: sin colores ni imágenes (usa `.wf-image` como marcador). Textos reales
  del producto, no "Lorem ipsum".
- Para notas de diseño visibles en el wireframe usa `.wf-note`.
- Cada estado debe verse completo con solo abrir su URL: incluye en el HTML los mensajes
  de error y contenidos de ejemplo con `data-show-in`.
- Todo elemento interactivo (botones, enlaces, campos) lleva su propio `data-id` y su fila
  en `ux.md`; si no, un comentario sobre él cae en el contenedor.
- Si la plataforma incluye móvil, el layout debe funcionar a 390 px de ancho. Las reglas
  responsivas usan `@container app (...)` y no `@media`: la vista móvil de la barra
  estrecha `#app`, no la ventana. `wireframe.css` trae `.row-movil-columna` y
  `.btn-block-movil`.
- El orden del HTML es el orden visual en todas las plataformas: no reordenes con
  `order`, posiciones ni `flex-direction: *-reverse`, porque el foco del teclado sigue
  el DOM. Si en móvil algo debe ir primero, va primero en el HTML.

### 5. Verificar y publicar para revisión

1. Si hay Node.js 18+, arranca el servidor en segundo plano desde la raíz del proyecto:
   `node .vd/design/review-server.mjs` (puerto 4321 por defecto; otro como argumento).
   El wireframe queda en `http://127.0.0.1:4321/RF-NNN/wireframe/`.
   Sin Node, el usuario abre `wireframe/index.html` con doble clic: los comentarios se
   guardan en su navegador y la barra ofrece **Exportar** (a `review/comments.json`) o
   **Copiar** (para pegarlos en el chat).
2. Si tienes un navegador disponible, recorre cada pantalla y estado de `ux.md` y la
   navegación del recorrido principal, en escritorio y móvil si aplica, y revisa que la
   consola no tenga errores. Corrige antes de mostrar.
3. Presenta al usuario: URL, pantallas, decisiones tomadas y preguntas abiertas. Explícale
   que puede comentar componentes con la tecla `C` y avisarte cuando termine.

### 6. Atender comentarios

Cuando el usuario diga que dejó comentarios (o al iterar):

1. Lee `.vd/RF-NNN/review/comments.json` y filtra `fase: "wireframe"` y
   `estado: "abierto"`. Cada comentario indica `pantalla`, `estado_pantalla`, `elemento`
   (el `data-id`), `texto_elemento` y `comentario`. Considera también el feedback que el
   usuario dé en el chat.
2. Clasifica cada uno:
   - **De wireframe** (estructura, contenido, textos, navegación, estados): aplícalo en
     `wireframe/index.html`, `ux.md` y `flujo.puml` si cambia la navegación.
   - **De requerimiento** (cambia qué hace la funcionalidad): no lo apliques; indícalo y
     sugiere `/vd:requirements`.
   - **Ambiguo**: no lo apliques; pregunta.
3. Responde **en el propio archivo**: para cada comentario aplicado pon
   `"estado": "resuelto"` y una `"respuesta"` breve con lo que cambiaste; para los no
   aplicados deja `"estado": "abierto"` y explica en `"respuesta"` por qué. Conserva los
   demás campos y comentarios intactos. La barra de revisión muestra tus respuestas.
4. Registra la ronda en "Historial de iteraciones" de `ux.md` e incrementa `iteracion`
   en `.vd/state.yaml`.
5. Verifica de nuevo (paso 5.2) y resume al usuario qué cambió y qué queda pendiente.

### 7. Aprobar

Solo cuando el usuario apruebe explícitamente la estructura:

1. Marca `estado: aprobado` en el frontmatter de `ux.md`.
2. Actualiza `.vd/state.yaml` con `fase: wireframes_aprobados`.
3. Si el requerimiento estaba `aprobado`, cámbialo a `en_desarrollo` en su archivo y en
   el índice `docs/requirements/README.md`.
4. Indica el siguiente paso: `/vd:prototype RF-NNN`.

## Estado en `.vd/state.yaml`

```yaml
RF-001:
  fase: wireframes_en_revision   # wireframes_en_revision | wireframes_aprobados | ...
  iteracion: 2
```

Si `/vd:prototype` detecta un cambio estructural y vuelve aquí, `ux.md` regresa a
`estado: en_revision` y la fase a `wireframes_en_revision`.

## Reglas

- Escribe en el idioma en que habla el usuario.
- No decidas tecnología, tablas ni endpoints: solo lo que ve y hace el usuario.
- No borres comentarios del usuario; solo cambia `estado` y `respuesta`.
- No marques nada como aprobado sin una aprobación explícita del usuario.
