---
requerimiento: RF-NNN
estado: en_progreso      # en_progreso | implementado
iteracion: 1
---

# Frontend — RF-NNN <Título del requerimiento>

## Pantallas

| Pantalla | Ruta o vista | Archivo |
|---|---|---|
| P1 Crear cuenta | `/registro` | `<ruta del archivo>` |
| P2 Cuenta creada | `/registro/listo` | `<ruta del archivo>` |

## Elementos

| data-id | Componente | Reutilizado o nuevo |
|---|---|---|
| `P1.correo` | `<CampoTexto>` | reutilizado |
| `P1.crear-cuenta` | `<BotonPrincipal>` | reutilizado |

## Acciones

| Acción de ux.md | Operación de api.md | Éxito |
|---|---|---|
| Crear cuenta | `POST /usuarios` | navega a P2 |

## Errores

| Código de api.md | Estado de ux.md | Mensaje mostrado |
|---|---|---|
| `CORREO_YA_REGISTRADO` | P1 error-validacion (campo `P1.correo`) | "Ya existe una cuenta con este correo." |
| cualquier otro | P1 error-sistema | "No pudimos crear tu cuenta. Inténtalo de nuevo en unos minutos." |

## Tema

<Cómo se reflejan los tokens de .vd/design/tokens.css en el proyecto, o "Sin cambios".>

## Diferencias con el prototipo

- <diferencia y motivo, o "Ninguna">

## Trazabilidad

| Criterio | Pruebas |
|---|---|
| CA-1 | `<archivo de prueba>: CA-1 …` |

## Implementación

- Archivos: <lista>
- Dependencias nuevas: <ninguna | lista>
- Verificación: <pruebas N/N · lint ok · build ok · recorrido en app local ok · comparación con prototipo ok>

## Historial de iteraciones

| Iteración | Motivo | Cambios |
|---|---|---|
| 1 | — | Versión inicial |
