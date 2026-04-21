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
    A["Frontend<br>Vite + React"] -- HTTPS / JSON --> B
    B --> C["Base de Datos<br>PostgreSQL"]
