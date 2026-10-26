---
name: prototype
description: Construye e itera un prototipo HTML navegable de alta fidelidad para un requerimiento (RF-NNN) cuyos wireframes HTML ya están aprobados, con estilo visual, datos simulados, validaciones y todos los estados de ux.md. El usuario lo revisa en el navegador y deja comentarios sobre componentes concretos. Úsalo cuando el usuario pida el prototipo, el diseño visual, la maqueta navegable o la experiencia de un requerimiento, cuando pida revisar o atender comentarios del prototipo, o cuando /vd:wireframe indique /vd:prototype como siguiente paso.
---

# prototype

Fase 1b del flujo de desarrollo vertical. Convierte el wireframe aprobado en un
prototipo que el usuario puede recorrer como si fuera la aplicación real: estilo visual,
interacción, validaciones, estados y navegación, **sin backend**. El prototipo aprobado
es la referencia visual de `/vd:frontend`.

## Entradas y salidas

Entradas en `.vd/RF-NNN/`: `ux.md` con `estado: aprobado` y `wireframe/index.html`.
Runtime en `.vd/design/` (`proto.js`, `review-server.mjs`), instalado por `/vd:wireframe`.

Salidas:

```
.vd/design/                 # kit visual compartido por todos los prototipos del proyecto
  tokens.css                # colores, tipografía, espaciado, radios, sombras
  components.css            # mismas clases que wireframe.css, con estilo real
.vd/RF-NNN/prototype/
  index.html                # el HTML del wireframe con estilo y comportamiento
  data.js                   # datos simulados
  app.js                    # validaciones y acciones simuladas
.vd/RF-NNN/review/comments.json   # comentarios del usuario (fase "prototipo")
```

Plantillas: [templates/design/](templates/design/) y [templates/prototype/](templates/prototype/)
(un ejemplo de registro de usuarios que muestra cómo encajan las piezas).

## Cómo funciona el prototipo

- HTML, CSS y JavaScript plano: **sin build, sin dependencias, sin CDN**. Funciona con el
  servidor de revisión y también abriendo `index.html` con doble clic; por eso los datos
  van en `data.js` y no en JSON cargado con `fetch`.
- Parte del HTML del wireframe: mismas `<section data-screen>`, mismos `data-states`,
  mismos `data-id` y mismas clases. Solo cambia la hoja de estilos (`wireframe.css` →
  `tokens.css` + `components.css`) y se añade comportamiento.
- `<body data-rf="RF-NNN" data-fase="prototipo">`: los comentarios de esta fase se
  separan de los del wireframe.
- `app.js` hace lo que el usuario haría de verdad: valida, simula la espera con
  `proto.delay()`, navega con `proto.go('P2', 'exito')`, cambia de estado con
  `proto.setState('error-validacion')` y falla si la barra de revisión activa
  `proto.forceError`. Escucha `proto:show` para rellenar datos de ejemplo cuando se abre
  un estado directamente desde la barra (incluidos los campos que ese estado menciona,
  p. ej. el elemento repetido en un estado "duplicado").
- La **barra de revisión** (botón ◧ o tecla `?`) es la misma del wireframe: pantallas y
  estados, vista móvil, simular error del sistema y **modo comentario** (tecla `C`).

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga
   `fase: wireframes_aprobados` en `.vd/state.yaml`).
2. Si `ux.md` no está `aprobado`, detente y sugiere `/vd:wireframe`.
3. Lee `ux.md`, `wireframe/index.html` y el requerimiento en `docs/requirements/`.
4. Si `.vd/RF-NNN/prototype/` ya existe, estás **iterando**: ve al paso 6. Si no,
   pon `prototipo: en_revision` en `ux.md` y `fase: prototipo_en_revision` en
   `.vd/state.yaml`.

### 2. Preparar el kit visual

Si `.vd/design/tokens.css` **no existe** (primer prototipo del proyecto):

1. Si el proyecto ya tiene frontend, busca su identidad visual (variables CSS, archivos
   de tema, colores y tipografías en `frontend.paths`) y tradúcela a `tokens.css`.
2. Si no hay frontend, pregunta en una sola ronda: tono del producto (p. ej. sobrio,
   amigable, técnico), color de marca si existe, tipografía preferida y alguna referencia
   visual. Propón valores por defecto para cada pregunta.
3. Copia [templates/design/](templates/design/) a `.vd/design/` y ajusta `tokens.css`.

Si ya existe, reutilízalo. Si el wireframe usa una clase que `components.css` no tiene,
añádela ahí. Nunca cambies tokens existentes sin avisar: afecta a otros requerimientos.

### 3. Construir el prototipo

1. Copia `wireframe/index.html` a `prototype/index.html` y:
   - cambia `wireframe.css` por `tokens.css` y `components.css`;
   - pon `data-fase="prototipo"` en `<body>`;
   - añade `data.js` y `app.js` (desde [templates/prototype/](templates/prototype/));
   - convierte los enlaces de acción en controles reales (`<button type="submit">`…) y
     quita los mensajes de error fijos: los genera `app.js`;
   - sustituye `.wf-image` por imágenes o ilustraciones de muestra y elimina `.wf-note`.
