---
requerimiento: RF-NNN
estado: en_revision      # en_revision | aprobado
motor: <postgres | mysql | sqlite | sqlserver | mongodb | ...>
---

# Modelo de datos — RF-NNN <Título del requerimiento>

Diagrama: [db.puml](db.puml)

## Resumen

<Qué entidades se crean o modifican y por qué, en 2 a 4 frases.>

## Inventario de datos

| data-id | Dato | Decisión | Destino |
|---|---|---|---|
| `P1.nombre` | Nombre | se persiste | `usuarios.nombre` |
| `P1.correo` | Correo electrónico | se persiste | `usuarios.correo` |
| `P1.clave` | Contraseña | se persiste como hash | `usuarios.clave_hash` |
| `P1.confirmar-clave` | Confirmar contraseña | no se persiste | solo validación |
| — | Fecha de alta | requisito de sistema | `usuarios.created_at` |

## Entidades

### `<tabla>` — <nueva | modificada>

<Para qué existe, en una frase.>

| Atributo | Tipo lógico | Tipo físico | Nulo | Por defecto | Restricciones | Notas |
|---|---|---|---|---|---|---|
| `id` | uuid | `uuid` | no | generado | PK | |
| `correo` | texto | `varchar(254)` | no | | único sin mayúsculas | PII |
| `clave_hash` | texto | `varchar(255)` | no | | | hash, nunca texto plano |
| `created_at` | fecha-hora | `timestamptz` | no | ahora | | |
| `updated_at` | fecha-hora | `timestamptz` | no | ahora | | |

**Índices**

| Nombre | Columnas | Tipo | Motivo |
|---|---|---|---|
| `<tabla>_correo_uq` | `lower(correo)` | único | CA-2: correo ya registrado |

## Relaciones

| Desde | Hacia | Cardinalidad | Clave foránea | Al borrar | Motivo |
|---|---|---|---|---|---|
| `<tabla_hija>` | `<tabla>` | N:1 | `<tabla>_id` | restrict | <motivo> |

## Cambios sobre el esquema existente

<Columnas o restricciones añadidas a tablas existentes y cómo se mantiene la
compatibilidad, o "Ninguno".>

## Datos sensibles

| Atributo | Tipo de dato | Tratamiento |
|---|---|---|
| `usuarios.correo` | PII | <acceso restringido, retención…> |
| `usuarios.clave_hash` | credencial | hash con algoritmo adaptativo, decidido en /vd:backend |

## Decisiones

- <decisión y motivo>

## Preguntas abiertas

- <pregunta, o "Ninguna">

## Migración

- Archivo: `<ruta de la migración>` (pendiente hasta aprobar el modelo)
- Verificación (subir → bajar → subir en base local): <pendiente | correcta | no disponible: motivo>

## Historial de iteraciones

| Iteración | Feedback recibido | Cambios aplicados |
|---|---|---|
| 1 | — | Versión inicial |
