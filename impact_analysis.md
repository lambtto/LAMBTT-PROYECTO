# 1. Descripción del cambio soliciado

## Cambio funcional:
Se requiere integrar con 3 bancos distintos para conciliar automáticamente los gastos con movimientos bancarios reales, cada banco con su propia API, formato y frecuencia de actualizacíon.

## Cambio no funcional:
El módulo de integracion bancaria debe operar con SLA de disponibilidad del 99.9% independiente del resto de la app, y recibir actualizaciones de seguridad sin redesplegar la aplicacíon completa.

## 2. Nuevas historias de usuario:

### US-01: Vinculación de cuenta bancaria mediante autenticación segura

Como usuario de GastApp, quiero vincular mi cuenta bancaria a la app de forma segura, para que el sistema pueda acceder a mis movimientos automáticamente sin que yo tenga que ingresar mis credenciales bancarias cada vez.

Criterios de Aceptación

•	CA1: Dado que el usuario quiere vincular un banco, cuando selecciona uno de los bancos disponibles, entonces la app lo redirige al portal oficial de autenticación de ese banco sin solicitarle sus credenciales directamente en GastApp.

•	CA2: Dado que el usuario autoriza el acceso desde el portal del banco, cuando regresa a la app, entonces el sistema almacena el token de acceso de forma segura, muestra la cuenta como vinculada y lanza la primera sincronización automáticamente.

•	CA3: Dado que el usuario cancela el proceso de autenticación en el portal del banco, cuando regresa a la app, entonces el sistema no guarda ningún dato, no muestra la cuenta como vinculada y permite reintentar el proceso.

•	CA4: Dado que el banco rechaza la autorización (credenciales incorrectas, cuenta bloqueada, etc.), cuando el usuario regresa a la app, entonces el sistema informa que la vinculación no fue exitosa, indica el motivo si el banco lo provee, y no almacena ningún token.

### US-2 Aviso de Seguridad del módulo bancario

Como usuario común, quiero recibir notificaciones de alertas cuando se detecte algún movimiento sospechoso o si se tiene algún problema de seguridad en el sistema, así pudiendo resolver y proteger las cuentas ya vinculadas.

Criterios de aceptación: 

- CA1: Dado que se intenta ingresar desde un acceso no autorizado a un banco, cuando el sistema lo detecta, entonces envía una alerta de inmediato y guarda el registro (fecha, hora y banco) en las notificaciones.

- CA2: Dado que se actualiza un parche de seguridad para el módulo bancario, cuando está listo para instalarse, entonces avisa al usuario y le permite instalarlo en la app sin tener que redesplegar esta.

- CA3: Dado que el usuario quiere gestionar sus avisos de seguridad, cuando entra a la configuración, entonces puede encender/apagar cada alerta

- CA4: Dado que se disparan varias alertas iguales en poco tiempo, cuando el sistema las procesa, entonces las hace un resumen para así no saturar la pantalla.



## 3. Impacto en requisitos extrafuncionales

Indicar si el cambio altera la prioridad de algún REF o introduce nuevos. 

Trazar cambios de prioridad que motiven cambios en decisiones de arquitectura. 

 

| REF ID | Descripción                    | Prioridad anterior | Prioridad nueva | Cambio / Motivo           | 
|--------|--------------------------------|--------------------|-----------------|---------------------------| 
| REF-07 | Seguridad de datos             | Media              | Alta            | El cambio hace que la seguridad para el usuario sea vital, con tal de evitar filtraciones de datos               | 
| REF-03 | Disponibilidad                 | Alta               | Alta            | El cambio requiere que se mantenga una disponibilidad elevada | 
| REF-10 | Recuperabilidad                | Baja               | Alta            | Una alta recuperabilidad es clave dado que si se pierden datos de gastos o presupuestos el impacto es directo al usuario           | 


----

## 4. Impacto en entidades del dominio 

[Nuevas entidades, atributos o relaciones afectadas] + Diagrama acutalizado 

 

## 5. Impacto en mockups 

[Mockups afectados y descripción de cambios necesarios] 

 

## 6. Impacto en arquitectura 

 

### 6.1 ¿Cambia el estilo arquitectónico? 

Si. Ya que nuestro estilo de capas solo satisface la importancia de seguridad y el atributo de disponibilidad es bajo, con las nuevas implementaciones, tendremos que cambiar de arquitectura a una estilo de micro servicios para poder mantener la seguridad y aumentar la disponibilidad de nuestra app, a su vez, este nuevo estilo permite modificar y desplegar el modulo de forma aislada, sin necesidad de redesplegar o detener la aplicación completa garantizando la continuidad del servicio.
Ahora porque es necesario este cambio. Es necesario porque al tener un estilo de micro servicios tenemos la facilidad para que el modulo de bancos viva en un servidor separado y se mantenga activo y funcional independientemente del monolito principal mientras que en otro mantenemos el nivel de seguridad.

 

### 6.2 Relación REF (repriorizado) con decisiones de arquitectura 

 

| REF ID | Prioridad nueva | Decisión de arquitectura que lo aborda         |
|--------|-----------------|------------------------------------------------| 
| REF-03 | Alta            | [cambio o confirmación de decisión existente]  | 
| REF-07 | Alta            | [nueva decisión derivada del cambio]           | 

 

## 7. Impacto en módulos 

 

| Módulo             | Tipo de impacto    | Responsabilidad actualizada        | Ofrece a otros (actualizado)   | 
|--------------------|--------------------|------------------------------------|--------------------------------| 
| [Módulo existente] | modificado         | [descripción actualizada]          | [interfaces actualizadas]      | 
| [Módulo nuevo]     | nuevo              | [responsabilidad]                  | [qué expone]                   | 
| [Módulo eliminado] | eliminado          | —                                  | —                              | 

 

Fundamentación de cambios modulares: 

[Justificar por qué se agregan, modifican o eliminan módulos en función del 

cambio de requerimientos y/o la repriorización de REF.] 

 

## 8. Nuevas decisiones de diseño 

 

### Decisión 1 

- Decisión: [qué se decide] 

- Motivación: [por qué, referenciando REF repriorizado si aplica] 

- Alternativas consideradas: [opciones evaluadas] 

- Impacto: [en qué módulos o REF afecta] 

 

## 9. Trazabilidad actualizada 

 

| Historia | REF relacionado | Módulo     | Mockup  | 
|----------|-----------------|------------|---------| 
| US-XX    | REF-XX          | [módulo]   | [ref]   | 

 

## 10. Justificación global y trade-offs 

[Por qué la solución propuesta es coherente con el sistema. 

Qué trade-offs se asumieron, especialmente ante cambios de prioridad en REF. 

Qué se gana y qué se sacrifica con las decisiones tomadas.] 
