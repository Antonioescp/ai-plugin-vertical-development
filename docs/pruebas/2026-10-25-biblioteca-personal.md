# Prueba del flujo completo — Biblioteca personal (2026-10-25)

> Nota: después de esta prueba los skills perdieron el prefijo `vd-` al empaquetarse como
> plugin (`/vd-setup` → `/vertical-dev:setup`, etc.). El informe conserva los nombres de
> entonces.
Proyecto de ejemplo: `C:\Users\packa\repos\vd-ejemplo` (Node 24 sin dependencias: `node:http`, `node:sqlite`, `node:test`).
Recorrido: `/vd-setup` → `/vd-requirements` (RF-001…RF-005) → RF-001 por todas las fases → `/vd-next`.
Aprobaciones y respuestas del usuario simuladas por el agente. QA: 2 rondas, 11 casos, 1 incidencia real (INC-1, orden de foco).
Entrega `local` en la rama `vd/RF-001-registrar-un-libro` (5 commits).

Los hallazgos IMPORTANTE y [menor] se corrigieron en los skills, salvo dos que no requieren cambios: el nombre del SVG renderizado (vd-wireframe) y el fallo de `git symbolic-ref` sin remoto (vd-setup ya lo cubre). Los [ok] confirman lo que funcionó.

## vd-setup
- [menor] La tabla de detección se basa en dependencias del manifiesto; un proyecto sin dependencias (node:http, node:sqlite) solo se detecta leyendo los puntos de entrada. Añadir: "si no hay dependencias que lo indiquen, lee los puntos de entrada y sus imports".
- [menor] No contempla que el frontend lo sirva el backend (sin build ni run propio): el perfil acaba con frontend.run = backend.run. Conviene decirlo explícitamente.
- [menor] `git symbolic-ref refs/remotes/origin/HEAD` falla sin remoto; el skill ya cae a la rama actual: ok.

## vd-requirements
- [menor] La plantilla no tiene dónde dejar las respuestas del usuario a las preguntas de aclaración (p. ej. "título+autor únicos", "año opcional"); quedan implícitas en criterios y reglas. Añadir sección "Decisiones" al requerimiento.
- [ok] La prueba de verticalidad funcionó: "registrar" sin la lista no aporta valor, así que RF-001 incluye la lista básica.

## vd-wireframe
- [IMPORTANTE] La vista "movil" de la barra de revisión solo limita #app a 390 px; las @media siguen viendo el viewport real, así que los layouts responsivos no se ven en esa vista. Arreglo: #app como contenedor (`container: app / inline-size`) y reglas responsivas con `@container app (...)` en wireframe.css y components.css, más utilidades (`.row-movil-columna`, `.btn-block-movil`). Documentarlo en los skills.
- [menor] El SVG renderizado se llama como el nombre de @startuml (RF-001-flujo.svg), no flujo.svg. Irrelevante, pero el skill podría decir "renderiza junto al .puml".
- [menor] Los elementos de acción secundarios (p. ej. "Registrar mi primer libro" en el estado vacío) sin data-id hacen que el comentario caiga en el contenedor; el skill debería pedir data-id en todo elemento interactivo.

## vd-prototype
- [menor] Hay dos contadores de iteración (frontmatter de ux.md y state.yaml) y la tabla de historial reinicia la numeración por fase. Simplificar: state.yaml cuenta iteraciones de la fase actual; ux.md solo lleva el historial con columna Fase (quitar `iteracion` del frontmatter).
- [menor] Cuando un comentario es un cambio de requerimiento y el usuario acepta, el skill no dice qué hacer: crear el requerimiento nuevo en borrador (como hace /vd-requirements) y marcar el comentario resuelto con referencia al RF nuevo.
- [menor] Al abrir un estado desde la barra (p. ej. P2 duplicado) los campos salen vacíos aunque el mensaje nombra un libro; la plantilla app.js debería mostrar cómo rellenar los campos del estado.
- [ok] Partir del HTML del wireframe y cambiar la hoja de estilos funcionó bien; las utilidades responsivas compartidas también.
- [ok] El kit visual se derivó del web/styles.css existente como indica el paso 2.

## vd-db
- [ok] El inventario por data-id obligó a decidir cada dato (derivado, persistido, de sistema).
- [ok] Detectó un problema real del motor: lower() de SQLite no normaliza acentos → columnas normalizadas + índice único. Conviene añadir al skill una línea: "comprueba que la unicidad o las restricciones funcionan con los datos reales (acentos, mayúsculas, espacios) en ese motor".
- [menor] Un CHECK no puede usar la fecha actual en SQLite: el skill ya dice "las de formato pueden quedarse en backend"; generalizar a "las que dependen del tiempo o de otras filas".
- [menor] Al generar la migración con el comando del proyecto se crean archivos vacíos; añadir: "antes de aplicar, comprueba que la migración contiene el cambio completo del modelo" (en la prueba se aplicó una migración vacía y hubo que revertirla).
- [menor] El paso "quita estereotipos al integrar en modelo.puml" es manual; está bien, pero el skill podría decir que en modelo.puml se reemplaza la entidad si ya existía.

