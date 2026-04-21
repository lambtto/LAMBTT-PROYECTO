<img width="1564" height="771" alt="imagen" src="https://github.com/user-attachments/assets/5977d96f-3f27-4eae-98be-dc89252487b4" />

|Entidades y sus atributos:                                                 |
|---------------------------------------------------------------------------|
|Usuario → id, nombre, email, contraseña, rol                               |
|Gasto → id, monto, categoria, fecha, descripcion, metodoPago, esCompartido |
|Categoria → id, nombre, tipo                                               |
|Presupuesto → id, montoLimite, mes, año, tipo                              |
|GrupoFamiliar → id, nombre, administrador                                  |
|Reporte → id, mes, año, formato                                            |

Relaciones:
|-------------------------------------|
|Usuario 1 ——< 0..* Gasto             |
|Usuario 0..* >—— 1 GrupoFamiliar     |
|Gasto 0..* >—— 1 Categoria           |
|GrupoFamiliar 1 ——< 0..* Presupuesto |
|Usuario 1 ——< 0..* Reporte           |

