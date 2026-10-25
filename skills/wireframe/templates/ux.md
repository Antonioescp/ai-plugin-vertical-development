---
requerimiento: RF-NNN
estado: en_revision      # wireframes: en_revision | aprobado
prototipo: pendiente     # pendiente | en_revision | aprobado (lo gestiona /vertical-dev:prototype)
plataformas: [web]
---

# UX — RF-NNN <Título del requerimiento>

## Objetivo del usuario

<Qué intenta lograr el usuario, en una frase, tomado de la historia de usuario.>

## Recorrido principal

1. El usuario <acción> en **P1 <Pantalla>**.
2. ...
3. Termina en **P2 <Pantalla>** con <resultado>.

Diagrama: [flujo.puml](flujo.puml) · Wireframe: [wireframe/index.html](wireframe/index.html)

## Pantallas

### P1 — <Nombre de la pantalla>

- **Cómo se llega**: <desde dónde y con qué acción>
- **Propósito**: <qué hace el usuario aquí>
- **Wireframe**: `wireframe/index.html#P1`

**Elementos**

| data-id | Elemento | Tipo | Dato | Validación | Mensaje de error |
|---|---|---|---|---|---|
| `P1.correo` | <Correo electrónico> | campo de texto | correo | obligatorio, formato válido | "<mensaje>" |
| `P1.crear-cuenta` | <Crear cuenta> | botón principal | — | habilitado cuando… | — |

**Estados**

| Estado | Cuándo ocurre | Qué ve el usuario |
|---|---|---|
| inicial | al entrar | <formulario vacío> |
| cargando | al enviar | <botón deshabilitado con indicador> |
| error de validación | <dato inválido> | <mensaje junto al campo> |
| error del sistema | <falla al guardar> | <mensaje general y opción de reintentar> |
| éxito | <operación completada> | <a dónde navega o qué confirma> |

**Acciones**

| Acción | Resultado |
|---|---|
| <Crear cuenta> | <va a P2 / muestra error> |

## Diferencias por plataforma

<Cómo se adapta el layout en cada plataforma, o "Ninguna".>

## Trazabilidad con criterios de aceptación

| Criterio | Pantalla | Estado |
|---|---|---|
| CA-1 | P1 → P2 | éxito |
| CA-2 | P1 | error de validación |

## Decisiones de diseño

- <decisión y motivo>

## Preguntas abiertas

- <pregunta, o "Ninguna">

## Historial de iteraciones

| Iteración | Fase | Feedback recibido | Cambios aplicados |
|---|---|---|---|
| 1 | wireframes | — | Versión inicial |
