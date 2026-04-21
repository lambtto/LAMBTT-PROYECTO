# Arquitectura de software
```mermaid
---
config:
  theme: neutral
---
flowchart TB
 subgraph B["Backend (NestJS)"]
        B1["Módulo de Usuario/Familiar"]
        B2["Módulo de Finanzas"]
        B3["Módulo de Presupuestos"]
  end
    B -- HTTPS / JSON --> A["Frontend<br>Vite + React"]
    C["Base de Datos<br>PostgreSQL"] --> B
