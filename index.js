martiiind
martiiind
Invisible

martiiind — 20/04/2026 19:45
https://claude.ai/public/artifacts/84fd2a75-9928-4fff-9c4a-0643521f937f
martiiind — 20/04/2026 20:19
https://www.figma.com/make/8a6hWw3p87KKdgCpop1Am1/Gastos-mensuales-app?p=f&t=zkh8rhV7C6AU3Z9F-0&fullscreen=1
Make
Gastos mensuales app
Created with Figma

martiiind — 20/04/2026 23:09
martín 88
rAyo1 [MDKT],  — 21/04/2026 12:38
El impacto de este cambio es importante ya que nuestra app solo recaía en la importancia de la seguridad, al añadir conectividad con otros tres bancos estos tienen que estar activos un 99.9% del tiempo y esto no congenia para nada con nuestra arquitectura de capas.
 Necesitaremos una rediseño de arquitectura a un sistema de microservicios para así poder mantener el modulo de bancos en un servidor propio, así, si el frontend falla el modulo se mantendrá activo la mayoría del tiempo
rAyo1 [MDKT],  — 21/04/2026 12:51
¿Cambia el estilo arquitectónico?
R:Si ya que nuestro estilo de capas solo satisface la importancia de seguridad y el atributo de disponibilidad es bajo, con las nuevas implementaciones, tendremos que cambiar de arquitectura a una estilo de micro servicios para poder mantener la seguridad y aumentar la disponibilidad de nuestra app, a su vez, este nuevo estilo permite modificar y desplegar el modulo de forma aislada, sin necesidad de redesplegar o detener la aplicación completa garantizando la continuidad del servicio.
 Ahora porque es necesario este cambio. Es necesario porque al tener un estilo de micro servicios tenemos la facilidad para que el modulo de bancos viva en un servidor separado y se mantenga activo y funcional independientemente del monolito principal mientras que en otro mantenemos el nivel de seguridad. 
rAyo1 [MDKT],  — 21/04/2026 13:03


Imagen
Imagen
primer chat con gemini
Segundo chat
Imagen
Imagen
Imagen
Imagen
Imagen
rAyo1 [MDKT],  — ayer a las 23:19
http://localhost:3000/docs
rAyo1 [MDKT],  — ayer a las 23:59
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
... (427 líneas restantes)

message.txt
22 KB
rAyo1 [MDKT],  — 0:00
const Database = require('better-sqlite3');
const db = new Database('gastos.db');
 
db.exec(
  CREATE TABLE IF NOT EXISTS categorias (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT    NOT NULL UNIQUE,
    compartida INTEGER NOT NULL DEFAULT 0
  );
 
  CREATE TABLE IF NOT EXISTS grupos (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  );
 
  CREATE TABLE IF NOT EXISTS grupo_miembros (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    grupo_id  INTEGER NOT NULL REFERENCES grupos(id),
    usuario   TEXT    NOT NULL,
    UNIQUE(grupo_id, usuario)
  );
 
  CREATE TABLE IF NOT EXISTS gastos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    monto        REAL    NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    fecha        TEXT    NOT NULL,
    descripcion  TEXT,
    metodo_pago  TEXT,
    grupo_id     INTEGER REFERENCES grupos(id),
    usuario      TEXT    NOT NULL DEFAULT 'personal'
  );
 
  INSERT OR IGNORE INTO categorias (nombre, compartida) VALUES
    ('Alimentación',    0),
    ('Transporte',      0),
    ('Salud',           0),
    ('Entretenimiento', 0),
    ('Servicios',       0),
    ('Hogar',           1),
    ('Arriendo',        1),
    ('Supermercado',    1);
 
  INSERT OR IGNORE INTO grupos (nombre) VALUES ('Familia');
);
 
module.exports = db;
﻿
rAyo1
el_rayo
 
 
 
 
 
