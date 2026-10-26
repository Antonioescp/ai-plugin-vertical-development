---
name: frontend
description: Implementa el frontend de un requerimiento (RF-NNN) cuyo backend ya está implementado, reproduciendo el prototipo aprobado con el stack, los componentes y los patrones del proyecto y consumiendo el contrato de api.md, con pruebas automáticas y verificación en la app real. Produce frontend.md y código con pruebas en verde. Úsalo cuando el usuario pida el frontend, las pantallas, la interfaz o la integración con la API de un requerimiento, o cuando /vertical-dev:backend indique /vertical-dev:frontend como siguiente paso.
---

# frontend

Fase 4 del flujo de desarrollo vertical. Lleva el prototipo aprobado al frontend real:
mismas pantallas, estados, textos y aspecto, ahora con el stack del proyecto y
conectado al backend de `api.md`. Termina con pruebas en verde, la app funcionando en
local y la funcionalidad lista para las pruebas manuales de `/vertical-dev:qa`.

## Entradas y salidas

Entradas:

- `.vd/RF-NNN/prototype/` (aprobado): referencia visual y de comportamiento.
- `.vd/RF-NNN/ux.md`: pantallas, estados, elementos con `data-id`, validaciones,
  mensajes y acciones.
- `.vd/RF-NNN/api.md` con `estado: implementado`: operaciones y códigos de error.
- `.vd/design/tokens.css`: identidad visual.
- `.vd/project.yaml`: `frontend.paths` y `frontend.commands`.
- El código del frontend existente: es la referencia de estilo y arquitectura.

Salidas:

- Código y pruebas en las rutas de frontend del proyecto.
- `.vd/RF-NNN/frontend.md` (plantilla: [templates/frontend.md](templates/frontend.md)).

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga `fase: backend_listo`
   en `.vd/state.yaml`).
2. Si `api.md` no está `implementado`, detente y sugiere `/vertical-dev:backend`.
3. Lee `ux.md`, `api.md`, el requerimiento y el prototipo (`index.html`, `app.js`).
4. Si `.vd/RF-NNN/frontend.md` ya existe, estás **retomando o iterando**: revisa su
   estado y continúa desde ahí.

### 2. Estudiar el frontend existente

Antes de escribir código, entiende cómo está hecho el frontend y **sigue sus patrones**:

- Framework, enrutado y estructura de carpetas (páginas, componentes, servicios).
- Sistema de estilos y tema: variables CSS, utilidades, tema del framework, librería de
  componentes.
- Componentes existentes reutilizables: botones, campos, formularios, alertas, layout.
- Cliente de API, manejo de autenticación, gestión de estado, formularios y validación.
- Textos e internacionalización, si existen.
- Pruebas: unitarias, de componentes y de extremo a extremo; herramientas y convenciones.

Busca una pantalla existente parecida y úsala como modelo. Si el frontend **no existe
todavía**, propón una estructura mínima coherente con el stack (enrutado, estilos,
cliente de API, pruebas) en una sola pregunta y guárdala en `.vd/project.yaml`:

```yaml
frontend:
  styling: "<css modules | tailwind | tema del framework | ...>"
  test_id_attribute: "data-testid"   # cómo se marcan los elementos para pruebas
```

### 3. Llevar el kit visual al proyecto

- Si el tema del proyecto **no** refleja aún `.vd/design/tokens.css` (primer
  requerimiento, o tokens nuevos), tradúcelos al sistema de estilos del proyecto: variables
  CSS, configuración de utilidades, tema del framework (p. ej. `ThemeData` en Flutter).
  No dupliques valores: una sola fuente de verdad en el proyecto.
- Si el proyecto ya tenía identidad visual y `/vertical-dev:prototype` la tomó de ahí, solo
  comprueba que coincide.
- Para cada clase de `components.css` que usa el prototipo, usa el componente existente
  del proyecto o crea uno reutilizable si no existe. No copies el CSS del prototipo tal
  cual a pantallas sueltas.

### 4. Planificar

Escribe en `frontend.md`:

- **Pantallas → rutas o vistas** del proyecto.
- **Elementos → componentes**: cada `data-id` de `ux.md` con el componente que lo
  implementa. El `data-id` se conserva como identificador de pruebas (atributo
  `frontend.test_id_attribute`, o el equivalente del framework, p. ej. `Key('P1.correo')`):
  así lo usan las pruebas automáticas, `/vertical-dev:qa` y los comentarios de revisión.
- **Acciones → operaciones** de `api.md`.
- **Códigos de error → mensajes**: cada código de `api.md` con el estado y el texto
  exacto de `ux.md`. Un error no previsto muestra el estado de error del sistema.

### 5. Escribir las pruebas primero

Con las herramientas y el estilo del proyecto:

1. **Pruebas de componentes o pantallas**: cada estado de `ux.md` (inicial, cargando,
   errores, éxito), cada validación con su mensaje y cada código de error de la API con
   su mensaje, simulando la API como lo haga el proyecto.
2. **Prueba de extremo a extremo** del recorrido principal si el proyecto tiene esa
   herramienta (contra el backend local o con la API simulada, según su convención).
3. Ejecútalas (`frontend.commands.test`) y comprueba que fallan por la razón esperada.

Etiqueta las pruebas con el criterio de aceptación que cubren (`CA-1`…).

Si el proyecto **no tiene herramienta de pruebas de componentes** (DOM), no la añadas
sin preguntar: extrae a módulos sin DOM la validación, los mensajes, la traducción de
códigos de error y el formato de datos, y pruébalos. Los estados de pantalla se
verifican en la app (paso 7) y la trazabilidad de `frontend.md` lo indica así.

### 6. Implementar

- Reproduce el prototipo: misma estructura, mismos textos, mismo orden, mismos estados.
  Las diferencias solo se aceptan cuando el stack las impone; anótalas en `frontend.md`.
- Validación en cliente igual a la de `ux.md` (el backend vuelve a validar).
- Llamadas a la API con el cliente del proyecto; estados de carga visibles; botones
  deshabilitados mientras se envía para evitar dobles envíos.
- Accesibilidad al menos como en el prototipo: etiquetas, foco visible, errores
  asociados a sus campos, uso con teclado.
- Responsivo para cada plataforma de `ux.platforms`. El prototipo usa `@container app`
  por su barra de revisión; en la app usa el mecanismo del proyecto (normalmente
  `@media`). El orden del DOM es el visual: no reordenes con `order` ni posiciones.
- Sin secretos ni claves privadas en el cliente; nada sensible en logs ni en
  almacenamiento local salvo que el proyecto lo haga así de forma deliberada.
- Dependencias nuevas solo si hacen falta, con el gestor del proyecto; menciónalas.

Si el contrato no encaja con lo que la UI necesita (falta un campo, un error no
documentado, un formato distinto), **no lo rodees en el frontend**: vuelve a
`/vertical-dev:backend` para ajustar `api.md` y el backend.

### 7. Verificar

1. Ejecuta `frontend.commands.test`, `lint` y `build` completos: sin regresiones.
2. Levanta backend y frontend en local (`backend.commands.run`, `frontend.commands.run`)
   con la base de datos local migrada. Nunca contra otros entornos. Arranca el proceso
   real y no un envoltorio como `npm start` cuando puedas, y al detenerlo comprueba que
   el puerto quedó libre: en Windows el proceso hijo puede seguir vivo y falsear las
   pruebas de "servidor caído".
3. Si tienes un navegador, emulador o herramienta de automatización disponible:
   - recorre el **recorrido principal** con datos reales de la API local;
   - provoca cada estado de `ux.md` (validaciones, errores de la API, éxito); espera a
     que el estado aparezca en vez de un tiempo fijo (una petición a un servidor caído
     puede tardar segundos en fallar);
   - **compara con el prototipo** abriendo ambos (el prototipo con
     `node .vd/design/review-server.mjs`) en escritorio y móvil si aplica;
   - revisa que la consola no tenga errores.
4. Anota en `frontend.md` el resultado y las diferencias visuales detectadas. Corrige las
   que no estén justificadas.

No des la fase por terminada con pruebas en rojo o con el recorrido principal roto.

### 8. Cerrar la fase

1. En `frontend.md`: `estado: implementado`, archivos tocados, dependencias nuevas y
   resultado de la verificación.
2. Actualiza `.vd/state.yaml` con `fase: frontend_listo`.
3. Resume al usuario qué se implementó y cómo levantar la app para verlo.
4. Indica el siguiente paso: `/vertical-dev:qa RF-NNN`, o `/vertical-dev:qa-auto RF-NNN`
   si el usuario prefiere que Claude ejecute las pruebas.

## Cambios posteriores

Si `/vertical-dev:qa` detecta fallos de frontend, vuelve a este skill: añade primero la prueba que
reproduce el fallo y después corrígelo; actualiza el historial de `frontend.md`. Si el
fallo no se puede probar con las herramientas del proyecto (p. ej. orden de foco sin
pruebas de DOM), dilo en el historial y verifícalo en la app.

## Reglas

- Escribe la documentación en el idioma del usuario; el código sigue las convenciones
  del proyecto.
- No cambies el diseño aprobado: un cambio visual o de comportamiento vuelve a
  `/vertical-dev:prototype` (o a `/vertical-dev:wireframe` si es estructural).
- No cambies el contrato ni el esquema desde aquí.
- No hagas commits: eso es `/vertical-dev:ship`.
