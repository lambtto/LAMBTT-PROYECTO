const express      = require('express');
const db           = require('./db');
const swaggerUi    = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
 
const app = express();
app.use(express.json());
 
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gastos Financieros',
      version: '1.0.0',
      description: 'API para registrar y gestionar gastos personales mensuales'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./index.js']
});
 
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 
// ──────────────────────────────────────────────
// Middleware de autenticación simulada
// ──────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado. Envía un token Bearer.' });
  }
  // En un proyecto real, aquí verificarías el JWT.
  // Por simplicidad, cualquier token no vacío se acepta.
  next();
}
 
// ──────────────────────────────────────────────
// Helpers de validación
// ──────────────────────────────────────────────
function validarMonto(monto) {
  if (monto === undefined || monto === null) return 'El monto es obligatorio.';
  if (typeof monto !== 'number' || monto <= 0)
    return 'El monto es inválido. Debe ser un número mayor a 0.';
  return null;
}
 
function validarFecha(fecha) {
  if (!fecha) return 'La fecha es obligatoria.';
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  const fechaGasto = new Date(fecha);
  if (isNaN(fechaGasto.getTime())) return 'La fecha no tiene un formato válido (YYYY-MM-DD).';
  if (fechaGasto > hoy)
    return 'No se permiten fechas posteriores al día actual.';
  return null;
}
 
// ──────────────────────────────────────────────
// CATEGORÍAS
// ──────────────────────────────────────────────
 
/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Lista todas las categorías del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:     { type: integer }
 *                   nombre: { type: string }
 *       401:
 *         description: No autenticado
 */
app.get('/categorias', authMiddleware, (req, res) => {
  const categorias = db.prepare('SELECT * FROM categorias').all();
  res.json(categorias);
});
 
/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crea una nueva categoría personalizada
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre: { type: string, example: "Alimentación" }
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:     { type: integer }
 *                 nombre: { type: string }
 *       400:
 *         description: Nombre inválido o duplicado
 *       401:
 *         description: No autenticado
 */
app.post('/categorias', authMiddleware, (req, res) => {
  const { nombre } = req.body;
 
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
  }
 
  const existe = db.prepare('SELECT id FROM categorias WHERE nombre = ?').get(nombre.trim());
  if (existe) {
    return res.status(400).json({ error: 'Ya existe una categoría con ese nombre.' });
  }
 
  const r = db.prepare('INSERT INTO categorias (nombre) VALUES (?)').run(nombre.trim());
  res.status(201).json({ id: r.lastInsertRowid, nombre: nombre.trim() });
});
 
/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Elimina una categoría
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       404:
 *         description: No encontrada
 *       401:
 *         description: No autenticado
 */