2. **Conserva** pantallas, estados, `data-id`, textos y orden. Aquí se decide el aspecto,
   no el contenido.
3. Implementa en `app.js` cada validación y mensaje de error de `ux.md` y cada acción de
   la tabla "Acciones" con su resultado.
4. Pon en `data.js` datos simulados realistas, incluidos casos límite: textos largos,
   listas vacías, muchos elementos.
5. Diseña para cada plataforma de `ux.platforms`; si incluye móvil, a 390 px de ancho.
   Las reglas responsivas usan `@container app (...)`, no `@media` (la vista móvil de
   la barra estrecha `#app`, no la ventana), y el orden del HTML es el orden visual: no
   reordenes con `order` ni posiciones.
6. Accesibilidad básica: cada campo con `<label>`, foco visible, contraste suficiente,
   errores asociados con `aria-describedby`, todo usable con teclado.

### 4. Verificar

1. Arranca el servidor de revisión si no está corriendo (`node .vd/design/review-server.mjs`,
   en segundo plano desde la raíz del proyecto). El prototipo queda en
   `http://127.0.0.1:4321/RF-NNN/prototype/`. Sin Node, se abre con doble clic.
2. Con un navegador disponible, recorre **cada pantalla y estado** de `ux.md` desde la
   barra, en escritorio y móvil si aplica.
3. Recorre el **recorrido principal** usando solo la interfaz, y repítelo con "simular
   error del sistema" activado.
4. Comprueba que la consola no tenga errores y que cada criterio de aceptación de la
   tabla de trazabilidad se pueda ver en el prototipo.

### 5. Presentar

Indica la URL (o la ruta de `index.html`), resume las decisiones visuales y recuerda al
usuario que puede comentar componentes con la tecla `C`. Sin servidor, los comentarios se
quedan en su navegador y debe **Exportar** a `review/comments.json` o **Copiar** al chat.

### 6. Atender comentarios

1. Lee `.vd/RF-NNN/review/comments.json`, filtra `fase: "prototipo"` y
   `estado: "abierto"`, y suma el feedback que el usuario dé en el chat. Cada comentario
   indica `pantalla`, `estado_pantalla`, `elemento` (el `data-id`) y `comentario`.
2. Clasifica cada uno:
   - **Visual o de interacción** (colores, tamaños, espaciado, animaciones, textos de
     ayuda, orden dentro de un bloque): aplícalo aquí.
   - **Estructural** (pantallas, navegación, componentes o estados nuevos o eliminados):
     no lo apliques. Pon `ux.md` en `estado: en_revision`, la fase en
     `wireframes_en_revision` e indica `/vd:wireframe RF-NNN`. Tras reaprobar el
     wireframe, vuelve aquí y lleva los cambios al prototipo.
   - **De requerimiento** (cambia qué hace la funcionalidad o queda fuera de su
     alcance): no lo apliques; propón un requerimiento nuevo o un cambio con
     `/vd:requirements`. Si el usuario acepta, créalo en `borrador` siguiendo ese skill
     y marca el comentario resuelto citando el nuevo `RF-NNN`.
   - **Ambiguo**: pregunta.
3. Responde en el archivo: los aplicados pasan a `"estado": "resuelto"` con una
   `"respuesta"` breve de lo que cambiaste; los no aplicados quedan `abierto` con la
   razón en `"respuesta"`. No toques los demás campos ni borres comentarios.
4. Registra la ronda en "Historial de iteraciones" de `ux.md` con fase `prototipo`,
   incrementa `iteracion` en `.vd/state.yaml` y vuelve a verificar (paso 4).

### 7. Aprobar

Solo con aprobación explícita del usuario:

1. Pon `prototipo: aprobado` en el frontmatter de `ux.md`.
2. Actualiza `.vd/state.yaml` con `fase: prototipo_aprobado`.
3. Indica el siguiente paso: `/vd:db RF-NNN`. Si el requerimiento es pequeño
   (criterios en "Cuándo usarlo" de [../build/SKILL.md](../build/SKILL.md)), propón
   también `/vd:build RF-NNN`, que hace base de datos, backend y frontend en
   una sola pasada con una única revisión, o `/vd:build-qa RF-NNN`, que además
   hace las pruebas con Claude como ejecutor y corrige los fallos hasta la aceptación.

## Reglas

- Escribe en el idioma en que habla el usuario.
- El prototipo no llama a ningún servidor de la aplicación ni guarda datos reales: todo
  se simula. El servidor de revisión solo sirve archivos y guarda comentarios.
- No uses frameworks ni librerías: el prototipo es desechable y debe abrirse en cualquier
  equipo. La implementación real la hace `/vd:frontend` con el stack del proyecto.
- No marques nada como aprobado sin una aprobación explícita del usuario.
