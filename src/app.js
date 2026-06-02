const express      = require('express');
const swaggerUi    = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

// Persistencia temporal en memoria para asegurar despliegue rápido
const gastosDB = []; 
const categoriasDB = ['General', 'Alimentación', 'Transporte', 'Liceo', 'Salud', 'Entretenimiento', 'Servicios']; 

// Configuración de las especificaciones de Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'API de Gestión de Gastos Personales', 
      version: '1.0.0',
      description: 'Documentación interactiva de la API para el control y análisis de gastos mensuales (Entrega 2)' 
    },
    servers: [
      {
        url: 'https://gastos-api-42tj.onrender.com',
        description: 'Servidor de Producción (Render)'
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local de Desarrollo'
      }
    ]
  },
  apis: [`${__dirname}/app.js`] 
});

// Ruta interactiva para visualizar la documentación
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =========================================================
// API 1: US-01 Registro de Gastos y Categorías
// =========================================================

/**
 * @swagger
 * /api/gastos:
 * post:
 * summary: Registrar un nuevo gasto
 * description: Almacena un movimiento financiero validando montos positivos, categorías existentes y que la fecha no sea futura.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - monto
 * - categoria
 * - fecha
 * properties:
 * monto:
 * type: integer
 * example: 7500
 * categoria:
 * type: string
 * example: "Alimentación"
 * fecha:
 * type: string
 * format: date
 * example: "2026-06-01"
 * descripcion:
 * type: string
 * example: "Almuerzo"
 * metodoPago:
 * type: string
 * example: "Tarjeta"
 * responses:
 * 201:
 * description: Gasto creado con éxito.
 * 400:
 * description: Error de validación.
 */
app.post('/api/gastos', (req, res) => {
    const { monto, categoria, fecha, descripcion, metodoPago } = req.body;

    if (monto === undefined || typeof monto !== 'number' || monto <= 0) {
        return res.status(400).json({ error: "El monto es inválido o no fue proporcionado" });
    }
    if (!categoria || categoria.trim() === '') {
        return res.status(400).json({ error: "La categoría es obligatoria" });
    }
    if (!fecha) {
        return res.status(400).json({ error: "La fecha es obligatoria" });
    }
    
    const fechaGasto = new Date(fecha);
    if (fechaGasto > new Date()) {
        return res.status(400).json({ error: "No se permiten fechas posteriores al día actual" });
    }

    const nuevoGasto = {
        id: Date.now(),
        monto,
        categoria,
        fecha: fechaGasto,
        descripcion: descripcion || null, 
        metodoPago: metodoPago || null    
    };

    gastosDB.push(nuevoGasto);
    return res.status(201).json(nuevoGasto);
});

/**
 * @swagger
 * /api/categorias:
 * post:
 * summary: Crear una nueva categoría personalizada
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - nombre
 * properties:
 * nombre:
 * type: string
 * example: "Suscripciones"
 * responses:
 * 201:
 * description: Categoría añadida con éxito.
 * 400:
 * description: Error de validación.
 */
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

/**
 * @swagger
 * /api/gastos/resumen:
 * get:
 * summary: Obtener la vista general analítica del mes
 * responses:
 * 200:
 * description: Datos obtenidos con éxito.
 */
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

module.exports = app;