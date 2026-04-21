# Arquitectura de software
```mermaid
---
config:
  theme: redux
---
flowchart BT
 subgraph B["Backend (NestJS)"]
        B1["Módulo de Usuario/Familiar"]
        B2["Módulo de Finanzas"]
        B3["Módulo de Presupuestos"]
  end
    A["Base de Datos<br>PostgreSQL"] --> B
    B -- HTTPS / JSON --> C["Frontend<br>Vite + React"]

    style B1 fill:#000000,color:#ffffff
    style B2 fill:#000000,color:#ffffff
    style B3 fill:#000000,color:#ffffff
    style A fill:#757575,color:#ffffff
    style B fill:#757575,stroke:#ffffff,color:#ffffff
    style C fill:#757575,color:#ffffff
    linkStyle 0 stroke:#ffffff
    linkStyle 1 stroke:#ffffff,fill:none