## vd-backend
- [menor] El paso 2 cubre "el backend no existe" pero no "hay infraestructura y ninguna funcionalidad": tampoco hay un modelo de capas que copiar. Ampliar la propuesta de estructura a ese caso.
- [menor] Si el formato de errores necesita un campo nuevo (aquí `detalle` para LIBRO_REPETIDO), el skill debería decir que se amplía el formato común y se documenta en project.yaml, no solo en api.md.
- [menor] Probar la API con curl en Windows corrompe acentos (argv no UTF-8). Recomendar en el paso 7.3 un script (fetch de Node, archivo con --data-binary) para cuerpos con texto no ASCII.
- [ok] Escribir las pruebas primero con CA-n en el nombre dio trazabilidad directa con api.md.

## vd-frontend
- [menor] El paso 5 asume pruebas de componentes; en un proyecto sin herramienta de DOM solo se pueden probar módulos. Añadir: "si el proyecto no tiene pruebas de componentes, extrae validación, mensajes y traducción de errores a módulos sin DOM y pruébalos; los estados de pantalla se verifican en la app (paso 7) y se anota así en la trazabilidad".
- [menor] El prototipo usa @container para la vista móvil y la app real @media: mencionar que la traducción del responsivo puede cambiar de mecanismo.
- [IMPORTANTE] Detener procesos en segundo plano en Windows: parar `npm start` deja vivo el `node` hijo (el servidor siguió respondiendo y guardó un libro en una prueba de "servidor caído"). Los skills que levantan servicios (backend, frontend, qa) deben decir: arranca el proceso real (no un envoltorio como npm) o comprueba que el puerto quedó libre al detenerlo.
- [menor] En Windows un fetch a un servidor caído tarda 1–2 s en fallar: al verificar estados de error, esperar a que aparezca el estado y no un tiempo fijo corto.

## vd-qa
- [IMPORTANTE] La utilidad `.orden-primero-movil` de wireframe.css y components.css reordena solo visualmente y rompe el orden de foco (lo detectó QA-10). Quitarla de las plantillas y añadir a los skills de wireframe/prototipo/frontend: "no reordenes con `order` ni posiciones; el orden del DOM debe ser el visual".
- [menor] "Cada caso debe poder ejecutarse solo, en cualquier orden" choca con casos que necesitan un estado global (biblioteca vacía). Permitir indicar en entorno.notas qué caso va primero, y pedir que los casos creen sus propios datos cuando sea posible (funcionó bien).
- [menor] Estados de error difíciles de provocar a mano: sugerir el modo "Sin conexión" de las herramientas del navegador para errores de red, en vez de pedir al agente que detenga servicios.
- [menor] Al volver de un fallo cuyo arreglo no afecta a BD ni API, el skill obliga a pasar por la fase más temprana "y las siguientes". Permitir saltar fases sin impacto dejando constancia (se hizo: prototipo → frontend).
- [menor] vd-frontend pide "añade primero la prueba que reproduce el fallo", imposible sin pruebas de DOM: indicar la alternativa (verificación en la app documentada en frontend.md).
- [ok] Clasificar el origen distinguió bien "el frontend no cumple el diseño" de "el diseño aprobado tiene el problema", y la confirmación con el usuario antes de reabrir el diseño tuvo sentido.
- [ok] La ronda 2 con `contexto` mostró al usuario qué cambió y el resultado anterior.

## vd-ship
- [menor] La asignación por capas no tiene sitio para lo que no es del requerimiento pero sí del flujo (perfil, kit de diseño, backlog de otros RF). Añadir un commit de "preparación" opcional antes del de diseño.
- [menor] Con delivery `local` no hay URL: definir `entrega: "local: rama <rama>"`.
- [ok] La verificación final, la revisión de secretos y los commits por capa funcionaron; con `local` no se pidió confirmación de publicación, como dice el skill.

## vd-next
- [IMPORTANTE] No mira git: tras una entrega `local` (o un PR sin fusionar) el siguiente requerimiento empezaría encima de la rama anterior. Debe informar de la rama actual, si la del último RF entregado está fusionada en base_branch y recomendar desde dónde crear la siguiente.
- [ok] Con el estado y los artefactos resolvió el siguiente paso sin ambigüedad (RF-002) y detectó RF-005 en borrador.