Soy veloz
1 ganador 42 perdedores
Y yo desayuno perdedores.
Velocidad, soy mas que rápido
Mas que veloz
SOY UN RAYO
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
app.post('/gastos', authMiddleware, (req, res) => {
  const { monto, categoria_id, fecha, descripcion, metodo_pago } = req.body;
 
  const errMonto = validarMonto(monto);
  if (errMonto) return res.status(400).json({ error: errMonto });
 
  const errFecha = validarFecha(fecha);
  if (errFecha) return res.status(400).json({ error: errFecha });
 
  if (!categoria_id)
    return res.status(400).json({ error: 'La categoría es obligatoria.' });
 
  if (!db.prepare('SELECT id FROM categorias WHERE id = ?').get(categoria_id))
    return res.status(400).json({ error: 'La categoría indicada no existe.' });
 
  const r = db.prepare(`
    INSERT INTO gastos (monto, categoria_id, fecha, descripcion, metodo_pago, usuario)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(monto, categoria_id, fecha, descripcion || null, metodo_pago || null, req.usuario);
 
  res.status(201).json({ id: r.lastInsertRowid, monto, categoria_id, fecha, descripcion: descripcion || null, metodo_pago: metodo_pago || null });
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
 *               monto:        { type: number }
 *               categoria_id: { type: integer }
 *               fecha:        { type: string }
 *               descripcion:  { type: string }
 *               metodo_pago:  { type: string }
 *     responses:
 *       200: { description: Gasto actualizado }
 *       400: { description: Datos inválidos }
 *       404: { description: No encontrado }
 *       401: { description: No autenticado }
 */
app.put('/gastos/:id', authMiddleware, (req, res) => {
  const { monto, categoria_id, fecha, descripcion, metodo_pago } = req.body;
 
  const errMonto = validarMonto(monto);
  if (errMonto) return res.status(400).json({ error: errMonto });
 
  const errFecha = validarFecha(fecha);
  if (errFecha) return res.status(400).json({ error: errFecha });
 
  if (categoria_id && !db.prepare('SELECT id FROM categorias WHERE id = ?').get(categoria_id))
    return res.status(400).json({ error: 'La categoría indicada no existe.' });
 
  const i = db.prepare(`
    UPDATE gastos SET monto=?, categoria_id=?, fecha=?, descripcion=?, metodo_pago=?
    WHERE id=?
  `).run(monto, categoria_id, fecha, descripcion || null, metodo_pago || null, req.params.id);
 
  if (i.changes === 0) return res.status(404).json({ error: 'Gasto no encontrado.' });
  res.json({ mensaje: 'Gasto actualizado correctamente.' });
});
 
/**
 * @swagger
 * /gastos/{id}:
 *   delete:
 *     summary: "[HU1] Elimina un gasto personal"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Gasto eliminado }
 *       404: { description: No encontrado }
 *       401: { description: No autenticado }
 */
app.delete('/gastos/:id', authMiddleware, (req, res) => {
  const i = db.prepare('DELETE FROM gastos WHERE id = ?').run(req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Gasto no encontrado.' });
  res.json({ mensaje: 'Gasto eliminado correctamente.' });
});
 
// ═════════════════════════════════════════════════════
// HU2 — GRUPOS FAMILIARES
// ═════════════════════════════════════════════════════
 
/**
 * @swagger
 * /grupos:
 *   get:
 *     summary: "[HU2] Lista todos los grupos familiares"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array de grupos }
 *       401: { description: No autenticado }
 */
app.get('/grupos', authMiddleware, (req, res) => {
  const grupos = db.prepare('SELECT * FROM grupos').all();
  grupos.forEach(g => {
    g.miembros = db.prepare('SELECT usuario FROM grupo_miembros WHERE grupo_id = ?').all(g.id).map(m => m.usuario);
  });
  res.json(grupos);
});
 
/**
 * @swagger
 * /grupos:
 *   post:
 *     summary: "[HU2] Crea un grupo familiar"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string, example: "Familia García" }
 *     responses:
 *       201: { description: Grupo creado }
 *       400: { description: Nombre inválido o duplicado }
 *       401: { description: No autenticado }
 */
app.post('/grupos', authMiddleware, (req, res) => {
  const { nombre } = req.body;
  if (!nombre || nombre.trim() === '')
    return res.status(400).json({ error: 'El nombre del grupo es obligatorio.' });
  if (db.prepare('SELECT id FROM grupos WHERE nombre = ?').get(nombre.trim()))
    return res.status(400).json({ error: 'Ya existe un grupo con ese nombre.' });
 
  const r = db.prepare('INSERT INTO grupos (nombre) VALUES (?)').run(nombre.trim());
  // El creador se agrega automáticamente como miembro
  db.prepare('INSERT OR IGNORE INTO grupo_miembros (grupo_id, usuario) VALUES (?, ?)').run(r.lastInsertRowid, req.usuario);
  res.status(201).json({ id: r.lastInsertRowid, nombre: nombre.trim(), miembros: [req.usuario] });
});
 
/**
 * @swagger
 * /grupos/{id}/miembros:
 *   post:
 *     summary: "[HU2] Agrega un miembro al grupo familiar"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario]
 *             properties:
 *               usuario: { type: string, example: "maria" }
 *     responses:
 *       201: { description: Miembro agregado }
 *       400: { description: Ya es miembro }
 *       404: { description: Grupo no encontrado }
 *       401: { description: No autenticado }
 */
app.post('/grupos/:id/miembros', authMiddleware, (req, res) => {
  const { usuario } = req.body;
  if (!usuario || usuario.trim() === '')
    return res.status(400).json({ error: 'El nombre de usuario es obligatorio.' });
  if (!db.prepare('SELECT id FROM grupos WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Grupo no encontrado.' });
  try {
    db.prepare('INSERT INTO grupo_miembros (grupo_id, usuario) VALUES (?, ?)').run(req.params.id, usuario.trim());
    res.status(201).json({ mensaje: `Usuario "${usuario.trim()}" agregado al grupo.` });
  } catch {
    res.status(400).json({ error: 'El usuario ya es miembro de este grupo.' });
  }
});
 
// ═════════════════════════════════════════════════════
// HU2 — GASTOS FAMILIARES COMPARTIDOS
// ═════════════════════════════════════════════════════
 
/**
 * @swagger
 * /grupos/{id}/gastos:
 *   get:
 *     summary: "[HU2] Lista gastos compartidos del grupo — visibles para todos los miembros"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *       - { in: query, name: mes,  schema: { type: integer } }
 *       - { in: query, name: anio, schema: { type: integer } }
 *     responses:
 *       200: { description: Array de gastos del grupo }
 *       403: { description: No eres miembro de este grupo }
 *       404: { description: Grupo no encontrado }
 *       401: { description: No autenticado }
 */
app.get('/grupos/:id/gastos', authMiddleware, (req, res) => {
  if (!db.prepare('SELECT id FROM grupos WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Grupo no encontrado.' });
 
  const esMiembro = db.prepare('SELECT id FROM grupo_miembros WHERE grupo_id = ? AND usuario = ?').get(req.params.id, req.usuario);
  if (!esMiembro)
    return res.status(403).json({ error: 'No eres miembro de este grupo.' });
 
  const { mes, anio } = req.query;
  let sql = `
    SELECT g.*, c.nombre AS categoria_nombre, c.compartida, g.usuario AS registrado_por
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.grupo_id = ?
  `;
  const params = [req.params.id];
  if (mes)  { sql += ` AND strftime('%m', g.fecha) = ?`; params.push(String(mes).padStart(2, '0')); }
  if (anio) { sql += ` AND strftime('%Y', g.fecha) = ?`; params.push(String(anio)); }
  sql += ` ORDER BY g.fecha DESC`;
 
  res.json(db.prepare(sql).all(...params));
});
 
/**
 * @swagger
 * /grupos/{id}/gastos:
 *   post:
 *     summary: "[HU2] Registra un gasto del hogar en el grupo familiar"
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto, categoria_id, fecha]
 *             properties:
 *               monto:        { type: number,  example: 80000 }
 *               categoria_id: { type: integer, example: 6, description: "Debe ser categoría compartida" }
 *               fecha:        { type: string,  example: "2025-05-20" }
 *               descripcion:  { type: string,  example: "Cuenta de luz mayo" }
 *               metodo_pago:  { type: string,  example: "Transferencia" }
 *     responses:
 *       201: { description: Gasto compartido registrado }
 *       400: { description: Datos inválidos o categoría no compartida }
 *       403: { description: No eres miembro del grupo }
 *       404: { description: Grupo no encontrado }
 *       401: { description: No autenticado }
 */
app.post('/grupos/:id/gastos', authMiddleware, (req, res) => {
  const { monto, categoria_id, fecha, descripcion, metodo_pago } = req.body;
 
  if (!db.prepare('SELECT id FROM grupos WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'Grupo no encontrado.' });
 
  const esMiembro = db.prepare('SELECT id FROM grupo_miembros WHERE grupo_id = ? AND usuario = ?').get(req.params.id, req.usuario);
  if (!esMiembro)
    return res.status(403).json({ error: 'No eres miembro de este grupo.' });
 
  const errMonto = validarMonto(monto);
  if (errMonto) return res.status(400).json({ error: errMonto });
 
  const errFecha = validarFecha(fecha);
  if (errFecha) return res.status(400).json({ error: errFecha });
 
  if (!categoria_id)
    return res.status(400).json({ error: 'La categoría es obligatoria.' });
 
  const categoria = db.prepare('SELECT * FROM categorias WHERE id = ?').get(categoria_id);
  if (!categoria)
    return res.status(400).json({ error: 'La categoría indicada no existe.' });
 
  const r = db.prepare(`
    INSERT INTO gastos (monto, categoria_id, fecha, descripcion, metodo_pago, grupo_id, usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(monto, categoria_id, fecha, descripcion || null, metodo_pago || null, req.params.id, req.usuario);
 
  res.status(201).json({
    id: r.lastInsertRowid,
    monto,
    categoria_id,
    categoria_nombre: categoria.nombre,
    fecha,
    descripcion: descripcion || null,
    metodo_pago: metodo_pago || null,
    grupo_id: Number(req.params.id),
    registrado_por: req.usuario,
    visible_para_grupo: true
  });
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
app.delete('/grupos/:id/gastos/:gastoId', authMiddleware, (req, res) => {
  const esMiembro = db.prepare('SELECT id FROM grupo_miembros WHERE grupo_id = ? AND usuario = ?').get(req.params.id, req.usuario);
  if (!esMiembro)
    return res.status(403).json({ error: 'No eres miembro de este grupo.' });
 
  const i = db.prepare('DELETE FROM gastos WHERE id = ? AND grupo_id = ?').run(req.params.gastoId, req.params.id);
  if (i.changes === 0) return res.status(404).json({ error: 'Gasto no encontrado en este grupo.' });
  res.json({ mensaje: 'Gasto compartido eliminado.' });
});
 
app.listen(3000, () => console.log('API Gastos v2 en http://localhost:3000'));
