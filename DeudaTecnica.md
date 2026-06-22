# Deuda Técnica, Code Smells y Mejoras de Diseño

## 1. Code smells / deuda técnica identificada

| ID    | Ubicación (archivo/módulo)         | Descripción del problema                                                                                                                              | Propuesta de mejora                                                                                                        |
|-------|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| DT-01 | `index.js` (general)               | Todo el código reside en un único archivo de ~350 líneas: rutas, controladores, validadores y configuración mezclados. God File clásico.              | Separar en capas: `routes/`, `controllers/`, `middlewares/`, `validators/`. Mejora mantenibilidad y testabilidad.          |
| DT-02 | `index.js` — `validarMonto` y `validarFecha` | Las funciones de validación están definidas en el mismo archivo que las rutas. Si se necesitan en otro módulo, habrá que duplicarlas.         | Extraer a un módulo `validators.js` y exportarlas para reutilización en cualquier controlador.                             |
| DT-03 | `index.js` — `authMiddleware`      | La autenticación simulada acepta cualquier string como token Bearer sin verificación real. Es funcional para desarrollo pero inseguro para producción. | Implementar autenticación real con JWT (`jsonwebtoken`): firmar y verificar tokens con una clave secreta almacenada en `.env`. |
| DT-04 | `index.js` — `GET /grupos`         | Para cada grupo se ejecuta una query adicional para obtener miembros (N+1 queries). Con muchos grupos esto degrada el rendimiento.                    | Reemplazar con un `JOIN` entre `grupos` y `grupo_miembros` y agregar con `array_agg(gm.usuario)`.                         |
| DT-05 | `db.js` — `initDB`                 | Los datos iniciales (categorías y grupo por defecto) se insertan en la misma función que inicializa las tablas, mezclando schema con seed data.      | Extraer los datos iniciales a una función `seedDB()` separada, invocada solo cuando `NODE_ENV=development`.                |

## 2. Mejoras de diseño futuras

- **Autenticación real con JWT:** El sistema actual usa el token Bearer directamente como nombre de usuario, lo que no provee ninguna seguridad real. Implementar JWT con expiración y firma secreta es un requisito para cualquier despliegue productivo. Impacto esperado: seguridad real, base para control de acceso por roles.

- **Paginación en listados:** Los endpoints `GET /gastos` y `GET /grupos/:id/gastos` retornan todos los registros sin límite. Con historial extenso esto puede degradar el rendimiento y la experiencia de usuario. Agregar parámetros `?page=1&limit=20` con respuesta que incluya total de registros. Impacto esperado: mejor rendimiento y UX en historiales extensos.

- **Separación en capas (Controller → Service → Repository):** Actualmente las rutas acceden directamente al pool de PostgreSQL. Aplicar esta separación desacoplaría la lógica de negocio del acceso a datos, facilitando el testing unitario con mocks y el reemplazo futuro del motor de base de datos. Impacto esperado: mayor mantenibilidad y testabilidad del código.
