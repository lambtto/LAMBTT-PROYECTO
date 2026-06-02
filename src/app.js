const express = require('express');
const app = express();
app.use(express.json());

// Persistencia temporal en memoria
const gastosDB = []; 
const categoriasDB = ['General', 'Alimentación', 'Transporte', 'Liceo']; // Categorías iniciales

// =========================================================
// API 1: US-01 Registro de Gastos y Categorías
// =========================================================

// Endpoint para guardar un gasto con sus criterios de aceptación
app.post('/api/gastos', (req, res) => {
    const { monto, categoria, fecha, descripcion, metodoPago } = req.body;

    // 1. Validación de Monto Obligatorio e Inválido (Negativo o Cero)
    if (monto === undefined || typeof monto !== 'number' || monto <= 0) {
        return res.status(400).json({ error: "El monto es inválido o no fue proporcionado" });
    }

    // 2. Validación de Categoría Obligatoria
    if (!categoria || categoria.trim() === '') {
        return res.status(400).json({ error: "La categoría es obligatoria" });
    }

    // 3. Validación de Fecha Obligatoria y Fecha Futura
    if (!fecha) {
        return res.status(400).json({ error: "La fecha es obligatoria" });
    }
    
    const fechaGasto = new Date(fecha);
    const fechaActual = new Date();
    if (fechaGasto > fechaActual) {
        return res.status(400).json({ error: "No se permiten fechas posteriores al día actual" });
    }

    // Construcción del objeto con campos opcionales (Descripción y Método de Pago)
    const nuevoGasto = {
        id: Date.now(),
        monto,
        categoria,
        fecha: fechaGasto,
        descripcion: descripcion || null, // Opcional
        metodoPago: metodoPago || null     // Opcional
    };

    gastosDB.push(nuevoGasto);
    return res.status(201).json(nuevoGasto);
});

// Endpoint para crear una nueva categoría personalizada
app.post('/api/categorias', (req, res) => {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
    }
    
    if (categoriasDB.includes(nombre)) {
        return res.status(400).json({ error: "La categoría ya existe" });
    }

    categoriasDB.push(nombre);
    return res.status(201).json({ mensaje: "Categoría añadida con éxito", categorias: categoriasDB });
});


// =========================================================
// API 2: US-02 Vista General de Gastos del Mes Categorizados
// =========================================================
app.get('/api/gastos/resumen', (req, res) => {
    if (gastosDB.length === 0) {
        return res.status(200).json({ 
            mensaje: "Todavía no hay datos registrados para el mes actual" 
        });
    }

    const totalNeto = gastosDB.reduce((sum, gasto) => sum + gasto.monto, 0);

    const categorizados = {};
    gastosDB.forEach(gasto => {
        if (!categorizados[gasto.categoria]) {
            categorizados[gasto.categoria] = {
                categoria: gasto.categoria,
                total: 0,
                movimientos: []
            };
        }
        categorizados[gasto.categoria].total += gasto.monto;
        categorizados[gasto.categoria].movimientos.push({
            id: gasto.id,
            monto: gasto.monto,
            fecha: gasto.fecha,
            descripcion: gasto.descripcion,
            metodoPago: gasto.metodoPago
        });
    });

    return res.status(200).json({
        totalNetoMes: totalNeto,
        gastosPorCategoria: Object.values(categorizados)
    });
});

module.exports = { app, gastosDB, categoriasDB };