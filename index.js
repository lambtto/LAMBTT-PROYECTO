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
