---
name: qa-run
description: Ejecuta en la app local los casos de prueba manual de un requerimiento (RF-NNN) que /vd:qa dejó en qa/plan.json, como lo haría una persona, con el navegador o la herramienta de automatización disponible. Compara cada resultado con lo esperado, guarda pasa, falla o bloqueado con notas y evidencia en qa/results.json marcados como ejecutados por el agente, y deja para el usuario los casos que necesitan criterio humano. Úsalo cuando el usuario pida que Claude ejecute, corra o pase las pruebas manuales o los casos de QA de un requerimiento, o cuando /vd:qa lo proponga.
---

# qa-run

Complemento de `/vd:qa`. Ese skill escribe el plan, prepara el entorno y analiza
los resultados; este **ejecuta los casos del plan** en la app real, en local, en lugar
del usuario o antes que él. No cambia el plan ni corrige nada: observa, marca y deja
evidencia.

Sus resultados cuentan como una ronda normal, marcados con `"ejecutor": "agente"`. El
usuario los ve en `design/qa.html`, puede cambiar cualquiera, y para aceptar el
requerimiento `/vd:qa` le pide confirmación explícita.

## Entradas y salidas

Entradas:

- `.vd/RF-NNN/qa/plan.json`: casos, datos, pasos, resultados esperados y entorno.
- `.vd/RF-NNN/qa/results.json`: rondas anteriores, si existen.
- `.vd/RF-NNN/qa.md`: datos de prueba preparados.
- `.vd/RF-NNN/ux.md`: textos exactos y `data-id` de cada elemento.
- `.vd/project.yaml`: comandos para levantar la app y `frontend.test_id_attribute`.

Salidas:

```
.vd/RF-NNN/qa/
  results.json                  # resultados de la ronda, con ejecutor y evidencia
  evidencia/R<n>-QA-NN.png      # capturas del resultado observado
```

## Proceso

### 1. Leer el contexto

1. Identifica el requerimiento (`RF-NNN` indicado o el que tenga `fase: en_pruebas` en
   `.vd/state.yaml`).
2. Si no existe `qa/plan.json`, detente y sugiere `/vd:qa RF-NNN`: sin plan no
   hay nada que ejecutar.
3. Lee el plan, `qa.md` y la última ronda de `qa/results.json`:
   - Si no hay rondas, crea la ronda 1 con todos los casos, como hace `design/qa.html`.
   - Si la última ronda tiene casos `pendiente`, ejecuta esos. Si el usuario pide
     repetir casos ya marcados, sobrescríbelos solo con su confirmación.
   - Si todos los casos de la última ronda están marcados y no hay una ronda nueva, no
     abras una: eso lo hace `/vd:qa` tras las correcciones.

### 2. Elegir la herramienta

Usa, por este orden, la primera disponible:

1. **Un navegador que puedas controlar**: el navegador integrado o Claude in Chrome
   (carga antes su skill), o el de la herramienta de extremo a extremo del proyecto
   (p. ej. Playwright) si ya está instalada.
2. Para apps que no son web, el emulador o la herramienta de automatización del stack
   (p. ej. Flutter Driver), si está disponible.
3. **Sin herramienta de interfaz**: solo puedes ejecutar los casos que se verifican del
   todo con la API local; los demás se quedan `pendiente` para el usuario.

No instales herramientas nuevas en el proyecto sin preguntar.

### 3. Comprobar el entorno

**Solo en local.** `entorno.url` del plan debe apuntar a `localhost`, `127.0.0.1` o
equivalente; si no, detente.

1. Comprueba que la app responde en `entorno.url` y que existen los datos de "Datos de
   prueba preparados" de `qa.md`.
2. Si algo falta, prepáralo como en el paso 3 de [../qa/SKILL.md](../qa/SKILL.md) y
   anótalo en `qa.md`. Si no puedes, marca como `bloqueado` los casos afectados con el
   motivo.
3. Si `.vd/design/qa.html` no muestra los resultados del agente (no contiene
   `ejecutor`), actualízalo desde
   [../qa/templates/design/qa.html](../qa/templates/design/qa.html): la versión anterior
   no los distingue y, si el usuario marca casos mientras ejecutas, sobrescribe los
   tuyos.
