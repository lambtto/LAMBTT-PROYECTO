# Diagramas GastApp – Entrega 3

## 1. Modelo de Dominio

```mermaid
erDiagram
  CATEGORIAS {
    int id PK
    string nombre
    int compartida
  }
  GRUPOS {
    int id PK
    string nombre
  }
  GRUPO_MIEMBROS {
    int id PK
    int grupo_id FK
    string usuario
  }
  GASTOS {
    int id PK
    float monto
    int categoria_id FK
    string fecha
    string descripcion
    string metodo_pago
    int grupo_id FK
    string usuario
  }

  GASTOS }o--|| CATEGORIAS : "clasificado en"
  GASTOS }o--o| GRUPOS : "pertenece a"
  GRUPO_MIEMBROS }o--|| GRUPOS : "miembro de"
```

---

## 2. Diagrama de Casos de Uso

```mermaid
flowchart TD
  U([Usuario Financiero])
  UF([Usuario Familiar])

  subgraph GastApp
    UC1[Registrar gasto personal]
    UC2[Ver historial de gastos]
    UC3[Filtrar por mes, año y categoría]
    UC4[Crear categoría personalizada]
    UC5[Editar gasto]
    UC6[Eliminar gasto]
    UC7[Crear grupo familiar]
    UC8[Agregar miembro al grupo]
    UC9[Registrar gasto compartido]
    UC10[Ver gastos del grupo]
  end

  U --> UC1
  U --> UC2
  UC2 --> UC3
  U --> UC4
  U --> UC5
  U --> UC6
  UF --> UC7
  UF --> UC8
  UF --> UC9
  UF --> UC10
```

---

## 3. Diagrama de Estados – Gasto

```mermaid
stateDiagram-v2
  [*] --> EnIngreso : usuario inicia registro
  EnIngreso --> Validando : POST /gastos
  Validando --> Rechazado : datos inválidos
  Rechazado --> EnIngreso : usuario corrige
  Validando --> Registrado : HTTP 201
  Registrado --> Modificado : PUT /gastos/:id
  Modificado --> Registrado : guardado
  Registrado --> Eliminado : DELETE /gastos/:id
  Modificado --> Eliminado : DELETE /gastos/:id
  Eliminado --> [*]
```

---

## 4. Diagrama de Despliegue y Componentes

```mermaid
flowchart TB
  subgraph Cliente
    C1[Docker - curl / Swagger UI]
    C2[Swagger UI en /docs]
  end

  subgraph Docker["Docker Compose"]
    subgraph API["Contenedor: api - Node.js :3000"]
      APP[index.js - Express + Swagger]
      MW[authMiddleware]
      VAL[validarMonto / validarFecha]
    end

    subgraph DB["Contenedor: db - PostgreSQL :5432"]
      PG[(gastapp_db)]
    end
  end

  C1 -->|HTTP REST + Bearer Token| APP
  C2 -->|generado desde| APP
  APP --> MW
  APP --> VAL
  APP -->|pg Pool| PG
```

---

## 5. Diagrama de Componentes (Dependencias e Interfaces)

```mermaid
flowchart LR
  IDX[index.js]

  subgraph Middlewares
    AUTH[authMiddleware]
    VMONTO[validarMonto]
    VFECHA[validarFecha]
  end

  subgraph RutasHU1["Rutas HU-01"]
    RG["GET/POST/PUT/DELETE /gastos"]
    RC["GET/POST/DELETE /categorias"]
  end

  subgraph RutasHU2["Rutas HU-06"]
    RGR["GET/POST /grupos"]
    RGM["POST /grupos/:id/miembros"]
    RGG["GET/POST/DELETE /grupos/:id/gastos"]
  end

  DB[db.js - Pool pg]

  subgraph Externas["Dependencias externas"]
    EXP[express]
    PG[pg]
    SWJ[swagger-jsdoc]
    SWU[swagger-ui-express]
  end

  IDX --> AUTH
  IDX --> VMONTO
  IDX --> VFECHA
  IDX --> RG
  IDX --> RC
  IDX --> RGR
  IDX --> RGM
  IDX --> RGG
  RG --> DB
  RC --> DB
  RGR --> DB
  RGM --> DB
  RGG --> DB
  DB --> PG
  IDX --> EXP
  IDX --> SWJ
  IDX --> SWU
```

---

## 6. Diagrama de Secuencia – Registrar Gasto Personal (HU-01 CA1)

```mermaid
sequenceDiagram
  actor U as Usuario
  participant API as POST /gastos
  participant MW as authMiddleware
  participant VAL as validadores
  participant DB as db.js
  participant PG as gastapp_db

  U->>API: POST /gastos + Bearer token
  API->>MW: verificar Authorization
  alt Sin token
    MW-->>U: HTTP 401 No autenticado
  end
  MW->>API: req.usuario = token
  API->>VAL: validarMonto(monto)
  alt Monto invalido
    VAL-->>U: HTTP 400 monto invalido
  end
  API->>VAL: validarFecha(fecha)
  alt Fecha futura
    VAL-->>U: HTTP 400 fecha invalida
  end
  API->>DB: SELECT categoria WHERE id = categoria_id
  DB->>PG: query
  PG-->>DB: rows
  alt Categoria no existe
    DB-->>U: HTTP 400 categoria no existe
  end
  API->>DB: INSERT INTO gastos
  DB->>PG: INSERT
  PG-->>DB: RETURNING id
  DB-->>API: id
  API-->>U: HTTP 201 gasto creado
```
