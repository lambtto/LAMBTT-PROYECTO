# GastApp Registro y Control de Gastos Mensuales

 

## Descripción del sistema 

GastApp nació de una necesidad bastante concreta: llevar un registro de en qué se va la plata cada mes. Ya sea solo o en familia, la idea es tener todo en un mismo lugar sin complicaciones.
La app permite anotar gastos, asignarles una categoría, ver cuánto llevas gastado en el mes y comparar con meses anteriores. También tiene una parte pensada para grupos familiares, donde todos los integrantes pueden ver y registrar gastos del hogar de forma compartida.
No es una app de contabilidad ni nada sofisticado, es algo práctico para el día a día.

Este proyecto permite llevar un control detallado del flujo de dinero. El sistema procesa ingresos categorizados, valida la información en tiempo real, genera reportes visuales de distribución de gastos y emite alertas cuando el usuario supera sus propios límites presupuestarios.


 

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

 

## Requisitos Extrafuncionales 

Ver: [ReqExtrafuncionales.md](./ReqExtrafuncionales.md) 

Ver archivo: ReqExtrafuncionales.md (ver template a continuación) 

 

--- 

### Template: ReqExtrafuncionales.md 

 

## Catálogo de Requisitos Extrafuncionales 

 

Clasificación según ISO 25010 y tipo de restricción. 

La columna Prioridad refleja la importancia para las decisiones de arquitectura: 

Alta, Media o Baja. 

 

| ID     | Tipo                         | Descripción                                      | Prioridad | 

|--------|------------------------------|--------------------------------------------------|-----------| 

| REF-01 | Calidad de servicio (Perf.)  | El sistema debe responder en menos de 2 segundos | Alta      | 

| REF-02 | Calidad de servicio (Disp.)  | Disponibilidad >= 99% en horario laboral         | Alta      | 

| REF-03 | Calidad de servicio (Seg.)   | Autenticación requerida para todas las acciones  | Alta      | 

| REF-04 | Restricción técnica          | Debe funcionar en navegadores modernos (SPA)     | Media     | 

| REF-05 | Restricción de proyecto      | Equipo de 3-5 personas, plazo 4 semanas          | Media     | 

| REF-06 | Otros no funcionales         | Interfaz en español                              | Baja      | 

| ...    | ...                          | ...                                              | ...       | 

 

> Nota: Los requisitos de prioridad Alta deben quedar explícitamente 

> abordados en las decisiones de diseño arquitectónico. 

--- 

 

PLACEHOLDER_REMOVE 

 

## Entidades del Dominio 

[Diagrama o descripción de entidades, atributos y relaciones] 

 

## Mockups 

| Mockup | Historia de usuario relacionada | 

|--------|----------------------------------| 

| (https://www.figma.com/make/8a6hWw3p87KKdgCpop1Am1/Gastos-mensuales-app?fullscreen=1&t=4Y3ODySBsILzqNbw-1&preview-route=%2Fbudget) | US-XX | 

 

## Diseño Arquitectónico 

Ver: [Arquitectura.md](./Arquitectura.md) 

Ver archivo: Arquitectura.md (ver template a continuación) 

 

--- 

### Template: Arquitectura.md 

 

## 1. Estilo Arquitectónico 

 

Estilo adoptado: [nombre del estilo, ej: Cliente-Servidor, Capas, etc.] 

 

Justificación basada en REF priorizados: 

 

| REF ID | Descripción                              | Prioridad | Cómo lo aborda el estilo      | 

|--------|------------------------------------------|-----------|-------------------------------| 

| REF-01 | [descripción]                            | Alta      | [explicación]                 | 

| REF-02 | [descripción]                            | Alta      | [explicación]                 | 

 

Explicación textual: [Describir por qué el estilo elegido es el más adecuado 

considerando los REF de alta prioridad. Ningún REF de alta prioridad puede 

quedar sin ser abordado.] 

 

## 2. Diagrama de Arquitectura 

 

[Insertar diagrama que muestre el estilo y los módulos. 

Ejemplo: ![Diagrama de Arquitectura](./diagrama_arquitectura.png)] 

 

## 3. Descomposición Modular 

 

Fundamentación: [Criterio de descomposición: por dominio, capa, funcionalidad, etc.] 

 

### Módulo 1: [Nombre] 

- Responsabilidad: [qué hace este módulo] 

- Ofrece a otros módulos: [interfaces o datos que expone] 

- Depende de: [módulos de los que consume servicios] 

 

### Módulo 2: [Nombre] 

- Responsabilidad: [qué hace este módulo] 

- Ofrece a otros módulos: [interfaces o datos que expone] 

- Depende de: [módulos de los que consume servicios] 

 

### Módulo N: [Nombre] 

- Responsabilidad: ... 

- Ofrece a otros módulos: ... 

- Depende de: ... 

 

## 4. Decisiones de Diseño 

 

### Decisión 1 

- Decisión: [qué se decide] 

- Motivación: [por qué, referenciando REF si aplica] 

- Alternativas consideradas: [qué otras opciones se evaluaron] 

- Impacto: [en qué módulos o REF afecta] 

--- 

 

PLACEHOLDER_REMOVE2 

 

## Responsabilidades del Equipo 

| Integrante     | Rol         | Ítems de la rúbrica a cargo| 
|----------------|-------------|----------------------------|
|Paulo Salas     |Scrum Master |                            |
|Simon Reyes     |Product Owner|                            |
|Martin Herrera  |Developer    |                            |
|Felipe Hernandez|Developer    |                            |
|Vicente Coiro   |Developer    |                            | 
