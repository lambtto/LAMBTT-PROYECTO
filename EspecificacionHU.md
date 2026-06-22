# Especificación de Historia de Usuario

## US-01: Registro de gasto individual

Como usuario financiero, quiero registrar mis gastos indicando monto, categoría y fecha, para llevar un control detallado de mis gastos mensuales.

**Descripción adicional:** El usuario podrá registrar gastos con información adicional opcional como descripción y método de pago. El sistema también permitirá seleccionar categorías previamente creadas o crear nuevas categorías personalizadas.

**Autenticación:** Todos los endpoints requieren un token Bearer. El valor del token se usa como identificador de usuario (ej: `Authorization: Bearer juan`).

## Criterios de aceptación

- **CA1 – Guardar gasto correctamente:** Dado que el usuario está autenticado, cuando ingresa un monto, categoría y fecha válidos y guarda el registro (`POST /gastos`), entonces el sistema almacena el gasto y retorna HTTP 201 con los datos del gasto creado.
- **CA2 – Validación de monto inválido:** Dado que el usuario ingresa un monto negativo o igual a cero, cuando intenta guardar el gasto, entonces el sistema retorna HTTP 400 con el mensaje `"El monto es inválido. Debe ser un número mayor a 0."`.
- **CA3 – Validación de fecha futura:** Dado que el usuario selecciona una fecha futura, cuando intenta guardar el gasto, entonces el sistema retorna HTTP 400 con el mensaje `"No se permiten fechas posteriores al día actual."`.
- **CA4 – Crear nueva categoría:** Dado que el usuario desea crear una nueva categoría, cuando registra el nombre mediante `POST /categorias`, entonces el sistema la añade y retorna HTTP 201 con los datos de la categoría creada.
- **CA5 – Registrar descripción opcional:** Dado que el usuario agrega una descripción opcional, cuando guarda el gasto, entonces el sistema almacena la descripción y la retorna en el detalle del registro.
- **CA6 – Asociar método de pago:** Dado que el usuario selecciona un método de pago, cuando guarda el gasto, entonces el sistema asocia el método de pago al registro y lo retorna en la respuesta.

## Definition of Done

1. `POST /gastos` retorna HTTP 201 con el gasto creado al recibir datos válidos.
2. `POST /gastos` retorna HTTP 400 con mensaje descriptivo ante monto inválido (≤ 0) o fecha futura.
3. `POST /gastos` retorna HTTP 400 si no se envía `categoria_id` o la categoría no existe.
4. `GET /gastos` retorna el historial del usuario autenticado, filtrando por `mes`, `anio` y/o `categoria_id`.
5. `PUT /gastos/:id` permite editar campos individuales de un gasto existente del usuario.
6. `DELETE /gastos/:id` elimina el gasto si pertenece al usuario autenticado.
7. `POST /categorias` permite crear una nueva categoría y retorna HTTP 201.
8. Los cambios se integraron a `main` mediante Pull Request desde la rama `feature/us-01`.
9. Se revisaron code smells antes del merge.
10. Al menos 3 casos de prueba documentados en `CasosDePrueba.md`.
