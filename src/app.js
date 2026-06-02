const express = require('express');
const app = express();
app.use(express.json());

// Arreglo en memoria para simular la base de datos temporalmente
const gastosDB = []; 

// API 1: US-01 Registro de gastos
app.post('/api/gastos', (req, res) => {
    const { descripcion, monto, categoria } = req.body;
    
    // Validaciones de negocio (Rúbrica de pruebas)
    if (!descripcion || descripcion.trim() === '') {
        return res.status(400).json({ error: "La descripción es obligatoria" });
    }
    if (monto === undefined || typeof monto !== 'number') {
        return res.status(400).json({ error: "El monto debe ser un número válido" });
    }
    if (monto <= 0) {
        return res.status(400).json({ error: "El monto debe ser mayor a cero" });
    }

    const nuevoGasto = { id: Date.now(), descripcion, monto, categoria: categoria || 'General', fecha: new Date() };
    gastosDB.push(nuevoGasto);
    return res.status(201).json(nuevoGasto);
});

// API 2: US-02 Visualización de gastos
app.get('/api/gastos', (req, res) => {
    return res.status(200).json(gastosDB);
});

module.exports = { app, gastosDB };