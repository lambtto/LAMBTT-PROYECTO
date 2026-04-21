# Requisitos Extrafuncionales

## Resumen de Atributos Seleccionados

### Prioridad Alta

| ID :-| Atributo | Descripción|
|:-----|:---------|:-----------|
|RNF-01|Eficiencia   |El dashboard debe cargar los gráficos y datos del mes actual en menos de 3 segundos.|
|RNF-02|Usabilidad    |La aplicación debe ser operable sin capacitación previa. La navegación entre secciones (Dashboard, Historial, Presupuesto, Exportar) debe ser intuitiva y consistente.|
|RNF-03|Disponibiilidad |La aplicación debe estar disponible el 99% del tiempo. El sistema debe recuperarse automáticamente ante errores temporales sin pérdida de datos.|
|RNF-04|Integridad de datos |Los montos, categorías y fechas registrados no deben alterarse ni perderse. Cualquier operación fallida debe revertirse sin dejar datos inconsistentes.|

### Prioridad Media

| ID :-| Atributo | Descripción|
|:-----|:---------|:-----------|
|RNF-05|Compatibilidad   |La aplicación debe funcionar correctamente en los navegadores Chrome, Firefox y Safari, tanto en escritorio como en dispositivos móviles.            |
|RNF-06|Escalabilidad    |La arquitectura debe permitir agregar nuevos tipos de usuario, categorías y módulos sin reestructurar el sistema base.           |
|RNF-07|Seguridad de datos|Los datos de gastos del usuario Común y del grupo familiar deben estar aislados entre sí. No se debe permitir acceso cruzado entre grupos.            |

### Prioridad Baja

| ID :-| Atributo | Descripción|
|:-----|:---------|:-----------|
|RNF-08|Mantenibilidad    |El código debe mantener separación clara entre módulos (gastos, presupuesto, panel familiar). Las funciones principales deben estar documentadas.|
|RNF-09|Exportabilidad    |La función de exportar debe generar archivos correctamente formateados (ej. CSV o PDF) y completarse en menos de 5 segundos.|
|RNF-10|Recuperabilidad   |El sistema debe realizar respaldos periódicos de los datos. Ante un fallo, debe poder restaurarse al último estado válido.|
