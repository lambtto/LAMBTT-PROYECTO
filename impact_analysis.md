# 1. Descripción del cambio soliciado

## Cambio funcional:
Se requiere integrar con 3 bancos distintos para conciliar automáticamente los gastos con movimientos bancarios reales, cada banco con su propia API, formato y frecuencia de actualizacíon.

## Cambio no funcional:
El módulo de integracion bancaria debe operar con SLA de disponibilidad del 99.9% independiente del resto de la app, y recibir actualizaciones de seguridad sin redesplegar la aplicacíon completa.

## 2. Nuevas historias de usuario:

### US-01: Vinculación de cuenta bancaria mediante autenticación segura

Como usuario común, quiero conectar mi cuenta bancaria a la app de manera segura, para que el sistema pueda leer a mis movimientos de forma automática sin perder mis credenciales cada vez que ingreso. 

Criterios de Aceptación

•	CA1: Dado que el usuario desea enlazar un banco, cuando elige una de las entidades bancarias disponibles, entonces la app lo lleva al sitio oficial de autenticación de ese banco sin solicitarle sus datos bancarios directamente.

•	CA2: Dado que el usuario aprueba el acceso desde el sitio del banco, cuando vuelve a la app, entonces el sistema guarda el token de acceso de forma protegida, refleja la cuenta como conectada e inicia la primera sincronización de movimientos de manera automática.

•	CA3: Dado que el usuario abandona el proceso de autenticación en el portal del banco, cuando retorna a la app, entonces el sistema descarta cualquier dato obtenido, no registra la cuenta como vinculada y le ofrece la opción de intentarlo nuevamente. 

•	CA4: Dado que el banco rechaza la autorización por cualquier motivo (datos incorrectos, cuenta suspendida, entre otros), cuando el usuario regresa a la app, entonces el sistema le comunica que la conexión no pudo completarse, muestra el motivo, y no conserva ningún token.

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
<img width="656" height="648" alt="image" src="https://github.com/user-attachments/assets/8058aea2-fbbb-4268-861d-76ebdf0d78ef" />

 

## 5. Impacto en mockups 

|Mockups afectados|Cambios necesarios|
|-----------------|------------------|
|US-02|Ahora al estar enlazado con el banco, la app tendra que tener una opción de agregar los movimientos bancarios que el usuario desee. |
|US-07|Ahora al estar enlazado con el banco, como cada usuario tiene un banco distitnto asociado el sistema debe hacer un resumen correcto cuanto gasto cada integrante familiar sin mezclar ni equivocarse de banco |
|US-09|Como el resumen mensual de gastos se ve afectado por los bancos conectados a cada familiar, los graficos realizados tendran que incluir los gastos añadidos de cada integrante sea en efectivo o por alguna transacción bancaria|
 

## 6. Impacto en arquitectura 

 

### 6.1 ¿Cambia el estilo arquitectónico? 

Si. Ya que nuestro estilo de capas solo satisface la importancia de seguridad y el atributo de disponibilidad es bajo, con las nuevas implementaciones, tendremos que cambiar de arquitectura a una estilo de micro servicios para poder mantener la seguridad y aumentar la disponibilidad de nuestra app, a su vez, este nuevo estilo permite modificar y desplegar el modulo de forma aislada, sin necesidad de redesplegar o detener la aplicación completa garantizando la continuidad del servicio.
Ahora porque es necesario este cambio. Es necesario porque al tener un estilo de micro servicios tenemos la facilidad para que el modulo de bancos viva en un servidor separado y se mantenga activo y funcional independientemente del monolito principal mientras que en otro mantenemos el nivel de seguridad.

 

### 6.2 Relación REF (repriorizado) con decisiones de arquitectura 

 

| RNF ID | Prioridad nueva | Decisión de arquitectura que lo aborda         |
|--------|-----------------|------------------------------------------------| 
| RNF-10 | Alta            | La recuperabilidad cambiara a alta ya que los bancos se van actualizando casi diariamente como tambien su seguridad  | 
| RNF-03 | Alta            | Como el nuevo cambio nos pide, la disponibilidad de la app o mas especifico del modulo de bancos tienes que estar un 99.9% del tiempo disponible| 
| RNF-07 | Alta            | Al tratar con datos bancarios la seguridad se mantendra alta |
 

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

 

Se decide ir por micro servicios ya que es el modelo perfecto para mantener la disponibilidad de la app y del modelo de bancos

La motivacion de este modelo fue la independencia que obtendra el modelo de banco del monolito principal 

No tuvimos otras opciones evaluadas ya que vimos que micro servicios era la mas fiable

Afecta en los modelos REF(-10,-03,-07)

 

## 9. Trazabilidad actualizada 

 

| Historia | REF relacionado | Módulo     | Mockup  | 
|----------|-----------------|------------|---------| 
| US-XX    | REF-XX          | [módulo]   | [ref]   | 

 

## 10. Justificación global y trade-offs 

La solución propuesta: migrar de una arquitectura de capas a una de microservicios, es coherente con la naturaleza del cambio solicitado: integrar 3 bancos con APIs, formatos y frecuencias distintas, bajo exigencias de seguridad y disponibilidad que el estilo anterior no podía garantizar. Aislar el módulo bancario como un microservicio independiente permite que este opere bajo su propio SLA del 99.9% sin arrastrar al resto de la aplicación, y que reciba actualizaciones de seguridad de forma autónoma, algo imposible en un monolito.


Qué trade-offs se asumieron, especialmente ante cambios de prioridad en REF. 
El cambio más crítico es la repriorización de REF-10 (Recuperabilidad) y REF-07 (Seguridad) de prioridad baja/media a alta, motivado directamente por el manejo de datos bancarios sensibles. Esto implica asumir los siguientes trade-offs:

Complejidad vs. disponibilidad: Pasar a microservicios aumenta considerablemente la complejidad operacional (orquestación, comunicación entre servicios, monitoreo distribuido), pero es el costo necesario para alcanzar el 99.9% de disponibilidad exigido en REF-03 y la independencia de despliegue del módulo bancario.
Costo de desarrollo vs. seguridad: Implementar autenticación delegada (OAuth con los bancos), almacenamiento protegido de tokens y un sistema de alertas de seguridad (US-02) eleva el esfuerzo de desarrollo, pero es indispensable dado que REF-07 pasó a ser crítico.
Consistencia eventual vs. resiliencia: Al desacoplar el módulo bancario, se acepta que la sincronización de movimientos puede no ser instantánea, priorizando la resiliencia y recuperabilidad (REF-10) frente a la consistencia inmediata.

