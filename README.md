# GastApp – Registro y Control de Gastos Mensuales

## Descripción del sistema

GastApp nació de una necesidad bastante concreta: llevar un registro de en qué se va la plata cada mes. Ya sea solo o en familia, la idea es tener todo en un mismo lugar sin complicaciones.

La app permite anotar gastos, asignarles una categoría, ver cuánto llevas gastado en el mes y comparar con meses anteriores. También tiene una parte pensada para grupos familiares, donde todos los integrantes pueden ver y registrar gastos del hogar de forma compartida.

## Historia de usuario implementada

| ID     | Nombre                              | Issue |
|--------|-------------------------------------|-------|
| US-01  | Registro de gasto individual        | #1    |

La implementación cubre CRUD completo de gastos personales, filtrado por mes/año/categoría, creación de categorías personalizadas, y validaciones de negocio (monto positivo, fecha no futura). El código también incluye los endpoints de grupos familiares (US-06) en el mismo servidor.

## Artefactos del proyecto

| Artefacto                          | Ubicación / enlace                                                                                                   |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Modelo de dominio                  | [docs/diagramas/diagramas.md#1-modelo-de-dominio](./docs/diagramas/diagramas.md#1-modelo-de-dominio)               |
| Diagrama de casos de uso           | [docs/diagramas/diagramas.md#2-diagrama-de-casos-de-uso](./docs/diagramas/diagramas.md#2-diagrama-de-casos-de-uso) |
| Especificación de HU               | [EspecificacionHU.md](./EspecificacionHU.md)                                                                         |
| Diagrama de estados                | [docs/diagramas/diagramas.md#3-diagrama-de-estados--gasto](./docs/diagramas/diagramas.md#3-diagrama-de-estados--gasto) |
| Diagrama de despliegue y comp.     | [docs/diagramas/diagramas.md#4-diagrama-de-despliegue-y-componentes](./docs/diagramas/diagramas.md#4-diagrama-de-despliegue-y-componentes) |
| Diagrama de componentes            | [docs/diagramas/diagramas.md#5-diagrama-de-componentes-dependencias-e-interfaces](./docs/diagramas/diagramas.md#5-diagrama-de-componentes-dependencias-e-interfaces) |
| Diagrama de secuencia              | [docs/diagramas/diagramas.md#6-diagrama-de-secuencia--registrar-gasto-personal-hu-01-ca1](./docs/diagramas/diagramas.md#6-diagrama-de-secuencia--registrar-gasto-personal-hu-01-ca1) |
| Casos de prueba                    | [CasosDePrueba.md](./CasosDePrueba.md)                                                                               |
| Deuda técnica / code smells        | [DeudaTecnica.md](./DeudaTecnica.md)                                                                                 |

## Instrucciones de instalación y ejecución

### Requisitos previos

- Docker y Docker Compose (recomendado)
- O Node.js v20+ y PostgreSQL v16+ (sin Docker)

### Variables de entorno

```bash
cp .env.example .env
```

| Variable    | Descripción                  | Valor por defecto |
|-------------|------------------------------|-------------------|
| DB_HOST     | Host de PostgreSQL            | localhost         |
| DB_PORT     | Puerto de PostgreSQL          | 5432              |
| DB_USER     | Usuario de la base de datos   | gastapp           |
| DB_PASSWORD | Contraseña de la base de datos| gastapp123        |
| DB_NAME     | Nombre de la base de datos    | gastapp_db        |
| PORT        | Puerto del servidor           | 3000              |

### Instalación y ejecución con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/lambtto/LAMBTT-PROYECTO.git
cd LAMBTT-PROYECTO

# 2. Levantar los contenedores (base de datos + API)
docker-compose up --build
```

La API queda disponible en `http://localhost:3000`.  
La documentación Swagger en `http://localhost:3000/docs`.

### Instalación y ejecución sin Docker

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/lambtto/LAMBTT-PROYECTO.git
cd LAMBTT-PROYECTO
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con los datos de tu instancia PostgreSQL local

# 3. Ejecutar
npm start
```

### Autenticación

Todos los endpoints requieren un header `Authorization: Bearer <usuario>`. El valor del token se usa como identificador de usuario.

```bash
# Ejemplo: registrar un gasto como usuario "juan"
curl -X POST http://localhost:3000/gastos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer juan" \
  -d '{"monto": 15000, "categoria_id": 1, "fecha": "2026-06-20"}'

# Ver historial
curl http://localhost:3000/gastos \
  -H "Authorization: Bearer juan"
```

### Endpoints principales

| Método | Endpoint                      | Descripción                                       |
|--------|-------------------------------|---------------------------------------------------|
| GET    | `/categorias`                 | Lista todas las categorías                        |
| POST   | `/categorias`                 | Crea una categoría personalizada                  |
| DELETE | `/categorias/:id`             | Elimina una categoría                             |
| GET    | `/gastos`                     | Historial del usuario (filtros: mes, anio, cat.)  |
| GET    | `/gastos/:id`                 | Detalle de un gasto                               |
| POST   | `/gastos`                     | Registra un nuevo gasto                           |
| PUT    | `/gastos/:id`                 | Edita un gasto existente                          |
| DELETE | `/gastos/:id`                 | Elimina un gasto                                  |
| GET    | `/grupos`                     | Lista grupos familiares                           |
| POST   | `/grupos`                     | Crea un grupo familiar                            |
| POST   | `/grupos/:id/miembros`        | Agrega un miembro al grupo                        |
| GET    | `/grupos/:id/gastos`          | Lista gastos compartidos del grupo                |
| POST   | `/grupos/:id/gastos`          | Registra un gasto compartido del hogar            |
| DELETE | `/grupos/:id/gastos/:gastoId` | Elimina un gasto compartido                       |

## Historias de Usuario

| ID    | Nombre                                           | Issue |
|-------|--------------------------------------------------|-------|
| US-01 | Registro de gasto individual                     | #1    |
| US-02 | Visualización de resumen mensual                 | #2    |
| US-03 | Establecimiento de presupuesto mensual personal  | #3    |
| US-04 | Edición y eliminación de un gasto registrado     | #4    |
| US-05 | Exportación de gastos en PDF o Excel             | #5    |
| US-06 | Registro de gasto compartido del hogar           | #7    |
| US-07 | Visualización del gasto total familiar del mes   | #8    |
| US-08 | Establecimiento de presupuesto familiar mensual  | #9    |
| US-09 | Comparación de gastos entre meses                | #10   |
| US-10 | Gestión de integrantes del grupo familiar        | #11   |

## Mockups

Enlace Figma: https://www.figma.com/make/8a6hWw3p87KKdgCpop1Am1/Gastos-mensuales-app

| Mockup | Historia de usuario relacionada |
|--------|---------------------------------|
| [Vista US-01](./US-01.png) | [#Issue 1](https://github.com/lambtto/LAMBTT-PROYECTO/issues/1) |
| [Vista US-02](./US-02.png) | [#Issue 2](https://github.com/lambtto/LAMBTT-PROYECTO/issues/2) |
| [Vista US-03](./US-03.png) | [#Issue 3](https://github.com/lambtto/LAMBTT-PROYECTO/issues/3) |
| [Vista US-04](./US-04.png) | [#Issue 4](https://github.com/lambtto/LAMBTT-PROYECTO/issues/4) |
| [Vista US-05](./US-05.png) | [#Issue 5](https://github.com/lambtto/LAMBTT-PROYECTO/issues/5) |
| [Vista US-06](./US-06.png) | [#Issue 7](https://github.com/lambtto/LAMBTT-PROYECTO/issues/7) |
| [Vista US-07](./US-07.png) | [#Issue 8](https://github.com/lambtto/LAMBTT-PROYECTO/issues/8) |
| [Vista US-08](./US-08.png) | [#Issue 9](https://github.com/lambtto/LAMBTT-PROYECTO/issues/9) |
| [Vista US-09](./US-09.png) | [#Issue 10](https://github.com/lambtto/LAMBTT-PROYECTO/issues/10) |
| [Vista US-10](./US-10.png) | [#Issue 11](https://github.com/lambtto/LAMBTT-PROYECTO/issues/11) |

## Diseño Arquitectónico

Ver: [Arquitectura.md](./Arquitectura.md)

## Responsabilidades del equipo – Entrega 3

| Integrante               | Rol(es)          | Ítems de la rúbrica a cargo                              |
|--------------------------|------------------|----------------------------------------------------------|
| Paulo Salas Arismendi    | Scrum Master     | 1.1 HU completa, 2.2 Casos de uso                        |
| Simon Reyes Morales      | Arquitecto       | 3.1 Despliegue y componentes, 3.2 Componentes, 3.3 Secuencia |
| Martín Herrera Duranti   | Developer        | 1.2 Instalación y ejecución, 1.3 GitHub workflow         |
| Felipe Hernández Olivares| Technical Lead   | 4.1 Casos de prueba, 5.1 Deuda técnica                   |
| Vicente Coiro Martínez   | QA               | 2.1 Modelo de dominio, 2.3 Especificación HU, 2.4 Diagrama de estados |

## Bonus

- Contenedores: **sí** — `docker-compose.yml` levanta PostgreSQL + API en contenedores separados
- Spec-driven development: no
