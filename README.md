# GastApp Registro y Control de Gastos Mensuales

GastApp nació de una necesidad bastante concreta: llevar un registro de en qué se va la plata cada mes. Ya sea solo o en familia, la idea es tener todo en un mismo lugar sin complicaciones.
La app permite anotar gastos, asignarles una categoría, ver cuánto llevas gastado en el mes y comparar con meses anteriores. También tiene una parte pensada para grupos familiares, donde todos los integrantes pueden ver y registrar gastos del hogar de forma compartida.
No es una app de contabilidad ni nada sofisticado, es algo práctico para el día a día.

##  Descripción
Este proyecto permite llevar un control detallado del flujo de dinero. El sistema procesa ingresos categorizados, valida la información en tiempo real, genera reportes visuales de distribución de gastos y emite alertas cuando el usuario supera sus propios límites presupuestarios.

##  Características Principales

- **Registro Inmediato:** Ingreso de gastos con monto, categoría y descripción opcional. El sistema guarda la fecha actual y actualiza el resumen del día al instante.
- **Análisis Mensual:** Visualización del total gastado por categoría y cálculo automático del porcentaje que representa sobre el gasto total del mes.
- **Alertas de Presupuesto:** Configuración de límites personalizados. Si un gasto hace que se supere el límite, el sistema bloquea o advierte con el monto excedido.
- **Validación Estricta:** Si se ingresa un monto con formato inválido, el sistema rechaza el registro y muestra un error de validación sin afectar los datos guardados.
- **Estados Vacíos Limpios:** Si no hay actividad, la interfaz oculta los gráficos y muestra claramente el mensaje "Sin gastos registrados este mes".

## Historias de Usuario
| ID   | Nombre                                          | Issue  | 
|------|-------------------------------------------------|--------| 
| US-01 | Registro de gasto individual                   | #1     | 
| US-02 | Visualizacion de resumen mensual               | #2     | 
| US-03 | Establecimiento de presupuesto mensual personal| #3     | 
| US-04 | Edición y eliminación de un gasto registrado   | #4     | 
| US-05 | Exportación de gastos en PDF o Excel           | #5     | 
| US-07 | Registro de gasto compartido del hogar         | #7     | 
| US-08 | Visualización del gasto total familiar del mes | #8     | 
| US-09 | Establecimiento de presupuesto familiar mensual| #9     | 
| US-10 | Comparación de gastos entre meses              | #10    | 
| US-11 | Gestión de integrantes del grupo familiar      | #11    | 


## Integrantes y Roles del equipo
|Nombre          |Rol          |
|----------------|-------------|
|Paulo Salas     |Scrum Master |
|Simon Reyes     |Product Owner|
|Martin Herrera  |Developer    |
|Felipe Hernandez|Developer    |
|Vicente Coiro   |Developer    |


## Figma
https://www.figma.com/make/8a6hWw3p87KKdgCpop1Am1/Gastos-mensuales-app?fullscreen=1&t=4Y3ODySBsILzqNbw-1&preview-route=%2Fbudget
