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
      version: '2.0.0',
      description: 'HU1: Gastos personales | HU2: Gastos familiares compartidos'
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./index.js']
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─────────────────────────────────────────────────────
// Middleware autenticación simulada
// ─────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'No autenticado. Envía un token Bearer.' });
  req.usuario = auth.replace('Bearer ', '').trim() || 'usuario';
  next();
}

// ─────────────────────────────────────────────────────
// Helpers de validación
// ─────────────────────────────────────────────────────
function validarMonto(monto) {
  if (monto === undefined || monto === null) return 'El monto es obligatorio.';
  if (typeof monto !== 'number' || monto <= 0)
    return 'El monto es inválido. Debe ser un número mayor a 0.';
  return null;
}

function validarFecha(fecha) {
  if (!fecha) return 'La fecha es obligatoria.';
  const hoy = new Date(); hoy.setHours(23, 59, 59, 999);
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return 'La fecha no tiene un formato válido (YYYY-MM-DD).';
  if (d > hoy) return 'No se permiten fechas posteriores al día actual.';
  return null;
}

// ═════════════════════════════════════════════════════
// HU1 — CATEGORÍAS PERSONALES
// ═════════════════════════════════════════════════════

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: "[HU1] Lista todas las categorías"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array de categorías }
 *       401: { description: No autenticado }
 */
app.get('/categorias', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM categorias ORDER BY nombre').all());
});

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: "[HU1] Crea una categoría personalizada"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:     { type: string,  example: "Gym" }
 *               compartida: { type: integer, example: 0, description: "0=personal, 1=compartida" }
 *     responses:
 *       201: { description: Categoría creada }
 *       400: { description: Nombre inválido o duplicado }
 *       401: { description: No autenticado }
 */
app.post('/categorias', authMiddleware, (req, res) => {
  const { nombre, compartida = 0 } = req.body;
  if (!nombre || nombre.trim() === '')
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
  if (db.prepare('SELECT id FROM categorias WHERE nombre = ?').get(nombre.trim()))
    return res.status(400).json({ error: 'Ya existe una categoría con ese nombre.' });
  const r = db.prepare('INSERT INTO categorias (nombre, compartida) VALUES (?, ?)').run(nombre.trim(), compartida ? 1 : 0);
  res.status(201).json({ id: r.lastInsertRowid, nombre: nombre.trim(), compartida: compartida ? 1 : 0 });
});

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: "[HU1] Elimina una categoría"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Categoría eliminada }
 *       404: { description: No encontrada }
 *       401: { description: No autenticado }
 */
app.delete('/categorias/:id', authMiddleware, (req, res) => {
  const i = db.prepare('DELETE FROM categorias WHERE id = ?').run(req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Categoría no encontrada.' });
  res.json({ mensaje: 'Categoría eliminada.' });
});

// ═════════════════════════════════════════════════════
// HU1 — GASTOS PERSONALES
// ═════════════════════════════════════════════════════

/**
 * @swagger
 * /gastos:
 *   get:
 *     summary: "[HU1] Historial de gastos del usuario autenticado"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: mes,          schema: { type: integer }, description: "Mes 1-12" }
 *       - { in: query, name: anio,         schema: { type: integer }, description: "Año ej. 2025" }
 *       - { in: query, name: categoria_id, schema: { type: integer } }
 *     responses:
 *       200: { description: Array de gastos }
 *       401: { description: No autenticado }
 */
app.get('/gastos', authMiddleware, (req, res) => {
  const { mes, anio, categoria_id } = req.query;
  let sql = `
    SELECT g.*, c.nombre AS categoria_nombre, c.compartida
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.grupo_id IS NULL
  `;
  const params = [];
  if (mes)          { sql += ` AND strftime('%m', g.fecha) = ?`; params.push(String(mes).padStart(2, '0')); }
  if (anio)         { sql += ` AND strftime('%Y', g.fecha) = ?`; params.push(String(anio)); }
  if (categoria_id) { sql += ` AND g.categoria_id = ?`;          params.push(categoria_id); }
  sql += ` ORDER BY g.fecha DESC`;
  res.json(db.prepare(sql).all(...params));
});

/**
 * @swagger
 * /gastos/{id}:
 *   get:
 *     summary: "[HU1] Detalle de un gasto personal"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Detalle del gasto }
 *       404: { description: No encontrado }
 *       401: { description: No autenticado }
 */
app.get('/gastos/:id', authMiddleware, (req, res) => {
  const g = db.prepare(`
    SELECT g.*, c.nombre AS categoria_nombre
    FROM gastos g LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.id = ?
  `).get(req.params.id);
  if (!g) return res.status(404).json({ error: 'Gasto no encontrado.' });
  res.json(g);
});
 
/**
 * @swagger
 * /gastos:
 *   post:
 *     summary: "[HU1] Registra un gasto personal"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto, categoria_id, fecha]
 *             properties:
 *               monto:        { type: number,  example: 15000 }
 *               categoria_id: { type: integer, example: 1 }
 *               fecha:        { type: string,  example: "2025-05-20" }
 *               descripcion:  { type: string,  example: "Almuerzo de trabajo" }
 *               metodo_pago:  { type: string,  example: "Tarjeta de crédito" }
 *     responses:
 *       201: { description: Gasto registrado }
 *       400: { description: Datos inválidos }
 *       401: { description: No autenticado }
 */
app.post('/cursos', (req, res) => {
  const { nombre, instructor, creditos } = req.body;
  const r = db.prepare(
    'INSERT INTO cursos (nombre, instructor, creditos) VALUES (?, ?, ?)'
  ).run(nombre, instructor, creditos);
  res.status(201).json({ id: r.lastInsertRowid, nombre, instructor, creditos });
});
 
/**
 * @swagger
 * /gastos/{id}:
 *   put:
 *     summary: "[HU1] Modifica un gasto personal"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:     { type: string }
 *               instructor: { type: string }
 *               creditos:   { type: integer }
 *     responses:
 *       201: { description: Gasto compartido registrado }
 *       400: { description: Datos inválidos o categoría no compartida }
 *       403: { description: No eres miembro del grupo }
 *       404: { description: Grupo no encontrado }
 *       401: { description: No autenticado }
 */
app.put('/cursos/:id', (req, res) => {
  const { nombre, instructor, creditos } = req.body;
  const i = db.prepare(
    'UPDATE cursos SET nombre=?, instructor=?, creditos=? WHERE id=?'
  ).run(nombre, instructor, creditos, req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Curso no encontrado' });
  res.json({ mensaje: 'Curso actualizado' });
});
 
/**
 * @swagger
 * /grupos/{id}/gastos/{gastoId}:
 *   delete:
 *     summary: "[HU2] Elimina un gasto compartido del grupo"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id,      required: true, schema: { type: integer } }
 *       - { in: path, name: gastoId, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Gasto eliminado }
 *       403: { description: No eres miembro del grupo }
 *       404: { description: No encontrado }
 *       401: { description: No autenticado }
 */
app.delete('/cursos/:id', (req, res) => {
  const i = db.prepare('DELETE FROM cursos WHERE id=?').run(req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Curso no encontrado' });
  res.json({ mensaje: 'Curso eliminado' });
});
 
app.listen(3000, () => console.log('API Gastos v2 en http://localhost:3000'));