app.delete('/categorias/:id', authMiddleware, (req, res) => {
  const i = db.prepare('DELETE FROM categorias WHERE id = ?').run(req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
  res.json({ mensaje: 'Categoría eliminada.' });
});
 
// ──────────────────────────────────────────────
// GASTOS
// ──────────────────────────────────────────────
 
/**
 * @swagger
 * /gastos:
 *   get:
 *     summary: Lista el historial de gastos del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mes
 *         schema: { type: integer }
 *         description: Filtrar por mes (1-12)
 *       - in: query
 *         name: anio
 *         schema: { type: integer }
 *         description: Filtrar por año (ej. 2025)
 *       - in: query
 *         name: categoria_id
 *         schema: { type: integer }
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Array de gastos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:              { type: integer }
 *                   monto:           { type: number }
 *                   categoria_id:    { type: integer }
 *                   categoria_nombre:{ type: string }
 *                   fecha:           { type: string, format: date }
 *                   descripcion:     { type: string }
 *                   metodo_pago:     { type: string }
 *       401:
 *         description: No autenticado
 */
app.get('/gastos', authMiddleware, (req, res) => {
  const { mes, anio, categoria_id } = req.query;
 
  let sql = `
    SELECT g.*, c.nombre AS categoria_nombre
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE 1=1
  `;
  const params = [];
 
  if (mes) {
    sql += ` AND strftime('%m', g.fecha) = ?`;
    params.push(String(mes).padStart(2, '0'));
  }
  if (anio) {
    sql += ` AND strftime('%Y', g.fecha) = ?`;
    params.push(String(anio));
  }
  if (categoria_id) {
    sql += ` AND g.categoria_id = ?`;
    params.push(categoria_id);
  }
 
  sql += ` ORDER BY g.fecha DESC`;
 
  const gastos = db.prepare(sql).all(...params);
  res.json(gastos);
});
 
/**
 * @swagger
 * /gastos/{id}:
 *   get:
 *     summary: Obtiene el detalle de un gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalle del gasto
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autenticado
 */
app.get('/gastos/:id', authMiddleware, (req, res) => {
  const gasto = db.prepare(`
    SELECT g.*, c.nombre AS categoria_nombre
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.id = ?
  `).get(req.params.id);
 
  if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado.' });
  res.json(gasto);
});
 
/**
 * @swagger
 * /gastos:
 *   post:
 *     summary: Registra un nuevo gasto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - categoria_id
 *               - fecha
 *             properties:
 *               monto:        { type: number,  example: 15000 }
 *               categoria_id: { type: integer, example: 1 }
 *               fecha:        { type: string,  format: date, example: "2025-05-20" }
 *               descripcion:  { type: string,  example: "Almuerzo de trabajo" }
 *               metodo_pago:  { type: string,  example: "Tarjeta de crédito" }
 *     responses:
 *       201:
 *         description: Gasto registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:           { type: integer }
 *                 monto:        { type: number }
 *                 categoria_id: { type: integer }
 *                 fecha:        { type: string }
 *                 descripcion:  { type: string }
 *                 metodo_pago:  { type: string }
 *       400:
 *         description: Datos inválidos (monto negativo, fecha futura, categoría inexistente)
 *       401:
 *         description: No autenticado
 */
app.post('/gastos', authMiddleware, (req, res) => {
  const { monto, categoria_id, fecha, descripcion, metodo_pago } = req.body;
 
  // Validaciones de negocio
  const errorMonto = validarMonto(monto);
  if (errorMonto) return res.status(400).json({ error: errorMonto });
 
  const errorFecha = validarFecha(fecha);
  if (errorFecha) return res.status(400).json({ error: errorFecha });
 
  if (!categoria_id) {
    return res.status(400).json({ error: 'La categoría es obligatoria.' });
  }
 
  const categoria = db.prepare('SELECT id FROM categorias WHERE id = ?').get(categoria_id);
  if (!categoria) {
    return res.status(400).json({ error: 'La categoría indicada no existe.' });
  }
 
  const r = db.prepare(`
    INSERT INTO gastos (monto, categoria_id, fecha, descripcion, metodo_pago)
    VALUES (?, ?, ?, ?, ?)
  `).run(monto, categoria_id, fecha, descripcion || null, metodo_pago || null);
 
  res.status(201).json({
    id: r.lastInsertRowid,
    monto,
    categoria_id,
    fecha,
    descripcion: descripcion || null,
    metodo_pago: metodo_pago || null
  });
});
 
/**
 * @swagger
 * /gastos/{id}:
 *   put:
 *     summary: Modifica un gasto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monto:        { type: number }
 *               categoria_id: { type: integer }
 *               fecha:        { type: string, format: date }
 *               descripcion:  { type: string }
 *               metodo_pago:  { type: string }
 *     responses:
 *       200:
 *         description: Gasto actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Gasto no encontrado
 *       401:
 *         description: No autenticado
 */
app.put('/gastos/:id', authMiddleware, (req, res) => {
  const { monto, categoria_id, fecha, descripcion, metodo_pago } = req.body;
 
  const errorMonto = validarMonto(monto);
  if (errorMonto) return res.status(400).json({ error: errorMonto });
 
  const errorFecha = validarFecha(fecha);
  if (errorFecha) return res.status(400).json({ error: errorFecha });
 
  if (categoria_id) {
    const categoria = db.prepare('SELECT id FROM categorias WHERE id = ?').get(categoria_id);
    if (!categoria) {
      return res.status(400).json({ error: 'La categoría indicada no existe.' });
    }
  }
 
  const i = db.prepare(`
    UPDATE gastos
    SET monto = ?, categoria_id = ?, fecha = ?, descripcion = ?, metodo_pago = ?
    WHERE id = ?
  `).run(monto, categoria_id, fecha, descripcion || null, metodo_pago || null, req.params.id);
 
  if (i.changes === 0) return res.status(404).json({ error: 'Gasto no encontrado.' });
  res.json({ mensaje: 'Gasto actualizado correctamente.' });
});
 
/**
 * @swagger
 * /gastos/{id}:
 *   delete:
 *     summary: Elimina un gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Gasto eliminado
 *       404:
 *         description: No encontrado
 *       401:
 *         description: No autenticado
 */
app.delete('/gastos/:id', authMiddleware, (req, res) => {
  const i = db.prepare('DELETE FROM gastos WHERE id = ?').run(req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Gasto no encontrado.' });
  res.json({ mensaje: 'Gasto eliminado correctamente.' });
});
 
app.listen(3000, () => console.log('API Gastos en http://localhost:3000'));