4. Si los datos de un caso ya existen por una ronda anterior (p. ej. el correo que crea
   QA-01), usa una variante (`toni.qa1.r2@…`) y anótalo en la nota del caso.

### 4. Ejecutar cada caso

Respeta el orden que pida `entorno.notas` (casos que necesitan un estado global, como
"lista vacía"). Para cada caso:

1. Parte de un estado limpio: nueva pestaña o página recargada en la pantalla de inicio,
   sin sesión salvo que las precondiciones digan otra cosa.
2. Sigue los **pasos tal como están escritos**, a través de la interfaz, con los datos
   exactos de `datos`. Localiza los elementos por su `data-id` (atributo
   `frontend.test_id_attribute`) o por su texto visible. No llames a la API ni toques la
   base de datos para saltarte pasos de interfaz.
3. Comprueba **cada punto de `esperado`**: textos exactos de `ux.md`, pantalla en la que
   quedas, estado de los botones. Espera a que aparezca el resultado en vez de un tiempo
   fijo.
4. Revisa la consola del navegador: un error durante el caso es una observación aunque
   la pantalla parezca bien.
5. Guarda una captura del resultado final (y del momento del fallo si es otro) en
   `qa/evidencia/R<n>-QA-NN.png`.
6. Decide el resultado:

   | Resultado | Cuándo |
   |---|---|
   | `pasa` | se cumplen todos los puntos de `esperado` y no hay errores en consola |
   | `falla` | algún punto no se cumple: anota qué esperabas y qué observaste, con el texto exacto |
   | `bloqueado` | no pudiste ejecutarlo por el entorno o la herramienta: anota por qué |
   | `pendiente` | necesita criterio humano o algo que la herramienta no puede hacer: anota qué falta comprobar |

   Quedan `pendiente`, por ejemplo: juicios visuales ("se ve bien", "se entiende"), foco
   visible, lectores de pantalla, el modo **Sin conexión** si la herramienta no lo
   permite, o un ancho de móvil si no puedes cambiar el tamaño de la ventana. Si puedes
   comprobar una parte del caso, anota lo comprobado y deja el resto al usuario.

7. Escribe el resultado en la ronda **al terminar cada caso**, para que el usuario vea el
   avance al recargar `design/qa.html`:

   ```json
   "QA-02": {
     "estado": "falla",
     "nota": "Esperado bajo el correo: \"Ya existe una cuenta con este correo.\" Observado: \"Error inesperado\". Consola: 409 sin manejar.",
     "ejecutor": "agente",
     "evidencia": ["evidencia/R1-QA-02.png"],
     "fecha": "<fecha ISO>"
   }
   ```

   Mantén el formato del resto del archivo y no toques los resultados que marcó el
   usuario.

No investigues la causa ni corrijas nada: eso lo hace el paso 6 de `/vd:qa`.
Si un fallo impide seguir con los demás casos (p. ej. la app no arranca), detente, marca
como `bloqueado` los restantes y dilo.

### 5. Informar

1. Cierra las pestañas que abriste. Deja la app levantada si el usuario va a revisar o
   completar casos; si no, detenla como indica `/vd:qa`.
2. Resume al usuario: cuántos casos pasan, fallan, quedan bloqueados y pendientes, y una
   línea por cada fallo con lo observado.
3. Dale la URL `http://127.0.0.1:4321/design/qa.html?rf=RF-NNN` (con el servidor de
   revisión levantado), donde ve tus resultados con su evidencia y puede cambiarlos o
   completar los pendientes.
4. Indica el siguiente paso: cuando no queden pendientes, `/vd:qa RF-NNN`
   analiza los fallos o, si todo pasa, le pide confirmar la aceptación.

## Reglas

- Escribe las notas en el idioma del usuario.
- Nunca ejecutes casos contra entornos que no sean locales ni con cuentas o datos reales
  del usuario.
- Marca siempre tus resultados con `"ejecutor": "agente"`; nunca los presentes como
  resultados del usuario ni marques `pasa` lo que no hayas comprobado.
- No cambies `plan.json`: si un caso está mal escrito o es ambiguo, márcalo `bloqueado`
  con el motivo y díselo al usuario.
- No modifiques código del producto ni des por aceptado el requerimiento.
