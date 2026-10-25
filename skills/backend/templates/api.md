---
requerimiento: RF-NNN
estado: en_revision      # en_revision | aprobado | implementado
estilo: rest             # el de backend.api_style
---

# Contrato de API — RF-NNN <Título del requerimiento>

## Resumen

<Qué operaciones expone este requerimiento y para qué pantallas, en 2 a 3 frases.>

| Operación | Usada en | Acción de ux.md |
|---|---|---|
| `POST /usuarios` | P1 Crear cuenta | Crear cuenta |

## Formato común de errores

<Formato del proyecto, p. ej.:>

```json
{ "error": { "code": "CODIGO_ESTABLE", "message": "Texto técnico", "fields": { "correo": "CODIGO" } } }
```

## Operaciones

### `POST /usuarios` — Crear cuenta

- **Autenticación**: <pública | usuario autenticado | rol X>
- **Efectos**: <inserta en `usuarios`; envía correo de confirmación>
- **Idempotencia y concurrencia**: <dos registros simultáneos con el mismo correo: el
  único de la base decide, el segundo recibe `CORREO_YA_REGISTRADO`>

**Entrada**

| Campo | Tipo | Obligatorio | Validación | data-id |
|---|---|---|---|---|
| `nombre` | string | sí | 1–120 caracteres | `P1.nombre` |
| `correo` | string | sí | formato de correo, ≤ 254 | `P1.correo` |
| `clave` | string | sí | ≥ 8 caracteres | `P1.clave` |

**Éxito**: `201 Created`

```json
{ "id": "uuid", "nombre": "Ana Pérez", "correo": "ana@ejemplo.com" }
```

**Errores**

| Código | HTTP | Campo | Cuándo | Estado y mensaje en ux.md |
|---|---|---|---|---|
| `VALIDACION` | 422 | según el campo | entrada inválida | P1 error-validacion, mensaje del campo |
| `CORREO_YA_REGISTRADO` | 409 | `correo` | el correo ya existe | P1 error-validacion, "Ya existe una cuenta con este correo." |
| `ERROR_INTERNO` | 500 | — | fallo inesperado | P1 error-sistema |

## Seguridad

- <hash de contraseñas, autorización, datos que no se devuelven, límites de peticiones…>

## Trazabilidad

| Criterio | Operación | Pruebas |
|---|---|---|
| CA-1 | `POST /usuarios` (201) | `<archivo de prueba>: CA-1 crea la cuenta` |
| CA-2 | `POST /usuarios` (409) | `<archivo de prueba>: CA-2 correo ya registrado` |

## Decisiones

- <decisión y motivo>

## Implementación

- Archivos: <lista de archivos creados o modificados>
- Dependencias nuevas: <ninguna | lista>
- Verificación: <pruebas N/N en verde · lint ok · build ok · prueba manual contra API local: ok/no disponible>

## Historial de iteraciones

| Iteración | Motivo | Cambios |
|---|---|---|
| 1 | — | Versión inicial |
